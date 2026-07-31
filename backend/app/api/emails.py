from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Any, Optional
import os
import re
import tempfile
from app.database import get_db
from app.models.user import User
from app.models.project import Project
from app.models.email import Email
from app.schemas.email import EmailGenerateRequest, EmailOut, EmailUpdate, QuickEmailRequest, QuickEmailResponse, JDEmailResponse, TextPromptRequest, TextPromptResponse, ContextEmailRequest, ContextEmailResponse
from app.auth.jwt import get_current_active_user
from app.models.resume import Resume
from app.services.ai_service import ai_service
from app.ai.rag.engine import rag_engine

router = APIRouter(prefix="/api/emails", tags=["emails"])

GREETING_RE = re.compile(r'\b(Dear|Hi|Hello|To whom it may concern|Good\s+(morning|afternoon|evening))\b', re.IGNORECASE)

def _clean_subject(subject: str) -> str:
    subject = subject.strip()
    for sep in [' - ', ' | ', ' — ', ' – ', ' : ']:
        idx = subject.find(sep)
        if idx != -1 and idx < 60:
            return subject[:idx].strip()
    return subject

def _extract_email_parts(content: str):
    """Splits generated content into (subject, body), tolerating missing newlines."""
    content = str(content).strip()
    # Strip a leading markdown heading that may prefix the subject (e.g. "## Subject: ...")
    content = re.sub(r'^\s*#{1,6}\s+', '', content, flags=re.IGNORECASE)
    m = re.match(r'^\s*(?:subject|re)\s*:\s*(.*)$', content, flags=re.IGNORECASE | re.DOTALL)
    if not m:
        return "Cold Email Application", content

    after = m.group(1).strip()
    nl = after.find('\n')
    cut = len(after)
    if nl != -1:
        cut = min(cut, nl)
    gm = GREETING_RE.search(after)
    if gm and 0 < gm.start() < cut:
        cut = gm.start()

    subject = _clean_subject(after[:cut])
    body = after[cut:].strip()
    if not body:
        body = after

    # Remove a stray greeting-like fragment glued to the subject if cleanup failed
    subject = re.sub(r'(?i)\bDear\b.*$', '', subject).strip() or "Cold Email Application"
    return subject, body

@router.post("/from-jd", response_model=JDEmailResponse)
async def generate_email_from_jd(
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None),
    project_id: Optional[int] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Generate a crisp cold email directly from a Job Description (file upload or pasted text)."""
    job_description = ""

    # 1. Read JD text from pasted text and/or file upload
    parts = []
    if text and text.strip():
        parts.append(text.strip())
    if file is not None:
        try:
            contents = await file.read()
            ext = os.path.splitext(file.filename or "")[1].lower()
            with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
                tmp.write(contents)
                tmp_path = tmp.name
            try:
                loaded = rag_engine.load_document(tmp_path)
                file_text = "\n\n".join(doc.page_content for doc in loaded).strip()
                if file_text:
                    parts.append(file_text)
            finally:
                os.unlink(tmp_path)
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Could not read JD file: {str(e)}")

    job_description = "\n\n".join(parts)

    if not job_description:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Provide a JD file or paste the Job Description text")

    # 2. Generate the cold email
    try:
        generated = await ai_service.generate_email_from_jd(
            job_description,
            candidate_name=current_user.full_name or "",
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"AI generation failed: {str(e)}")

    subject, body = _extract_email_parts(generated)

    # 3. Persist the email under a project (auto-create a default project if needed)
    target_project = None
    if project_id:
        target_project = db.query(Project).filter(
            Project.id == project_id,
            Project.user_id == current_user.id
        ).first()

    if not target_project:
        # Fall back to the user's first project, or create a default "My Campaigns"
        target_project = db.query(Project).filter(
            Project.user_id == current_user.id
        ).order_by(Project.created_at.asc()).first()
        if not target_project:
            target_project = Project(
                name="My Campaigns",
                description="Default campaign for generated cold emails",
                user_id=current_user.id
            )
            db.add(target_project)
            db.commit()
            db.refresh(target_project)

    if target_project:
        email_record = Email(
            subject=subject,
            body=body,
            recipient_name="Hiring Manager",
            recipient_company="",
            job_id_referenced="",
            job_description=job_description,
            generated_resume=None,
            project_id=target_project.id,
            user_id=current_user.id
        )
        db.add(email_record)
        db.commit()
        db.refresh(email_record)
        return JDEmailResponse(id=email_record.id, subject=subject, body=body, saved=True)

    return JDEmailResponse(subject=subject, body=body, saved=False)

@router.post("/text-prompt", response_model=TextPromptResponse)
async def generate_email_from_prompt(
    request: TextPromptRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Generate a short, sweet cold email from a single free-text user prompt."""
    try:
        generated = await ai_service.generate_email_from_prompt(
            request.text,
            candidate_name=current_user.full_name or "",
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"AI generation failed: {str(e)}")

    subject, body = _extract_email_parts(generated)

    # Persist the email under the user's first project (or create a default one)
    target_project = db.query(Project).filter(
        Project.user_id == current_user.id
    ).order_by(Project.created_at.asc()).first()
    if not target_project:
        target_project = Project(
            name="My Campaigns",
            description="Default campaign for generated cold emails",
            user_id=current_user.id
        )
        db.add(target_project)
        db.commit()
        db.refresh(target_project)

    email_record = Email(
        subject=subject,
        body=body,
        recipient_name="Hiring Manager",
        recipient_company="",
        job_id_referenced="",
        job_description=request.text,
        generated_resume=None,
        project_id=target_project.id,
        user_id=current_user.id
    )
    db.add(email_record)
    db.commit()
    db.refresh(email_record)
    return TextPromptResponse(id=email_record.id, subject=subject, body=body, saved=True)

@router.post("/quick", response_model=QuickEmailResponse)
async def quick_generate_email(
    request: QuickEmailRequest,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    try:
        generated_content = await ai_service.generate_quick_email(role=request.role)
        return QuickEmailResponse(email_content=str(generated_content))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"AI generation failed: {str(e)}")

@router.post("/from-context", response_model=ContextEmailResponse)
async def generate_email_from_context(
    request: ContextEmailRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Generate a cold email from a free-form user prompt/context."""
    try:
        generated = await ai_service.generate_context_email(
            user_prompt=request.prompt,
            candidate_name=current_user.full_name or "",
            tone=request.tone or "Professional",
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"AI generation failed: {str(e)}")

    subject, body = _extract_email_parts(generated)

    # Persist under a default project
    target_project = db.query(Project).filter(
        Project.user_id == current_user.id
    ).order_by(Project.created_at.asc()).first()
    if not target_project:
        target_project = Project(
            name="My Campaigns",
            description="Default campaign for generated cold emails",
            user_id=current_user.id
        )
        db.add(target_project)
        db.commit()
        db.refresh(target_project)

    email_record = Email(
        subject=subject,
        body=body,
        recipient_name="Hiring Manager",
        recipient_company="",
        job_id_referenced="",
        job_description=request.prompt,
        generated_resume=None,
        project_id=target_project.id,
        user_id=current_user.id
    )
    db.add(email_record)
    db.commit()
    db.refresh(email_record)
    return ContextEmailResponse(id=email_record.id, subject=subject, body=body, saved=True)

@router.post("/generate", response_model=EmailOut, status_code=status.HTTP_201_CREATED)
async def generate_email(
    request: EmailGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    # Verify project exists and belongs to user
    project = db.query(Project).filter(
        Project.id == request.project_id, 
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    try:
        # Generate email
        generated_content = await ai_service.generate_cold_email(
            project_id=request.project_id,
            recipient_name=request.recipient_name,
            company_name=request.company_name,
            industry=request.industry,
            pain_points=request.pain_points,
            job_description=request.job_description,
            job_id=request.job_id,
            tone=request.tone
        )
        
        # Generate tailored resume based on JD
        generated_resume = await ai_service.generate_tailored_resume(
            job_description=request.job_description,
            project_id=request.project_id
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"AI generation failed: {str(e)}")

    # Extract subject if present (e.g., "Subject: ...\n\nBody...")
    subject, email_body = _extract_email_parts(str(generated_content))

    resume_text = str(generated_resume) if generated_resume else None

    # Save to database
    email_record = Email(
        subject=subject,
        body=email_body,
        recipient_name=request.recipient_name,
        recipient_company=request.company_name,
        job_id_referenced=request.job_id,
        job_description=request.job_description,
        generated_resume=resume_text,
        project_id=request.project_id,
        user_id=current_user.id
    )
    
    db.add(email_record)
    db.commit()
    db.refresh(email_record)

    # Also save as a separate resume record under this company
    resume_record = Resume(
        company_name=request.company_name,
        job_title=request.job_id or "",
        job_description=request.job_description,
        resume_content=resume_text if resume_text else "",
        project_id=request.project_id,
        user_id=current_user.id
    )
    db.add(resume_record)
    db.commit()
    
    return email_record

@router.get("/project/{project_id}", response_model=List[EmailOut])
def get_project_emails(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    # Verify project exists and belongs to user
    project = db.query(Project).filter(
        Project.id == project_id, 
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        
    emails = db.query(Email).filter(Email.project_id == project_id).order_by(Email.created_at.desc()).all()
    return emails

@router.get("/{email_id}", response_model=EmailOut)
def get_email(
    email_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    email = db.query(Email).filter(
        Email.id == email_id, 
        Email.user_id == current_user.id
    ).first()
    
    if not email:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Email not found")
        
    return email

@router.delete("/{email_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_email(
    email_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    email = db.query(Email).filter(
        Email.id == email_id, 
        Email.user_id == current_user.id
    ).first()
    
    if not email:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Email not found")
        
    db.delete(email)
    db.commit()
    return None

@router.put("/{email_id}", response_model=EmailOut)
def update_email(
    email_id: int,
    email_in: EmailUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    email = db.query(Email).filter(
        Email.id == email_id, 
        Email.user_id == current_user.id
    ).first()
    
    if not email:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Email not found")
        
    email.subject = email_in.subject
    db.commit()
    db.refresh(email)
    return email

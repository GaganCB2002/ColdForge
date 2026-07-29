from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Any
from app.database import get_db
from app.models.user import User
from app.models.project import Project
from app.models.email import Email
from app.schemas.email import EmailGenerateRequest, EmailOut, EmailUpdate, QuickEmailRequest, QuickEmailResponse
from app.auth.jwt import get_current_active_user
from app.models.resume import Resume
from app.services.ai_service import ai_service

router = APIRouter(prefix="/api/emails", tags=["emails"])

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
    subject = "AI Generated Email"
    email_body = generated_content
    
    if isinstance(generated_content, str):
        lines = generated_content.strip().split("\n")
        if lines and lines[0].lower().startswith("subject:"):
            subject = lines[0].replace("Subject:", "").replace("subject:", "").strip()
            email_body = "\n".join(lines[1:]).strip()

    # Save to database
    email_record = Email(
        subject=subject,
        body=email_body,
        recipient_name=request.recipient_name,
        recipient_company=request.company_name,
        job_id_referenced=request.job_id,
        job_description=request.job_description,
        generated_resume=generated_resume,
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
        resume_content=str(generated_resume) if generated_resume else "",
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

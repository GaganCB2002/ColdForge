from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Any
from app.database import get_db
from app.models.user import User
from app.models.project import Project
from app.models.resume import Resume
from app.schemas.resume import (
    ResumeGenerateRequest, ResumeOut, ResumeUpdate,
    ATSAnalysisRequest, ATSAnalysisResponse
)
from app.auth.jwt import get_current_active_user
from app.services.ai_service import ai_service

router = APIRouter(prefix="/api/resumes", tags=["resumes"])

@router.post("/generate", response_model=ResumeOut, status_code=status.HTTP_201_CREATED)
async def generate_resume(
    request: ResumeGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    project = None
    if request.project_id:
        project = db.query(Project).filter(
            Project.id == request.project_id,
            Project.user_id == current_user.id
        ).first()

    try:
        generated_resume = await ai_service.generate_tailored_resume(
            job_description=request.job_description,
            project_id=request.project_id or 0
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Resume generation failed: {str(e)}"
        )

    resume_record = Resume(
        company_name=request.company_name,
        job_title=request.job_title,
        job_description=request.job_description,
        resume_content=str(generated_resume),
        project_id=request.project_id,
        user_id=current_user.id
    )

    db.add(resume_record)
    db.commit()
    db.refresh(resume_record)

    return resume_record

@router.get("/", response_model=List[ResumeOut])
def list_resumes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    resumes = db.query(Resume).filter(
        Resume.user_id == current_user.id
    ).order_by(Resume.created_at.desc()).all()
    return resumes

@router.get("/company/{company_name}", response_model=List[ResumeOut])
def get_company_resumes(
    company_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    resumes = db.query(Resume).filter(
        Resume.user_id == current_user.id,
        Resume.company_name.ilike(company_name)
    ).order_by(Resume.created_at.desc()).all()
    return resumes

@router.get("/{resume_id}", response_model=ResumeOut)
def get_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()

    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")

    return resume

@router.put("/{resume_id}", response_model=ResumeOut)
def update_resume(
    resume_id: int,
    resume_in: ResumeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()

    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")

    if resume_in.resume_content is not None:
        resume.resume_content = resume_in.resume_content
    if resume_in.job_title is not None:
        resume.job_title = resume_in.job_title

    db.commit()
    db.refresh(resume)
    return resume

@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> None:
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()

    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")

    db.delete(resume)
    db.commit()
    return None

@router.post("/ats-score", response_model=ATSAnalysisResponse)
async def analyze_ats_score(
    request: ATSAnalysisRequest,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    try:
        result = await ai_service.analyze_ats_score(
            resume_content=request.resume_content,
            job_description=request.job_description
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"ATS analysis failed: {str(e)}"
        )

@router.post("/{resume_id}/ats-score", response_model=ATSAnalysisResponse)
async def analyze_resume_ats(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()

    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")

    if not resume.job_description:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume has no job description for comparison"
        )

    try:
        result = await ai_service.analyze_ats_score(
            resume_content=resume.resume_content,
            job_description=resume.job_description
        )

        resume.ats_score = result["ats_score"]
        resume.missing_skills = ", ".join(result["missing_skills"])
        resume.match_percentage = result["match_percentage"]
        db.commit()

        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"ATS analysis failed: {str(e)}"
        )

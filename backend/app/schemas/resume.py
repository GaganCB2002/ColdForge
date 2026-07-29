from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ResumeGenerateRequest(BaseModel):
    company_name: str
    job_title: Optional[str] = ""
    job_description: str
    project_id: Optional[int] = None

class ATSAnalysisRequest(BaseModel):
    resume_content: str
    job_description: str

class ATSAnalysisResponse(BaseModel):
    ats_score: float
    missing_skills: List[str]
    match_percentage: float
    recommendations: List[str]
    strengths: List[str]

class ResumeOut(BaseModel):
    id: int
    company_name: str
    job_title: Optional[str] = None
    job_description: Optional[str] = None
    resume_content: str
    ats_score: Optional[float] = None
    missing_skills: Optional[str] = None
    match_percentage: Optional[float] = None
    project_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ResumeUpdate(BaseModel):
    resume_content: Optional[str] = None
    job_title: Optional[str] = None

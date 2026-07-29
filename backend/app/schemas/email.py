from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class QuickEmailRequest(BaseModel):
    role: str

class QuickEmailResponse(BaseModel):
    email_content: str

class EmailGenerateRequest(BaseModel):
    project_id: int
    recipient_name: str
    company_name: str
    industry: str
    pain_points: str
    job_description: str
    job_id: Optional[str] = ""
    tone: Optional[str] = "Professional"

class EmailUpdate(BaseModel):
    subject: str

class EmailOut(BaseModel):
    id: int
    subject: Optional[str] = None
    body: str
    recipient_name: Optional[str] = None
    recipient_company: Optional[str] = None
    job_id_referenced: Optional[str] = None
    job_description: Optional[str] = None
    generated_resume: Optional[str] = None
    project_id: int
    created_at: datetime

    class Config:
        from_attributes = True

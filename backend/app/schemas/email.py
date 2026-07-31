from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime

class QuickEmailRequest(BaseModel):
    role: str = Field(..., min_length=1)

    @field_validator("role")
    @classmethod
    def strip_role(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("role must not be empty")
        return v

class QuickEmailResponse(BaseModel):
    email_content: str

class JDEmailResponse(BaseModel):
    id: Optional[int] = None
    subject: str
    body: str
    saved: bool = False

class TextPromptRequest(BaseModel):
    text: str = Field(..., min_length=1)

    @field_validator("text")
    @classmethod
    def strip_text(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("text must not be empty")
        return v

class TextPromptResponse(BaseModel):
    id: Optional[int] = None
    subject: str
    body: str
    saved: bool = False

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

class ContextEmailRequest(BaseModel):
    prompt: str = Field(..., min_length=5, max_length=5000)
    tone: Optional[str] = "Professional"

    @field_validator("prompt")
    @classmethod
    def strip_prompt(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("prompt must not be empty")
        return v

class ContextEmailResponse(BaseModel):
    id: Optional[int] = None
    subject: str
    body: str
    saved: bool = False


from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime

class ProjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None

    @field_validator("name")
    @classmethod
    def strip_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("name must not be empty")
        return v

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class ProjectOut(BaseModel):
    name: str = Field(..., max_length=200)
    description: Optional[str] = None
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    @field_validator("name")
    @classmethod
    def sanitize_name(cls, v: str) -> str:
        v = (v or "").strip()
        return v or "Untitled Project"

    class Config:
        from_attributes = True

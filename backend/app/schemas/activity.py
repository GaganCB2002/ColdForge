from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime

class ActivityBase(BaseModel):
    action_type: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1, max_length=1000)
    project_id: Optional[int] = None
    application_id: Optional[int] = None

    @field_validator("action_type", "description")
    @classmethod
    def strip_fields(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("field must not be empty")
        return v

class ActivityCreate(ActivityBase):
    pass

class ActivityUpdate(BaseModel):
    action_type: Optional[str] = None
    description: Optional[str] = None
    project_id: Optional[int] = None
    application_id: Optional[int] = None

class ActivityOut(ActivityBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

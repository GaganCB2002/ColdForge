from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ActivityBase(BaseModel):
    action_type: str
    description: str
    project_id: Optional[int] = None
    application_id: Optional[int] = None

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

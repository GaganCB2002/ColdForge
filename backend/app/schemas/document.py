from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DocumentUpdate(BaseModel):
    filename: str

class DocumentOut(BaseModel):
    id: int
    filename: str
    doc_type: Optional[str] = None
    project_id: int
    created_at: datetime

    class Config:
        from_attributes = True

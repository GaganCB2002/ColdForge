from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Email(Base):
    __tablename__ = "emails"

    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String)
    body = Column(Text, nullable=False)
    recipient_name = Column(String)
    recipient_company = Column(String)
    job_id_referenced = Column(String) # Explicitly linking to job ID if parsed from JD
    job_description = Column(Text, nullable=True)
    generated_resume = Column(Text, nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship("Project", back_populates="emails")
    user = relationship("User", backref="emails")

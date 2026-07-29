from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, nullable=False)
    job_title = Column(String, nullable=True)
    job_description = Column(Text, nullable=True)
    resume_content = Column(Text, nullable=False)
    ats_score = Column(Float, nullable=True)
    missing_skills = Column(Text, nullable=True)
    match_percentage = Column(Float, nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship("Project", backref="resumes")
    user = relationship("User", backref="resumes")

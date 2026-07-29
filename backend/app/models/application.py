from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    job_role = Column(String, nullable=False)
    status = Column(String, default="Draft", nullable=False)
    salary_range = Column(String, nullable=True)
    employment_type = Column(String, nullable=True)
    date_applied = Column(DateTime(timezone=True), nullable=True)
    source = Column(String, nullable=True) # LinkedIn, Careers Page
    recruiter_name = Column(String, nullable=True)
    recruiter_contact = Column(String, nullable=True)
    hr_contact = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    
    # Track documents/versions used
    resume_id = Column(Integer, ForeignKey("documents.id"), nullable=True)
    email_id = Column(Integer, ForeignKey("emails.id"), nullable=True)
    
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    company = relationship("Company", back_populates="applications")
    user = relationship("User", backref="applications")
    project = relationship("Project")
    resume = relationship("Document")
    email = relationship("Email")

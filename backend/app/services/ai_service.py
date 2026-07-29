import json
import re
from app.ai.gemini_client import get_llm, get_local_llm
from app.ai.rag.engine import rag_engine
from app.ai.prompts.email_prompts import COLD_EMAIL_PROMPT, RESUME_INJECTION_PROMPT, QUICK_EMAIL_PROMPT, ATS_ANALYSIS_PROMPT
from langchain_core.runnables import RunnableSequence

class AIService:
    def __init__(self):
        self.llm = get_llm()
        self.local_llm = get_local_llm()

    async def generate_cold_email(self, 
                            project_id: int, 
                            recipient_name: str, 
                            company_name: str, 
                            industry: str, 
                            pain_points: str, 
                            job_description: str,
                            job_id: str = "", 
                            tone: str = "Professional"):
        
        # 1. Retrieve relevant context using RAG
        # We query the vector store for information about the company or industry
        query = f"Information relevant to {company_name} in {industry} focusing on {pain_points}"
        context = rag_engine.retrieve_context(query, project_id)

        # 2. Format Prompt
        chain = COLD_EMAIL_PROMPT | self.local_llm
        
        # 3. Generate response
        response = chain.invoke({
            "context": context,
            "recipient_name": recipient_name,
            "company_name": company_name,
            "industry": industry,
            "pain_points": pain_points,
            "job_id": job_id,
            "job_description": job_description,
            "tone": tone
        })
        
        return response

    async def generate_tailored_resume(self, job_description: str, project_id: int):
        # Retrieve the user's base resume from the Knowledge Base
        query = "resume curriculum vitae CV experience education skills"
        context = rag_engine.retrieve_context(query, project_id)
        
        chain = RESUME_INJECTION_PROMPT | self.llm
        
        response = chain.invoke({
            "job_description": job_description,
            "current_resume": context
        })
        
        return response

    async def analyze_ats_score(self, resume_content: str, job_description: str):
        chain = ATS_ANALYSIS_PROMPT | self.llm
        response = chain.invoke({
            "resume_content": resume_content,
            "job_description": job_description
        })

        content = str(response)
        json_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', content)
        if json_match:
            content = json_match.group(1).strip()

        try:
            result = json.loads(content)
        except json.JSONDecodeError:
            result = {
                "ats_score": 50.0,
                "missing_skills": [],
                "match_percentage": 50.0,
                "recommendations": ["Unable to parse ATS analysis. Please try again."],
                "strengths": []
            }

        return result

    async def generate_quick_email(self, role: str):
        chain = QUICK_EMAIL_PROMPT | self.local_llm
        response = chain.invoke({"role": role})
        return response

ai_service = AIService()

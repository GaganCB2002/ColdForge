import json
import re
from app.config import settings
from app.ai.gemini_client import get_llm, get_local_llm
from app.ai.ollama_client import get_ollama_llm
from app.ai.rag.engine import rag_engine
from app.ai.prompts.email_prompts import (
    COLD_EMAIL_PROMPT,
    RESUME_INJECTION_PROMPT,
    QUICK_EMAIL_PROMPT,
    ATS_ANALYSIS_PROMPT,
    JD_COLD_EMAIL_PROMPT,
    TEXT_PROMPT_EMAIL_PROMPT,
)
from app.ai.prompts.resume_builder_prompts import (
    RESUME_PARSE_PROMPT,
    ATS_RESUME_BUILD_PROMPT
)
from langchain_core.runnables import RunnableSequence

PLACEHOLDER_RE = re.compile(r'\[[^\]]*\]|<[^>]*>|\{[^}]*\}')

def _to_text(response) -> str:
    """Extracts the plain text from a LangChain response."""
    if hasattr(response, 'content'):
        return str(response.content)
    return str(response)


def clean_placeholders(text: str) -> str:
    """
    Removes leftover placeholder artifacts (e.g. [Your Name], [Number]) and
    normalizes whitespace / stray markdown markers so the email reads cleanly.
    """
    if not text:
        return text
    cleaned = PLACEHOLDER_RE.sub('', text)
    cleaned = re.sub(r'^\s*#{1,6}\s*', '', cleaned, flags=re.MULTILINE)
    cleaned = cleaned.replace('**', '').replace('##', '')
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    cleaned = re.sub(r'\b,\s*,', ',', cleaned)
    cleaned = re.sub(r'\bat\s+,\b', 'at ', cleaned)
    return cleaned

class AIService:
    def __init__(self):
        # Local Ollama/Gemma is the primary engine for email generation.
        # Gemini remains available as a cloud fallback via get_llm().
        self.ollama_llm = get_ollama_llm()
        self.llm = get_llm()
        self.local_llm = self.ollama_llm

    def _generation_llm(self):
        """Returns the local Ollama LLM; falls back to Gemini if configured."""
        if settings.LLM_PROVIDER == "ollama":
            return self.ollama_llm
        return self.llm

    async def generate_email_from_jd(self, job_description: str, candidate_name: str = ""):
        """Generates a crisp, personalized cold email directly from a Job Description."""
        chain = JD_COLD_EMAIL_PROMPT | self._generation_llm()
        response = await chain.ainvoke({
            "job_description": job_description,
            "candidate_name": candidate_name or "Your Name",
        })
        return clean_placeholders(_to_text(response))

    async def generate_email_from_prompt(self, prompt: str, candidate_name: str = ""):
        """Generates a short, sweet cold email from a single free-text user prompt."""
        chain = TEXT_PROMPT_EMAIL_PROMPT | self._generation_llm()
        response = await chain.ainvoke({
            "prompt": prompt,
            "candidate_name": candidate_name or "Your Name",
        })
        return clean_placeholders(_to_text(response))

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
        chain = COLD_EMAIL_PROMPT | self._generation_llm()
        
        # 3. Generate response
        response = await chain.ainvoke({
            "context": context,
            "recipient_name": recipient_name,
            "company_name": company_name,
            "industry": industry,
            "pain_points": pain_points,
            "job_id": job_id,
            "job_description": job_description,
            "tone": tone
        })
        
        return _to_text(response)

    async def generate_tailored_resume(self, job_description: str, project_id: int):
        # Retrieve the user's base resume from the Knowledge Base
        query = "resume curriculum vitae CV experience education skills"
        context = rag_engine.retrieve_context(query, project_id)
        
        chain = RESUME_INJECTION_PROMPT | self._generation_llm()
        
        response = await chain.ainvoke({
            "job_description": job_description,
            "current_resume": context
        })
        
        return _to_text(response)

    async def analyze_ats_score(self, resume_content: str, job_description: str):
        chain = ATS_ANALYSIS_PROMPT | self.llm
        response = await chain.ainvoke({
            "resume_content": resume_content,
            "job_description": job_description
        })

        content = _to_text(response)
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
        chain = QUICK_EMAIL_PROMPT | self._generation_llm()
        response = await chain.ainvoke({"role": role})
        return _to_text(response)

    async def generate_context_email(self, user_prompt: str, candidate_name: str = "", tone: str = "Professional"):
        """Generates a cold email from a free-form user prompt/context."""
        chain = CONTEXT_COLD_EMAIL_PROMPT | self._generation_llm()
        response = await chain.ainvoke({
            "user_prompt": user_prompt,
            "candidate_name": candidate_name or "Your Name",
            "tone": tone,
        })
        return clean_placeholders(_to_text(response))

    async def parse_resume_info(self, resume_content: str):
        """Parses a resume to extract structured data."""
        chain = RESUME_PARSE_PROMPT | self._generation_llm()
        response = await chain.ainvoke({"resume_content": resume_content})
        
        content = _to_text(response)
        json_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', content)
        if json_match:
            content = json_match.group(1).strip()
            
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            # Fallback if the LLM didn't return valid JSON
            return {
                "name": "Unknown",
                "contact": "Unknown",
                "location": "Unknown",
                "education": "Unknown",
                "skills": []
            }

    async def build_ats_resume(self, parsed_info: str, job_description: str):
        """Generates an ATS optimized resume."""
        chain = ATS_RESUME_BUILD_PROMPT | self._generation_llm()
        response = await chain.ainvoke({
            "parsed_info": parsed_info,
            "job_description": job_description
        })
        content = _to_text(response)
        # Clean any markdown code block wrappers
        content = re.sub(r'^```(?:markdown)?\n', '', content)
        content = re.sub(r'\n```$', '', content)
        return content

ai_service = AIService()

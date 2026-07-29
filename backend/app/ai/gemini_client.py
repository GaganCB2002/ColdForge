from langchain_google_genai import ChatGoogleGenerativeAI
from app.config import settings

def get_llm(model: str = settings.GEMINI_MODEL):
    """
    Initializes and returns the Gemini LLM client.
    """
    llm = ChatGoogleGenerativeAI(
        model=model,
        google_api_key=settings.GEMINI_API_KEY,
        max_retries=2
    )
    return llm

def get_local_llm(model: str = settings.GEMINI_MODEL):
    """
    Returns the same Gemini client since we are deprecating local/alternative LLMs.
    """
    return get_llm(model)

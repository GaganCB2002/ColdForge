from app.config import settings
from langchain_ollama import ChatOllama


def get_ollama_llm(model: str = settings.OLLAMA_MODEL):
    """
    Initializes and returns the local Ollama LLM client (Gemma by default).
    """
    return ChatOllama(
        model=model,
        base_url=settings.OLLAMA_BASE_URL,
        temperature=settings.OLLAMA_TEMPERATURE,
        num_ctx=settings.OLLAMA_NUM_CTX,
        timeout=300,
    )


def check_ollama_available() -> bool:
    """
    Quick connectivity check against the local Ollama server.
    """
    try:
        import ollama

        client = ollama.Client(host=settings.OLLAMA_BASE_URL)
        client.list()
        return True
    except Exception:
        return False

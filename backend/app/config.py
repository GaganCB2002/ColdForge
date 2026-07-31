import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET: str
    JWT_REFRESH_SECRET: str
    # LLM provider: "ollama" (local Gemma) or "gemini" (cloud)
    LLM_PROVIDER: str = "ollama"
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "gemma2:2b"
    OLLAMA_TEMPERATURE: float = 0.7
    OLLAMA_NUM_CTX: int = 8192
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"
    EMBEDDING_MODEL: str = "BAAI/bge-small-en-v1.5"
    VECTOR_STORE: str = "faiss"
    UPLOAD_DIRECTORY: str = "./storage/documents"
    MAX_UPLOAD_SIZE: int = 5000000
    FRONTEND_URL: str = "http://localhost:3000"
    BACKEND_URL: str = "http://localhost:8000"

    class Config:
        env_file = ".env"

settings = Settings()

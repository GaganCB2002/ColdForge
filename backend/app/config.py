import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET: str
    JWT_REFRESH_SECRET: str
    GEMINI_API_KEY: str
    GEMINI_MODEL: str = "gemini-1.5-pro"
    EMBEDDING_MODEL: str = "BAAI/bge-small-en-v1.5"
    VECTOR_STORE: str = "faiss"
    UPLOAD_DIRECTORY: str = "./storage/documents"
    MAX_UPLOAD_SIZE: int = 5000000
    FRONTEND_URL: str = "http://localhost:5173"
    BACKEND_URL: str = "http://localhost:8000"

    class Config:
        env_file = ".env"

settings = Settings()

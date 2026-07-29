import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.config import settings
from app.auth.router import router as auth_router
from app.api.projects import router as projects_router
from app.api.documents import router as documents_router
from app.api.emails import router as emails_router
from app.api.activities import router as activities_router
from app.api.resumes import router as resumes_router
from app.middleware.error_handler import custom_exception_handler, validation_exception_handler
from app.limiter import limiter

app = FastAPI(
    title="AI Cold Email Generator Pro",
    description="Enterprise API for generating cold emails and resumes via local LLM and RAG.",
    version="1.0.0"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Exception handlers
app.add_exception_handler(Exception, custom_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex="https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(projects_router)
app.include_router(documents_router)
app.include_router(emails_router)
app.include_router(activities_router)
app.include_router(resumes_router)

# Health check
@app.get("/")
def read_root():
    return {"status": "ok", "message": "Welcome to AI Cold Email Generator Pro API"}

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "version": "1.0.0",
    }

# AI Cold Email Generator Pro

An enterprise-grade full-stack SaaS application that generates highly personalized cold emails and tailored resumes by leveraging local Large Language Models (LLMs) and Retrieval-Augmented Generation (RAG).

## Core Features
* **Project Management**: Organize your campaigns into distinct projects.
* **Knowledge Base (RAG)**: Upload PDFs, DOCX, and TXT files for your projects. The app parses, chunks, and indexes these documents using FAISS and local embedding models.
* **AI Email Generation**: Leverages a local Ollama model (Gemma) to write highly tailored cold emails directly referencing your uploaded knowledge base.
* **Security**: JWT-based Authentication with bcrypt password hashing.

## Tech Stack
* **Frontend**: React 19, Vite, Tailwind CSS, Zustand, React Router DOM, Framer Motion
* **Backend**: FastAPI, SQLAlchemy, SQLite/PostgreSQL, Passlib
* **AI/RAG**: LangChain, FAISS, PyPDF2, Ollama (Gemma 2b), HuggingFace BAAI Embeddings

## Setup Instructions

### 1. Environment Variables
Copy `.env.example` to `.env` in the root, `backend/`, and `frontend/` directories and customize the variables.

### 2. Backend Setup
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Running the Complete App Automatically (Windows)
You can simply double-click the `run.bat` or run `.\run.ps1` at the root of the project to automatically start the Database (Docker), Backend, and Frontend simultaneously.

## Testing

**Backend Tests (Pytest)**
```bash
cd backend
.\venv\Scripts\activate
pytest tests/test_api_endpoints.py -v
```

## AI Requirements
Ensure you have [Ollama](https://ollama.com/) installed and running locally with the Gemma model:
```bash
ollama run gemma:2b
```

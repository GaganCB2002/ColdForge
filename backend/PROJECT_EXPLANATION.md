# Backend Project Explanation

This document provides a detailed breakdown of the backend directory structure, architectural patterns, and sentence formation outlining exactly how the codebase operates under the hood.

## 📂 File Structure Explained

Our backend follows a **Clean Architecture** paradigm, ensuring separation of concerns, scalability, and maintainability.

```text
backend/
├── alembic/                 # Database migration scripts (auto-generated versions of DB schema changes)
├── app/
│   ├── ai/                  # Core AI Engine (The brain of the app)
│   │   ├── embeddings/      # Logic for text-to-vector embedding models
│   │   ├── ollama/          # Client connection to the local Ollama LLM
│   │   ├── prompts/         # Langchain Prompt Templates defining the AI's persona and tasks
│   │   └── rag/             # Retrieval-Augmented Generation logic (FAISS indexing and querying)
│   ├── api/                 # FastAPI router endpoints (Controllers)
│   ├── auth/                # JWT Authentication logic, password hashing, and dependency injectors
│   ├── config/              # Pydantic BaseSettings loading environment variables securely
│   ├── core/                # Core application utilities and base abstractions
│   ├── database/            # SQLAlchemy Engine setup and database connection pooling
│   ├── middleware/          # Custom middlewares (e.g., Error handlers, Request loggers)
│   ├── models/              # SQLAlchemy ORM Models (Defines exact database tables/columns)
│   ├── repositories/        # Database access layer (CRUD operations abstracted away from APIs)
│   ├── schemas/             # Pydantic schemas (Defines input validation and output serialization)
│   ├── services/            # Business logic (e.g., Orchestrating the AI with the Database)
│   ├── utils/               # Helper functions (e.g., date formatters, basic string manipulation)
│   └── main.py              # The absolute entry point of the FastAPI application
├── uploads/                 # Local storage directory for user-uploaded documents (PDFs, DOCX)
├── .env                     # Environment variables configuration
├── alembic.ini              # Alembic configuration for database migrations
└── requirements.txt         # Python dependencies listing
```

## 🧠 Sentence Formation & Code Execution Flow

To understand the backend, read through these descriptive "sentences" that define the life of a request:

1. **The Entry Point:** When the server boots up, `main.py` instantiates the FastAPI app, attaches the CORS middleware to allow the React frontend to communicate, and maps all the API Routers (like Authentication and Email Generation) to the application.
2. **Database Initialization:** `app.database.py` spins up the SQLAlchemy engine. Using Alembic, the ORM models defined in `app/models/` (such as `User`, `Project`, and `Document`) are mapped directly to SQL tables.
3. **Data Protection:** When a request hits a protected endpoint, `app.auth.jwt.py` intercepts it using `Depends(get_current_active_user)`. It extracts the Bearer token, verifies its signature using the secret key, decodes the user's email, and fetches the user from the database. If any step fails, an `HTTP 401 Unauthorized` is thrown immediately.
4. **Knowledge Ingestion (RAG):** When a file is uploaded, the API router passes the file to the `RAGEngine` in `app/ai/rag/engine.py`. The engine uses a LangChain document loader (e.g., `PyPDFLoader`) to read the text. It slices the text into 1000-character chunks to preserve memory context. Then, `HuggingFaceBgeEmbeddings` converts these chunks into dense vector arrays, which are finally persisted to disk in a FAISS index tagged by the `project_id`.
5. **AI Orchestration (The Core Logic):** When an email generation request is received, `app/services/ai_service.py` takes control. It first talks to the FAISS vector store, querying it with the lead's company name and pain points. FAISS returns the most mathematically similar text chunks from the user's uploaded documents.
6. **Prompt Assembly:** The `AIService` takes the retrieved text (the context) and injects it into a strict template found in `app/ai/prompts/email_prompts.py`. This template tells the LLM exactly how to act (e.g., "You are an expert sales copywriter...").
7. **LLM Execution:** Finally, the fully assembled prompt is fired across to the local Ollama client. The local `gemma:2b` model calculates the optimal response word by word. Once finished, the text is returned up the chain, serialized into JSON by a Pydantic schema, and delivered back to the frontend.

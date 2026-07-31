<p align="center">
  <br/>
  <img src="https://img.shields.io/badge/Version-2.0.0-7C3AED?style=for-the-badge&labelColor=FFFFFF" alt="Version"/>
  <img src="https://img.shields.io/badge/Status-Active-10B981?style=for-the-badge&labelColor=FFFFFF" alt="Status"/>
  <img src="https://img.shields.io/badge/License-MIT-6366F1?style=for-the-badge&labelColor=FFFFFF" alt="License"/>
  <br/>
  <br/>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"/>
  <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python"/>
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind"/>
  <img src="https://img.shields.io/badge/Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white" alt="Gemini"/>
  <img src="https://img.shields.io/badge/Ollama-000000?style=for-the-badge&logo=ollama&logoColor=white" alt="Ollama"/>
</p>

<div align="center">
  <br/>
  
  # ✦ AI Cold Email Generator Pro ✦
  
  ### *ColdForge — Enterprise SaaS Platform*
  
  <br/>
  
  <p><i>A full-stack AI-powered platform that generates personalized cold emails, crafts tailored resumes, and predicts ATS compatibility — powered by Google Gemini (cloud) and a local Gemma model via Ollama, with Retrieval-Augmented Generation.</i></p>
  
  <br/>
  
  <kbd> [ 🚀 Live Demo ] </kbd> &nbsp;
  <kbd> [ 📖 API Docs ] </kbd> &nbsp;
  <kbd> [ 🐛 Report Bug ] </kbd>
  
  <br/>
  <br/>
</div>

---

<div align="center">
  
## 📋 Table of Contents
  
[Architecture](#-architecture) &nbsp;•&nbsp; [Flow Diagrams](#-flow-diagrams) &nbsp;•&nbsp; [Data Models](#-data-models) &nbsp;•&nbsp; [API Reference](#-api-reference) &nbsp;•&nbsp; [AI Prompts](#-ai-prompts) &nbsp;•&nbsp; [Setup](#-setup) &nbsp;•&nbsp; [Structure](#-structure)
  
</div>

---

<br/>

## 🏗 Architecture

<div align="center">
  
```mermaid
graph TB
    subgraph Frontend["🖥 React Frontend"]
        style Frontend fill:#F8FAFC,stroke:#CBD5E1,stroke-width:2
        UI[⚛️ React Components]
        ZS[📦 Zustand Stores]
        API[🔗 Axios Client]
        RR[🧭 React Router]
    end

    subgraph Backend["⚙️ FastAPI Backend"]
        style Backend fill:#F0F9FF,stroke:#BAE6FD,stroke-width:2
        Auth["🔐 Auth Router"]
        Projects["📁 Projects"]
        Emails["✉️ Emails"]
        Resumes["📄 Resumes"]
        Docs["📎 Documents"]
        
        subgraph AI["🧠 AI Layer"]
            style AI fill:#FAF5FF,stroke:#E9D5FF,stroke-width:2
            AIService["⚡ AIService"]
            Prompts["📜 Prompt Templates"]
            Ollama["🦙 Ollama (Gemma local)"]
            Gemini["🌐 Google Gemini (cloud)"]
            RAG["📚 FAISS + Embeddings"]
        end
        
        DB[(💾 Database)]
        FS["📂 File Storage"]
    end

    subgraph External["🌍 External"]
        style External fill:#FFF7ED,stroke:#FED7AA,stroke-width:2
        OLL["Ollama Server"]
        GAPI["Google AI API"]
    end

    UI --> RR --> ZS
    UI --> API
    API --> Auth & Projects & Emails & Resumes & Docs
    Auth --> DB
    Projects --> DB
    Emails --> AIService --> DB
    Resumes --> AIService --> DB
    Docs --> FS --> DB
    AIService --> Prompts --> Gemini --> GAPI
    AIService --> Prompts --> Ollama --> OLL
    AIService --> RAG
```

</div>

<br/>

---

## 🔄 Flow Diagrams

<br/>

### ✉️ Email Generation Flow

<div align="center">

```mermaid
sequenceDiagram
    actor U as 👤 User
    participant F as 🖥 Frontend
    participant BE as ⚙️ API
    participant AI as 🧠 AIService
    participant RAG as 📚 RAG Engine
    participant LLM as 🌐 Gemini
    participant DB as 💾 Database

    U->>F: Fill email form<br/>(project, company, JD, tone)
    F->>BE: POST /api/emails/generate
    BE->>BE: ✅ Verify project ownership
    
    par Generate Cold Email
        BE->>AI: generate_cold_email()
        AI->>RAG: retrieve_context(company, industry)
        RAG-->>AI: 📄 Relevant document chunks
        AI->>AI: Format COLD_EMAIL_PROMPT
        AI->>LLM: 🔮 Invoke with context + JD
        LLM-->>AI: ✉️ Generated email
        AI-->>BE: Email content
    and Generate Tailored Resume
        BE->>AI: generate_tailored_resume()
        AI->>RAG: retrieve_resume_context()
        RAG-->>AI: 📄 Base resume chunks
        AI->>AI: Format RESUME_INJECTION_PROMPT
        AI->>LLM: 🔮 Invoke with JD + resume
        LLM-->>AI: 📝 Tailored resume
        AI-->>BE: Resume content
    end
    
    BE->>DB: 💾 Save Email record
    BE->>DB: 💾 Auto-create Resume record<br/>(linked to company)
    DB-->>BE: ✅ Saved
    BE-->>F: 201 {email + resume}
    F-->>U: 🎉 Show generated content
```

</div>

<br/>

### 📊 ATS Score Analysis Flow

<div align="center">

```mermaid
sequenceDiagram
    actor U as 👤 User
    participant F as 🖥 Frontend
    participant BE as ⚙️ API
    participant AI as 🧠 AIService
    participant LLM as 🌐 Gemini
    participant DB as 💾 Database

    U->>F: Click 📈 ATS Analyze
    F->>BE: POST /api/resumes/{id}/ats-score
    BE->>DB: 🔍 Fetch resume + JD
    DB-->>BE: Resume content, Job description
    BE->>AI: analyze_ats_score()
    AI->>AI: Format ATS_ANALYSIS_PROMPT
    AI->>LLM: 🔮 Invoke for analysis
    
    Note over LLM: Returns JSON:<br/>{ats_score, missing_skills,<br/>match_percentage, recommendations, strengths}
    
    LLM-->>AI: 📊 JSON response
    AI->>AI: ⚡ Parse JSON<br/>(handles markdown code blocks)
    
    alt ✅ Parse Success
        AI-->>BE: {score, skills, match, recommendations, strengths}
        BE->>DB: 💾 Update resume scores
        DB-->>BE: ✅ Updated
        BE-->>F: 200 Full analysis
    else ❌ Parse Failure
        AI-->>BE: ⚠️ Fallback defaults
        BE-->>F: 200 Default values
    end
    
    F-->>U: 🎯 Show ATS score<br/>📉 Match percentage<br/>🏷 Missing skills<br/>💡 Recommendations
```

</div>

<br/>

### 🔐 Authentication Flow

<div align="center">

```mermaid
sequenceDiagram
    actor U as 👤 User
    participant F as 🖥 Frontend
    participant FE as ⚙️ FastAPI
    participant JWT as 🔑 JWT Utils
    participant DB as 💾 Database

    U->>F: Register / Login
    F->>FE: POST /api/auth/register or /login
    
    alt 📝 Register
        FE->>DB: Check duplicate email
        FE->>JWT: bcrypt hash password
        JWT-->>FE: Hashed password
        FE->>DB: INSERT user
        DB-->>FE: 👤 New user
        FE-->>F: 201 User profile
        F-->>U: ✅ Redirect to login
    else 🔑 Login
        FE->>JWT: verify_password()
        JWT-->>FE: ✅ Valid
        FE->>JWT: create_access_token (30min)
        FE->>JWT: create_refresh_token (7d)
        FE-->>F: 200 {tokens}
        F->>F: 💾 localStorage save
        F->>FE: GET /api/auth/me
        FE->>JWT: Decode & validate token
        JWT-->>FE: ✅ Valid
        FE-->>F: 200 User profile
        F-->>U: 🚀 Redirect to dashboard
    end
```

</div>

<br/>

### 📎 Document Upload & RAG Indexing Flow

<div align="center">

```mermaid
sequenceDiagram
    actor U as 👤 User
    participant F as 🖥 Frontend
    participant BE as ⚙️ API
    participant RAG as 📚 RAG Engine
    participant FS as 📂 Storage
    participant DB as 💾 Database

    U->>F: Upload PDF / DOCX / TXT
    F->>BE: POST /api/documents/ (multipart)
    BE->>BE: ✅ Verify project ownership
    BE->>FS: 💾 Save file
    FS-->>BE: ✅ File saved
    BE->>RAG: add_document_to_index()
    
    RAG->>RAG: 📖 Load via PyPDFLoader / Docx2txtLoader / TextLoader
    RAG->>RAG: ✂️ Split into chunks<br/>(1000 chars, 100 overlap)
    RAG->>RAG: 🔢 Generate embeddings<br/>(BAAI/bge-small-en-v1.5)
    RAG->>FS: 💾 Save/update FAISS index
    FS-->>RAG: ✅ Index saved
    
    RAG-->>BE: ✅ Indexing complete
    BE->>DB: 💾 Save document metadata
    DB-->>BE: ✅ Saved
    BE-->>F: 201 {document record}
    F-->>U: 🎉 Document added to Knowledge Base
```

</div>

<br/>

### 📧 JD → Cold Email Flow

<div align="center">

```mermaid
sequenceDiagram
    actor U as 👤 User
    participant F as 🖥 Frontend
    participant BE as ⚙️ API
    participant AI as 🧠 AIService
    participant LLM as 🦙 Ollama / Gemini
    participant DB as 💾 Database

    U->>F: Upload JD file OR paste JD text
    F->>BE: POST /api/emails/from-jd (multipart)
    BE->>BE: 📖 Load text via PyPDFLoader / Docx2txtLoader / TextLoader
    BE->>AI: generate_email_from_jd(jd, candidate_name)
    AI->>AI: Format JD_COLD_EMAIL_PROMPT<br/>(no placeholders, &lt;180 words)
    AI->>LLM: 🔮 Invoke with JD
    LLM-->>AI: ✉️ Raw email (Subject + Body)
    AI->>AI: ⚡ clean_placeholders()<br/>+ _extract_email_parts()
    AI-->>BE: {subject, body}
    BE->>DB: 💾 Auto-save under project<br/>(or create "My Campaigns")
    DB-->>BE: ✅ Saved
    BE-->>F: 200 {id, subject, body, saved}
    F-->>U: 🎉 Copy / Print / Open in Gmail
```

</div>

<br/>

### 🧑‍💼 Resume Builder Flow

<div align="center">

```mermaid
sequenceDiagram
    actor U as 👤 User
    participant F as 🖥 Frontend
    participant BE as ⚙️ API
    participant AI as 🧠 AIService
    participant LLM as 🦙 Ollama / Gemini

    U->>F: Paste resume text or upload PDF/DOCX
    F->>BE: POST /api/resumes/extract-text (optional)
    BE-->>F: {text}
    F->>BE: POST /api/resumes/parse
    BE->>AI: parse_resume_info(resume_text)
    AI->>AI: Format RESUME_PARSE_PROMPT
    AI->>LLM: 🔮 Extract name / contact / location / education / skills
    LLM-->>AI: 📦 JSON
    AI->>AI: ⚡ Parse JSON (markdown-code-block tolerant)
    AI-->>BE: {name, contact, location, education, skills}
    BE-->>F: 200 Structured profile
    U->>F: ✏️ Review / edit skills
    U->>F: Paste Job Description
    F->>BE: POST /api/resumes/build
    BE->>AI: build_ats_resume(parsed_info, jd)
    AI->>AI: Format ATS_RESUME_BUILD_PROMPT
    AI->>LLM: 🔮 Generate ATS-optimized Markdown resume
    LLM-->>AI: 📝 Resume Markdown
    AI-->>BE: resume_markdown
    BE-->>F: 200 {resume_markdown}
    F-->>U: 🎯 Preview (react-markdown) / Download PDF
```

</div>

<br/>

### 🧠 Prompt Selection Flow

<div align="center">

```mermaid
flowchart TD
    REQ[📥 Incoming Request] --> ENDPOINT{Which Endpoint?}
    
    ENDPOINT -->|POST /api/emails/quick| QE[📨 Quick Email]
    QE --> QP[QUICK_EMAIL_PROMPT]
    QP --> QLLM[local_llm]
    QLLM --> QR[📝 Plain text email]
    
    ENDPOINT -->|POST /api/emails/from-jd| JD[📧 JD Cold Email]
    JD --> JDP[JD_COLD_EMAIL_PROMPT]
    JDP --> JDLLM[local_llm]
    JDLLM --> JDCLEAN[⚡ clean_placeholders]
    JDCLEAN --> JDSAVE[💾 Save email]
    
    ENDPOINT -->|POST /api/emails/text-prompt| TP[✍️ Text Prompt Email]
    TP --> TPP[TEXT_PROMPT_EMAIL_PROMPT]
    TPP --> TPLLM[local_llm]
    TPLLM --> TPSAVE[💾 Save email]
    
    ENDPOINT -->|POST /api/emails/from-context| CE2[📋 Context Email]
    CE2 --> CEP[CONTEXT_COLD_EMAIL_PROMPT]
    CEP --> CELLM[local_llm]
    CELLM --> CESAVE[💾 Save email]
    
    ENDPOINT -->|POST /api/emails/generate| CE[📧 Cold Email]
    CE --> CP[COLD_EMAIL_PROMPT]
    CP --> RAG1[RAG retrieve company context]
    RAG1 --> CLLM[local_llm]
    CLLM --> PARSE[Parse subject / body]
    PARSE --> RESUME
    
    RESUME[Also generate resume] --> RP[RESUME_INJECTION_PROMPT]
    RP --> RAG2[RAG retrieve base resume]
    RAG2 --> RLLM[local_llm]
    RLLM --> SAVE[💾 Save email + resume]
    
    ENDPOINT -->|POST /api/resumes/generate| RG[📄 Resume Gen]
    RG --> RGP[RESUME_INJECTION_PROMPT]
    RGP --> RGRAG[RAG retrieve base resume]
    RGRAG --> RGLLM[local_llm]
    RGLLM --> RGSAVE[💾 Save resume]
    
    ENDPOINT -->|POST /api/resumes/parse| RPARSE[🧩 Parse Resume]
    RPARSE --> RPARSEP[RESUME_PARSE_PROMPT]
    RPARSEP --> RPARSELLM[local_llm]
    RPARSELLM --> RPARSEJ[Parse JSON]
    
    ENDPOINT -->|POST /api/resumes/build| RBUILD[🛠 ATS Resume]
    RBUILD --> RBUILDP[ATS_RESUME_BUILD_PROMPT]
    RBUILDP --> RBUILDLLM[local_llm]
    RBUILDLLM --> RBUILDMD[📝 Markdown resume]
    
    ENDPOINT -->|POST /api/resumes/*/ats-score| ATS[📊 ATS Score]
    ATS --> AP[ATS_ANALYSIS_PROMPT]
    AP --> ALLM[gemini - llm]
    ALLM --> AJ[Parse JSON response]
    AJ --> AUPDATE[💾 Update DB + return]
    
    style QE fill:#E0F2FE,stroke:#0284C7
    style JD fill:#E0F2FE,stroke:#0284C7
    style TP fill:#E0F2FE,stroke:#0284C7
    style CE2 fill:#E0F2FE,stroke:#0284C7
    style CE fill:#DCFCE7,stroke:#16A34A
    style RG fill:#FEF3C7,stroke:#D97706
    style RPARSE fill:#FEF3C7,stroke:#D97706
    style RBUILD fill:#FEF3C7,stroke:#D97706
    style ATS fill:#F3E8FF,stroke:#9333EA
```

</div>

<br/>

---

## 📊 Data Models

<br/>

### 👤 User — `users`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `Integer` | 🔑 PK, Auto | Unique identifier |
| `email` | `String` | 🔷 Unique, Indexed, NOT NULL | Login email |
| `hashed_password` | `String` | 🔒 NOT NULL | bcrypt hash |
| `full_name` | `String` | ➖ Nullable | Display name |
| `role` | `String` | 📛 Default: `"user"` | `admin` / `user` |
| `phone` | `String` | ➖ Nullable | Contact |
| `linkedin` | `String` | ➖ Nullable | Profile URL |
| `portfolio` | `String` | ➖ Nullable | Website |
| `bio` | `Text` | ➖ Nullable | Short bio |
| `settings` | `JSON` | ⚙️ Nullable | Preferences |
| `is_active` | `Boolean` | ✅ Default: `True` | Soft disable |
| `created_at` | `DateTime` | 📅 Server default | |
| `updated_at` | `DateTime` | 🔄 On update | |

**Relationships:** `projects`, `emails`, `documents`, `companies`, `applications`, `templates`, `resumes`, `notifications`, `reminders`

<br/>

### 📁 Project — `projects`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `Integer` | 🔑 PK, Auto | |
| `name` | `String` | 🔷 Indexed, NOT NULL | Campaign name |
| `description` | `String` | ➖ Nullable | |
| `user_id` | `Integer` | 🔗 FK → `users.id` | Owner |
| `created_at` | `DateTime` | 📅 Server default | |
| `updated_at` | `DateTime` | 🔄 On update | |

**Relationships:** `documents` (cascade), `emails` (cascade), `resumes`

<br/>

### ✉️ Email — `emails`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `Integer` | 🔑 PK, Auto | |
| `subject` | `String` | ➖ | Extracted subject line |
| `body` | `Text` | 📝 NOT NULL | Generated email body |
| `recipient_name` | `String` | ➖ | Target person |
| `recipient_company` | `String` | ➖ | Target company |
| `job_id_referenced` | `String` | ➖ | Job ID from JD |
| `job_description` | `Text` | ➖ Nullable | Source JD |
| `generated_resume` | `Text` | ➖ Nullable | AI-tailored resume |
| `project_id` | `Integer` | 🔗 FK → `projects.id` | Parent |
| `user_id` | `Integer` | 🔗 FK → `users.id` | Owner |
| `created_at` | `DateTime` | 📅 Server default | |

<br/>

### 📄 Resume — `resumes`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `Integer` | 🔑 PK, Auto | |
| `company_name` | `String` | 🏢 NOT NULL | Target company |
| `job_title` | `String` | ➖ Nullable | Target role |
| `job_description` | `Text` | ➖ Nullable | Source JD |
| `resume_content` | `Text` | 📝 NOT NULL | AI resume (Markdown) |
| `ats_score` | `Float` | 📊 Nullable | 0–100 ATS score |
| `missing_skills` | `Text` | 🏷 Nullable | Comma-separated gaps |
| `match_percentage` | `Float` | 📈 Nullable | % matched |
| `project_id` | `Integer` | 🔗 FK → `projects.id` | Optional |
| `user_id` | `Integer` | 🔗 FK → `users.id` | Owner |
| `created_at` | `DateTime` | 📅 Server default | |

<br/>

### 🏢 Company — `companies`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `Integer` | 🔑 PK, Auto | |
| `name` | `String` | 🏷 NOT NULL | Company name |
| `logo_url` | `String` | ➖ Nullable | Logo |
| `website` | `String` | ➖ Nullable | Website |
| `industry` | `String` | ➖ Nullable | Sector |
| `location` | `String` | ➖ Nullable | HQ |
| `notes` | `Text` | ➖ Nullable | User notes |
| `user_id` | `Integer` | 🔗 FK → `users.id` | Owner |
| `created_at` | `DateTime` | 📅 Server default | |

<br/>

### 📋 Application — `applications`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `Integer` | 🔑 PK, Auto | |
| `job_role` | `String` | 🎯 NOT NULL | |
| `status` | `String` | 📌 Default: `"Draft"` | Draft / Applied / Interviewing / Offer / Rejected |
| `salary_range` | `String` | ➖ Nullable | |
| `employment_type` | `String` | ➖ Nullable | Full-time, Contract |
| `date_applied` | `DateTime` | ➖ Nullable | |
| `source` | `String` | ➖ Nullable | LinkedIn, Careers |
| `recruiter_name` | `String` | ➖ Nullable | |
| `recruiter_contact` | `String` | ➖ Nullable | |
| `hr_contact` | `String` | ➖ Nullable | |
| `notes` | `Text` | ➖ Nullable | |
| `resume_id` | `Integer` | 🔗 FK → `documents.id` | Linked |
| `email_id` | `Integer` | 🔗 FK → `emails.id` | Linked |
| `company_id` | `Integer` | 🔗 FK → `companies.id` | 🔷 NOT NULL |
| `user_id` | `Integer` | 🔗 FK → `users.id` | 🔷 NOT NULL |
| `project_id` | `Integer` | 🔗 FK → `projects.id` | Optional |
| `created_at` | `DateTime` | 📅 Server default | |
| `updated_at` | `DateTime` | 🔄 On update | |

<br/>

### 📎 Document — `documents`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `Integer` | 🔑 PK, Auto | |
| `filename` | `String` | 📄 NOT NULL | Original name |
| `filepath` | `String` | 📂 NOT NULL | Server path |
| `doc_type` | `String` | 🏷 Nullable | resume / company_profile / etc. |
| `project_id` | `Integer` | 🔗 FK → `projects.id` | 🔷 NOT NULL |
| `user_id` | `Integer` | 🔗 FK → `users.id` | 🔷 NOT NULL |
| `created_at` | `DateTime` | 📅 Server default | |

<br/>

### 📝 Template — `templates`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `Integer` | 🔑 PK, Auto | |
| `name` | `String` | 🏷 NOT NULL | |
| `description` | `String` | ➖ Nullable | |
| `content` | `Text` | 📝 NOT NULL | Template body |
| `user_id` | `Integer` | 🔗 FK → `users.id` | Null = global |
| `created_at` | `DateTime` | 📅 Server default | |
| `updated_at` | `DateTime` | 🔄 On update | |

<br/>

### 🔔 Notification — `notifications`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `Integer` | 🔑 PK, Auto | |
| `title` | `String` | 🏷 NOT NULL | |
| `message` | `Text` | 📝 NOT NULL | |
| `type` | `String` | 🔵 Default: `"info"` | info / warning / success / error |
| `is_read` | `Boolean` | 👁 Default: `False` | |
| `user_id` | `Integer` | 🔗 FK → `users.id` | |
| `created_at` | `DateTime` | 📅 Server default | |

<br/>

### ⏰ Reminder — `reminders`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `Integer` | 🔑 PK, Auto | |
| `title` | `String` | 🏷 NOT NULL | Follow-up title |
| `description` | `Text` | ➖ Nullable | |
| `due_date` | `DateTime` | 🗓 NOT NULL | Due timestamp |
| `is_completed` | `Boolean` | ✅ Default: `False` | |
| `user_id` | `Integer` | 🔗 FK → `users.id` | 🔷 NOT NULL |
| `application_id` | `Integer` | 🔗 FK → `applications.id` | ➖ Nullable |
| `created_at` | `DateTime` | 📅 Server default | |

**Relationships:** `user`, `application`

<br/>

---

## 🌐 API Reference

<br/>

### 🔐 Authentication — `/api/auth`

| Method | Path | Auth | Request | Response | Description |
|--------|------|:----:|---------|:--------:|-------------|
| <kbd>POST</kbd> | `/api/auth/register` | ❌ | `UserCreate` | `UserOut` 🟢 201 | Create account |
| <kbd>POST</kbd> | `/api/auth/login` | ❌ | OAuth2 form | `Token` 🟢 200 | Get JWT pair |
| <kbd>GET</kbd> | `/api/auth/me` | ✅ | — | `UserOut` 🟢 200 | Current profile |
| <kbd>PUT</kbd> | `/api/auth/me` | ✅ | `UserUpdate` | `UserOut` 🟢 200 | Update profile |

<br/>

### 📁 Projects — `/api/projects`

| Method | Path | Auth | Request | Response | Description |
|--------|------|:----:|---------|:--------:|-------------|
| <kbd>GET</kbd> | `/api/projects/` | ✅ | — | `List[ProjectOut]` 🟢 200 | List all |
| <kbd>POST</kbd> | `/api/projects/` | ✅ | `ProjectCreate` | `ProjectOut` 🟢 201 | Create |
| <kbd>GET</kbd> | `/api/projects/{id}` | ✅ | — | `ProjectOut` 🟢 200 | Get one |
| <kbd>PUT</kbd> | `/api/projects/{id}` | ✅ | `ProjectUpdate` | `ProjectOut` 🟢 200 | Update |
| <kbd>DELETE</kbd> | `/api/projects/{id}` | ✅ | — | 🔴 204 | Delete (cascade) |

<br/>

### ✉️ Emails — `/api/emails`

| Method | Path | Auth | Request | Response | Description |
|--------|------|:----:|---------|:--------:|-------------|
| <kbd>POST</kbd> | `/api/emails/quick` | ✅ | `QuickEmailRequest` | `QuickEmailResponse` 🟢 200 | Quick by role only |
| <kbd>POST</kbd> | `/api/emails/from-jd` | ✅ | Multipart (file/text) | `JDEmailResponse` 🟢 200 | JD file/paste → email (auto-saved) |
| <kbd>POST</kbd> | `/api/emails/text-prompt` | ✅ | `TextPromptRequest` | `TextPromptResponse` 🟢 200 | Free-text prompt → email |
| <kbd>POST</kbd> | `/api/emails/from-context` | ✅ | `ContextEmailRequest` | `ContextEmailResponse` 🟢 200 | Prompt + tone → email |
| <kbd>POST</kbd> | `/api/emails/generate` | ✅ | `EmailGenerateRequest` | `EmailOut` 🟢 201 | Full gen + RAG + auto-resume |
| <kbd>GET</kbd> | `/api/emails/project/{id}` | ✅ | — | `List[EmailOut]` 🟢 200 | List project emails |
| <kbd>GET</kbd> | `/api/emails/{id}` | ✅ | — | `EmailOut` 🟢 200 | Get one |
| <kbd>PUT</kbd> | `/api/emails/{id}` | ✅ | `EmailUpdate` | `EmailOut` 🟢 200 | Update subject |
| <kbd>DELETE</kbd> | `/api/emails/{id}` | ✅ | — | 🔴 204 | Delete |

<br/>

### 📄 Resumes — `/api/resumes`

| Method | Path | Auth | Request | Response | Description |
|--------|------|:----:|---------|:--------:|-------------|
| <kbd>POST</kbd> | `/api/resumes/generate` | ✅ | `ResumeGenerateRequest` | `ResumeOut` 🟢 201 | Generate from JD |
| <kbd>GET</kbd> | `/api/resumes/` | ✅ | — | `List[ResumeOut]` 🟢 200 | List all |
| <kbd>GET</kbd> | `/api/resumes/company/{name}` | ✅ | — | `List[ResumeOut]` 🟢 200 | By company |
| <kbd>GET</kbd> | `/api/resumes/{id}` | ✅ | — | `ResumeOut` 🟢 200 | Get one |
| <kbd>PUT</kbd> | `/api/resumes/{id}` | ✅ | `ResumeUpdate` | `ResumeOut` 🟢 200 | Update |
| <kbd>DELETE</kbd> | `/api/resumes/{id}` | ✅ | — | 🔴 204 | Delete |
| <kbd>POST</kbd> | `/api/resumes/ats-score` | ✅ | `ATSAnalysisRequest` | `ATSAnalysisResponse` 🟢 200 | Analyze any resume+JD |
| <kbd>POST</kbd> | `/api/resumes/{id}/ats-score` | ✅ | — | `ATSAnalysisResponse` 🟢 200 | Analyze + auto-save score |
| <kbd>POST</kbd> | `/api/resumes/parse` | ✅ | `ResumeParseRequest` | `ResumeParseResponse` 🟢 200 | Extract structured profile (name/contact/location/education/skills) |
| <kbd>POST</kbd> | `/api/resumes/build` | ✅ | `ATSResumeGenerateRequest` | `ATSResumeGenerateResponse` 🟢 200 | Build ATS-optimized resume (Markdown) |
| <kbd>POST</kbd> | `/api/resumes/extract-text` | ✅ | File (PDF/DOCX) | `{text}` 🟢 200 | Extract raw text from file |

<br/>

### 📎 Documents — `/api/documents`

| Method | Path | Auth | Request | Response | Description |
|--------|------|:----:|---------|:--------:|-------------|
| <kbd>POST</kbd> | `/api/documents/` | ✅ | Multipart | `DocumentOut` 🟢 201 | Upload + chunk + index |
| <kbd>GET</kbd> | `/api/documents/project/{id}` | ✅ | — | `List[DocumentOut]` 🟢 200 | List |
| <kbd>PUT</kbd> | `/api/documents/{id}` | ✅ | `DocumentUpdate` | `DocumentOut` 🟢 200 | Rename |
| <kbd>DELETE</kbd> | `/api/documents/{id}` | ✅ | — | 🔴 204 | Delete metadata |

<br/>

### 📈 Activities — `/api/activities`

| Method | Path | Auth | Request | Response | Description |
|--------|------|:----:|---------|:--------:|-------------|
| <kbd>GET</kbd> | `/api/activities/` | ✅ | — | `List[ActivityOut]` 🟢 200 | List |
| <kbd>POST</kbd> | `/api/activities/` | ✅ | `ActivityCreate` | `ActivityOut` 🟢 201 | Create |
| <kbd>PUT</kbd> | `/api/activities/{id}` | ✅ | `ActivityUpdate` | `ActivityOut` 🟢 200 | Update |
| <kbd>DELETE</kbd> | `/api/activities/{id}` | ✅ | — | 🔴 204 | Delete |

<br/>

### ❤️ Health

| Method | Path | Auth | Response | Description |
|--------|------|:----:|:--------:|-------------|
| <kbd>GET</kbd> | `/` | ❌ | `{status, message}` 🟢 200 | Welcome |
| <kbd>GET</kbd> | `/health` | ❌ | `{status, timestamp, version}` 🟢 200 | Health check |

<br/>

---

## 🧠 AI Prompts

<br/>

<details open>
<summary><b>📧 1. COLD_EMAIL_PROMPT</b> — <i>Full email generation</i></summary>

<br/>

**Used in:** `POST /api/emails/generate`  
**Input variables:** `{context}`, `{recipient_name}`, `{company_name}`, `{industry}`, `{pain_points}`, `{job_id}`, `{job_description}`, `{tone}`  
**LLM:** `local_llm` (Gemini)

```
You are an expert sales and marketing copywriter specializing in high-converting cold emails.
Your goal is to write a personalized cold email based on the provided context, instructions, and job description.

Context about our company and product (from our knowledge base):
{context}

Job Description (for the role they are hiring for):
{job_description}

Recipient Information:
- Name: {recipient_name}
- Company: {company_name}
- Industry: {industry}
- Job ID (if known, otherwise extract from JD): {job_id}
- Known Pain Points: {pain_points}

Instructions:
1. Write a compelling subject line.
2. Tone should be: {tone}.
3. The email must be highly personalized. Use the recipient's name and company.
4. If a Job ID or Job Reference is provided or found in the Job Description, mention it explicitly.
5. Clearly state the value proposition based on the Context provided.
6. Include a clear Call to Action (CTA).
7. Keep it concise, professional, and easy to read.

Output Format:
Subject: [Your Subject Line]

[Body of the email]
```

<br/>

| Tag | Why It's Used |
|-----|---------------|
| `{context}` | **RAG injection point.** Embeds retrieved FAISS chunks so the email references the user's actual products/services — not generic fluff. |
| `{recipient_name}` | **Personalization.** Emails with names get 2–3× higher open rates. |
| `{company_name}` | **Company targeting.** Allows natural mention of the prospect's company. |
| `{industry}` | **Domain alignment.** AI uses industry-specific terminology. |
| `{pain_points}` | **Problem-aware.** User specifies known pain points; AI writes a solution-oriented pitch. |
| `{job_id}` | **Role precision.** Referencing the specific job posting ID makes the email feel manually crafted. |
| `{job_description}` | **Skill alignment.** AI sees exactly what the employer wants and positions the pitch accordingly. |
| `{tone}` | **Style control.** Professional, Friendly, Bold — the AI adjusts vocabulary and sentence rhythm. |

**Why `Subject: ... \n\n Body` format?** The backend scans the first line for `Subject:` prefix, stores it in `email.subject`, and the remainder goes to `email.body`. This enables inbox-style subject-line listing on the frontend.

</details>

<br/>

<details open>
<summary><b>📄 2. RESUME_INJECTION_PROMPT</b> — <i>Tailored resume</i></summary>

<br/>

**Used in:** `POST /api/emails/generate` and `POST /api/resumes/generate`  
**Input variables:** `{job_description}`, `{current_resume}`  
**LLM:** `llm` (Gemini)

```
You are an expert technical recruiter and resume writer.
Your task is to extract relevant skills from a Job Description and intelligently integrate them into a candidate's current resume.

Job Description:
{job_description}

Current Resume:
{current_resume}

Instructions:
1. Analyze the Job Description and extract the key skills and keywords.
2. Review the Current Resume.
3. Generate an updated version of the resume that highlights these extracted skills.
   Do not lie or invent experience, but reframe the existing experience to better align with the job description.
4. Output the updated resume in Markdown format.
```

<br/>

| Tag | Why It's Used |
|-----|---------------|
| `{job_description}` | **The target.** The AI extracts every skill, tool, and requirement. |
| `{current_resume}` | **The source of truth.** Retrieved from the user's Knowledge Base via RAG. |

**Why Markdown?** Markdown is human-readable, renders in the frontend, exports as `.md` files, and converts easily to PDF/HTML via Pandoc. It's the universal resume format.

**Why not invent experience?** The instruction "Do not lie" is critical — the AI *reframes* existing experience (e.g., rephrases "used Python" to "built Python microservices") but never fabricates.

</details>

<br/>

<details open>
<summary><b>📊 3. ATS_ANALYSIS_PROMPT</b> — <i>ATS scoring & gap analysis</i></summary>

<br/>

**Used in:** `POST /api/resumes/ats-score` and `POST /api/resumes/{id}/ats-score`  
**Input variables:** `{resume_content}`, `{job_description}`  
**LLM:** `llm` (Gemini)

```
You are an expert ATS (Applicant Tracking System) analyst and career coach.
Your task is to analyze a candidate's resume against a job description and provide detailed scoring.

Job Description:
{job_description}

Resume:
{resume_content}

Analyze the resume against the job description and return a JSON object with the following fields:
1. "ats_score": A float between 0 and 100 representing the overall ATS compatibility score.
2. "missing_skills": An array of strings listing important skills mentioned in the JD that are missing or insufficiently addressed in the resume.
3. "match_percentage": A float between 0 and 100 representing the percentage of key requirements matched.
4. "recommendations": An array of strings with actionable recommendations to improve the resume for this specific job.
5. "strengths": An array of strings highlighting the strongest matching areas of the resume against the JD.

Return ONLY valid JSON, no other text.
```

<br/>

| Tag | Why It's Used |
|-----|---------------|
| `{resume_content}` | **The candidate.** The AI checks keyword density, experience relevance, formatting, and skill coverage. |
| `{job_description}` | **The benchmark.** Every requirement in the JD is compared against what the resume offers. |

**Why structured JSON output?**

| JSON Field | User-Facing Purpose | Visual Treatment |
|------------|---------------------|------------------|
| `ats_score` | **Quick health check** (0–100) | 🟢 ≥80 / 🟡 60–79 / 🔴 <60 |
| `missing_skills` | **Gap analysis:** exactly which skills to add | 🏷 Colored "missing" badges |
| `match_percentage` | **Shortlist probability** | 📈 Progress bar |
| `recommendations` | **Actionable steps** | 💡 Bulleted list |
| `strengths` | **Positive reinforcement** | ✅ Green checkmarks |

**Why `Return ONLY valid JSON, no other text`?** The backend calls `json.loads()` to parse the response. If the LLM wraps JSON in markdown code blocks, a regex fallback strips them: `re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', content)`. If all parsing fails, sensible defaults are returned (score: 50, empty arrays).

</details>

<br/>

<details open>
<summary><b>⚡ 4. QUICK_EMAIL_PROMPT</b> — <i>Rapid one-liner email</i></summary>

<br/>

**Used in:** `POST /api/emails/quick`  
**Input variables:** `{role}`  
**LLM:** `local_llm` (Gemini)

```
You are an expert career coach and cold email writer.
Write a short, crisp, and highly effective cold email applying for a {role} position.
Do not use any placeholders that require the user to look up information.
Keep it under 150 words.
The email should highlight relevant skills, enthusiasm for the role, and a clear call to action.

Output Format:
Subject: [Your Subject Line]

[Body of the email]
```

<br/>

| Tag | Why It's Used |
|-----|---------------|
| `{role}` | **Single input.** The user types just "Software Engineer" or "Data Scientist" and gets an instant email. |

**Why a separate prompt?** The Quick Email feature is for speed — no RAG, no JD, no forms. Just role-in → email-out. The 150-word cap ensures scannable output. The "no placeholders" rule prevents `[Your Name]` tokens.

</details>

<br/>

<details open>
<summary><b>📧 5. JD_COLD_EMAIL_PROMPT</b> — <i>Cold email straight from a Job Description</i></summary>

<br/>

**Used in:** `POST /api/emails/from-jd`  
**Input variables:** `{job_description}`, `{candidate_name}`  
**LLM:** `local_llm` (Ollama/Gemma, falls back to Gemini)

```
You are an expert career coach and cold email copywriter who writes high-converting, crisp cold emails for job applications.

Read the Job Description below carefully and extract:
- The role title and company (if mentioned)
- The key skills, technologies, and requirements
- The responsibilities

Job Description:
{job_description}

CRITICAL RULES:
1. You MUST NOT use any placeholders or bracket placeholders like [Name], [Company], [Number], [Your Name], [Previous Company], [Percentage], <X>, etc.
2. The candidate's name is "{candidate_name}". Sign the email with this exact name.
3. If a hiring manager name is not given in the JD, open with "Dear Hiring Manager".
4. Never invent fake metrics or employers. Use confident, generic but specific-sounding phrasing.
5. Do NOT include words like "placeholder", "X years", or ask the reader to fill anything in.

Write a single, crisp, professional cold email (under 180 words) that references the role, highlights 3-4 matching skills, shows enthusiasm, and ends with a low-friction CTA.

Output Format (strictly, with no brackets anywhere):
Subject: <A concise, attention-grabbing subject line>

<Email body with short paragraphs and a clear sign-off.>
```

<br/>

| Tag | Why It's Used |
|-----|---------------|
| `{job_description}` | **The only real input.** The AI extracts role, company, and key requirements itself. |
| `{candidate_name}` | **Signature.** The email is signed with the logged-in user's name. |

**Why a dedicated JD prompt?** Powers the "JD Email Generator" — a two-step wizard where the user uploads/pastes a JD and gets a ready-to-send email. Output is post-processed by `clean_placeholders()` (strips `[...]`, `<...>`, `{...}`, markdown markers) and `_extract_email_parts()` (splits `Subject:` from body) before being auto-saved.

</details>

<br/>

<details open>
<summary><b>⚡ 6. TEXT_PROMPT_EMAIL_PROMPT</b> — <i>Short email from a free-text prompt</i></summary>

<br/>

**Used in:** `POST /api/emails/text-prompt`  
**Input variables:** `{prompt}`, `{candidate_name}`  
**LLM:** `local_llm` (Ollama/Gemma)

```
You are an expert career coach and cold email copywriter who writes short, sweet, high-converting cold emails for job applications.

The user has shared what they want the email about:
{prompt}

CRITICAL RULES:
1. You MUST NOT use any placeholders or bracket placeholders like [Name], [Company], [Role], [Number], <X>, etc.
2. The candidate's name is "{candidate_name}". Sign the email with this exact name.
3. If no hiring manager name is mentioned, open with "Dear Hiring Manager".
4. Never invent fake metrics, credentials, or employers.
5. Do NOT include words like "placeholder", "X years", or ask the reader to fill anything in.

Write a single, short, sweet, professional cold email (under 120 words) that opens with a strong personalized line, highlights relevant skills, and ends with a clear low-friction call to action.

Output Format (strictly, with no brackets anywhere):
Subject: A concise, attention-grabbing subject line

Email body with short paragraphs and a clear sign-off.
```

<br/>

| Tag | Why It's Used |
|-----|---------------|
| `{prompt}` | **User intent.** Whatever the user typed becomes the email's subject matter. |
| `{candidate_name}` | **Signature.** Signs the email so it reads as first-person. |

**Why a separate prompt?** Fast, form-free email generation. It enforces a 120-word cap, bans placeholders, and avoids inventing fake metrics — so every output is sendable as-is.

</details>

<br/>

<details open>
<summary><b>💬 7. CONTEXT_COLD_EMAIL_PROMPT</b> — <i>Prompt + tone email</i></summary>

<br/>

**Used in:** `POST /api/emails/from-context`  
**Input variables:** `{user_prompt}`, `{candidate_name}`, `{tone}`  
**LLM:** `local_llm` (Ollama/Gemma)

```
You are an expert career coach and cold email copywriter who specializes in writing high-converting, polished cold emails.

The user has provided the following context/instructions for the cold email they want:
"{user_prompt}"

The candidate's name is: {candidate_name}
Desired tone: {tone}

CRITICAL RULES:
1. You MUST NOT use any placeholders or bracket placeholders like [Name], [Company], [Number], [Your Name], <X>, etc.
2. Parse the user's context carefully to extract the role, company name, and any specific details.
3. Sign the email with the candidate's exact name.
4. If a hiring manager name is not provided, open with "Dear Hiring Manager".
5. Never invent fake metrics or employers.
6. Match the desired tone: {tone}

Write a single, polished, professional cold email (150-250 words) that opens with a strong personalized first line, highlights 3-4 relevant skills, shows enthusiasm, and ends with a clear low-friction call to action.

Output Format (strictly, with no brackets anywhere):
Subject: <A concise, attention-grabbing subject line>

<Email body with short paragraphs and a clear sign-off.>
```

<br/>

| Tag | Why It's Used |
|-----|---------------|
| `{user_prompt}` | **The blueprint.** The user describes role, company, and any specifics in plain English. |
| `{candidate_name}` | **Signature.** Personalizes the sign-off. |
| `{tone}` | **Style control.** Professional, Friendly, Confident, Enthusiastic, Formal, Casual — mapped from the frontend dropdown. |

**Why separate from JD prompt?** This powers the "Cold Email Generator" page with example prompts, auto-suggest, and a tone picker. It parses free-form context instead of a structured JD.

</details>

<br/>

<details open>
<summary><b>🧩 8. RESUME_PARSE_PROMPT</b> — <i>Extract structured data from a resume</i></summary>

<br/>

**Used in:** `POST /api/resumes/parse`  
**Input variables:** `{resume_content}`  
**LLM:** `local_llm` (Ollama/Gemma)

```
You are an expert ATS parser. Your task is to extract the following information from the provided resume text:
- Name
- Email (or contact number if email missing)
- Location
- Education (as a single concise string or bullet list)
- Skills (as a list of strings)

Resume Text:
{resume_content}

Return the extracted information ONLY as a valid JSON object with the following exact keys:
{
  "name": "...",
  "contact": "...",
  "location": "...",
  "education": "...",
  "skills": ["...", "..."]
}

Do not include any markdown formatting like ```json or any other text. Just the JSON object.
```

<br/>

**Why JSON?** The frontend Resume Builder needs discrete fields (name, contact, location, education, skills) to render a reviewable, editable profile. The backend strips markdown code-block wrappers via regex before `json.loads()`; on failure it returns sensible defaults.

</details>

<br/>

<details open>
<summary><b>🛠 9. ATS_RESUME_BUILD_PROMPT</b> — <i>Generate an ATS-optimized resume</i></summary>

<br/>

**Used in:** `POST /api/resumes/build`  
**Input variables:** `{parsed_info}`, `{job_description}`  
**LLM:** `local_llm` (Ollama/Gemma)

```
You are an expert Resume Writer and ATS optimization specialist.
Your task is to generate a polished, professional, ATS-optimized resume using the provided Candidate Information, tailored specifically to the Job Description below.

Job Description:
{job_description}

Candidate Information (JSON format):
{parsed_info}

Instructions:
1. Output the final resume in formatted Markdown.
2. Ensure 100% ATS compatibility by strategically naturally incorporating keywords from the Job Description.
3. Frame existing skills as actionable experience — do NOT lie.
4. Do not include placeholders or brackets.
5. Use H1 for Name, H3 for Contact Info, H2 for Sections.
6. Do NOT wrap the output in markdown code blocks.
```

<br/>

| Tag | Why It's Used |
|-----|---------------|
| `{parsed_info}` | **Candidate profile.** The structured data extracted by `RESUME_PARSE_PROMPT` (plus any edits). |
| `{job_description}` | **The target.** Keywords are naturally woven in for ATS keyword matching. |

**Why Markdown?** Renders in the frontend via `react-markdown`, exports to PDF with `html2pdf.js`, and stays plain-text readable for ATS parsers.

</details>

<br/>

---

## ⚙️ Setup

<br/>

### Prerequisites

- Python **3.11+**
- Node.js **20+**
- [Ollama](https://ollama.com/) with the **Gemma 2 (2B)** model *(default local LLM)*
- Google Gemini API key ([get one free](https://aistudio.google.com/)) *(optional cloud fallback)*

<br/>

### 0. Ollama Setup (recommended)

The default LLM provider is a **local Gemma model** — free, private, and offline.

```bash
# Install Ollama, then pull the default model:
ollama pull gemma2:2b
```

- Ollama must be running at `http://localhost:11434` for local generation.
- Set `LLM_PROVIDER=gemini` in `backend/.env` to switch back to Google Gemini (requires `GEMINI_API_KEY`).

<br/>

### 1. Environment Variables

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edit **`backend/.env`** — set `LLM_PROVIDER` (default `ollama`) and, if using Gemini, `GEMINI_API_KEY`:

```ini
DATABASE_URL=sqlite:///./ai_cold_email.db       # or PostgreSQL
JWT_SECRET=your-random-secret-here
JWT_REFRESH_SECRET=your-random-refresh-secret

# LLM provider: "ollama" (local Gemma) or "gemini" (cloud)
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma2:2b
OLLAMA_TEMPERATURE=0.7
OLLAMA_NUM_CTX=8192

GEMINI_API_KEY=AIzaSy...                         # Required if LLM_PROVIDER=gemini
GEMINI_MODEL=gemini-2.5-flash
```

<br/>

### 2. Backend

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate          # Windows
pip install -r requirements.txt
alembic upgrade head             # Run migrations
uvicorn app.main:app --reload    # http://localhost:8000
```

<br/>

### 3. Frontend

```bash
cd frontend
npm install
npm run dev                      # http://localhost:3000
```

<br/>

### 4. One-Click Launch (Windows)

Double-click **`run.bat`** or run:

```powershell
.\run.ps1
```

<br/>

### 5. Run Tests

```bash
cd backend
.\venv\Scripts\activate
pytest tests/test_api_endpoints.py -v
```

<br/>

---

## 📁 Structure

<br/>

<pre>
📦 <b>ai-cold-email-generator</b>
 ┣━ 📂 <b>backend</b>
 ┃   ┣━ 📂 alembic ─────────────── 🔄 Database migrations
 ┃   ┃   ┗━ 📂 versions ───────── 📜 Migration scripts
 ┃   ┣━ 📂 app
 ┃   ┃   ┣━ 📂 ai
 ┃   ┃   ┃   ┣━ 📄 gemini_client.py ─── 🤖 Gemini cloud LLM
 ┃   ┃   ┃   ┣━ 📄 ollama_client.py ─── 🦙 Local Gemma LLM (default)
 ┃   ┃   ┃   ┣━ 📂 prompts
 ┃   ┃   ┃   ┃   ┣━ 📄 email_prompts.py ─────── 📜 7 email prompt templates
 ┃   ┃   ┃   ┃   ┗━ 📄 resume_builder_prompts.py ─ 🧩 Parse + ATS-build prompts
 ┃   ┃   ┃   ┗━ 📂 rag
 ┃   ┃   ┃       ┗━ 📄 engine.py ──────── 📚 FAISS + embeddings
 ┃   ┃   ┣━ 📂 api
 ┃   ┃   ┃   ┣━ 📄 emails.py ─────────── ✉️ Email gen (quick / jd / prompt / context)
 ┃   ┃   ┃   ┣━ 📄 resumes.py ────────── 📄 Resume gen + ATS + parse + build
 ┃   ┃   ┃   ┣━ 📄 projects.py ───────── 📁 Project CRUD
 ┃   ┃   ┃   ┣━ 📄 documents.py ──────── 📎 Upload + RAG index
 ┃   ┃   ┃   ┗━ 📄 activities.py ─────── 📈 Activity log
 ┃   ┃   ┣━ 📂 auth
 ┃   ┃   ┃   ┣━ 📄 jwt.py ────────────── 🔑 JWT + bcrypt
 ┃   ┃   ┃   ┗━ 📄 router.py ─────────── 🔐 Register/Login/Me
 ┃   ┃   ┣━ 📂 middleware
 ┃   ┃   ┃   ┗━ 📄 error_handler.py ──── 🛡 Global error handlers
 ┃   ┃   ┣━ 📂 models ─────────────── 🗄 SQLAlchemy (11 models)
 ┃   ┃   ┣━ 📂 schemas ────────────── 📋 Pydantic (request/response)
 ┃   ┃   ┣━ 📂 services
 ┃   ┃   ┃   ┗━ 📄 ai_service.py ─────── ⚡ AI orchestrator
 ┃   ┃   ┣━ 📄 config.py ─────────────── ⚙️ Pydantic settings (.env)
 ┃   ┃   ┣━ 📄 limiter.py ────────────── 🚦 Rate limiting (slowapi)
 ┃   ┃   ┣━ 📄 main.py ──────────────── 🚀 FastAPI entry
 ┃   ┃   ┗━ 📄 database.py ──────────── 💾 SQLAlchemy engine
 ┃   ┣━ 📂 faiss_index ─────────── 🔍 Per-project vector indices
 ┃   ┣━ 📂 storage/documents ───── 📂 Uploaded files
 ┃   ┣━ 📂 tests
 ┃   ┣━ 📄 requirements.txt
 ┃   ┗━ 📄 .env.example
 ┃
 ┣━ 📂 <b>frontend</b>
 ┃   ┣━ 📂 src
 ┃   ┃   ┣━ 📂 components
 ┃   ┃   ┃   ┣━ 📄 ColdEmailGenerator.tsx ── 📧 JD → email wizard
 ┃   ┃   ┃   ┣━ 📄 ErrorBoundary.tsx
 ┃   ┃   ┃   ┣━ 📄 ThemeToggle.tsx ──────── 🌓 Light/dark switch
 ┃   ┃   ┃   ┗━ 📂 layout
 ┃   ┃   ┃       ┗━ 📄 AppLayout.tsx ─── 🧭 Sidebar + header + guard
 ┃   ┃   ┣━ 📂 data
 ┃   ┃   ┃   ┗━ 📄 resumeTemplates.ts ──── 📄 ATS-friendly resume templates
 ┃   ┃   ┣━ 📂 lib
 ┃   ┃   ┃   ┗━ 📄 api.ts ────────────── 🔗 Axios + interceptors
 ┃   ┃   ┣━ 📂 pages ─────────────── 🖥 19 page components
 ┃   ┃   ┃   ┣━ 📄 Dashboard.tsx ──────── 🏠 Overview + stats
 ┃   ┃   ┃   ┣━ 📄 EmailGenerator.tsx ─── 📧 JD Email Generator
 ┃   ┃   ┃   ┣━ 📄 ColdEmailPrompt.tsx ── ✨ Prompt + tone email
 ┃   ┃   ┃   ┣━ 📄 ResumeBuilder.tsx ─── 🧑‍💼 Parse → build ATS resume
 ┃   ┃   ┃   ┣━ 📄 Applications.tsx ───── 🎯 Job application tracker
 ┃   ┃   ┃   ┣━ 📄 Companies.tsx ──────── 🏢 Company CRM
 ┃   ┃   ┃   ┣━ 📄 Resumes.tsx ────────── 📄 Saved resumes + ATS scores
 ┃   ┃   ┃   ┣━ 📄 Templates.tsx ──────── 📝 Email templates
 ┃   ┃   ┃   ┣━ 📄 KnowledgeBase.tsx ──── 📚 Documents + RAG
 ┃   ┃   ┃   ┣━ 📄 History.tsx ────────── 🕘 Generation history
 ┃   ┃   ┃   ┣━ 📄 Analytics.tsx ──────── 📊 Charts + insights
 ┃   ┃   ┃   ┣━ 📄 NotificationsPage.tsx ─ 🔔 Notifications
 ┃   ┃   ┃   ┣━ 📄 CalendarPage.tsx ───── 📅 Interview calendar
 ┃   ┃   ┃   ┣━ 📄 Settings.tsx ───────── ⚙️ Profile settings
 ┃   ┃   ┃   ┣━ 📄 ProjectDetail.tsx ──── 📁 Project detail
 ┃   ┃   ┃   ┣━ 📄 NewProject.tsx ─────── 🆕 Create campaign
 ┃   ┃   ┃   ┣━ 📄 Landing.tsx ────────── 🚀 Marketing landing
 ┃   ┃   ┃   ┣━ 📄 Login.tsx / Register.tsx ─ 🔐 Auth
 ┃   ┃   ┃   ┗━ ... 
 ┃   ┃   ┣━ 📂 store
 ┃   ┃   ┃   ┣━ 📄 useAuthStore.ts ───── 👤 Auth state
 ┃   ┃   ┃   ┗━ 📄 useThemeStore.ts ──── 🌓 Theme state
 ┃   ┃   ┣━ 📄 App.tsx ──────────────── 🧩 Root + routes
 ┃   ┃   ┗━ 📄 main.tsx ─────────────── 🎯 Entry point
 ┃   ┣━ 📄 package.json
 ┃   ┣━ 📄 vite.config.ts
 ┃   ┣━ 📄 tailwind.config.js
 ┃   ┣━ 📄 components.json ─────────── 🎨 shadcn/ui config
 ┃   ┗━ 📄 .oxlintrc.json ──────────── 🔬 Lint config
 ┃
 ┣━ 📂 Doc ───────────────────────── 📊 Architecture diagrams + PPT
 ┣━ 📄 run.bat ───────────────────── 🏁 Windows launch (checks Ollama)
 ┣━ 📄 run.ps1 ───────────────────── 🏁 PowerShell launch (checks Ollama)
 ┗━ 📄 README.md ─────────────────── 📘 This file
</pre>

<br/>

---

<div align="center">
  <br/>
  <p><i>Built with ❤️ using React, FastAPI, LangChain & Google Gemini</i></p>
  <p>
    <a href="#">Report Bug</a> ·
    <a href="#">Request Feature</a> ·
    <a href="#">API Docs</a>
  </p>
  <br/>
  <p>
    <img src="https://img.shields.io/badge/Made%20with-React-61DAFB?logo=react" alt="React"/>
    <img src="https://img.shields.io/badge/Made%20with-FastAPI-009688?logo=fastapi" alt="FastAPI"/>
    <img src="https://img.shields.io/badge/Made%20with-Python-3776AB?logo=python" alt="Python"/>
    <img src="https://img.shields.io/badge/Powered%20by-Gemini-8E75B2?logo=google" alt="Gemini"/>
    <img src="https://img.shields.io/badge/Runs%20on-Ollama-000000?logo=ollama" alt="Ollama"/>
  </p>
  <br/>
  <p><b>ColdForge</b> — © 2026</p>
  <br/>
</div>

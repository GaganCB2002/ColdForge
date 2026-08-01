# ColdForge — Frontend

The React + TypeScript + Vite frontend for the **AI Cold Email Generator Pro** platform. It provides a full enterprise-SaaS UI for generating cold emails, building ATS-optimized resumes, tracking job applications, managing companies, and browsing a RAG-backed knowledge base.

## Tech Stack

- **React 19** + **TypeScript**
- **Vite 8** (dev server on `http://localhost:3000`)
- **Tailwind CSS** with dark mode
- **Zustand** — auth & theme state
- **React Router** — routing
- **shadcn/ui** + **Base UI** — component primitives
- **framer-motion** / **GSAP** / **Lenis** / **React Three Fiber** — animation & landing visuals
- **react-markdown** + **html2pdf.js** — resume preview & PDF export
- **Axios** — API client (JWT bearer token via interceptors)
- **react-hook-form** + **zod** — form validation
- **Oxlint** — linting

## Getting Started

```bash
npm install
npm run dev          # http://localhost:3000
```

The backend must be running on `http://localhost:8000` (see the root `README.md`).

### Environment

Copy `.env.example` to `.env` and set the backend URL if it differs:

```ini
VITE_BACKEND_URL=http://localhost:8000
```

## Scripts

| Command              | Description                            |
|----------------------|----------------------------------------|
| `npm run dev`        | Start the Vite dev server (port 3000)  |
| `npm run build`      | Type-check (`tsc -b`) + production build |
| `npm run preview`    | Preview the production build           |
| `npm run lint`       | Run Oxlint                             |
| `npm run test`       | Run Vitest tests                       |
| `npm run test:watch` | Run Vitest in watch mode               |

## Pages

| Route            | Page                | Purpose |
|------------------|---------------------|---------|
| `/`              | `Landing`           | Marketing landing page |
| `/login`         | `Login`             | Sign in |
| `/register`      | `Register`          | Create account |
| `/dashboard`     | `Dashboard`         | Overview & stats |
| `/campaign/new`  | `NewProject`        | Create a campaign |
| `/email-generator` | `EmailGenerator`  | Upload/paste a JD → crisp cold email |
| `/prompt-email`  | `ColdEmailPrompt`   | Free-text prompt + tone → cold email |
| `/resume-builder`| `ResumeBuilder`     | Parse resume → build ATS-optimized resume |
| `/project/:id`   | `ProjectDetail`     | Project detail + documents/emails |
| `/history`       | `History`           | Generation history |
| `/settings`      | `Settings`          | Profile settings |
| `/analytics`     | `Analytics`         | Charts & insights |
| `/applications`  | `Applications`      | Job application tracker |
| `/companies`     | `Companies`         | Company CRM |
| `/templates`     | `Templates`         | Email templates |
| `/resumes`       | `Resumes`           | Saved resumes + ATS scores |
| `/knowledge`     | `KnowledgeBase`     | RAG documents |
| `/calendar`      | `CalendarPage`      | Interview/reminder calendar |
| `/notifications` | `NotificationsPage` | Notifications |

## Structure

```
src/
 ├─ components/        Reusable UI (ColdEmailGenerator, ThemeToggle, layout/…)
 ├─ data/              Static data (ATS-friendly resume templates)
 ├─ lib/api.ts         Axios instance + auth interceptor
 ├─ pages/             19 route components
 ├─ store/             Zustand stores (useAuthStore, useThemeStore)
 ├─ test/              Vitest setup
 ├─ App.tsx            Router
 └─ main.tsx           Entry point
```

# Frontend Project Explanation

This document provides a detailed breakdown of the React 19 frontend directory structure, architectural patterns, and sentence formation outlining exactly how the UI operates under the hood.

## 📂 File Structure Explained

Our frontend is built with **Vite, React 19, TypeScript, and Tailwind CSS**. We use a modular, component-driven architecture.

```text
frontend/
├── public/                  # Static assets that don't need webpack bundling (favicon, raw SVGs)
├── src/
│   ├── assets/              # Images, icons, and bundled CSS files
│   ├── components/
│   │   ├── common/          # Reusable, non-domain specific components (e.g., ErrorBoundaries, Loaders)
│   │   ├── dashboard/       # Domain-specific components for the dashboard (e.g., StatsCard, RecentEmailsList)
│   │   ├── email/           # Components for the email generator (e.g., EmailEditor, EmailPreview, VariableInjector)
│   │   ├── forms/           # Complex form components using React Hook Form + Zod
│   │   ├── layout/          # Page wrappers (e.g., SidebarLayout, Navbar, Footer)
│   │   └── ui/              # shadcn/ui components (Radix UI primitives wrapped with Tailwind - highly accessible)
│   ├── contexts/            # React Context providers (for localized state without Zustand)
│   ├── hooks/               # Custom React hooks (e.g., useDebounce, useLocalStorage)
│   ├── lib/                 # Third-party library initializations (e.g., api.ts for Axios, utils.ts for Tailwind-merge)
│   ├── pages/               # Top-level route components representing full screen views (e.g., LoginPage, DashboardPage)
│   ├── routes/              # React Router configuration mapping URLs to Pages
│   ├── services/            # API call abstractions (functions that hit our backend endpoints)
│   ├── store/               # Zustand global state stores (e.g., useAuthStore.ts for global user auth state)
│   ├── styles/              # Global CSS files and Tailwind base directives (index.css)
│   ├── types/               # Global TypeScript interfaces and type definitions
│   ├── App.tsx              # The root React component that provides the Router and QueryClient
│   └── main.tsx             # The React DOM entry point that binds the app to the HTML root node
├── components.json          # Configuration file for shadcn/ui
├── tailwind.config.js       # Tailwind CSS theme configuration and plugin setup
├── tsconfig.json            # TypeScript compiler options
└── vite.config.ts           # Vite bundler configuration (including path alias definitions)
```

## 🧠 Sentence Formation & Code Execution Flow

To understand the frontend, read through these descriptive "sentences" that define the user experience loop:

1. **The Entry Point:** When a user navigates to the URL, `main.tsx` renders the React tree into the DOM. It wraps the entire `App.tsx` inside a `QueryClientProvider` (TanStack Query for data fetching caching) and a `RouterProvider` (React Router for URL navigation).
2. **State Hydration:** As `App.tsx` mounts, the Zustand `useAuthStore` wakes up. It checks if an `access_token` exists in `localStorage`. If it does, it immediately flags `isAuthenticated=true` to prevent UI flashing and fires a request to `/api/auth/me` to fetch the user's profile data in the background.
3. **API Interception:** Whenever any part of the application uses the Axios instance defined in `lib/api.ts` to make a request, an Axios Interceptor silently injects the JWT Bearer token into the Authorization headers. If the server responds with a 401 (token expired), the interceptor can automatically trigger a logout or token refresh.
4. **Form Validation (The UI Gates):** When a user types into the login or email generation forms, `react-hook-form` controls the input state for maximum performance without triggering global re-renders. When the user clicks submit, the inputs are validated against strict `Zod` schemas. If the data is invalid, error messages instantly appear below the inputs.
5. **Component Assembly:** The UI is constructed using `shadcn/ui` components located in `components/ui/`. These components use `clsx` and `tailwind-merge` to elegantly handle conditional styling and dynamic class overriding, ensuring that a "Button" always looks like a button, but can safely accept a customized `className` without CSS conflicts.
6. **Data Fetching:** When the Dashboard loads, it uses a TanStack Query hook (e.g., `useQuery({ queryKey: ['projects'] })`). This abstracts away `useEffect` fetching logic. It handles loading states, error handling, retries, and caches the data. If the user navigates away and comes back, TanStack Query instantly serves the cached data while re-verifying it in the background.
7. **The Magic Moment (Interaction):** When the user submits the "Generate Email" form, a mutation fires to the backend. As the backend's AI processes the request, the frontend displays a Framer Motion-powered skeleton loading animation. Once the email text is returned, the state updates, the skeleton fades out, and the highly polished email draft renders into an interactive `EmailEditor` component.

# System Architecture Diagram

This document captures the current system/container architecture for the holistic assessment tool based on the active frontend, backend, and deployment configuration.

## Scope

- System/container-level view
- Frontend hosting and runtime boundary
- Backend API and core responsibilities
- Supabase auth/database/storage boundaries
- External integrations used by the application

## Mermaid Script

```mermaid
flowchart LR
    user[User Browser]

    subgraph vercel[Vercel Frontend Hosting]
        subgraph spa[React SPA]
            index[index.html]
            main[main.tsx]
            app[App.tsx]
            providers[AuthProvider + LanguageProvider + Router]
            pages[Pages and Protected Routes]
            apiClient[apiClient via VITE_API_URL]
            supabaseClient[Supabase JS Client]
            sentryFront[Sentry Frontend SDK]
        end
    end

    subgraph railway[Railway Backend Hosting]
        subgraph api[Express API]
            server[backend/src/index.ts]
            middleware[Helmet + CORS + Timeouts + Rate Limits + Request Logging]
            routes[Route Groups\nprofile quizzes results progress reports admin teacher ai quiz-content]
            auth[verifySupabaseToken + role/grade access]
            reportFlow[Report generation\nPDF assembly + signed URLs]
            sentryBack[Sentry Backend SDK]
            redis[(Optional Redis cache/session storage)]
        end
    end

    subgraph supabase[Supabase Platform]
        authSvc[Auth]
        postgres[(Postgres\nprofiles quiz_results reports questions metadata)]
        storage[Storage bucket\nreports PDFs]
    end

    gemini[Google Gemini API]
    sentry[Sentry Cloud]

    user -->|Loads SPA| index
    index --> main --> app --> providers --> pages
    providers --> apiClient
    providers --> supabaseClient

    supabaseClient -->|Sign in, sign up, refresh session| authSvc
    authSvc -->|JWT session| supabaseClient
    supabaseClient -->|Access token for API calls| apiClient

    apiClient -->|Authenticated REST requests| server
    server --> middleware --> routes
    routes --> auth
    auth -->|Validate JWT, fetch profile| authSvc
    auth -->|Read profile and app data| postgres

    routes -->|Quiz content, progress, results, profile reads/writes| postgres
    routes -->|Generate report metadata| reportFlow
    reportFlow -->|Read quiz results and profile| postgres
    reportFlow -->|Upload PDFs| storage
    reportFlow -->|Return signed URLs| routes

    routes -->|AI evaluation and content generation| gemini

    server -. optional telemetry .-> sentryBack
    app -. optional telemetry .-> sentryFront
    sentryBack -.-> sentry
    sentryFront -.-> sentry

    server -. optional cache/session storage .-> redis
```

## Backend Module-Level Flow Diagram

```mermaid
flowchart TB
    client[Frontend service layer]

    subgraph backend[Backend module flows]
        authMw[verifySupabaseToken middleware]

        subgraph reports[Reports pipeline]
            reportRoute[reports.ts\nPOST /generate\nGET /:reportId/download]
            reportValidation[Inline Zod validation\nreport_type audience language]
            reportQuery[supabaseAdmin queries\nquiz_results reports profiles]
            pdfGen[pdfGenerator.ts\ngenerateEnglishPDF\ngenerateArabicPDF]
            arabicFont[Arabic font loader\nlocal dist font + CDN fallback]
            storageSvc[storageService.ts\nuploadPDF getSignedUrl]
        end

        subgraph quizContent[Quiz-content delivery and validation]
            qcRoutes[quizContent.ts route groups\ncontent catalog delivery validation]
            qcValidation[Route-level Zod schemas]
            staticCatalog[assessmentCatalogData\nroute-local grade metadata]
            quizDb[quizDb.ts\ncontent reads and answer-data reads]
            sessionStore[sessionStorage.ts\nin-memory or Redis session state]
            quizHelpers[quizHelpers.ts\nserver-side scoring and checks]
            memoryModule[memoryAssessmentData.ts\nquestion generation and evaluation]
        end
    end

    subgraph supabase[Supabase backing services]
        authSvc[Auth]
        questions[(questions table)]
        appData[(profiles quiz_results reports)]
        storage[(reports bucket)]
    end

    fontCdn[External font CDN fallback]

    client -->|/api/reports/*| reportRoute
    client -->|/api/quiz-content/*| qcRoutes

    reportRoute --> reportValidation
    reportRoute -->|protected routes| authMw
    qcRoutes -->|protected endpoints only| authMw
    authMw -->|validate JWT and load user profile| authSvc
    authMw -->|profile lookup| appData

    reportRoute -->|fetch category results and save report rows| reportQuery
    reportQuery --> appData
    reportRoute -->|assemble report data| pdfGen
    pdfGen --> arabicFont
    arabicFont -. fallback .-> fontCdn
    reportRoute -->|upload PDFs and create signed URLs| storageSvc
    storageSvc --> storage

    qcRoutes --> qcValidation
    qcRoutes -->|assessment catalog and static grade metadata| staticCatalog
    qcRoutes -->|deliver safe question content| quizDb
    quizDb --> questions
    qcRoutes -->|multi-step quiz sessions| sessionStore
    qcRoutes -->|validate answers and calculate results| quizHelpers
    quizHelpers -->|answer-data lookups| quizDb
    qcRoutes -->|memory assessment generation and evaluation| memoryModule
    memoryModule --> quizDb
    memoryModule --> sessionStore
```

### Backend Module Notes

- `quizContent.ts` contains three backend patterns rather than one generic flow: static catalog/grade metadata responses, database-backed safe question delivery through `quizDb.ts`, and server-side validation or session-backed interactions through `quizHelpers.ts` and `sessionStorage.ts`.
- `quizDb.ts` is the content boundary for the `questions` table. It returns frontend-safe `content` fields for delivery endpoints and keeps `answer_data` reads in separate helpers used only by backend validation paths.
- `sessionStorage.ts` supports multi-step quiz flows such as spelling and memory assessment, using in-memory storage by default and Redis when configured.
- `reports.ts` orchestrates the report pipeline end to end: authenticated request validation, result aggregation from Supabase, PDF generation, storage upload, report record persistence, and signed URL generation.
- `pdfGenerator.ts` includes a separate Arabic rendering path with local-font loading and CDN fallback, which is why the report pipeline is worth showing as its own backend module flow.

## Boundary Notes

- The frontend is a Vite-built React SPA bootstrapped in `src/main.tsx` and composed in `src/App.tsx`.
- The frontend authenticates directly with Supabase using `src/supabase-client.ts` and stores sessions in `window.sessionStorage`.
- The frontend calls the backend through `src/services/apiClient.ts`, which injects the Supabase access token into `Authorization` headers and targets `VITE_API_URL`.
- The backend is an Express app in `backend/src/index.ts` deployed separately from the frontend.
- The backend exposes both `/api/v1/*` canonical routes and `/api/*` compatibility routes.
- The backend uses a Supabase service-role client in `backend/src/config/supabase.ts` for server-side database and storage access.
- Report generation is a distinct backend flow in `backend/src/routes/reports.ts`: fetch quiz results, generate English and Arabic PDFs, upload them to Supabase Storage, persist a report row, and return signed URLs.
- Gemini is called only from the backend API, not from the browser directly.
- Sentry and Redis are environment-dependent integrations and are shown as optional nodes.

## Primary Flows

1. Authentication
   Browser users sign in through the frontend Supabase client, which receives and refreshes JWT sessions via Supabase Auth.

2. API access
   The SPA attaches the current Supabase access token to REST calls made to the Express backend, which verifies the token and loads the user profile before protected work.

3. Quiz and progress data
   Backend route groups read and write quiz metadata, questions, profiles, results, progress, and report records in Supabase Postgres.

4. Report generation
   The backend report route aggregates quiz data, generates PDFs, uploads them to Supabase Storage, saves the report record, and returns signed download URLs to the frontend.

5. AI-backed features
   The frontend calls backend AI endpoints, and the backend mediates requests to Gemini.

## Assumptions

- The frontend is hosted on Vercel based on `vercel.json` SPA rewrites.
- The backend is hosted on Railway based on `backend/railway.json`.
- Supabase is the system of record for authentication, relational data, and generated report file storage.
- Redis and Sentry may not be enabled in every environment, so they are represented as optional integrations rather than required core infrastructure.
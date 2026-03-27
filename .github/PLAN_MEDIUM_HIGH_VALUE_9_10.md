# PLAN MODE PROMPT - Medium Effort / High Value (Items 9-10)

Paste everything below this separator into Copilot PLAN mode.

---

You are implementing roadmap items 9 and 10 only, with production-grade best practices tailored to this repository.

Repository context:
- Frontend: Vite + React + TypeScript in root project
- Backend: Express + TypeScript in `backend/`
- Existing route and service structure must stay intact
- Existing behavior must not regress
- Changes should be incremental, minimal-risk, and easy to review

Scope for this task:
1. Item 9: Add CI pipeline with practical quality gates for this repo
2. Item 10: Add production-ready error tracking and observability with Sentry (frontend + backend)

Rules:
- Read all listed files completely before editing
- Keep changes focused to items 9-10
- Do not perform large architectural refactors in this task
- Do not remove current functionality
- Keep local development workflow simple (Sentry must be optional in dev)

---

## Files to read first

Root:
- `package.json`
- `vite.config.ts`
- `tsconfig.json`
- `tsconfig.app.json`
- `src/main.tsx`
- `src/components/ErrorBoundary.tsx`
- `src/utils/logger.ts`
- `.env.example` (if exists)

Backend:
- `backend/package.json`
- `backend/tsconfig.json`
- `backend/src/index.ts`
- `backend/src/lib/index.ts`
- `backend/.env.example`

Also inspect `.github/PLAN_HIGH_IMPACT_LOW_EFFORT.md` to preserve formatting consistency.

---

## ITEM 9 - CI Pipeline (GitHub Actions)

### Goal
Add a reliable CI workflow that validates frontend and backend quality on pull requests and main branch pushes.

### Why this matters
The project currently has no enforced quality gate before merge/deploy. CI should prevent broken builds, type errors, and lint regressions from reaching production.

### What to implement

### 9.1 Add/standardize package scripts used by CI

Update root `package.json` scripts:
- Add `typecheck`: `tsc --noEmit`
- Keep existing `lint` and `build`
- Add `test:ci`: `npm run test --if-present`

Update `backend/package.json` scripts:
- Add `typecheck`: `tsc --noEmit`
- Keep existing `build`
- Add `test:ci`: `npm run test --if-present`

Important:
- Do not remove existing scripts
- Do not assume tests already exist; use `--if-present` for now

### 9.2 Create CI workflow

Create file:
- `.github/workflows/ci.yml`

Use these best-practice workflow characteristics:
- Trigger on:
  - `pull_request` to `main`
  - `push` to `main`
- Add `concurrency` to cancel stale runs per branch
- Use least privileges: `permissions: contents: read`
- Use Node 20 in all jobs
- Use npm caching in `actions/setup-node`

Recommended job structure:
1. `frontend-quality`
- checkout
- setup node + cache
- `npm ci`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run test:ci`

2. `backend-quality`
- checkout
- setup node + cache
- `npm ci` in `backend/`
- `npm run typecheck` in `backend/`
- `npm run build` in `backend/`
- `npm run test:ci` in `backend/`

3. Optional `ci-status` aggregator job
- depends on both jobs
- provides one clean final status check for branch protection

### 9.3 Keep CI practical for current codebase

- Do not add deployment steps yet (this item is CI, not CD)
- Do not fail CI on `npm audit` yet (can be noisy and block progress)
- Keep total runtime efficient (parallel frontend/backend jobs)

### Example implementation pattern

```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

concurrency:
  group: ci-${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: read

jobs:
  frontend-quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run build
      - run: npm run test:ci

  backend-quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: backend/package-lock.json
      - run: npm ci
        working-directory: backend
      - run: npm run typecheck
        working-directory: backend
      - run: npm run build
        working-directory: backend
      - run: npm run test:ci
        working-directory: backend
```

---

## ITEM 10 - Production Error Tracking with Sentry (Frontend + Backend)

### Goal
Integrate Sentry for runtime error monitoring with safe defaults, minimal noise, and privacy-conscious configuration.

### Why this matters
Without centralized error tracking, production failures are hard to detect and debug. Sentry adds visibility into crashes, stack traces, and key metadata.

### What to implement

### 10.1 Install dependencies

Root project:
- `@sentry/react`
- `@sentry/vite-plugin` (dev dependency, for source maps)

Backend project:
- `@sentry/node`

### 10.2 Frontend Sentry initialization

Create:
- `src/lib/sentry.ts`

Implement an initialization function and guard by env:
- If no DSN, do not initialize Sentry
- Enable only in non-test environments
- Add `environment` and `release`
- Use conservative tracing sample rate default (for example `0.05`)

Integrate in:
- `src/main.tsx` (initialize before app render)

Also update:
- `src/components/ErrorBoundary.tsx` to capture exceptions with Sentry in `componentDidCatch`

Privacy best practices for this project (student data context):
- In `beforeSend`, redact PII keys such as:
  - `student_name`
  - `parent_email`
  - `email`
- Avoid sending full assessment responses as event extras

### 10.3 Backend Sentry initialization

Create:
- `backend/src/lib/sentry.ts`

Implement helper:
- `initSentry()` that reads env and initializes Sentry only when DSN exists
- Export a safe `captureException(error, context?)` helper that no-ops when disabled

Update:
- `backend/src/lib/index.ts` to export Sentry helpers
- `backend/src/index.ts` to initialize Sentry during bootstrap
- Global error handler in `backend/src/index.ts` to capture exceptions before sending response

Best practice for this codebase:
- Keep existing response shape and middleware behavior
- Do not replace app-wide error handling logic; augment it
- Include context tags when available (`route`, `method`, `requestId`, `userRole`)
- Never include auth tokens in captured metadata

### 10.4 Source maps for frontend builds

Update `vite.config.ts`:
- Enable source map upload via `@sentry/vite-plugin` only when required env vars are present
- Do not break local build when Sentry env vars are missing

Typical gating pattern:
- Only add Sentry plugin in production mode and when `SENTRY_AUTH_TOKEN` is set
- Keep plugin config isolated and documented

### 10.5 Environment variable documentation

Update examples:
- `backend/.env.example`
- root `.env.example` (create if missing)

Frontend env vars:
- `VITE_SENTRY_DSN`
- `VITE_SENTRY_ENVIRONMENT`
- `VITE_SENTRY_TRACES_SAMPLE_RATE`
- `VITE_APP_VERSION`

Backend env vars:
- `SENTRY_DSN`
- `SENTRY_ENVIRONMENT`
- `SENTRY_TRACES_SAMPLE_RATE`
- `SENTRY_RELEASE`

Optional build-time var for source maps:
- `SENTRY_AUTH_TOKEN`

Add short comments explaining each variable.

### Example frontend pattern

```typescript
// src/lib/sentry.ts
import * as Sentry from '@sentry/react';

const dsn = import.meta.env.VITE_SENTRY_DSN;

export function initFrontendSentry() {
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE,
    release: import.meta.env.VITE_APP_VERSION || 'unknown',
    tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || 0.05),
    beforeSend(event) {
      // redact sensitive fields
      if (event.user?.email) event.user.email = '[redacted]';
      return event;
    },
  });
}
```

### Example backend pattern

```typescript
// backend/src/lib/sentry.ts
import * as Sentry from '@sentry/node';

let enabled = false;

export function initSentry() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
    release: process.env.SENTRY_RELEASE,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.05),
  });

  enabled = true;
}

export function captureException(error: unknown, context?: Record<string, unknown>) {
  if (!enabled) return;
  Sentry.withScope(scope => {
    if (context) {
      Object.entries(context).forEach(([k, v]) => scope.setContext(k, { value: v as never }));
    }
    Sentry.captureException(error);
  });
}
```

---

## Validation and acceptance checklist

After completing items 9-10:

1. CI workflow exists and is valid YAML:
- `.github/workflows/ci.yml`

2. Local command checks pass:
- Root: `npm run lint`, `npm run typecheck`, `npm run build`
- Backend: `cd backend && npm run typecheck && npm run build`

3. Sentry integration is optional and safe:
- App works when Sentry env vars are absent
- No runtime crash due to missing Sentry config

4. Error capture path works:
- Throw a controlled frontend error and verify it reaches Sentry when DSN is configured
- Trigger a controlled backend error and verify it reaches Sentry when DSN is configured

5. Privacy guardrails are in place:
- No token values or raw student PII are attached to Sentry events

6. No unrelated refactors were introduced.

---

## Output format expected from PLAN mode

At the end, report:
1. Files created/modified
2. Exact commands run
3. Verification results
4. Any assumptions or follow-up tasks required for deployment secrets

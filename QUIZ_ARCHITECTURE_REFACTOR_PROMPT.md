# Quiz Architecture Refactor Prompt

Use the prompt below when you want an implementation-focused agent to refactor this repository toward a backend-owned, database-driven quiz architecture while safely removing duplicate data and redundant files.

## Prompt

You are a senior staff engineer working inside the `holistic-assessment-tool` repository. Refactor the quiz architecture so quiz content is backend-owned, database-backed where appropriate, and no duplicate quiz data remains across frontend and backend. Do this without breaking current authentication, quiz flows, reporting, scoring, admin access, or existing public routes that the frontend already depends on.

### Repository Context

- Frontend stack: Vite + React + TypeScript.
- Backend stack: Express + TypeScript.
- Auth and database: Supabase.
- Existing backend secure quiz pattern already exists in `backend/src/routes/quizContent.ts` and is used by several frontend pages.
- Existing backend quiz metadata seed and schema live in `backend/scripts/seed-quizzes.ts`, `backend/scripts/schema.sql`, and `backend/scripts/migrations/`.
- Existing report generation and quiz result storage must keep working because reports, progress, and admin downloads rely on current quiz result semantics.

### Current Duplication and Migration Targets

Treat these as confirmed migration targets, not theoretical examples:

- Duplicate content exists in both frontend and backend:
  - `src/data/writingData.ts`
  - `backend/src/data/writingData.ts`
  - `src/data/learningStylesData.ts`
  - `backend/src/data/learningStylesData.ts`
- Frontend still imports local quiz content directly in places that should move to backend-owned content:
  - `src/pages/WritingTest.tsx`
  - `src/pages/WritingGradeSelector.tsx`
  - `src/pages/LearningStylesQuiz.tsx`
  - `src/pages/SentenceBuildingQuiz.tsx`
  - `src/pages/SentenceBuildingGradeSelector.tsx`
  - `src/components/QuestionCard.tsx`
  - `src/components/ResultScreen.tsx`
- Frontend also contains presentation-oriented data files such as:
  - `src/data/assessmentData.ts`
  - `src/data/oralLanguageTranslations.ts`
  - `src/data/puzzleData.ts`
  - `src/data/learningGamesData.ts`

Do not delete presentation-only files unless they are truly redundant after the refactor. The goal is to remove duplicate quiz authority, not to delete every frontend data file blindly.

### Primary Goals

- Make the backend the source of truth for quiz content that affects scoring, validation, access rules, reporting, or cheating risk.
- Remove duplicate quiz data definitions across `src/data` and `backend/src/data`.
- Preserve or improve the existing secure pattern where correct answers are not sent to the frontend before validation unless the quiz type explicitly requires post-submit feedback.
- Keep the frontend focused on rendering quiz payloads, collecting answers, and displaying backend-provided results.
- Reduce redundant code files and only remove markdown files if they are truly stale, duplicated, or superseded.
- Avoid a big-bang rewrite. Migrate in safe phases with backward compatibility where needed.

### Non-Negotiable Safety Constraints

- Do not break current routes already used by the frontend. Preserve current route behavior, or add compatibility wrappers if the internal implementation changes.
- Do not break existing auth behavior based on Supabase bearer tokens.
- Do not break `quiz_results`, `reports`, `assessment_sessions`, `quiz_metadata`, or current report generation flows.
- Do not change existing quiz IDs, category names, subcategory names, or result semantics unless a migration path updates all consumers safely.
- Do not expose correct answers, answer keys, or hidden validation rules to the browser bundle.
- Do not delete any file until all imports, references, and runtime callers have been migrated.
- Do not remove `AI_WRITING_TROUBLESHOOTING.md` unless its useful content is explicitly consolidated elsewhere and the file is genuinely obsolete.
- Prefer incremental vertical slices over broad speculative rewrites.

### Architectural Target

Use the database and backend as the authoritative source for quiz content, but do not force every quiz into a simplistic multiple-choice-only model.

Design a schema that supports multiple quiz types used in this repo, including at minimum:

- multiple choice
- writing prompts and rubric-based or AI-assisted evaluation
- ordered sequence questions
- category placement / drag-and-drop classification
- image or coordinate-based detection
- generated memory tasks
- oral language validation
- learning style preference questions

The schema should extend the current metadata model instead of fighting it.

### Database Direction

Use PostgreSQL/Supabase migrations under `backend/scripts/migrations/`.

Create or extend tables along these lines, adapting names only if there is a strong repository-specific reason:

- `quiz_categories`
- `quizzes`
- `quiz_versions`
- `questions`
- `question_options`
- `question_assets`
- `question_answer_keys` or type-specific validation/config tables
- `quiz_access_rules`
- `quiz_attempts`
- `quiz_attempt_answers`

Use structured columns plus JSONB only where flexibility is necessary for quiz-type-specific payloads. Do not over-normalize dynamic quiz behavior into an unmaintainable schema, but also do not hide everything in one opaque JSON blob.

Preserve compatibility with the current `quiz_metadata` and `quiz_results` usage, either by evolving those tables safely or by bridging them during migration.

### Backend Responsibilities

Implement or evolve backend services so they handle:

- fetching quiz definitions by category, quiz ID, grade, and language
- access control and grade filtering
- randomization logic where applicable
- attempt/session creation and ownership validation
- answer validation and scoring
- anti-cheat protections
- version-aware quiz delivery so completed attempts and reports remain reproducible
- selective response shaping so the frontend only receives what it needs to render

Prefer service/repository boundaries over bloated route files. If `backend/src/routes/quizContent.ts` becomes too large, split it by quiz domain or service responsibility while preserving route compatibility.

### Frontend Responsibilities

Refactor the frontend so it:

- fetches quiz definitions from backend endpoints instead of importing authoritative quiz content from `src/data`
- renders quiz payloads by quiz type
- submits answers or attempt updates to the backend
- displays feedback and results returned by the backend
- keeps existing UX and route structure intact unless a small UI adjustment is required for correctness

Frontend data files may remain only for:

- presentation metadata
- routing display labels
- static visual-only assets or copy
- translations that are not authoritative quiz answer content

### Required Audit Before Deletion

Before deleting any duplicated or redundant file, explicitly inventory:

- which pages/components/services import it
- whether it contains authoritative quiz content, UI-only metadata, or mixed concerns
- whether an equivalent backend source already exists
- whether the file is still referenced by tests, docs, or build tooling

After migration, delete only files that are genuinely redundant. Update imports and tests first.

### Required Cleanup Targets

At minimum, evaluate and address these:

- duplicate `writingData` definitions across frontend and backend
- duplicate `learningStylesData` definitions across frontend and backend
- frontend-owned sentence-building question data if it should become backend-owned
- local quiz data imports in frontend pages that should instead call backend APIs
- oversized or redundant data index files if they no longer provide value after the refactor

For markdown cleanup, be conservative. This repository currently has a minimal markdown footprint surfaced in workspace search. Remove or consolidate docs only if they are clearly duplicated, stale, or replaced by a better source.

### Migration Strategy

Implement this in phases.

#### Phase 1

- Audit all quiz types and classify each as one of:
  - backend-owned already
  - duplicated between frontend and backend
  - frontend-only but should move to backend
  - presentation-only and safe to keep in frontend
- Produce a migration map.

#### Phase 2

- Add the database schema and migration files.
- Seed or migrate quiz content from code files into the database where appropriate.
- Keep compatibility with current quiz metadata and grade access rules.

#### Phase 3

- Refactor backend retrieval and validation into services/repositories.
- Add or adapt endpoints so frontend can retrieve quiz definitions safely.
- Preserve current endpoint behavior where already in use.

#### Phase 4

- Migrate frontend consumers one vertical slice at a time.
- Start with the most obvious duplicated datasets, such as writing and learning styles.
- Then migrate sentence building and any other frontend-owned scored quiz content.

#### Phase 5

- Remove redundant data files, dead imports, and obsolete helper code only after all consumers have been moved.
- Remove redundant docs only if clearly superseded.

### Suggested Endpoint Direction

Prefer a coherent backend API shape such as:

- `GET /api/quizzes`
- `GET /api/quizzes/:quizId`
- `GET /api/quiz-content/:quizId`
- `POST /api/quiz-attempts/start`
- `POST /api/quiz-attempts/:attemptId/answer`
- `POST /api/quiz-attempts/:attemptId/complete`

However, maintain backward compatibility with current routes in `backend/src/routes/quizContent.ts` where the frontend already depends on them.

### Testing and Verification Requirements

Do not finish on code changes alone. Validate the refactor.

Run, at minimum, the relevant repository checks that already exist:

- root: `npm run lint`
- root: `npm run typecheck`
- root: `npm run build`
- root: `npm run test:ci`
- backend: `npm run typecheck`
- backend: `npm run build`
- backend: `npm run test:ci`

Also add or update targeted tests for:

- route compatibility
- quiz content fetch behavior
- no-answer-leak behavior for secure quiz types
- scoring correctness
- grade/access enforcement
- migrated frontend flows that used to read local data

### Output Expectations

When implementing, provide:

- a concise migration summary
- the schema changes added
- the files migrated from frontend data ownership to backend ownership
- the files deleted and why each deletion was safe
- any docs removed or consolidated and why
- validation results and any remaining risks

### Acceptance Criteria

The refactor is only complete when all of the following are true:

- authoritative quiz content no longer exists in duplicate across frontend and backend
- frontend no longer imports scored quiz content directly from `src/data` for migrated quizzes
- backend is the source of truth for scoring and answer validation
- no correct answers are shipped to the frontend before they are needed
- existing auth, quiz submission, progress tracking, and report generation still work
- builds, tests, and typechecks pass
- redundant files are removed only after migration safety is proven
- docs are not deleted recklessly

### Implementation Style

- Prefer small, reviewable commits or change batches.
- Preserve existing public behavior unless the change is necessary and migrated safely.
- Favor compatibility adapters over breaking changes.
- Prefer explicit types and Zod validation at API boundaries.
- Avoid introducing a new shared package that would accidentally bundle hidden answer keys into the frontend.

Start by auditing and mapping every quiz type in this repo to its current data source and target ownership model, then implement the migration in safe phases.

## Prompt: Evaluate Whether Quiz Questions Should Live In Supabase

Use the prompt below when you want another AI to evaluate whether this repository's current quiz-content architecture is enterprise-appropriate, or whether the project should introduce Supabase tables for question banks and versioned assessment content.

### Prompt

You are a principal engineer reviewing the architecture of the `holistic-assessment-tool` repository. I need a concrete architectural recommendation, not a generic pros/cons list.

Analyze whether the current approach for quiz content storage is enterprise-appropriate, or whether the project should introduce database-backed question tables in Supabase.

### Current Architecture Context

- Frontend stack: Vite + React + TypeScript.
- Backend stack: Express + TypeScript.
- Auth and primary data platform: Supabase.
- Current Supabase schema in `backend/scripts/schema.sql` includes operational tables such as:
  - `profiles`
  - `quiz_metadata`
  - `quiz_results`
  - `assessment_sessions`
  - `reports`
- The actual quiz questions, prompts, passages, answer keys, and grade-specific content are not currently stored in Supabase question tables.
- Instead, the real quiz content currently lives in backend code under `backend/src/data/`, with examples including:
  - `backend/src/data/spellingData.ts`
  - `backend/src/data/writingData.ts`
  - `backend/src/data/storyRetellData.ts`
  - `backend/src/data/readingAssessmentData.ts`
  - `backend/src/data/sentenceBuildingData.ts`
- Backend routes in `backend/src/routes/quizContent.ts` import those backend data modules directly and serve frontend-safe payloads.
- The current architecture already keeps answer validation and scoring on the backend for secure quiz types, and tries to avoid leaking correct answers to the frontend bundle.

### What I Want You To Evaluate

I want you to determine whether this architecture is good enough for an enterprise-grade assessment platform, or whether the system should evolve so that quiz questions and related content are stored in Supabase tables instead of hardcoded backend files.

Do not answer at a high level only. Evaluate this specifically for a platform that may eventually need:

- non-developer content management
- audit trails for question edits
- question versioning
- approval/publishing workflows
- analytics at the question level
- localization or multi-language content
- tenant-specific or school-specific content variations
- reproducible historical attempts and reports tied to the exact content version seen by the student
- secure answer handling and anti-cheat protections
- support for different quiz types, not just simple multiple choice

### Important Constraints

- Do not assume a simplistic quiz engine. This repository contains multiple quiz shapes, including:
  - spelling with hidden answers
  - writing prompts with rubric or AI-assisted evaluation
  - reading passages and benchmark tables
  - ordered sequence questions
  - drag/drop or category placement interactions
  - image/spot-the-difference or coordinate-based checks
  - memory-style generated tasks
  - oral language and learning-style style assessments
- The answer should account for the fact that some quiz content is static and developer-managed today, while other content may later need to become operational business data.
- The answer should preserve the principle that correct answers and hidden validation logic should remain protected on the backend.
- The answer should distinguish between what is acceptable now versus what should be the target architecture if the system is meant to scale operationally.

### Required Deliverables

Provide your answer in the following structure:

#### 1. Verdict

State clearly one of these positions:

- the current backend-code-owned model is sufficient for this repo even at enterprise scale
- the current model is acceptable temporarily, but a database-backed question model should be introduced next
- the current model is already a bottleneck and should be migrated to Supabase-backed question tables now

#### 2. Reasoning

Explain why, using the actual architecture described above. Address operational maintainability, security, data governance, change management, extensibility, and reporting reproducibility.

#### 3. Decision Criteria

List the concrete signals that should trigger migration from backend code files to database-backed content. Be specific. For example: content edited by non-engineers, need for approvals, frequent question updates, item analytics, tenant customization, or versioned publishing.

#### 4. Recommended Target Architecture

If you recommend database-backed content, propose an enterprise-appropriate data model for Supabase/Postgres. Do not oversimplify. The model should support heterogeneous quiz types and versioned content. Include tables or logical entities such as:

- assessment definitions
- assessment versions
- question groups or content sets
- questions
- question options or selectable responses where needed
- answer-key or validation-rule storage
- rubric/scoring configuration
- localization/content variants
- audit/change history

Also explain what should remain in code versus what should move into the database.

#### 5. Migration Strategy

Recommend a phased migration path from the current `backend/src/data/*` approach to a database-backed model without breaking existing frontend routes, result storage, report generation, or backend scoring flows.

#### 6. Risks And Tradeoffs

Explain the risks of:

- keeping everything in backend code too long
- moving everything into database tables too early
- overusing JSONB versus over-normalizing the schema

#### 7. Practical Recommendation For This Repo

End with a concrete recommendation for this specific repository:

- what should stay as backend code-owned content for now
- what should move into Supabase first
- whether a hybrid model is the right intermediate state

### Output Quality Bar

- Be specific to this repository structure.
- Do not give a generic textbook answer.
- Do not assume all quizzes fit the same schema.
- Do not recommend exposing answers to the frontend.
- Optimize for a recommendation that is realistic, incremental, and safe for an existing production-style codebase.

If useful, you may compare two end-state options:

- backend code as source of truth with stronger internal content tooling
- Supabase-backed content as source of truth with backend delivery and validation

But you must still make a final recommendation rather than staying neutral.
# PLAN MODE PROMPT — High Impact / Low Effort Refactoring (Items 1–8)

Paste the entire content below this line into Copilot PLAN mode.

---

You are performing 8 targeted engineering improvements on a holistic student assessment web application. The project uses React + TypeScript (Vite) on the frontend, Express + TypeScript on the backend, and Supabase (PostgreSQL + Auth) as the data layer.

Before making any changes, read the referenced files fully to understand surrounding context. Make each change surgically — do not refactor code unrelated to these 8 items. Preserve all existing functionality. Do not delete or modify quiz-delivery behavior on the backend.

Execute items in the order listed. After completing each item, verify there are no TypeScript or lint errors before proceeding.

---

## ITEM 1 — Fix Critical Security Vulnerability: Memory Assessment Answer Leakage

### Problem
`backend/src/routes/quizContent.ts` has two security flaws in the memory assessment endpoints:

**Flaw A — Answer sent to client**: The `POST /memory-assessment/generate` endpoint (search for `_internal`) sends correct answers directly in the API response body via an `_internal` field. These answers are visible in browser DevTools.

**Flaw B — Client-supplied correct answer trusted**: The `POST /memory-assessment/check` endpoint destructures `correctAnswer` from `req.body`, meaning the client tells the server what the correct answer is. A student can always send matching values and score 100%.

### What to change

**File: `backend/src/routes/quizContent.ts`**

**Fix Flaw A** — In the `POST /memory-assessment/generate` handler:
1. After generating the question and destructuring `correctSequence` and `missingItemId` from the question object, store those answer values in server-side session storage instead of returning them.
2. Generate a unique session key like `memory-${req.user.id}-${Date.now()}` and store `{ correctSequence, missingItemId, type }` using the existing `sessionStorage.set(key, data, 3600)` from `'../lib/sessionStorage.js'`.
3. Return a `questionRef` field in the response (the session key) instead of `_internal`. The response should be:
```typescript
res.json({
  success: true,
  question: safeQuestion,
  questionRef: sessionKey,
});
```

**Fix Flaw B** — In the `POST /memory-assessment/check` handler:
1. Change the request body to accept `{ type, submittedAnswer, questionRef }` instead of `{ type, submittedAnswer, correctAnswer }`.
2. Retrieve the correct answer from session storage using `questionRef`:
```typescript
const { type, submittedAnswer, questionRef } = req.body;

if (!type || submittedAnswer === undefined || !questionRef) {
  return res.status(400).json({ error: 'Missing required fields' });
}

const sessionData = await sessionStorage.get(questionRef);
if (!sessionData || sessionData.userId !== req.user.id) {
  return res.status(400).json({ error: 'Invalid or expired question reference' });
}

let isCorrect = false;
if (type === 'sequence_recall' && sessionData.correctSequence) {
  isCorrect = MemoryAssessmentData.checkSequenceAnswer(submittedAnswer, sessionData.correctSequence);
} else if (type === 'missing_object' && sessionData.missingItemId) {
  isCorrect = MemoryAssessmentData.checkMissingObjectAnswer(submittedAnswer, sessionData.missingItemId);
}
```

3. Make sure to include `userId: req.user.id` in the session data stored during `/generate` so you can verify ownership in `/check`.

**Also update** the frontend component that calls these endpoints. Search the `src/pages/` directory for files importing or referencing `memory-assessment` API calls (likely `MemoryAssessment.tsx` or `MemoryQuiz.tsx`). Update it to:
- Store the `questionRef` from the `/generate` response.
- Send `questionRef` instead of `correctAnswer` when calling `/check`.

---

## ITEM 2 — Remove Frontend Quiz Answer Files

### Problem
The `src/data/` directory contains quiz data files that ship correct answers (`correctAnswer`, `isCorrect`, correct option indices) directly into the frontend JavaScript bundle. Any student can inspect the bundle in browser DevTools and extract all answers. The backend already has its own secure copy of this data in `backend/src/data/`.

### What to change

**Delete the following files** (they contain answers that are also available securely on the backend):
- `src/data/criticalThinkingData.ts`
- `src/data/spellingData.ts`
- `src/data/oralLanguageData.ts`
- `src/data/storyRetellData.ts`
- `src/data/logicalSequencingData.ts`
- `src/data/spotTheDifferenceData.ts`
- `src/data/startingEndingSoundData.ts`

**Keep the following files** (they contain UI-only metadata, category definitions, or client-side-only data without exploitable answers):
- `src/data/assessmentData.ts` — Category and subcategory UI structure for navigation
- `src/data/writingData.ts` — Writing prompts (no correct answers; writing is AI-evaluated)
- `src/data/learningStylesData.ts` — Learning style definitions and UI labels (no right/wrong answers)
- `src/data/learningGamesData.ts` — Game metadata for UI
- `src/data/puzzleData.ts` — Puzzle UI metadata

**After deleting**, search the entire `src/` directory for any imports from the deleted files. For each broken import:
1. Check if the component actually uses the imported data for client-side grading (insecure — remove this codepath).
2. If the component already fetches quiz content from the backend API via `secureQuizService.ts`, simply remove the unused import.
3. If the component uses the data only for TypeScript type definitions (interfaces/types), move those type definitions to `src/types/quiz.ts` and update the import.
4. The following type definitions should be extracted and preserved in `src/types/quiz.ts` before deletion:
   - `AnalogyQuestion`, `CategoryItem`, `CategoryQuestion` from `criticalThinkingData.ts`
   - `SpellingWord` and grade-related types from `spellingData.ts`
   - `OralLanguageQuestion`, `OralLanguageOption`, `SequenceImage`, `QuizCategory` from `oralLanguageData.ts`
   - Any types from the other deleted files that are imported elsewhere in `src/`

**Do NOT modify any files in `backend/src/data/`** — those are the secure source of truth.

---

## ITEM 3 — Enable Backend TypeScript Strict Mode

### Problem
`backend/tsconfig.json` currently has `"strict": false` and `"noImplicitAny": false`, which defeats TypeScript's ability to catch type errors at compile time. The frontend already uses `"strict": true`.

### What to change

**File: `backend/tsconfig.json`**

Change the following compiler options:
```json
"strict": true,
"noImplicitAny": true,
"strictNullChecks": true,
"strictFunctionTypes": true,
"strictBindCallApply": true,
"strictPropertyInitialization": true,
"noImplicitThis": true,
"alwaysStrict": true
```

Then fix all resulting TypeScript errors across the `backend/src/` directory. Common patterns you'll encounter:

1. **Implicit `any` parameters** in route handlers — add explicit types: `(req: Request, res: Response)`
2. **Null checks** — `req.user` might be `undefined`; add guards or use `req.user!` where middleware guarantees it exists (i.e., after `verifySupabaseToken`)
3. **Object property access** on potentially null query results — add null checks before accessing `.data`
4. **Type assertions** — Supabase query results may need `as Type` casts
5. **`req.body` destructuring** — properties are `any` by default; Zod validation (Item 4) will fix this properly, but for now add inline type assertions where needed

Work through errors file by file. Do not suppress errors with `// @ts-ignore`. Use proper type narrowing or type assertions.

---

## ITEM 4 — Add Zod Validation to All Unvalidated Quiz Routes

### Problem
In `backend/src/routes/quizContent.ts`, only the spelling quiz routes use Zod schemas for input validation. All other quiz endpoints destructure `req.body` directly with no validation — trusting whatever the client sends. This is an injection and type-safety risk.

### What to change

**File: Create `backend/src/validators/quizContent.ts`** containing Zod schemas for every quiz endpoint that accepts input.

Define schemas for these currently unvalidated endpoints:

```typescript
import { z } from 'zod';

// Blending
export const validateBlendingSchema = z.object({
  questionId: z.string().min(1),
  answer: z.string().min(1),
});

// Story Retell
export const validateStoryRetellSchema = z.object({
  storyId: z.string().min(1),
  beginningId: z.string().min(1),
  middleId: z.string().min(1),
  endId: z.string().min(1),
});

// Vocabulary
export const validateVocabularySchema = z.object({
  wordId: z.string().min(1),
  answerId: z.string().min(1),
});

// Critical Thinking
export const validateCriticalThinkingSchema = z.object({
  questionId: z.string().min(1),
  answerId: z.string().min(1),
});

// Learning Styles
export const calculateLearningStyleSchema = z.object({
  answers: z.record(z.string(), z.string()),
});

// Logical Sequencing
export const checkLogicalSequencingSchema = z.object({
  questionId: z.string().min(1),
  submittedOrder: z.array(z.string()).min(1),
});

// Starting/Ending Sounds
export const soundOptionsSchema = z.object({
  questionId: z.string().min(1),
  questionType: z.enum(['beginning', 'ending']),
});

export const checkSoundSchema = z.object({
  questionId: z.string().min(1),
  questionType: z.enum(['beginning', 'ending']),
  answer: z.string().min(1),
});

// Spot the Difference
export const checkSpotDifferenceSchema = z.object({
  levelId: z.number().int(),
  clickX: z.number(),
  clickY: z.number(),
});

// Attention Control
export const calculateAttentionSchema = z.object({
  responses: z.record(z.string(), z.number()),
});

// Sentence Difference
export const checkSentenceDiffSchema = z.object({
  questionId: z.string().min(1),
  answer: z.string().min(1),
});

// Memory Assessment
export const generateMemorySchema = z.object({
  type: z.enum(['sequence_recall', 'missing_object']),
  difficulty: z.string().min(1),
});

export const checkMemorySchema = z.object({
  type: z.enum(['sequence_recall', 'missing_object']),
  submittedAnswer: z.any(),
  questionRef: z.string().min(1),
});

// Memory Evaluate
export const evaluateMemorySchema = z.object({
  correctAnswers: z.number().int().min(0),
  totalQuestions: z.number().int().min(1),
  difficulty: z.string().min(1),
});
```

**Then update `backend/src/routes/quizContent.ts`**: Import the schemas and apply `.safeParse(req.body)` at the top of every POST handler that accepts input. Follow the existing pattern from the spelling routes:

```typescript
const validation = validateBlendingSchema.safeParse(req.body);
if (!validation.success) {
  return res.status(400).json({ error: validation.error.errors });
}
const { questionId, answer } = validation.data;
```

Also create a barrel export: **`backend/src/validators/index.ts`** that re-exports everything from `quizContent.ts`.

For GET routes with path params (like `/grade/:grade`), add inline Zod parsing of `req.params.grade`:
```typescript
const gradeSchema = z.coerce.number().int().min(1).max(8);
const gradeResult = gradeSchema.safeParse(req.params.grade);
if (!gradeResult.success) {
  return res.status(400).json({ error: 'Invalid grade' });
}
```

---

## ITEM 5 — Add Structured Logger (pino)

### Problem
The backend uses raw `console.log`, `console.error`, and `console.warn` calls (50+ instances) with no log levels, no structured metadata, no request correlation, and no environment-aware formatting.

### What to change

**Step 1: Install pino**
```bash
cd backend
npm install pino
npm install -D pino-pretty @types/pino
```

**Step 2: Create `backend/src/lib/logger.ts`**
```typescript
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV !== 'production'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
  base: { service: 'holistic-assessment-api' },
});

export default logger;
```

**Step 3: Update `backend/src/lib/index.ts`** to re-export: `export { logger } from './logger.js';`

**Step 4: Replace all `console.*` calls across `backend/src/`**

Apply these mappings:
- `console.log(...)` → `logger.info(...)`
- `console.error(...)` → `logger.error(...)`
- `console.warn(...)` → `logger.warn(...)`

For error logging, use structured context:
```typescript
// Before:
console.error('Save result error:', error);

// After:
logger.error({ err: error, path: req.path }, 'Save result error');
```

For startup logs in `backend/src/index.ts`:
```typescript
// Before:
console.log(`🚀 Server running on http://localhost:${PORT}`);

// After:
logger.info({ port: PORT, env: process.env.NODE_ENV || 'development' }, 'Server started');
```

Files that need updating (search for `console.` in `backend/src/`):
- `backend/src/index.ts`
- `backend/src/routes/quizContent.ts` (many handlers)
- `backend/src/routes/results.ts`
- `backend/src/routes/reports.ts`
- `backend/src/routes/admin.ts`
- `backend/src/routes/ai.ts`
- `backend/src/routes/teacher.ts`
- `backend/src/routes/profile.ts`
- `backend/src/routes/progress.ts`
- `backend/src/routes/quizzes.ts`
- `backend/src/middleware/auth.ts`
- `backend/src/middleware/gradeAccess.ts`
- `backend/src/services/pdfGenerator.ts`
- `backend/src/services/emailService.ts`
- `backend/src/lib/sessionStorage.ts`

Do NOT modify the frontend logger (`src/utils/logger.ts`) — that serves a different purpose.

---

## ITEM 6 — Fix package.json and Remove Unused Dependencies

### Problem
The root `package.json` has the default Vite scaffold name and includes server-side dependencies that should not be in the frontend.

### What to change

**File: `package.json` (root)**

1. Change `"name"` from `"vite-react-typescript-starter"` to `"holistic-assessment-tool"`.

2. Remove these dependencies (they are server-side libraries that don't belong in the frontend):
   - `"nodemailer"` — Legacy email sending; the backend uses Resend instead
   - `"dotenv"` — Not needed in Vite (Vite uses `import.meta.env` natively)

3. Remove this dev dependency (not needed with React Router v7 which includes its own types):
   - `"@types/react-router-dom"`

After removing, run `npm install` to update the lockfile.

Then search the `src/` directory for any imports of `nodemailer` or `dotenv`. If found, remove those imports and any code using them (they are dead code from the legacy server).

---

## ITEM 7 — Delete Dead and Unused Files

### Problem
Several files are empty, fully commented out, or are development artifacts that should not be in the repository.

### What to change

**Delete these files:**
- `src/utils/sampleImages.ts` — Empty file (0 exports)
- `src/hooks/useAssessmentData.ts` — Entirely commented out, no active code
- `generate-samples.html` — Development artifact (HTML file for generating sample images, not part of the app)

**After deleting**, check for and remove any imports of the deleted files:
- Search `src/` for `sampleImages` — remove any imports
- Search `src/` for `useAssessmentData` — remove any imports (likely already commented out)
- `generate-samples.html` won't have imports (it's standalone HTML)

**Also update `src/hooks/index.ts`**: If it exports `useAssessmentData`, remove that export line.

Do NOT delete these files even though they appear to be legacy — they may still be referenced by active routes:
- `src/pages/ScrollableHomepage.tsx` — Verify if any route points to it first
- `src/pages/SecureSpellingTest.tsx` — Same, verify route usage
- `src/pages/PhonicsQuizNew.tsx` — Same

For each of these three pages, search `src/App.tsx` and `src/routes.ts` to determine if they are referenced. If no route references them AND no other file imports them, include them in the deletion list. If they are referenced, leave them and add a `// TODO: consolidate with primary implementation` comment at the top.

---

## ITEM 8 — Implement Tiered Rate Limiting

### Problem
`backend/src/index.ts` applies a single global rate limiter (100 requests per 15 minutes) to all routes equally. This means:
- AI endpoints (expensive Gemini API calls) get the same limit as reading quiz progress
- Auth-related operations get the same limit as fetching quiz metadata
- A user hitting the quiz content API quickly depletes their budget for all other operations

### What to change

**File: `backend/src/index.ts`**

1. Remove or rename the existing single `limiter` application (look for `app.use(limiter)` or `app.use(rateLimit(...))`).

2. Create tiered limiters and apply them to specific route prefixes:

```typescript
import rateLimit from 'express-rate-limit';

// Default: generous limit for general API usage
const defaultLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

// Auth: strict limit to prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15, // 15 auth attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts, please try again later' },
});

// AI: very strict limit (Gemini API calls are expensive)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 AI calls per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI evaluation rate limit reached, please wait before trying again' },
});

// Quiz content: moderate limit for active quiz taking
const quizLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 quiz operations per minute (enough for rapid answer submission)
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Quiz rate limit reached, please slow down' },
});

// Reports: limit PDF generation (CPU intensive)
const reportLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5, // 5 report operations per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Report generation rate limit reached, please wait' },
});
```

3. Apply limiters BEFORE the route registrations, ordered from most specific to least:

```typescript
// Apply tiered rate limits (most specific first)
app.use('/api/ai', aiLimiter);
app.use('/api/reports', reportLimiter);
app.use('/api/quiz-content', quizLimiter);
// Note: auth is handled via Supabase client-side, but if you have auth proxy routes, apply authLimiter to them
app.use('/api', defaultLimiter);
```

4. Ensure the existing route registrations come AFTER the rate limiter middleware.

5. Do NOT remove the existing security middleware (helmet, cors). Only modify the rate limiting section.

---

## Final Verification Checklist

After completing all 8 items:

1. Run `cd backend && npx tsc --noEmit` — must compile with zero errors under strict mode
2. Run `cd backend && npm run build` — must build successfully  
3. Run `npm run build` (root) — frontend must build with no errors from deleted data files
4. Search `src/` for any remaining `correctAnswer` or `isCorrect` strings that indicate answer data is still being shipped to the frontend (OK in type definitions, not OK in actual data arrays)
5. Verify `backend/src/routes/quizContent.ts` has no remaining `_internal` responses
6. Verify no `console.log` or `console.error` calls remain in `backend/src/` (only `logger.*` calls)
7. Verify the memory assessment `/check` endpoint no longer accepts `correctAnswer` from request body

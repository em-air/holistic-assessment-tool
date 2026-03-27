/**
 * routes.ts — Single source of truth for all application routes.
 *
 * RULES:
 * 1. Every <Route path=...> in App.tsx MUST reference a constant from this file
 * 2. Every navigate() call MUST reference a constant or helper from this file
 * 3. Never use raw route strings anywhere else in the codebase
 *
 * This prevents the #1 recurring bug: route definitions in App.tsx and
 * navigate() targets in page components silently drifting apart.
 */

// ─── Static route paths (no parameters) ─────────────────────────────

export const ROUTES = {
  // ── Core ──────────────────────────────────────────────────────────
  HOME: '/',
  AUTH: '/auth',
  CATEGORIES: '/categories',
  ADMIN_REPORTS: '/admin/reports',

  // ── Mind / Cognition ─────────────────────────────────────────────
  CATEGORY_MIND: '/category/mind',

  // Attention & Memory
  ATTENTION_MEMORY: '/category/mind/attention-memory',
  ATTENTION_QUIZ: '/category/mind/attention-memory/attention-quiz',
  PICTURE_SEQUENCE: '/category/mind/attention-memory/picture-sequence',
  FLASH_WORD: '/category/mind/attention-memory/flash-word',

  // Perception
  PERCEPTION_SELECTION: '/category/mind/perception-selection',
  PERCEPTION_MISSING_OBJECT: '/category/mind/perception/missing-object',
  PERCEPTION_SENTENCE_DIFF: '/category/mind/perception/sentence-difference',
  PERCEPTION_LOGICAL_SEQ: '/category/mind/perception/logical-sequencing',

  // Critical Thinking
  CRITICAL_THINKING_SELECTION: '/category/mind/critical-thinking-selection',
  ANALOGY_QUIZ: '/category/mind/critical-thinking/analogy-quiz',
  CATEGORY_QUIZ: '/category/mind/critical-thinking/category-quiz',

  // Learning Style
  LEARNING_STYLES_QUIZ: '/learning-styles-quiz',

  // ── Oral Skills ──────────────────────────────────────────────────
  ORAL_LANGUAGE_SELECTION: '/category/oral-skills/oral-language-selection',
  ORAL_SENTENCE_BUILDING: '/category/oral-skills/sentence-building',
  ORAL_STORY_SEQUENCING: '/category/oral-skills/story-sequencing',
  ORAL_STORY_RETELL: '/category/oral-skills/story-retell',

  // Phonics & Sound (kept for internal page references, removed from oral skills navigation)
  STARTING_ENDING_SOUND: '/starting-ending-sound-quiz',

  // ── Academic Skills ──────────────────────────────────────────────
  VOCABULARY_MATCHING: '/vocabulary-matching',
  SPELLING_GRADES: '/spelling-grades',
  WRITING_GRADES: '/writing-grades',
  ASSESSMENT_GENERATOR: '/assessment-generator',
  CATEGORY_ACADEMIC_SKILLS: '/category/academic-skills',

  // ── Legacy flat routes (backward compatibility) ──────────────────
  // These duplicate the canonical nested paths above.
  // TODO: Replace with <Navigate> redirects to canonical paths.
  LOGICAL_SEQUENCING_GRADES: '/logical-sequencing-quiz',
  PERCEPTION_QUIZ_FLAT: '/perception-quiz',
  MISSING_OBJECT_QUIZ_FLAT: '/missing-object-quiz',
  SENTENCE_DIFFERENCE_QUIZ_FLAT: '/sentence-difference-quiz',
  ATTENTION_MEMORY_FLAT: '/attention-memory-selection',
  ATTENTION_ASSESSMENT_FLAT: '/attention-assessment',
  MEMORY_ASSESSMENT_FLAT: '/memory-assessment',
  ATTENTION_QUIZ_FLAT: '/attention-quiz',
  MEMORY_QUIZ_FLAT: '/memory-quiz',
  CRITICAL_THINKING_FLAT: '/critical-thinking',
  ANALOGY_QUIZ_FLAT: '/analogy-quiz',
  CATEGORY_QUIZ_FLAT: '/category-quiz',
  FLASH_WORD_QUIZ_FLAT: '/flash-word-quiz',
  ORAL_LANGUAGE_QUIZ_FLAT: '/oral-language-quiz',
  STORY_RETELL_QUIZ_FLAT: '/story-retell-quiz',
} as const;

// ─── Route patterns (for <Route path=...> with dynamic segments) ────

export const ROUTE_PATTERNS = {
  CATEGORY: '/category/:categoryId',
  QUIZ: '/quiz/:categoryId/:subcategoryId',
  LOGICAL_SEQUENCING_GRADE: '/logical-sequencing-quiz/:grade',
  PERCEPTION_QUIZ_SELECTION: '/perception-quiz-selection/:categoryId',
  ORAL_LANGUAGE_SELECTION_WITH_ID: '/oral-language-selection/:categoryId',
  ORAL_SENTENCE_BUILDING_GRADE: '/category/oral-skills/sentence-building/:grade',
  ORAL_STORY_RETELL_GRADE: '/category/oral-skills/story-retell/:grade',
  READING_ASSESSMENT: '/reading-assessment/:categoryId',
  SPELLING_TEST: '/spelling-test/:grade',
  WRITING_TEST: '/writing-test/:grade',
  STORY_RETELL_QUIZ_GRADE_FLAT: '/story-retell-quiz/:grade',
} as const;

// ─── Parameterized route helpers ────────────────────────────────────
// Use these in navigate() calls for routes with dynamic segments.

export const categoryRoute = (id: string) =>
  `/category/${id}`;

export const quizRoute = (categoryId: string, subcategoryId: string) =>
  `/quiz/${categoryId}/${subcategoryId}`;

export const startingEndingSoundGradeRoute = (grade: string | number) =>
  `/starting-ending-sound-quiz/${grade}`;

export const logicalSequencingGradeRoute = (grade: string | number) =>
  `/logical-sequencing-quiz/${grade}`;

export const perceptionQuizSelectionRoute = (categoryId: string) =>
  `/perception-quiz-selection/${categoryId}`;

export const oralLanguageSelectionRoute = (categoryId: string) =>
  `/oral-language-selection/${categoryId}`;

export const oralSentenceBuildingGradeRoute = (grade: string | number) =>
  `/category/oral-skills/sentence-building/${grade}`;

export const oralStoryRetellGradeRoute = (grade: string | number) =>
  `/category/oral-skills/story-retell/${grade}`;

export const readingAssessmentRoute = (categoryId: string) =>
  `/reading-assessment/${categoryId}`;

export const spellingTestRoute = (grade: string | number) =>
  `/spelling-test/${grade}`;

export const writingTestRoute = (grade: string | number) =>
  `/writing-test/${grade}`;

export const storyRetellQuizGradeRoute = (grade: string) =>
  `/story-retell-quiz/${grade}`;

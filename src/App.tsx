import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { lazy, Suspense, ComponentType } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import { AnimatePresence, motion } from 'framer-motion';
import { ROUTES, ROUTE_PATTERNS } from './routes';

// ============================================
// LAZY LOADED PAGES - Code splitting for better performance
// Pages are loaded on-demand when navigated to
// ============================================

// Core pages (load first as most likely to be visited)
const Homepage = lazy(() => import('./pages/Homepage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const QuizPage = lazy(() => import('./pages/QuizPage'));

// Admin pages
const AdminReports = lazy(() => import('./pages/AdminReports'));

// Phonics & Sound quizzes (removed from oral skills category)

// Perception quizzes
const PerceptionQuiz = lazy(() => import('./pages/PerceptionQuiz'));
const PerceptionQuizSelection = lazy(() => import('./pages/PerceptionQuizSelection'));
const MissingObjectQuizPage = lazy(() => import('./pages/MissingObjectQuizPage'));
const SentenceDifferenceQuiz = lazy(() => import('./pages/SentenceDifferenceQuiz'));

// Cognitive assessments
const LogicalSequencingQuiz = lazy(() => import('./pages/LogicalSequencingQuiz'));
const SharedGradeSelectorPage = lazy(() => import('./pages/SharedGradeSelectorPage'));
const AttentionMemorySelection = lazy(() => import('./pages/AttentionMemorySelection'));
const AttentionAssessment = lazy(() => import('./pages/AttentionAssessment'));
const MemoryAssessment = lazy(() => import('./pages/MemoryAssessment'));
const LearningStylesQuiz = lazy(() => import('./pages/LearningStylesQuiz'));
const CriticalThinkingPage = lazy(() => import('./pages/CriticalThinkingPage'));
const AnalogyQuiz = lazy(() => import('./pages/AnalogyQuiz'));
const CategoryQuiz = lazy(() => import('./pages/CategoryQuiz'));

// Oral language quizzes
const OralLanguageQuiz = lazy(() => import('./pages/OralLanguageQuiz'));
const OralLanguageSelection = lazy(() => import('./pages/OralLanguageSelection'));
const StoryRetellQuiz = lazy(() => import('./pages/StoryRetellQuiz'));
const SentenceBuildingQuiz = lazy(() => import('./pages/SentenceBuildingQuiz'));
const VocabularyMatching = lazy(() => import('./pages/VocabularyMatching'));
const FlashWordQuiz = lazy(() => import('./pages/FlashWordQuiz'));

// Academic assessments
const SpellingTest = lazy(() => import('./pages/SpellingTest'));
const WritingTest = lazy(() => import('./pages/WritingTest'));
const ReadingAssessment = lazy(() => import('./pages/ReadingAssessment'));
const AssessmentGenerator = lazy(() => import('./pages/AssessmentGenerator'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

const base = import.meta.env.VITE_BASE_PATH || '/holistic-assessment-tool';

// ============================================
// ROUTE CONFIGURATION
// Single source of truth — every route path comes from routes.ts.
// Adding a route = adding one entry here. No more drift.
// ============================================

interface RouteEntry {
  path: string;
  Component: React.LazyExoticComponent<ComponentType<any>>;
  adminOnly?: boolean;
}

const routeConfig: RouteEntry[] = [
  // ── Core ──────────────────────────────────────────────────────────
  { path: ROUTES.HOME, Component: Homepage },
  { path: ROUTES.AUTH, Component: AuthPage },
  { path: ROUTES.PROFILE, Component: ProfilePage },
  { path: ROUTES.ADMIN_REPORTS, Component: AdminReports, adminOnly: true },
  { path: ROUTES.CATEGORIES, Component: CategoriesPage },
  { path: ROUTE_PATTERNS.CATEGORY, Component: CategoryPage },
  { path: ROUTE_PATTERNS.QUIZ, Component: QuizPage },

  // ── Mind – Attention & Memory ─────────────────────────────────────
  { path: ROUTES.ATTENTION_MEMORY, Component: AttentionMemorySelection },
  { path: ROUTES.ATTENTION_QUIZ, Component: AttentionAssessment },
  { path: ROUTES.PICTURE_SEQUENCE, Component: MemoryAssessment },
  { path: ROUTES.FLASH_WORD, Component: FlashWordQuiz },

  // ── Mind – Perception ─────────────────────────────────────────────
  { path: ROUTES.PERCEPTION_SELECTION, Component: PerceptionQuizSelection },
  { path: ROUTES.PERCEPTION_MISSING_OBJECT, Component: MissingObjectQuizPage },
  { path: ROUTES.PERCEPTION_SENTENCE_DIFF, Component: SentenceDifferenceQuiz },
  { path: ROUTES.PERCEPTION_LOGICAL_SEQ, Component: SharedGradeSelectorPage },

  // ── Mind – Critical Thinking ──────────────────────────────────────
  { path: ROUTES.CRITICAL_THINKING_SELECTION, Component: CriticalThinkingPage },
  { path: ROUTES.ANALOGY_QUIZ, Component: AnalogyQuiz },
  { path: ROUTES.CATEGORY_QUIZ, Component: CategoryQuiz },

  // ── Mind – Learning Style ─────────────────────────────────────────
  { path: ROUTES.LEARNING_STYLES_QUIZ, Component: LearningStylesQuiz },

  // ── Oral Skills ───────────────────────────────────────────────────
  { path: ROUTES.ORAL_LANGUAGE_SELECTION, Component: OralLanguageSelection },
  { path: ROUTES.ORAL_SENTENCE_BUILDING, Component: SharedGradeSelectorPage },
  { path: ROUTE_PATTERNS.ORAL_SENTENCE_BUILDING_GRADE, Component: SentenceBuildingQuiz },
  { path: ROUTES.ORAL_STORY_SEQUENCING, Component: OralLanguageQuiz },
  { path: ROUTES.ORAL_STORY_RETELL, Component: SharedGradeSelectorPage },
  { path: ROUTE_PATTERNS.ORAL_STORY_RETELL_GRADE, Component: StoryRetellQuiz },

  // ── Academic ──────────────────────────────────────────────────────
  { path: ROUTES.VOCABULARY_MATCHING, Component: VocabularyMatching },
  { path: ROUTES.SPELLING_GRADES, Component: SharedGradeSelectorPage },
  { path: ROUTE_PATTERNS.SPELLING_TEST, Component: SpellingTest },
  { path: ROUTES.WRITING_GRADES, Component: SharedGradeSelectorPage },
  { path: ROUTE_PATTERNS.WRITING_TEST, Component: WritingTest },
  { path: ROUTE_PATTERNS.READING_ASSESSMENT, Component: ReadingAssessment },
  { path: ROUTES.ASSESSMENT_GENERATOR, Component: AssessmentGenerator },

  // ── Legacy flat routes (backward compatibility) ───────────────────
  { path: ROUTE_PATTERNS.PERCEPTION_QUIZ_SELECTION, Component: PerceptionQuizSelection },
  { path: ROUTES.PERCEPTION_QUIZ_FLAT, Component: PerceptionQuiz },
  { path: ROUTES.MISSING_OBJECT_QUIZ_FLAT, Component: MissingObjectQuizPage },
  { path: ROUTES.SENTENCE_DIFFERENCE_QUIZ_FLAT, Component: SentenceDifferenceQuiz },
  { path: ROUTES.LOGICAL_SEQUENCING_GRADES, Component: SharedGradeSelectorPage },
  { path: ROUTE_PATTERNS.LOGICAL_SEQUENCING_GRADE, Component: LogicalSequencingQuiz },
  { path: ROUTE_PATTERNS.ORAL_LANGUAGE_SELECTION_WITH_ID, Component: OralLanguageSelection },
  { path: ROUTES.ORAL_LANGUAGE_QUIZ_FLAT, Component: OralLanguageQuiz },
  { path: ROUTES.STORY_RETELL_QUIZ_FLAT, Component: SharedGradeSelectorPage },
  { path: ROUTE_PATTERNS.STORY_RETELL_QUIZ_GRADE_FLAT, Component: StoryRetellQuiz },
  { path: ROUTES.ATTENTION_MEMORY_FLAT, Component: AttentionMemorySelection },
  { path: ROUTES.ATTENTION_ASSESSMENT_FLAT, Component: AttentionAssessment },
  { path: ROUTES.MEMORY_ASSESSMENT_FLAT, Component: MemoryAssessment },
  { path: ROUTES.ATTENTION_QUIZ_FLAT, Component: AttentionAssessment },
  { path: ROUTES.CRITICAL_THINKING_FLAT, Component: CriticalThinkingPage },
  { path: ROUTES.ANALOGY_QUIZ_FLAT, Component: AnalogyQuiz },
  { path: ROUTES.CATEGORY_QUIZ_FLAT, Component: CategoryQuiz },
  { path: ROUTES.FLASH_WORD_QUIZ_FLAT, Component: FlashWordQuiz },
];

const motionProps = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.1, ease: 'easeOut' as const },
};

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {routeConfig.map(({ path, Component, adminOnly }) => {
          const element = (
            <motion.div {...motionProps}>
              <Component />
            </motion.div>
          );
          return (
            <Route
              key={path}
              path={path}
              element={
                adminOnly
                  ? <ProtectedRoute allowedRoles={['admin']}>{element}</ProtectedRoute>
                  : element
              }
            />
          );
        })}
        {/* Catch-all: must be last */}
        <Route
          path="*"
          element={
            <motion.div {...motionProps}>
              <NotFoundPage />
            </motion.div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <Router basename={base}>
            <Suspense fallback={<LoadingSpinner message="Loading..." />}>
              <div className="App" data-theme="grow360">
                <AnimatedRoutes />
              </div>
            </Suspense>
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
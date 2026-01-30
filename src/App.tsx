import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import { AnimatePresence, motion } from 'framer-motion';

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

// Phonics & Sound quizzes
const PhonicsQuiz = lazy(() => import('./pages/PhonicsQuizNew'));
const PhonicsQuizSelection = lazy(() => import('./pages/PhonicsQuizSelection'));
const StartingEndingSoundQuiz = lazy(() => import('./pages/StartingEndingSoundQuiz'));
const StartingEndingSoundGradeSelector = lazy(() => import('./pages/StartingEndingSoundGradeSelector'));
const BlendingQuiz = lazy(() => import('./pages/BlendingQuiz'));
const SegmentingQuiz = lazy(() => import('./pages/SegmentingQuiz'));
const BlendingSegmentingSelection = lazy(() => import('./pages/BlendingSegmentingSelection'));

// Perception quizzes
const PerceptionQuiz = lazy(() => import('./pages/PerceptionQuiz'));
const PerceptionQuizSelection = lazy(() => import('./pages/PerceptionQuizSelection'));
const MissingObjectQuizPage = lazy(() => import('./pages/MissingObjectQuizPage'));
const SentenceDifferenceQuiz = lazy(() => import('./pages/SentenceDifferenceQuiz'));

// Cognitive assessments
const LogicalSequencingQuiz = lazy(() => import('./pages/LogicalSequencingQuiz'));
const LogicalSequencingGradeSelector = lazy(() => import('./pages/LogicalSequencingGradeSelector'));
const AttentionQuiz = lazy(() => import('./pages/AttentionQuiz'));
const MemoryQuiz = lazy(() => import('./pages/MemoryQuiz'));
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
const StoryRetellGradeSelector = lazy(() => import('./pages/StoryRetellGradeSelector'));
const VocabularyMatching = lazy(() => import('./pages/VocabularyMatching'));
const FlashWordQuiz = lazy(() => import('./pages/FlashWordQuiz'));

// Academic assessments
const SpellingGradeSelector = lazy(() => import('./pages/SpellingGradeSelector'));
const SpellingTest = lazy(() => import('./pages/SpellingTest'));
const WritingGradeSelector = lazy(() => import('./pages/WritingGradeSelector'));
const WritingTest = lazy(() => import('./pages/WritingTest'));
const ReadingAssessment = lazy(() => import('./pages/ReadingAssessment'));
const AssessmentGenerator = lazy(() => import('./pages/AssessmentGenerator'));

const base = import.meta.env.VITE_BASE_PATH || '/holistic-assessment-tool';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            >
              <Homepage />
            </motion.div>
          }
        />
        <Route
          path="/auth"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            >
              <AuthPage />
            </motion.div>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1, ease: "easeOut" }}
              >
                <AdminReports />
              </motion.div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            >
              <CategoriesPage />
            </motion.div>
          }
        />
        <Route
          path="/category/:categoryId"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            >
              <CategoryPage />
            </motion.div>
          }
        />
        <Route
          path="/quiz/:categoryId/:subcategoryId"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            >
              <QuizPage />
            </motion.div>
          }
        />
        <Route
          path="/phonics-quiz-selection/:categoryId"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            >
              <PhonicsQuizSelection />
            </motion.div>
          }
        />
        <Route
          path="/phonics-quiz/:categoryId"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            >
              <PhonicsQuiz />
            </motion.div>
          }
        />
        <Route
          path="/starting-ending-sound-quiz"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            >
              <StartingEndingSoundGradeSelector />
            </motion.div>
          }
        />
        <Route
          path="/starting-ending-sound-quiz/:grade"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            >
              <StartingEndingSoundQuiz />
            </motion.div>
          }
        />
        <Route
          path="/blending-segmenting-selection/:categoryId"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            >
              <BlendingSegmentingSelection />
            </motion.div>
          }
        />
        <Route
          path="/blending-quiz/:categoryId"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            >
              <BlendingQuiz />
            </motion.div>
          }
        />
        <Route
          path="/segmenting-quiz/:categoryId"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            >
              <SegmentingQuiz />
            </motion.div>
          }
        />
        <Route
          path="/vocabulary-matching"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            >
              <VocabularyMatching />
            </motion.div>
          }
        />
        <Route
          path="/learning-styles-quiz"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            >
              <LearningStylesQuiz />
            </motion.div>
          }
        />
        <Route
          path="/category/mind/perception/quiz"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            >
              <PerceptionQuiz />
            </motion.div>
          }
        />
        <Route
          path="/category/mind/perception/missing-object"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            >
              <MissingObjectQuizPage />
            </motion.div>
          }
        />
        <Route
          path="/category/mind/perception/sentence-difference"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            >
              <SentenceDifferenceQuiz />
            </motion.div>
          }
        />
        <Route
          path="/category/mind/perception/logical-sequencing"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            >
              <LogicalSequencingGradeSelector />
            </motion.div>
          }
        />
        <Route
          path="/category/mind/perception/logical-sequencing/:grade"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            >
              <LogicalSequencingQuiz />
            </motion.div>
          }
        />
        <Route
          path="/category/mind/perception-selection"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            >
              <PerceptionQuizSelection />
            </motion.div>
          }
        />
        <Route
          path="/category/oral-skills/oral-language-selection"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            >
              <OralLanguageSelection />
            </motion.div>
          }
        />
        <Route
          path="/category/oral-skills/oral-language-selection/sentence-building"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            >
              <OralLanguageQuiz />
            </motion.div>
          }
        />
        <Route
          path="/category/oral-skills/oral-language-selection/story-sequencing"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            >
              <OralLanguageQuiz />
            </motion.div>
          }
        />
        <Route
          path="/category/oral-skills/oral-language-selection/story-retell"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            >
              <StoryRetellGradeSelector />
            </motion.div>
          }
        />
        <Route
          path="/category/oral-skills/oral-language-selection/story-retell/:grade"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            >
              <StoryRetellQuiz />
            </motion.div>
          }
        />
        <Route
          path="/category/mind/attention-memory"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            >
              <AttentionMemorySelection />
            </motion.div>
          }
        />
        <Route
          path="/category/mind/attention-memory/attention-quiz"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            >
              <AttentionAssessment />
            </motion.div>
          }
        />
        <Route
          path="/category/mind/attention-memory/picture-sequence"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            >
              <MemoryAssessment />
            </motion.div>
          }
        />
        <Route
          path="/category/mind/attention-memory/flash-word"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            >
              <AttentionQuiz />
            </motion.div>
          }
        />
        <Route
          path="/category/mind/attention-memory/memory-quiz"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            >
              <MemoryQuiz />
            </motion.div>
          }
        />
        <Route
          path="/assessment-generator"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            >
              <AssessmentGenerator />
            </motion.div>
          }
        />
        <Route
          path="/reading-assessment/:categoryId"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <ReadingAssessment />
            </motion.div>
          }
        />
        <Route
          path="/spelling-grades"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            >
              <SpellingGradeSelector />
            </motion.div>
          }
        />
        <Route
          path="/spelling-test/:grade"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            >
              <SpellingTest />
            </motion.div>
          }
        />
        <Route
          path="/writing-grades"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            >
              <WritingGradeSelector />
            </motion.div>
          }
        />
        <Route
          path="/writing-test/:grade"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            >
              <WritingTest />
            </motion.div>
          }
        />
        <Route
          path="/category/mind/critical-thinking-selection"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            >
              <CriticalThinkingPage />
            </motion.div>
          }
        />
        <Route
          path="/category/mind/critical-thinking/analogy-quiz"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            >
              <AnalogyQuiz />
            </motion.div>
          }
        />
        <Route
          path="/category/mind/critical-thinking/category-quiz"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            >
              <CategoryQuiz />
            </motion.div>
          }
        />
        <Route
          path="/flash-word-quiz"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            >
              <FlashWordQuiz />
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
      <AuthProvider>
        <Router basename={base}>
          <Suspense fallback={<LoadingSpinner message="Loading..." />}>
            <div className="App" data-theme="grow360">
              <AnimatedRoutes />
            </div>
          </Suspense>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
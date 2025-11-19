import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Homepage from './pages/Homepage';
import CategoriesPage from './pages/CategoriesPage';
import CategoryPage from './pages/CategoryPage';
import QuizPage from './pages/QuizPage';
import PhonicsQuiz from './pages/PhonicsQuizNew';
import PhonicsQuizSelection from './pages/PhonicsQuizSelection';
import StartingEndingSoundQuiz from './pages/StartingEndingSoundQuiz';
import StartingEndingSoundGradeSelector from './pages/StartingEndingSoundGradeSelector';
import LogicalSequencingQuiz from './pages/LogicalSequencingQuiz';
import LogicalSequencingGradeSelector from './pages/LogicalSequencingGradeSelector';
import PerceptionQuizSelection from './pages/PerceptionQuizSelection';
import BlendingQuiz from './pages/BlendingQuiz';
import VocabularyMatching from './pages/VocabularyMatching';
import LearningStylesQuiz from './pages/LearningStylesQuiz';
import AttentionQuiz from './pages/AttentionQuiz';
import MemoryQuiz from './pages/MemoryQuiz';
import AttentionMemorySelection from './pages/AttentionMemorySelection';
import AttentionAssessment from './pages/AttentionAssessment';
import MemoryAssessment from './pages/MemoryAssessment';
import PerceptionQuiz from './pages/PerceptionQuiz';
import MissingObjectQuizPage from './pages/MissingObjectQuizPage';
import SentenceDifferenceQuiz from './pages/SentenceDifferenceQuiz';
import OralLanguageQuiz from './pages/OralLanguageQuiz';
import StoryRetellQuiz from './pages/StoryRetellQuiz';
import StoryRetellGradeSelector from './pages/StoryRetellGradeSelector';
import SpellingGradeSelector from './pages/SpellingGradeSelector';
import SpellingTest from './pages/SpellingTest';
import WritingGradeSelector from './pages/WritingGradeSelector';
import WritingTest from './pages/WritingTest';
import AssessmentGenerator from './pages/AssessmentGenerator';
import ReadingAssessment from './pages/ReadingAssessment';
import AuthPage from './pages/AuthPage';
import CriticalThinkingPage from './pages/CriticalThinkingPage';
import AnalogyQuiz from './pages/AnalogyQuiz';
import CategoryQuiz from './pages/CategoryQuiz';
import FlashWordQuiz from './pages/FlashWordQuiz';
import { AuthProvider } from './contexts/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';

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
          path="/perception-quiz"
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
          path="/missing-object-quiz"
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
          path="/sentence-difference-quiz"
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
          path="/logical-sequencing-quiz"
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
          path="/logical-sequencing-quiz/:grade"
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
          path="/perception-quiz-selection/:categoryId"
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
          path="/oral-language-quiz"
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
          path="/story-retell-quiz"
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
          path="/story-retell-quiz/:grade"
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
          path="/attention-memory-selection"
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
          path="/attention-assessment"
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
          path="/memory-assessment"
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
          path="/attention-quiz"
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
          path="/memory-quiz"
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
          path="/critical-thinking"
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
          path="/analogy-quiz"
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
          path="/category-quiz"
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
    <AuthProvider>
      <Router basename={base}>
        <div className="App" data-theme="grow360">
          <AnimatedRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
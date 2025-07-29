import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import ScrollableHomepage from './pages/ScrollableHomepage';
import CategoryPage from './pages/CategoryPage';
import QuizPage from './pages/QuizPage';
import AssessmentGenerator from './pages/AssessmentGenerator';
import AuthPage from './pages/AuthPage';
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
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <ScrollableHomepage />
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
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <AuthPage />
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
              transition={{ duration: 0.15, ease: "easeOut" }}
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
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <QuizPage />
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
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <AssessmentGenerator />
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
        <div className="App" data-theme="bloom">
          <AnimatedRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
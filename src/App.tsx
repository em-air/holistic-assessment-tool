import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import QuizPage from './pages/QuizPage';
import AssessmentGenerator from './pages/AssessmentGenerator';


function App() {
  return (
    <Router>
      <div className="App" data-theme="bloom">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/category/:categoryId" element={<CategoryPage />} />
          <Route path="/quiz/:categoryId/:subcategoryId" element={<QuizPage />} />
          <Route path="/assessment-generator" element={<AssessmentGenerator />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
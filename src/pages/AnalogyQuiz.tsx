import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle, Trophy, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { analogyQuestions, gradeOptions, type GradeLevel, type AnalogyQuestion } from '../data/criticalThinkingData';
import { ProgressTracker } from '../utils/progressTracker';
import MindProgressBar from '../components/MindProgressBar';
import MindSectionReport from '../components/MindSectionReport';

const AnalogyQuiz: React.FC = () => {
  const navigate = useNavigate();
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [questions, setQuestions] = useState<AnalogyQuestion[]>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [showReport, setShowReport] = useState(false);

  // Always start with grade selection (don't auto-load from localStorage)
  useEffect(() => {
    // Clear any previously stored grade to ensure grade selection shows
    localStorage.removeItem('selectedGrade');
    setSelectedGrade(null);
  }, []);

  const handleGradeSelect = (grade: GradeLevel) => {
    setSelectedGrade(grade);
    setQuestions(analogyQuestions[grade]);
    // Only store for current session, will be cleared on page reload
    sessionStorage.setItem('selectedGrade', grade);
    resetQuiz();
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setScore(0);
    setIsComplete(false);
    setStartTime(Date.now());
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showFeedback) return;

    setSelectedAnswer(answerIndex);
    setShowFeedback(true);

    const currentQuestion = questions[currentQuestionIndex];
    if (answerIndex === currentQuestion.correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      // Quiz completed - save result
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      const percentage = Math.round((score / questions.length) * 100);

      ProgressTracker.saveQuizResult({
        quizId: 'analogy-quiz',
        quizName: 'Analogy Quiz',
        subcategory: 'critical-thinking',
        score,
        totalQuestions: questions.length,
        percentage,
        timeSpent,
        completedAt: new Date().toISOString(),
        gradeLevel: selectedGrade || 'unknown'
      });

      setIsComplete(true);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  // Grade Selection Screen
  if (!selectedGrade) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl"
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🧩</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Analogy Quiz</h1>
              <p className="text-gray-600">Choose your grade level to start</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {gradeOptions.map((option) => (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleGradeSelect(option.value as GradeLevel)}
                  className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100 hover:border-purple-300 transition-all duration-200 text-left"
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{option.label}</h3>
                  <p className="text-gray-600 text-sm">{option.description}</p>
                  <div className="mt-4 text-purple-600 font-semibold">Start Quiz →</div>
                </motion.button>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={() => navigate('/category/mind/critical-thinking-selection')}
                className="px-6 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-colors duration-200"
              >
                Back
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Results Screen
  if (isComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    const getPerformanceLevel = () => {
      if (percentage >= 90) return { level: 'Excellent!', color: 'text-green-600', emoji: '🌟' };
      if (percentage >= 70) return { level: 'Great Job!', color: 'text-blue-600', emoji: '🎉' };
      if (percentage >= 50) return { level: 'Good Work!', color: 'text-yellow-600', emoji: '👍' };
      return { level: 'Keep Practicing!', color: 'text-purple-600', emoji: '💪' };
    };

    const performance = getPerformanceLevel();

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-400 to-purple-500 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl text-center"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy size={36} className="text-white" />
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-4">Quiz Complete!</h1>

            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
              <div className="text-6xl mb-4">{performance.emoji}</div>
              <h2 className={`text-2xl font-bold mb-2 ${performance.color}`}>
                {performance.level}
              </h2>
              <p className="text-gray-600 mb-4">
                You answered {score} out of {questions.length} questions correctly
              </p>
              <div className="text-4xl font-bold text-gray-800">
                {percentage}%
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={resetQuiz}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
              >
                <RotateCcw size={20} />
                Try Again
              </button>
              <button
                onClick={() => setSelectedGrade(null)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
              >
                Change Grade
              </button>
              <button
                onClick={() => navigate('/category/mind/critical-thinking-selection')}
                className="px-6 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-colors duration-200"
              >
                Back
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Quiz Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-500 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/category/mind/critical-thinking-selection')}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:bg-white/20 transition-colors duration-200"
          >
            <ArrowLeft size={20} />
            Back
          </button>

          <div className="text-center text-white">
            <h1 className="text-xl font-bold">
              {gradeOptions.find(g => g.value === selectedGrade)?.label} Analogy Quiz
            </h1>
            <div className="text-sm opacity-90">
              Question {currentQuestionIndex + 1} of {questions.length} • Score: {score}/{currentQuestionIndex + (showFeedback ? 1 : 0)}
            </div>
          </div>

          <div className="w-20"></div>
        </div>

        {/* Progress Bar for Mind Section */}
        <div className="mb-6">
          <MindProgressBar
            onShowReport={() => setShowReport(true)}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl"
          >
            {/* Question */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {currentQuestion?.question}
              </h2>
              {currentQuestion?.image && (
                <div className="mb-6">
                  <img
                    src={currentQuestion.image}
                    alt="Question illustration"
                    className="w-64 h-64 object-contain bg-gray-50 rounded-xl shadow-lg mx-auto border border-gray-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/256x256/f0f0f0/999999?text=Image";
                    }}
                  />
                </div>
              )}
              <div className="w-20 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded mx-auto"></div>
            </div>

            {/* Answer Choices */}
            <div className="grid gap-4 mb-8">
              {currentQuestion?.choices.map((choice, index) => {
                let buttonClass = "w-full p-4 text-left rounded-xl border-2 transition-all duration-200 font-semibold ";

                if (showFeedback) {
                  if (index === currentQuestion.correctAnswer) {
                    buttonClass += "bg-green-100 border-green-400 text-green-800";
                  } else if (index === selectedAnswer && index !== currentQuestion.correctAnswer) {
                    buttonClass += "bg-red-100 border-red-400 text-red-800";
                  } else {
                    buttonClass += "bg-gray-100 border-gray-200 text-gray-600";
                  }
                } else {
                  if (selectedAnswer === index) {
                    buttonClass += "bg-blue-100 border-blue-400 text-blue-800";
                  } else {
                    buttonClass += "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700";
                  }
                }

                return (
                  <motion.button
                    key={index}
                    whileHover={!showFeedback ? { scale: 1.02 } : {}}
                    whileTap={!showFeedback ? { scale: 0.98 } : {}}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showFeedback}
                    className={buttonClass}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-medium">{choice}</span>
                      {showFeedback && index === currentQuestion.correctAnswer && (
                        <CheckCircle size={24} className="text-green-600" />
                      )}
                      {showFeedback && index === selectedAnswer && index !== currentQuestion.correctAnswer && (
                        <XCircle size={24} className="text-red-600" />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Feedback */}
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <div className={`p-4 rounded-xl ${selectedAnswer === currentQuestion.correctAnswer
                  ? 'bg-green-100 border border-green-200'
                  : 'bg-red-100 border border-red-200'
                  }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {selectedAnswer === currentQuestion.correctAnswer ? (
                      <>
                        <CheckCircle size={20} className="text-green-600" />
                        <span className="font-semibold text-green-800">Correct!</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={20} className="text-red-600" />
                        <span className="font-semibold text-red-800">Not quite right</span>
                      </>
                    )}
                  </div>
                  {currentQuestion.explanation && (
                    <p className="text-gray-700 text-sm">{currentQuestion.explanation}</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Next Button */}
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <button
                  onClick={handleNext}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                >
                  {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
                </button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Report Modal */}
        {showReport && (
          <MindSectionReport onClose={() => setShowReport(false)} />
        )}
      </div>
    </div>
  );
};

export default AnalogyQuiz;
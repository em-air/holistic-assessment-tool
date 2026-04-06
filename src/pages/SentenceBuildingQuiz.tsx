import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, Check, X, RotateCcw, MessageSquare } from 'lucide-react';
import { getQuestionsForGrade, getGradeData, type SentenceBuildingQuestion } from '../data/sentenceBuildingData';
import { ProgressTracker } from '../utils/progressTracker';
import { ROUTES } from '../routes';

const SentenceBuildingQuiz: React.FC = () => {
  const navigate = useNavigate();
  const { grade: gradeParam } = useParams<{ grade: string }>();
  const grade = parseInt(gradeParam || '1');
  const gradeData = getGradeData(grade);

  const [questions, setQuestions] = useState<SentenceBuildingQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showSparkle, setShowSparkle] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const hasSavedResultRef = useRef(false);

  useEffect(() => {
    const gradeQuestions = getQuestionsForGrade(grade);
    setQuestions(gradeQuestions);
    startTimeRef.current = Date.now();
  }, [grade]);

  // Save results when quiz is completed
  useEffect(() => {
    if (showResults && !hasSavedResultRef.current && questions.length > 0) {
      hasSavedResultRef.current = true;
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      const percentage = Math.round((score / questions.length) * 100);

      ProgressTracker.saveQuizResult({
        quizId: 'oral-language-sentence-building',
        quizName: `Sentence Building - Grade ${grade}`,
        category: 'oral',
        subcategory: 'oral-language',
        score,
        totalQuestions: questions.length,
        percentage,
        timeSpent,
        completedAt: new Date().toISOString(),
      });
    }
  }, [showResults, score, questions.length, grade]);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleAnswerSelect = (optionId: string) => {
    if (showFeedback) return;

    setSelectedAnswer(optionId);
    const selectedOption = currentQuestion?.options.find(opt => opt.id === optionId);
    const correct = selectedOption?.isCorrect || false;

    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setScore(prev => prev + 1);
      setShowSparkle(true);
      setTimeout(() => setShowSparkle(false), 2000);
    }
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      setShowResults(true);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setIsCorrect(false);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setIsCorrect(false);
    setScore(0);
    setShowResults(false);
    setShowSparkle(false);
    hasSavedResultRef.current = false;
    startTimeRef.current = Date.now();
  };

  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  const getPerformanceMessage = () => {
    if (percentage >= 80) return 'Excellent work! 🌟';
    if (percentage >= 60) return 'Good job! 👍';
    return 'Keep practicing! 💪';
  };

  // Results screen
  if (showResults) {
    return (
      <div className="min-h-screen bg-emerald-50 py-8">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-2xl mx-auto"
          >
            <div className="bg-white rounded-xl p-8 shadow-card border border-slate-100">
              <Star className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-stone-800 mb-2">Quiz Complete!</h2>
              <p className="text-stone-500 mb-6">Sentence Building — {gradeData?.title}</p>

              <div className="bg-emerald-100 rounded-lg p-6 mb-6">
                <div className="text-4xl font-bold text-emerald-600 mb-2">
                  {percentage}%
                </div>
                <p className="text-emerald-700">
                  {score} of {questions.length} correct
                </p>
                <p className="text-lg font-medium text-emerald-800 mt-2">
                  {getPerformanceMessage()}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleRestart}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-300"
                >
                  <RotateCcw size={20} />
                  Try Again
                </button>
                <button
                  onClick={() => navigate(ROUTES.ORAL_SENTENCE_BUILDING, { replace: true })}
                  className="px-6 py-3 bg-stone-500 hover:bg-stone-600 text-white rounded-lg font-medium transition-colors duration-300"
                >
                  Back to Grades
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading questions...</p>
      </div>
    );
  }

  // Question screen
  return (
    <div className="min-h-screen bg-purple-50 py-8">
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center space-x-2 px-4 py-2 text-stone-600 rounded-lg transition-all duration-300 ease-out hover:text-purple-700 hover:bg-white/50 hover:shadow-md transform hover:scale-105 hover:-translate-y-0.5"
          >
            <ArrowLeft size={20} className="transform group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-medium">Back</span>
          </button>

          {/* Progress */}
          <div className="flex items-center gap-4 text-white">
            <div className="flex items-center gap-2">
              <MessageSquare size={20} />
              <span>Sentence Building — {gradeData?.title}</span>
            </div>
            <div className="bg-white/20 rounded-full px-3 py-1">
              {currentQuestionIndex + 1} of {questions.length}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white rounded-xl p-8 shadow-card border border-slate-100 mb-6 relative">
            {/* Question */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-stone-800 mb-4">
                {currentQuestion.question}
              </h2>

              {/* Image */}
              {currentQuestion.image && (
                <div className="relative mb-6">
                  <img
                    src={currentQuestion.image}
                    alt="Question"
                    className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                  />
                </div>
              )}

              {/* Answer Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {currentQuestion.options.map((option) => {
                  const isSelected = selectedAnswer === option.id;
                  const showCorrectFeedback = showFeedback && option.isCorrect;
                  const showIncorrectFeedback = showFeedback && isSelected && !option.isCorrect;

                  return (
                    <motion.button
                      key={option.id}
                      whileHover={{ scale: showFeedback ? 1 : 1.02 }}
                      whileTap={{ scale: showFeedback ? 1 : 0.98 }}
                      onClick={() => handleAnswerSelect(option.id)}
                      disabled={showFeedback}
                      className={`
                        p-4 rounded-xl border-2 transition-all duration-300 text-left
                        ${showCorrectFeedback
                          ? 'bg-green-100 border-green-500 text-green-800'
                          : showIncorrectFeedback
                          ? 'bg-red-100 border-red-500 text-red-800'
                          : isSelected
                          ? 'bg-blue-100 border-blue-500 text-blue-800'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100 hover:border-stone-300'
                        }
                        ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{option.text}</span>
                        {showCorrectFeedback && <Check className="w-5 h-5 text-green-600" />}
                        {showIncorrectFeedback && <X className="w-5 h-5 text-red-600" />}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Sparkle Animation */}
            <AnimatePresence>
              {showSparkle && (
                <motion.div
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2 }}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
                >
                  <div className="text-6xl">✨</div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Feedback */}
            <AnimatePresence>
              {showFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`text-center p-4 rounded-lg mb-4 ${
                    isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {isCorrect ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                    <span className="font-bold">
                      {isCorrect ? 'Correct!' : 'Incorrect'}
                    </span>
                  </div>
                  <p className="text-sm">
                    {isCorrect
                      ? currentQuestion.feedback.correct
                      : currentQuestion.feedback.incorrect
                    }
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Next Button */}
            {showFeedback && (
              <div className="text-center">
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={handleNextQuestion}
                  className="px-8 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-full font-bold transition-colors duration-300"
                >
                  {isLastQuestion ? 'See Results' : 'Next Question'}
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SentenceBuildingQuiz;

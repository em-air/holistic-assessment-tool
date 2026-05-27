import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QuestionCard from '../components/QuestionCard';
import ResultScreen from '../components/ResultScreen';
import FloatingBackground from '../components/FloatingBackground';
import { 
  learningStyles, 
  quizTexts, 
  type LearningStyle 
} from '../data/learningStylesPresentation';
import { ProgressTracker } from '../utils/progressTracker';
import AssessmentProgressBar from '../components/AssessmentProgressBar';
import MindSectionReport from '../components/MindSectionReport';
import {
  getLearningStyleQuestions,
  calculateLearningStyle,
  type LearningStyleQuestion,
  type LearningStyleId,
  type LearningStyleResultId,
} from '../services/learningStylesService';
import { logger } from '../utils/logger';

interface QuizAnswer {
  questionId: string;
  selectedOptionId: string;
  learningStyle: LearningStyleId;
}

interface LearningStyleScore {
  style: LearningStyleId;
  score: number;
  percentage: number;
}

const LearningStylesQuiz: React.FC = () => {
  // State management
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [showReport, setShowReport] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [isQuizStarted, setIsQuizStarted] = useState<boolean>(false);
  const [scores, setScores] = useState<LearningStyleScore[]>([]);
  const [dominantStyle, setDominantStyle] = useState<LearningStyle | null>(null);
  const [questions, setQuestions] = useState<LearningStyleQuestion[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [startTime] = useState<number>(Date.now());

  useEffect(() => {
    let isMounted = true;

    const loadQuestions = async () => {
      const fetchedQuestions = await getLearningStyleQuestions();
      if (!isMounted) {
        return;
      }

      setQuestions(fetchedQuestions);
      setIsLoadingQuestions(false);
      if (fetchedQuestions.length === 0) {
        setLoadError('Learning styles questions are unavailable right now.');
      }
    };

    void loadQuestions();

    return () => {
      isMounted = false;
    };
  }, []);

  // Get current question
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  // Handle option selection
  const handleSelectOption = (optionId: string) => {
    const selectedOptionData = currentQuestion.options.find(opt => opt.id === optionId);
    if (!selectedOptionData) return;

    setSubmissionError(null);
    setSelectedOption(optionId);
    
    // Update answers
    const newAnswer: QuizAnswer = {
      questionId: currentQuestion.id,
      selectedOptionId: optionId,
      learningStyle: selectedOptionData.style
    };
    
    setAnswers(prev => {
      const existingAnswerIndex = prev.findIndex(a => a.questionId === currentQuestion.id);
      if (existingAnswerIndex >= 0) {
        const updated = [...prev];
        updated[existingAnswerIndex] = newAnswer;
        return updated;
      }
      return [...prev, newAnswer];
    });
  };

  // Handle next question
  const handleNextQuestion = () => {
    if (!selectedOption) return;

    if (isLastQuestion) {
      void calculateResults();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
    }
  };

  // Calculate quiz results
  const calculateResults = async () => {
    const answerMap = answers.reduce<Record<string, string>>((acc, answer) => {
      acc[answer.questionId] = answer.selectedOptionId;
      return acc;
    }, {});

    const calculation = await calculateLearningStyle(answerMap);
    if (!calculation) {
      setSubmissionError('Unable to calculate learning style right now. Please try again.');
      logger.error('Learning styles calculation failed');
      return;
    }

    const totalAnswers = answers.length;
    const scoreArray: LearningStyleScore[] = (
      ['visual', 'auditory', 'reading-writing'] as const
    ).map((style) => ({
      style,
      score: calculation[style],
      percentage: totalAnswers > 0 ? Math.round((calculation[style] / totalAnswers) * 100) : 0,
    }));

    // Sort by score to find dominant style
    scoreArray.sort((a, b) => b.score - a.score);
    setScores(scoreArray);

    // Find result style info (supports all 7 result types including mixed)
    const dominantStyleInfo = learningStyles.find(s => s.id === calculation.result);
    if (dominantStyleInfo) {
      setDominantStyle(dominantStyleInfo);
    }

    // Save progress
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const percentage = Math.round((scoreArray[0].score / totalAnswers) * 100);
    
    ProgressTracker.saveQuizResult({
      quizId: 'learning-styles',
      quizName: 'Learning Styles Quiz',
      subcategory: 'learning-style',
      score: scoreArray[0].score,
      totalQuestions: totalAnswers,
      percentage,
      timeSpent,
      completedAt: new Date().toISOString(),
      additionalData: {
        dominantStyle: calculation.dominantStyle,
        result: calculation.result,
        allScores: scoreArray
      }
    });

    setShowResults(true);
  };

  // Reset quiz
  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedOption(null);
    setShowResults(false);
    setIsQuizStarted(false);
    setScores([]);
    setDominantStyle(null);
    setSubmissionError(null);
  };

  // Start quiz
  const startQuiz = () => {
    setIsQuizStarted(true);
  };

  // Check if current question has been answered
  const currentAnswer = answers.find(a => a.questionId === currentQuestion?.id);
  useEffect(() => {
    if (currentAnswer) {
      setSelectedOption(currentAnswer.selectedOptionId);
    } else {
      setSelectedOption(null);
    }
  }, [currentQuestionIndex, currentAnswer]);

  if (isLoadingQuestions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        <FloatingBackground />
        <div className="relative z-10 container mx-auto flex min-h-screen items-center justify-center px-4 py-8">
          <div className="rounded-2xl bg-white p-8 text-center shadow-lg">
            <div className="mb-4 text-6xl">🧠</div>
            <h2 className="text-2xl font-bold text-gray-800">Loading learning styles quiz...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        <FloatingBackground />
        <div className="relative z-10 container mx-auto flex min-h-screen items-center justify-center px-4 py-8">
          <div className="max-w-xl rounded-2xl bg-white p-8 text-center shadow-lg">
            <div className="mb-4 text-6xl">🧠</div>
            <h2 className="mb-3 text-2xl font-bold text-gray-800">Learning styles unavailable</h2>
            <p className="text-gray-600">{loadError}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      <FloatingBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl md:text-4xl font-bold text-gray-800"
          >
            {quizTexts.title[language]}
          </motion.h1>
        </div>

        {/* Progress Bar for Mind Section */}
        <div className="mb-6">
          <AssessmentProgressBar 
            onShowReport={() => setShowReport(true)} 
          />
        </div>

        <AnimatePresence mode="wait">
          {!isQuizStarted && !showResults && (
            /* Welcome Screen */
            <motion.div
              key="welcome"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl mx-auto text-center"
            >
              <motion.div
                initial={{ rotate: 0, scale: 0 }}
                animate={{ rotate: 360, scale: 1 }}
                transition={{ 
                  duration: 1, 
                  delay: 0.2,
                  type: "spring",
                  bounce: 0.4
                }}
                className="text-8xl mb-8"
              >
                🧠
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <h2 className="text-4xl font-bold text-gray-800 mb-6">
                  {quizTexts.title[language]}
                </h2>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  {quizTexts.subtitle[language]}
                </p>
                
                <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">
                    What You'll Discover:
                  </h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    {learningStyles.map((style, index) => (
                      <motion.div
                        key={style.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 + (index * 0.1) }}
                        className="text-center p-4"
                      >
                        <div className="text-4xl mb-3">{style.icon}</div>
                        <h4 className="font-bold text-gray-800 mb-2">
                          {style.name[language]}
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {style.description[language]}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startQuiz}
                  className="px-12 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xl font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {quizTexts.startButton[language]} ✨
                </motion.button>
                
                <p className="text-sm text-gray-500 mt-4">
                  📝 {totalQuestions} questions • ⏱️ 5-10 minutes
                </p>
              </motion.div>
            </motion.div>
          )}

          {isQuizStarted && !showResults && currentQuestion && (
            /* Quiz Questions */
            <motion.div
              key="quiz"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
            >
              <QuestionCard
                question={currentQuestion}
                selectedOption={selectedOption}
                onSelectOption={handleSelectOption}
                language={language}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={totalQuestions}
              />

              {submissionError && (
                <div className="mx-auto mt-6 max-w-2xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {submissionError}
                </div>
              )}
              
              {/* Navigation */}
              <div className="flex justify-center mt-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNextQuestion}
                  disabled={!selectedOption}
                  className={`
                    px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300
                    ${selectedOption
                      ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  {isLastQuestion 
                    ? `${quizTexts.finishButton[language]} 🎯`
                    : `${quizTexts.nextButton[language]} →`
                  }
                </motion.button>
              </div>
            </motion.div>
          )}

          {showResults && dominantStyle && (
            /* Results Screen */
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              <ResultScreen
                scores={scores}
                dominantStyle={dominantStyle}
                language={language}
                onRetake={resetQuiz}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Report Modal */}
        {showReport && (
          <MindSectionReport onClose={() => setShowReport(false)} />
        )}
      </div>
    </div>
  );
};

export default LearningStylesQuiz;
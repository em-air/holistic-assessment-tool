import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QuestionCard from '../components/QuestionCard';
import ResultScreen from '../components/ResultScreen';
import FloatingBackground from '../components/FloatingBackground';
import { useLanguage } from '../i18n';
import { 
  quizQuestions, 
  learningStyles, 
  quizTexts, 
  LearningStyle 
} from '../data/learningStylesData';
import { ProgressTracker } from '../utils/progressTracker';
import MindProgressBar from '../components/MindProgressBar';
import MindSectionReport from '../components/MindSectionReport';

interface QuizAnswer {
  questionId: string;
  selectedOptionId: string;
  learningStyle: 'visual' | 'auditory' | 'reading-writing';
}

interface LearningStyleScore {
  style: 'visual' | 'auditory' | 'reading-writing';
  score: number;
  percentage: number;
}

const LearningStylesQuiz: React.FC = () => {
  // Use global language context
  const { language } = useLanguage();
  // State management
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [showReport, setShowReport] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [isQuizStarted, setIsQuizStarted] = useState<boolean>(false);
  const [scores, setScores] = useState<LearningStyleScore[]>([]);
  const [dominantStyle, setDominantStyle] = useState<LearningStyle | null>(null);
  const [startTime] = useState<number>(Date.now());

  // Get current question
  const currentQuestion = quizQuestions[currentQuestionIndex];
  const totalQuestions = quizQuestions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  // Handle option selection
  const handleSelectOption = (optionId: string) => {
    const selectedOptionData = currentQuestion.options.find(opt => opt.id === optionId);
    if (!selectedOptionData) return;

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
      calculateResults();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
    }
  };

  // Calculate quiz results
  const calculateResults = () => {
    const styleScores = {
      visual: 0,
      auditory: 0,
      'reading-writing': 0
    };

    // Count scores for each style
    answers.forEach(answer => {
      styleScores[answer.learningStyle]++;
    });

    const totalAnswers = answers.length;
    const scoreArray: LearningStyleScore[] = Object.entries(styleScores).map(([style, score]) => ({
      style: style as 'visual' | 'auditory' | 'reading-writing',
      score,
      percentage: Math.round((score / totalAnswers) * 100)
    }));

    // Sort by score to find dominant style
    scoreArray.sort((a, b) => b.score - a.score);
    setScores(scoreArray);

    // Find dominant style info
    const dominantStyleInfo = learningStyles.find(s => s.id === scoreArray[0].style);
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
        dominantStyle: scoreArray[0].style,
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
          <MindProgressBar 
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
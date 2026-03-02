import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, Brain, Check, X, RotateCcw } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { oralLanguageCategories, oralLanguageTranslations, type QuizCategory } from '../data/oralLanguageData';
import { ProgressTracker } from '../utils/progressTracker';
import { ROUTES, oralLanguageSelectionRoute } from '../routes';

interface QuizScores {
  vocabulary: { correct: number; total: number };
  'sentence-building': { correct: number; total: number };
  storytelling: { correct: number; total: number };
  'story-retell': { correct: number; total: number };
}

const OralLanguageQuiz: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [quizScores, setQuizScores] = useState<QuizScores>({
    vocabulary: { correct: 0, total: 0 },
    'sentence-building': { correct: 0, total: 0 },
    storytelling: { correct: 0, total: 0 },
    'story-retell': { correct: 0, total: 0 }
  });
  const [showResults, setShowResults] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [showSparkle, setShowSparkle] = useState(false);
  const [sequenceOrder, setSequenceOrder] = useState<{[key: string]: number}>({});
  const startTimeRef = useRef<number>(Date.now());
  // Track the original navigation categoryId (before remapping) for correct quiz ID saving
  const [originalCategoryId, setOriginalCategoryId] = useState<string | null>(null);

  // Save quiz results to database when quiz is completed
  useEffect(() => {
    if (showResults && selectedCategory) {
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      const categoryScore = quizScores[selectedCategory.id as keyof QuizScores];
      const percentage = Math.round((categoryScore.correct / categoryScore.total) * 100);
      
      // Use original categoryId for quiz ID (e.g. 'story-sequencing' not 'storytelling')
      const saveCategoryId = originalCategoryId || selectedCategory.id;
      
      // Save to ProgressTracker (localStorage + DB sync)
      ProgressTracker.saveQuizResult({
        quizId: `oral-language-${saveCategoryId}`,
        quizName: `Oral Language - ${selectedCategory.title.en}`,
        category: 'oral',
        subcategory: 'oral-language',
        score: categoryScore.correct,
        totalQuestions: categoryScore.total,
        percentage,
        timeSpent,
        completedAt: new Date().toISOString(),
      });
    }
  }, [showResults, selectedCategory, quizScores, originalCategoryId]);

  const t = oralLanguageTranslations[language];
  const isRTL = language === 'ar';

  const currentQuestion = selectedCategory?.questions[currentQuestionIndex];
  const isLastQuestion = selectedCategory && currentQuestionIndex === selectedCategory.questions.length - 1;

  // Auto-select category from navigation state
  useEffect(() => {
    const state = location.state as { categoryId?: string } | null;
    if (state?.categoryId && !selectedCategory) {
      // Remember the original category ID for saving (e.g. 'story-sequencing')
      setOriginalCategoryId(state.categoryId);
      // Map story-sequencing to storytelling (the actual category ID in the data)
      const categoryId = state.categoryId === 'story-sequencing' ? 'storytelling' : state.categoryId;
      const category = oralLanguageCategories.find(c => c.id === categoryId);
      if (category) {
        startQuiz(category);
      }
    }
  }, [location.state, selectedCategory]);

  // Handle answer selection for regular questions
  const handleAnswerSelect = (optionId: string) => {
    if (showFeedback) return;
    
    setSelectedAnswer(optionId);
    const selectedOption = currentQuestion?.options.find(opt => opt.id === optionId);
    const correct = selectedOption?.isCorrect || false;
    
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      setShowSparkle(true);
      setTimeout(() => setShowSparkle(false), 2000);
    }

    // Update scores
    if (selectedCategory) {
      setQuizScores(prev => ({
        ...prev,
        [selectedCategory.id]: {
          correct: prev[selectedCategory.id].correct + (correct ? 1 : 0),
          total: prev[selectedCategory.id].total + 1
        }
      }));
    }
  };

  // Handle next question
  const handleNextQuestion = () => {
    if (!selectedCategory) return;

    if (isLastQuestion) {
      setShowResults(true);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setIsCorrect(false);
      setSequenceOrder({});
    }
  };

  // Start a specific quiz category
  const startQuiz = (category: QuizCategory) => {
    // If story-retell is selected, navigate to the separate Story Retell quiz
    if (category.id === 'story-retell') {
      navigate(ROUTES.STORY_RETELL_QUIZ_FLAT);
      return;
    }
    
    // Map data category IDs to the quiz IDs expected by ProgressTracker
    if (!originalCategoryId) {
      setOriginalCategoryId(category.id === 'storytelling' ? 'story-sequencing' : category.id);
    }
    
    setSelectedCategory(category);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setIsCorrect(false);
    setShowResults(false);
    setSequenceOrder({});
    startTimeRef.current = Date.now();  // Reset timer when starting a quiz
  };

  // Reset quiz — navigate back to the oral language selection screen
  const resetQuiz = () => {
    navigate(oralLanguageSelectionRoute('oral-skills'));
  };

  // Calculate overall performance
  const getOverallScore = () => {
    const categoryScore = quizScores[selectedCategory?.id || 'vocabulary'];
    return categoryScore.total > 0 ? Math.round((categoryScore.correct / categoryScore.total) * 100) : 0;
  };

  const getPerformanceMessage = (score: number) => {
    if (score >= 80) return t.excellent;
    if (score >= 60) return t.good;
    return t.keepTrying;
  };

  // Category Selection Screen
  if (!selectedCategory) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-blue-300 via-purple-400 to-pink-500 py-8 ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="container mx-auto px-4 relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
            onClick={() => navigate(oralLanguageSelectionRoute('oral-skills'))}
              className="group flex items-center space-x-2 px-4 py-2 text-stone-600 rounded-lg transition-all duration-300 ease-out hover:text-purple-700 hover:bg-white/50 hover:shadow-md transform hover:scale-105 hover:-translate-y-0.5"
            >
              <ArrowLeft size={20} className="transform group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="font-medium">{t.backToCategories}</span>
            </button>
            
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(lang => lang === 'en' ? 'ar' : 'en')}
              className="px-4 py-2 bg-white/20 rounded-lg text-white font-medium hover:bg-white/30 transition-colors duration-300"
            >
              {language === 'en' ? 'عربي' : 'English'}
            </button>
          </div>

          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent mb-4">
              {t.title}
            </h1>
            <p className="text-stone-700 text-lg max-w-2xl mx-auto">
              {t.subtitle}
            </p>
          </div>

          {/* Quiz Category Cards */}
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {oralLanguageCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`group ${category.color} rounded-2xl p-6 shadow-xl border border-white/20 cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-2xl`}
                onClick={() => startQuiz(category)}
              >
                <div className="text-center text-white">
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <h2 className="text-xl font-bold mb-2">
                    {category.title[language]}
                  </h2>
                  <p className="text-white/90 text-sm mb-4">
                    {category.description[language]}
                  </p>
                  <div className="bg-white/20 rounded-lg p-3">
                    <span className="text-sm font-medium">
                      {category.questions.length} {t.question}s
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Quiz Results Screen
  if (showResults) {
    const score = getOverallScore();
    const categoryScore = quizScores[selectedCategory.id];
    
    return (
      <div className={`min-h-screen bg-gradient-to-br from-green-300 via-emerald-400 to-teal-500 py-8 ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-2xl mx-auto"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
              <Star className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-stone-800 mb-4">{t.complete}</h2>
              
              <div className="bg-emerald-100 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold text-emerald-800 mb-2">
                  {selectedCategory.title[language]}
                </h3>
                <div className="text-3xl font-bold text-emerald-600 mb-2">
                  {score}%
                </div>
                <p className="text-emerald-700">
                  {categoryScore.correct} {t.of} {categoryScore.total} {t.correct}
                </p>
                <p className="text-lg font-medium text-emerald-800 mt-2">
                  {getPerformanceMessage(score)}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => startQuiz(selectedCategory)}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-300"
                >
                  <RotateCcw size={20} />
                  {t.restart}
                </button>
                <button
                  onClick={resetQuiz}
                  className="px-6 py-3 bg-stone-500 hover:bg-stone-600 text-white rounded-lg font-medium transition-colors duration-300"
                >
                  {t.backToSelection}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Quiz Question Screen
  return (
    <div className={`min-h-screen bg-gradient-to-br from-indigo-300 via-purple-400 to-pink-500 py-8 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={resetQuiz}
            className="group flex items-center space-x-2 px-4 py-2 text-stone-600 rounded-lg transition-all duration-300 ease-out hover:text-purple-700 hover:bg-white/50 hover:shadow-md transform hover:scale-105 hover:-translate-y-0.5"
          >
            <ArrowLeft size={20} className="transform group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-medium">{t.backToSelection}</span>
          </button>

          {/* Progress */}
          <div className="flex items-center gap-4 text-white">
            <div className="flex items-center gap-2">
              <Brain size={20} />
              <span>{selectedCategory.title[language]}</span>
            </div>
            <div className="bg-white/20 rounded-full px-3 py-1">
              {currentQuestionIndex + 1} {t.of} {selectedCategory.questions.length}
            </div>
          </div>
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 mb-6">
              {/* Question */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-stone-800 mb-4">
                  {currentQuestion.question}
                </h2>
                
              {/* Content based on question type */}
              {currentQuestion.type === 'storytelling' && currentQuestion.sequenceImages ? (
                // Story Sequencing Activity
                <div className="mb-6">
                  {/* Story Images */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {currentQuestion.sequenceImages.map((sequenceImage) => (
                      <motion.div
                        key={sequenceImage.id}
                        whileHover={{ scale: showFeedback ? 1 : 1.02 }}
                        className="relative"
                      >
                        <div className={`relative bg-white rounded-xl shadow-lg overflow-hidden border-2 transition-all duration-300 ${
                          sequenceOrder[sequenceImage.id] 
                            ? `border-blue-500 bg-blue-50` 
                            : 'border-gray-200 hover:border-blue-300'
                        }`}>
                          <img
                            src={sequenceImage.image}
                            alt={sequenceImage.description || `Story step ${sequenceImage.correctOrder}`}
                            className="w-full h-48 object-cover"
                          />
                          
                          {/* Selected order number */}
                          {sequenceOrder[sequenceImage.id] && (
                            <div className="absolute top-2 right-2 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                              {sequenceOrder[sequenceImage.id]}
                            </div>
                          )}
                        </div>
                        
                        {/* Order buttons */}
                        {!showFeedback && (
                          <div className="flex justify-center mt-3 gap-2">
                            {[1, 2, 3].map((num) => (
                              <button
                                key={num}
                                onClick={() => setSequenceOrder(prev => {
                                  // Remove this number from other images
                                  const updated = { ...prev };
                                  Object.keys(updated).forEach(id => {
                                    if (updated[id] === num) delete updated[id];
                                  });
                                  // Assign to current image
                                  updated[sequenceImage.id] = num;
                                  return updated;
                                })}
                                className={`w-10 h-10 rounded-full font-bold text-lg transition-all duration-200 ${
                                  sequenceOrder[sequenceImage.id] === num
                                    ? 'bg-blue-500 text-white scale-110'
                                    : 'bg-gray-200 text-gray-700 hover:bg-blue-100 hover:text-blue-700'
                                }`}
                              >
                                {num}
                              </button>
                            ))}
                          </div>
                        )}
                        
                        {/* Show correct order after feedback */}
                        {showFeedback && (
                          <div className="text-center mt-3">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                              sequenceOrder[sequenceImage.id] === sequenceImage.correctOrder
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {sequenceOrder[sequenceImage.id] === sequenceImage.correctOrder 
                                ? `✓ Correct (${sequenceImage.correctOrder})`
                                : `✗ Should be ${sequenceImage.correctOrder}`
                              }
                            </span>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Submit button for sequence */}
                  {!showFeedback && Object.keys(sequenceOrder).length === 3 && (
                    <div className="text-center">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          const userSequence: string[] = [];
                          [1, 2, 3].forEach(order => {
                            const imageId = Object.keys(sequenceOrder).find(id => sequenceOrder[id] === order);
                            if (imageId) userSequence.push(imageId);
                          });
                          
                          const isSequenceCorrect = currentQuestion.correctSequence &&
                            userSequence.length === currentQuestion.correctSequence.length &&
                            userSequence.every((id, index) => id === currentQuestion.correctSequence![index]);

                          setIsCorrect(isSequenceCorrect || false);
                          setShowFeedback(true);
                          
                          if (isSequenceCorrect) {
                            setShowSparkle(true);
                            setTimeout(() => setShowSparkle(false), 2000);
                          }

                          // Update scores
                          if (selectedCategory) {
                            setQuizScores(prev => ({
                              ...prev,
                              [selectedCategory.id]: {
                                correct: prev[selectedCategory.id].correct + (isSequenceCorrect ? 1 : 0),
                                total: prev[selectedCategory.id].total + 1
                              }
                            }));
                          }
                        }}
                        className="px-8 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-full font-bold transition-colors duration-300 shadow-lg"
                      >
                        Check My Answer
                      </motion.button>
                    </div>
                  )}
                </div>
              ) : (
                // Regular question with image and options
                <div>
                  {/* Image */}
                  <div className="relative mb-6">
                    <img
                      src={currentQuestion.image}
                      alt="Question"
                      className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                    />
                  </div>
                  
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
              )}
              
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
            </div>              {/* Feedback */}
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
                        {isCorrect ? t.correct : t.tryAgain}
                      </span>
                    </div>
                    <p className="text-sm">
                      {isCorrect 
                        ? currentQuestion.feedback?.correct 
                        : currentQuestion.feedback?.incorrect
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
                    {isLastQuestion ? t.complete : t.nextQuestion}
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default OralLanguageQuiz;
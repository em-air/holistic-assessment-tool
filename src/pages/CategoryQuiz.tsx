import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle, Trophy, RotateCcw, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { GradeLevel, CategoryQuestion, CategoryItem } from '../types/quiz';
import { supabase } from '../supabase-client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const gradeOptions = [
  { value: 'grade1', label: 'Grade 1', description: 'Basic relationships and simple concepts' },
  { value: 'grade2', label: 'Grade 2', description: 'Comparative logic and everyday connections' },
  { value: 'grade3', label: 'Grade 3', description: 'Age, size, and order reasoning' },
  { value: 'grade4', label: 'Grade 4', description: 'Abstract reasoning and complex relationships' }
];
import { ProgressTracker } from '../utils/progressTracker';
import AssessmentProgressBar from '../components/AssessmentProgressBar';
import MindSectionReport from '../components/MindSectionReport';
import { ROUTES } from '../routes';

interface DroppedItem extends CategoryItem {
  droppedIn: string;
}

const CategoryQuiz: React.FC = () => {
  const navigate = useNavigate();
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [droppedItems, setDroppedItems] = useState<DroppedItem[]>([]);
  const [availableItems, setAvailableItems] = useState<CategoryItem[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [questions, setQuestions] = useState<CategoryQuestion[]>([]);
  const [draggedItem, setDraggedItem] = useState<CategoryItem | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [showReport, setShowReport] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [validationResults, setValidationResults] = useState<Record<string, { correct: boolean; correctCategory: string }>>({}); 

  // Always start with grade selection (don't auto-load from localStorage)
  useEffect(() => {
    localStorage.removeItem('selectedGrade');
    setSelectedGrade(null);
  }, []);

  // Initialize items when question changes
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      const currentQuestion = questions[currentQuestionIndex];
      setAvailableItems([...currentQuestion.items]);
      setDroppedItems([]);
      setShowResults(false);
      setValidationResults({});
    }
  }, [currentQuestionIndex, questions]);

  const handleGradeSelect = async (grade: GradeLevel) => {
    setSelectedGrade(grade);
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      const response = await fetch(`${API_BASE_URL}/api/quiz-content/critical-thinking/category-questions?grade=${grade}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await response.json();
      if (data.success && data.questions) {
        setQuestions(data.questions);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setIsLoading(false);
    }
    sessionStorage.setItem('selectedGrade', grade);
    resetQuiz();
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setIsComplete(false);
    setShowResults(false);
    setStartTime(Date.now());
  };

  const handleDragStart = (item: CategoryItem) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, category: string) => {
    e.preventDefault();

    if (!draggedItem) return;

    // Remove item from available items
    setAvailableItems(prev => prev.filter(item => item.id !== draggedItem.id));

    // Add item to dropped items
    setDroppedItems(prev => [
      ...prev.filter(item => item.id !== draggedItem.id),
      { ...draggedItem, droppedIn: category }
    ]);

    setDraggedItem(null);
  };

  const handleItemClick = (item: CategoryItem, targetCategory?: string) => {
    // For mobile/touch support - cycle through categories
    if (targetCategory) {
      // Remove from available and add to category
      setAvailableItems(prev => prev.filter(i => i.id !== item.id));
      setDroppedItems(prev => [
        ...prev.filter(i => i.id !== item.id),
        { ...item, droppedIn: targetCategory }
      ]);
    } else {
      // Remove from category and add back to available
      setDroppedItems(prev => prev.filter(i => i.id !== item.id));
      setAvailableItems(prev => [...prev, item]);
    }
  };

  const checkAnswers = async () => {
    if (availableItems.length > 0 || isChecking) return;

    setIsChecking(true);
    const currentQuestion = questions[currentQuestionIndex];
    let correctCount = 0;
    const results: Record<string, { correct: boolean; correctCategory: string }> = {};

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        for (const item of droppedItems) {
          const response = await fetch(`${API_BASE_URL}/api/quiz-content/critical-thinking/category-validate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              questionId: currentQuestion.id,
              itemId: item.id,
              droppedCategory: item.droppedIn,
              grade: selectedGrade,
            }),
          });
          const result = await response.json();
          results[item.id] = {
            correct: result.correct ?? false,
            correctCategory: result.correctCategory ?? '',
          };
          if (result.correct) {
            correctCount++;
          }
        }
      }
    } catch {
      // Fallback: mark all as unknown
      droppedItems.forEach(item => {
        results[item.id] = { correct: false, correctCategory: '' };
      });
    }

    if (correctCount === droppedItems.length && droppedItems.length > 0) {
      setScore(prev => prev + 1);
    }

    setValidationResults(results);
    setShowResults(true);
    setIsChecking(false);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Quiz completed - save result
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      const totalQuestions = questions.reduce((sum, q) => sum + q.items.length, 0);
      const percentage = Math.round((score / totalQuestions) * 100);

      ProgressTracker.saveQuizResult({
        quizId: 'category-quiz',
        quizName: 'Category Quiz',
        subcategory: 'critical-thinking',
        score,
        totalQuestions,
        percentage,
        timeSpent,
        completedAt: new Date().toISOString(),
        gradeLevel: selectedGrade || 'unknown'
      });

      setIsComplete(true);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const allItemsPlaced = availableItems.length === 0;

  // Grade Selection Screen
  if (!selectedGrade) {
    return (
      <div className="min-h-screen bg-emerald-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-8 shadow-card"
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🧺</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Category Quiz</h1>
              <p className="text-gray-600">Choose your grade level to start sorting!</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {gradeOptions.map((option) => (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleGradeSelect(option.value as GradeLevel)}
                  className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100 hover:border-teal-300 transition-all duration-200 text-left"
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{option.label}</h3>
                  <p className="text-gray-600 text-sm">{option.description}</p>
                  <div className="mt-4 text-teal-600 font-semibold">Start Sorting →</div>
                </motion.button>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={() => navigate(-1)}
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
      if (percentage >= 90) return { level: 'Amazing Sorting!', color: 'text-green-600', emoji: '🌟' };
      if (percentage >= 70) return { level: 'Great Categories!', color: 'text-blue-600', emoji: '🎉' };
      if (percentage >= 50) return { level: 'Good Sorting!', color: 'text-yellow-600', emoji: '👍' };
      return { level: 'Keep Practicing!', color: 'text-purple-600', emoji: '💪' };
    };

    const performance = getPerformanceLevel();

    return (
      <div className="min-h-screen bg-emerald-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-8 shadow-card text-center"
          >
            <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy size={36} className="text-white" />
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-4">Sorting Complete!</h1>

            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
              <div className="text-6xl mb-4">{performance.emoji}</div>
              <h2 className={`text-2xl font-bold mb-2 ${performance.color}`}>
                {performance.level}
              </h2>
              <p className="text-gray-600 mb-4">
                You sorted {score} out of {questions.length} categories correctly
              </p>
              <div className="text-4xl font-bold text-gray-800">
                {percentage}%
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={resetQuiz}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
              >
                <RotateCcw size={20} />
                Try Again
              </button>
              <button
                onClick={() => setSelectedGrade(null)}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
              >
                Change Grade
              </button>
              <button
                onClick={() => navigate(ROUTES.CRITICAL_THINKING_SELECTION, { replace: true })}
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
    <div className="min-h-screen bg-emerald-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:bg-white/20 transition-colors duration-200"
          >
            <ArrowLeft size={20} />
            Back
          </button>

          <div className="text-center text-white">
            <h1 className="text-xl font-bold">
              {gradeOptions.find(g => g.value === selectedGrade)?.label} Category Sort
            </h1>
            <div className="text-sm opacity-90">
              Question {currentQuestionIndex + 1} of {questions.length} • Score: {score}/{currentQuestionIndex + (showResults ? 1 : 0)}
            </div>
          </div>

          <div className="w-20"></div>
        </div>

        {/* Progress Bar for Mind Section */}
        <div className="mb-6">
          <AssessmentProgressBar
            onShowReport={() => setShowReport(true)}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-xl p-8 shadow-card"
          >
            {/* Instruction */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {currentQuestion?.instruction}
              </h2>
              <p className="text-gray-600">
                {availableItems.length > 0
                  ? "Drag items into the correct categories (or click item then click category)"
                  : "All items placed! Click 'Check Answers' to see how you did."
                }
              </p>
            </div>

            {/* Available Items */}
            {availableItems.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Items to Sort:</h3>
                <div className="flex flex-wrap gap-3 justify-center">
                  {availableItems.map((item) => (
                    <motion.div
                      key={item.id}
                      draggable
                      onDragStart={() => handleDragStart(item)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-blue-100 border-2 border-blue-200 rounded-xl p-3 cursor-move hover:bg-blue-200 transition-colors duration-200 select-none flex flex-col items-center space-y-2"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg shadow-sm"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://via.placeholder.com/64x64/f0f0f0/999999?text=" + encodeURIComponent(item.name);
                        }}
                      />
                      <span className="font-medium text-blue-800 text-sm text-center">{item.name}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            <div className="grid gap-6 mb-8" style={{
              gridTemplateColumns: `repeat(${currentQuestion?.categories.length || 2}, 1fr)`
            }}>
              {currentQuestion?.categories.map((category) => {
                const categoryItems = droppedItems.filter(item => item.droppedIn === category);

                return (
                  <div
                    key={category}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, category)}
                    onClick={() => {
                      // Mobile support - if an item is selected and user clicks category
                      if (draggedItem) {
                        handleDrop({} as any, category);
                      }
                    }}
                    className="bg-gray-50 border-3 border-dashed border-gray-300 rounded-2xl p-6 min-h-32 transition-all duration-200 hover:border-teal-400 hover:bg-teal-50"
                  >
                    <h3 className="text-lg font-bold text-gray-700 mb-4 text-center">
                      {category}
                    </h3>

                    <div className="space-y-2">
                      {categoryItems.map((item) => {
                        let itemClass = "w-full p-3 rounded-lg border-2 text-center font-medium transition-all duration-200 cursor-pointer ";

                        if (showResults) {
                          const vr = validationResults[item.id];
                          if (vr?.correct) {
                            itemClass += "bg-green-100 border-green-400 text-green-800";
                          } else {
                            itemClass += "bg-red-100 border-red-400 text-red-800";
                          }
                        } else {
                          itemClass += "bg-white border-gray-200 hover:border-teal-300 text-gray-700";
                        }

                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => !showResults && handleItemClick(item)}
                            className={itemClass}
                          >
                            <div className="flex items-center justify-center gap-3">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded-lg shadow-sm"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://via.placeholder.com/64x64/f0f0f0/999999?text=" + encodeURIComponent(item.name);
                                }}
                              />
                              <span>{item.name}</span>
                              {showResults && (
                                <>
                                  {validationResults[item.id]?.correct ? (
                                    <CheckCircle size={16} className="text-green-600" />
                                  ) : (
                                    <XCircle size={16} className="text-red-600" />
                                  )}
                                </>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}

                      {categoryItems.length === 0 && (
                        <div className="text-center text-gray-400 py-8">
                          Drop items here
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="text-center">
              {!showResults ? (
                <button
                  onClick={checkAnswers}
                  disabled={!allItemsPlaced || isChecking}
                  className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${allItemsPlaced && !isChecking
                    ? 'bg-teal-500 text-white hover:shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  {isChecking ? 'Checking…' : 'Check Answers'}
                </button>
              ) : (
                <div className="space-y-4">
                  {/* Results Summary */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {Object.values(validationResults).length > 0 && Object.values(validationResults).every(v => v.correct) ? (
                        <>
                          <CheckCircle size={24} className="text-green-600" />
                          <span className="text-green-800 font-semibold">Perfect Sorting!</span>
                        </>
                      ) : (
                        <>
                          <Eye size={24} className="text-blue-600" />
                          <span className="text-blue-800 font-semibold">Check the colors above</span>
                        </>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">
                      Green items are in the correct category, red items need to be moved.
                    </p>
                  </div>

                  <button
                    onClick={handleNext}
                    className="px-8 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                  >
                    {currentQuestionIndex < questions.length - 1 ? 'Next Challenge' : 'See Final Results'}
                  </button>
                </div>
              )}
            </div>
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

export default CategoryQuiz;
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, RotateCcw, CheckCircle, XCircle, GripVertical, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressTracker } from '../utils/progressTracker';
import FloatingBackground from '../components/FloatingBackground';
import { logger } from '../utils/logger';
import { supabase } from '../supabase-client';

// API types for logical sequencing (no answers exposed)
interface SequencingQuestion {
  id: number;
  title: string;
  sentences: string[];
  grade: number;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  hint?: string;
}

interface DragItem {
  id: string;
  content: string;
  originalIndex: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const LogicalSequencingQuiz: React.FC = () => {
  const navigate = useNavigate();
  const { grade: gradeParam } = useParams<{ grade: string }>();
  const grade = parseInt(gradeParam || '1');

  // Quiz state
  const [questions, setQuestions] = useState<SequencingQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userOrder, setUserOrder] = useState<DragItem[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctOrder, setCorrectOrder] = useState<number[] | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timePerQuestion, setTimePerQuestion] = useState<number[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState<Date>(new Date());
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const totalQuestions = 5;
  const currentQuestion = questions[currentQuestionIndex];

  // Fetch questions from API
  useEffect(() => {
    if (!grade) return;

    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/quiz-content/logical-sequencing/grade/${grade}`);
        if (!response.ok) {
          throw new Error('Failed to fetch questions');
        }

        const data = await response.json();
        if (data.success && data.questions) {
          // Shuffle and limit to totalQuestions
          const shuffled = [...data.questions].sort(() => Math.random() - 0.5);
          const selected = shuffled.slice(0, Math.min(totalQuestions, shuffled.length));
          logger.log('Loaded questions for grade:', grade, selected);
          setQuestions(selected);
          setCurrentQuestionIndex(0);
          setScore(0);
          setShowResult(false);
          setTimePerQuestion([]);
          setQuestionStartTime(new Date());
        } else {
          throw new Error(data.error || 'Invalid response');
        }
      } catch (err) {
        logger.error('Error loading sequencing questions:', err);
        setError(err instanceof Error ? err.message : 'Failed to load questions');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [grade]);

  // Initialize drag items when question changes
  useEffect(() => {
    if (currentQuestion) {
      const shuffled = currentQuestion.sentences
        .map((sentence, index) => ({
          id: `sentence-${index}`,
          content: sentence,
          originalIndex: index
        }))
        .sort(() => Math.random() - 0.5);

      setUserOrder(shuffled);
      setIsSubmitted(false);
      setIsCorrect(null);
      setShowHint(false);
    }
  }, [currentQuestion]);

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', itemId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();

    if (draggedItem && draggedItem !== targetId) {
      const newOrder = [...userOrder];
      const draggedIndex = newOrder.findIndex(item => item.id === draggedItem);
      const targetIndex = newOrder.findIndex(item => item.id === targetId);

      // Swap items
      [newOrder[draggedIndex], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[draggedIndex]];

      setUserOrder(newOrder);
    }

    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  // Move item up/down (for accessibility)
  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...userOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < newOrder.length) {
      [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
      setUserOrder(newOrder);
    }
  };

  const checkAnswer = async () => {
    if (!currentQuestion || isSubmitted) return;

    // Record time for this question
    const questionTime = (new Date().getTime() - questionStartTime.getTime()) / 1000;
    setTimePerQuestion([...timePerQuestion, questionTime]);

    // Get user order indices
    const userOrderIndices = userOrder.map(item => item.originalIndex);

    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        logger.error('No session found for API call');
        setIsSubmitted(true);
        return;
      }

      // Validate via API
      const response = await fetch(`${API_BASE_URL}/api/quiz-content/logical-sequencing/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          submittedOrder: userOrderIndices,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsCorrect(data.isCorrect);
        setIsSubmitted(true);

        if (data.isCorrect) {
          setScore(score + 1);
        } else {
          // Store correct order for display
          setCorrectOrder(data.correctOrder);
        }
      }
    } catch (err) {
      logger.error('Error checking answer:', err);
      // Fallback to just marking as submitted without server validation
      setIsSubmitted(true);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setQuestionStartTime(new Date());
      setCorrectOrder(null);
    } else {
      finishQuiz();
    }
  };

  const retryQuestion = () => {
    // Re-shuffle the sentences
    const shuffled = currentQuestion.sentences
      .map((sentence, index) => ({
        id: `sentence-${index}`,
        content: sentence,
        originalIndex: index
      }))
      .sort(() => Math.random() - 0.5);

    setUserOrder(shuffled);
    setIsSubmitted(false);
    setIsCorrect(null);
    setCorrectOrder(null);
    setShowHint(false);
    setQuestionStartTime(new Date());
  };

  const finishQuiz = () => {
    // Calculate results
    const totalTime = timePerQuestion.reduce((sum, time) => sum + time, 0);
    const percentage = Math.round((score / questions.length) * 100);

    // Save progress
    ProgressTracker.saveQuizResult({
      quizId: 'logical-sequencing-quiz',
      quizName: 'Logical Sequencing',
      subcategory: 'logical-reasoning',
      score: score,
      totalQuestions: questions.length,
      percentage: percentage,
      timeSpent: totalTime,
      completedAt: new Date().toISOString(),
      gradeLevel: `Grade ${grade}`
    });

    setShowResult(true);
  };

  const getCorrectOrderDisplay = () => {
    if (!currentQuestion || !isSubmitted || isCorrect || !correctOrder) return null;

    return correctOrder.map(index => currentQuestion.sentences[index]);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-8 shadow-xl max-w-md">
          <XCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Failed to Load</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/logical-sequencing-quiz')}
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-6 rounded-xl"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 relative overflow-hidden">
        <FloatingBackground />

        <div className="flex items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center relative z-10"
          >
            <div className="mb-6">
              {percentage >= 70 ? (
                <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
              ) : (
                <XCircle size={64} className="text-red-500 mx-auto mb-4" />
              )}

              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {percentage >= 70 ? 'Great Job!' : 'Keep Practicing!'}
              </h2>

              <div className="text-6xl font-bold text-purple-600 mb-2">
                {percentage}%
              </div>

              <p className="text-gray-600 mb-4">
                {score} out of {questions.length} correct
              </p>

              <div className="bg-gray-100 rounded-xl p-4 text-sm text-gray-600">
                <p>Average time per question: {(timePerQuestion.reduce((a, b) => a + b, 0) / timePerQuestion.length).toFixed(1)}s</p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/logical-sequencing-quiz')}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200"
              >
                Try Different Grade
              </button>

              <button
                onClick={() => navigate('/perception-quiz-selection/mind')}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200"
              >
                Back to Perception
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 relative overflow-hidden">
      <FloatingBackground />

      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
        <button
          onClick={() => navigate('/logical-sequencing-quiz')}
          className="flex items-center space-x-2 px-4 py-2 text-white bg-black/20 backdrop-blur-sm rounded-lg hover:bg-black/30 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">back</span>
        </button>

        <div className="text-white text-center bg-black/20 backdrop-blur-sm rounded-lg px-4 py-2">
          <div className="text-sm opacity-90">Grade {grade} • Logical Sequencing</div>
          <div className="font-bold">Question {currentQuestionIndex + 1} of {questions.length}</div>
        </div>

        <div className="text-white text-right bg-black/20 backdrop-blur-sm rounded-lg px-4 py-2">
          <div className="text-sm opacity-90">Score</div>
          <div className="font-bold">{score}/{questions.length}</div>
        </div>
      </div>

      <div className="flex items-center justify-center min-h-screen p-4 pt-24">
        <div className="max-w-4xl w-full">
          {/* Question */}
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl p-8 mb-8"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                {currentQuestion.title}
              </h2>
              <p className="text-gray-600 text-lg">
                Drag the sentences to arrange them in the correct order
              </p>

              {currentQuestion.hint && (
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="mt-4 flex items-center space-x-2 mx-auto px-4 py-2 text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  <Lightbulb size={16} />
                  <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
                </button>
              )}

              <AnimatePresence>
                {showHint && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                  >
                    <p className="text-yellow-800 font-medium">💡 Hint: {currentQuestion.hint}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Draggable Sentences */}
            <div className="space-y-3 mb-6">
              {userOrder.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  draggable={!isSubmitted}
                  onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, item.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, item.id)}
                  onDragEnd={handleDragEnd}
                  className={`
                    group relative flex items-center space-x-4 p-4 rounded-xl border-2 transition-all duration-200 cursor-move
                    ${draggedItem === item.id ? 'opacity-50' : ''}
                    ${isSubmitted
                      ? (isCorrect
                        ? 'border-green-300 bg-green-50'
                        : 'border-red-300 bg-red-50'
                      )
                      : 'border-purple-200 bg-purple-50 hover:border-purple-300 hover:shadow-md'
                    }
                    ${!isSubmitted ? 'hover:scale-[1.02]' : ''}
                  `}
                >
                  {/* Drag Handle */}
                  {!isSubmitted && (
                    <GripVertical size={20} className="text-gray-400 group-hover:text-purple-500" />
                  )}

                  {/* Order Number */}
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                    ${isSubmitted
                      ? (isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white')
                      : 'bg-purple-500 text-white'
                    }
                  `}>
                    {index + 1}
                  </div>

                  {/* Sentence Text */}
                  <div className="flex-1 text-left text-gray-800 font-medium">
                    {item.content}
                  </div>

                  {/* Move Buttons (for accessibility) */}
                  {!isSubmitted && (
                    <div className="flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => moveItem(index, 'up')}
                        disabled={index === 0}
                        className="w-6 h-6 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-30 text-xs"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveItem(index, 'down')}
                        disabled={index === userOrder.length - 1}
                        className="w-6 h-6 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-30 text-xs"
                      >
                        ↓
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {isSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                >
                  {isCorrect ? (
                    <div className="p-4 bg-green-100 border border-green-300 rounded-xl text-center">
                      <CheckCircle size={24} className="text-green-600 mx-auto mb-2" />
                      <p className="text-green-800 font-semibold">Excellent! You got the correct order!</p>
                    </div>
                  ) : (
                    <div className="p-4 bg-red-100 border border-red-300 rounded-xl">
                      <div className="text-center mb-4">
                        <XCircle size={24} className="text-red-600 mx-auto mb-2" />
                        <p className="text-red-800 font-semibold">Not quite right. Here's the correct order:</p>
                      </div>

                      <div className="space-y-2">
                        {getCorrectOrderDisplay()?.map((sentence, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="w-6 h-6 rounded-full bg-green-500 text-white text-sm font-bold flex items-center justify-center">
                              {index + 1}
                            </div>
                            <div className="text-gray-800">{sentence}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              {!isSubmitted ? (
                <button
                  onClick={checkAnswer}
                  className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-8 rounded-xl transition-colors duration-200 flex items-center space-x-2"
                >
                  <CheckCircle size={20} />
                  <span>Submit Order</span>
                </button>
              ) : (
                <div className="flex space-x-3">
                  {!isCorrect && (
                    <button
                      onClick={retryQuestion}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center space-x-2"
                    >
                      <RotateCcw size={20} />
                      <span>Try Again</span>
                    </button>
                  )}

                  <button
                    onClick={nextQuestion}
                    className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200"
                  >
                    {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LogicalSequencingQuiz;
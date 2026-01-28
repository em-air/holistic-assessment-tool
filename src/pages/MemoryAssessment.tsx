import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, CheckCircle, XCircle, Clock, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProgressTracker } from '../utils/progressTracker';
import MindProgressBar from '../components/MindProgressBar';
import MindSectionReport from '../components/MindSectionReport';
import { supabase } from '../supabase-client';
import { logger } from '../utils/logger';

// API types for memory assessment (no answers exposed)
interface MemoryItem {
  id: string;
  name: string;
  image: string;
  category: 'object';
}

interface SequenceQuestion {
  id: string;
  type: 'sequence_recall' | 'missing_object';
  title: string;
  instruction: string;
  items: MemoryItem[];
  allChoices?: MemoryItem[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  // Answers stored server-side only
  correctSequence?: string[];
  missingItemId?: string;
}

interface PerformanceResult {
  percentage: number;
  finalScore: number;
  level: string;
  recommendations: string[];
}

type GamePhase = 'showing' | 'hidden' | 'testing' | 'feedback' | 'results';
type AssessmentType = 'sequence_recall' | 'missing_object';

interface AssessmentResults {
  questionsAnswered: number;
  correctAnswers: number;
  difficulty: number;
  performance: PerformanceResult;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const MemoryAssessment: React.FC = () => {
  const navigate = useNavigate();

  // Game state
  const [gamePhase, setGamePhase] = useState<GamePhase>('showing');
  const [currentQuestion, setCurrentQuestion] = useState<SequenceQuestion | null>(null);
  const [selectedType, setSelectedType] = useState<AssessmentType | null>('sequence_recall');
  const [difficulty, setDifficulty] = useState(1);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [currentCorrectAnswer, setCurrentCorrectAnswer] = useState<string[] | string | null>(null);

  // User interaction state
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showTimer, setShowTimer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [shuffledItems, setShuffledItems] = useState<MemoryItem[]>([]);

  // Results
  const [finalResults, setFinalResults] = useState<AssessmentResults | null>(null);
  const [startTime] = useState<Date>(new Date());
  const [showReport, setShowReport] = useState(false);

  // Fetch question from API
  const fetchQuestion = useCallback(async (type: AssessmentType, diff: number) => {
    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        logger.error('No session found for API call');
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/api/quiz-content/memory-assessment/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ type, difficulty: diff }),
      });

      const data = await response.json();
      if (data.success && data.question) {
        setCurrentQuestion(data.question);
        // Store the correct answer from _internal (only available on this session)
        if (data._internal) {
          setCurrentCorrectAnswer(data._internal.correctSequence || data._internal.missingItemId);
        }
        return data.question;
      }
    } catch (err) {
      console.error('Error fetching question:', err);
    }
    return null;
  }, []);

  // Initialize first question on mount
  useEffect(() => {
    if (!currentQuestion && selectedType === 'sequence_recall') {
      fetchQuestion('sequence_recall', difficulty).then(q => {
        if (q) {
          setGamePhase('showing');
          setTimeLeft(6);
          setShowTimer(true);
        }
      });
    }
  }, [currentQuestion, selectedType, difficulty, fetchQuestion]);

  // Timer effect for showing phase
  useEffect(() => {
    if (gamePhase === 'showing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gamePhase === 'showing' && timeLeft === 0 && showTimer) {
      handleShowingComplete();
    }
  }, [gamePhase, timeLeft, showTimer]);

  // Generate new question wrapper
  const generateNewQuestion = useCallback(async (type: AssessmentType, currentDifficulty: number) => {
    const question = await fetchQuestion(type, currentDifficulty);
    if (question) {
      setUserSequence([]);
      setSelectedItems([]);
      setIsCorrect(false);
      setShuffledItems([]);
      setGamePhase('showing');
      setTimeLeft(6);
      setShowTimer(true);
    }
  }, [fetchQuestion]);

  // Handle end of showing phase
  const handleShowingComplete = () => {
    setShowTimer(false);

    // Prepare items for testing phase
    if (currentQuestion?.items) {
      if (currentQuestion.type === 'missing_object' && currentQuestion.allChoices) {
        // For missing object, use the pre-defined choices (correct + decoys)
        const shuffled = [...currentQuestion.allChoices].sort(() => Math.random() - 0.5);
        setShuffledItems(shuffled);
      } else {
        // For sequences, shuffle the original items
        const shuffled = [...currentQuestion.items].sort(() => Math.random() - 0.5);
        setShuffledItems(shuffled);
      }
    }

    if (currentQuestion?.type === 'missing_object') {
      // For missing object, go to hidden phase then testing
      setGamePhase('hidden');
      setTimeout(() => setGamePhase('testing'), 1000);
    } else {
      // For sequences, go directly to testing
      setGamePhase('testing');
    }
  };

  // Handle user selections
  const handleItemSelect = (itemId: string) => {
    if (gamePhase !== 'testing') return;

    if (currentQuestion?.type === 'missing_object') {
      // For missing object, only allow one selection
      setSelectedItems([itemId]);
      checkAnswer([itemId]);
    } else {
      // For sequences, build up the sequence
      const newSequence = [...userSequence, itemId];
      setUserSequence(newSequence);

      // Check if sequence is complete
      // Check if sequence is complete
      if (newSequence.length === currentQuestion?.items?.length) {
        checkAnswer(newSequence);
      }
    }
  };

  // Check if answer is correct
  const checkAnswer = (answer: string[]) => {
    if (!currentQuestion) return;

    let correct = false;

    if (currentQuestion.type === 'missing_object') {
      correct = answer[0] === currentCorrectAnswer;
    } else {
      correct = JSON.stringify(answer) === JSON.stringify(currentCorrectAnswer);
    }

    setIsCorrect(correct);
    if (correct) setCorrectAnswers(prev => prev + 1);
    setQuestionsAnswered(prev => prev + 1);
    setGamePhase('feedback');

    // Auto-advance after feedback
    setTimeout(() => {
      if (questionsAnswered + 1 >= 5) {
        // Complete assessment after 5 questions
        completeAssessment();
      } else {
        // Continue with next question, increase difficulty every 2 questions
        const newDifficulty = Math.min(Math.floor((questionsAnswered + 1) / 2) + 1, 5);
        setDifficulty(newDifficulty);
        generateNewQuestion(selectedType!, newDifficulty);
      }
    }, 2000);
  };

  // Complete assessment
  const completeAssessment = async () => {
    const finalCorrect = correctAnswers + (isCorrect ? 1 : 0);
    const finalTotal = questionsAnswered + 1;

    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        logger.error('No session found for evaluation API call');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/quiz-content/memory-assessment/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          correctAnswers: finalCorrect,
          totalQuestions: finalTotal,
          difficulty,
        }),
      });

      const data = await response.json();
      if (data.success && data.evaluation) {
        setFinalResults({
          questionsAnswered: finalTotal,
          correctAnswers: finalCorrect,
          difficulty,
          performance: data.evaluation
        });
        setGamePhase('results');

        const quizId = selectedType === 'sequence_recall' ? 'picture-sequence' : 'missing-object';
        const quizName = selectedType === 'sequence_recall' ? 'Picture Sequence' : 'Missing Object';

        ProgressTracker.saveQuizResult({
          quizId: quizId,
          quizName: quizName,
          subcategory: 'memory',
          score: finalCorrect,
          totalQuestions: finalTotal,
          percentage: Math.round((finalCorrect / finalTotal) * 100),
          timeSpent: Math.round((new Date().getTime() - startTime.getTime()) / 1000),
          completedAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Error evaluating performance:', err);
    }
  };

  // Results screen
  if (gamePhase === 'results' && finalResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-300 via-purple-400 to-pink-500 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Mind Section Progress Bar */}
          <div className="mb-6">
            <MindProgressBar
              onShowReport={() => setShowReport(true)}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl"
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star size={36} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Assessment Complete!
              </h1>
              <p className="text-gray-600">
                Here are your memory assessment results
              </p>
            </div>

            {/* Score Overview */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg text-center">
                <h3 className="font-semibold text-gray-700 mb-2">Questions Answered</h3>
                <div className="text-3xl font-bold text-gray-800">
                  {finalResults.questionsAnswered}
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg text-center">
                <h3 className="font-semibold text-gray-700 mb-2">Correct Answers</h3>
                <div className="text-3xl font-bold text-green-600">
                  {finalResults.correctAnswers}
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg text-center">
                <h3 className="font-semibold text-gray-700 mb-2">Final Score</h3>
                <div className="text-3xl font-bold text-blue-600">
                  {finalResults.performance.finalScore}%
                </div>
              </div>
            </div>

            {/* Performance Level */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-8 text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Performance Level: {finalResults.performance.level}
              </h3>
              <p className="text-gray-600">
                Accuracy: {finalResults.performance.percentage}% | Difficulty Level: {finalResults.difficulty}
              </p>
            </div>

            {/* Recommendations */}
            <div className="bg-green-50 rounded-2xl p-6 mb-8">
              <h3 className="font-semibold text-green-800 mb-4 flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                Recommendations for Improvement:
              </h3>
              <ul className="space-y-2">
                {finalResults.performance.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start text-green-700">
                    <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  // Reset and restart the quiz
                  setQuestionsAnswered(0);
                  setCorrectAnswers(0);
                  setDifficulty(1);
                  setFinalResults(null);
                  generateNewQuestion('sequence_recall', 1);
                }}
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/category/mind/attention-memory')}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                Back to Selection
              </button>
            </div>
          </motion.div>

          {/* Report Modal */}
          {showReport && (
            <MindSectionReport onClose={() => setShowReport(false)} />
          )}
        </div>
      </div>
    );
  }

  // Main game screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-300 via-emerald-400 to-green-500 py-8">
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/category/mind/attention-memory')}
            className="group flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-all duration-300 ease-out hover:text-emerald-100 hover:bg-white/20 hover:shadow-md transform hover:scale-105 hover:-translate-y-0.5"
          >
            <ArrowLeft size={20} className="transform group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-medium">Back to Selection</span>
          </button>

          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-1">{currentQuestion?.title}</h1>
            <div className="flex items-center justify-center gap-4 text-sm">
              <span>Question {questionsAnswered + 1}/5</span>
              <span>•</span>
              <span>Level {difficulty}</span>
              <span>•</span>
              <span>Score: {correctAnswers}/{questionsAnswered}</span>
            </div>
          </div>

          <div className="w-20"></div> {/* Spacer for centering */}
        </div>

        {/* Mind Section Progress Bar */}
        <div className="mb-6">
          <MindProgressBar
            onShowReport={() => setShowReport(true)}
          />
        </div>

        {/* Game Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={gamePhase}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl max-w-4xl mx-auto"
          >
            {/* Instructions */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {currentQuestion?.instruction}
              </h2>

              {/* Timer */}
              {showTimer && (
                <div className="flex items-center justify-center gap-2 text-blue-600 text-lg font-bold">
                  <Clock size={20} />
                  <span>{timeLeft} seconds</span>
                </div>
              )}

              {/* Phase indicators */}
              {gamePhase === 'showing' && (
                <p className="text-gray-600">🔍 Look carefully and remember!</p>
              )}
              {gamePhase === 'hidden' && (
                <p className="text-gray-600">⏳ Get ready...</p>
              )}
              {gamePhase === 'testing' && (
                <p className="text-gray-600">
                  {currentQuestion?.type === 'missing_object'
                    ? '❓ Which object is missing?'
                    : '🎯 Select items in the correct order'}
                </p>
              )}
            </div>

            {/* Content based on phase and type */}
            {gamePhase === 'showing' && currentQuestion && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
                {currentQuestion.items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.2 }}
                    className="bg-white rounded-2xl p-4 shadow-lg border-2 border-blue-200"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-xl mb-2"
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://via.placeholder.com/150/4F46E5/FFFFFF?text=${encodeURIComponent(item.name)}`;
                      }}
                    />
                    <p className="text-center text-sm font-medium text-gray-700">
                      {item.name}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}

            {gamePhase === 'hidden' && (
              <div className="text-center py-20">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
                />
                <p className="text-gray-600 text-lg">Preparing your challenge...</p>
              </div>
            )}

            {gamePhase === 'testing' && currentQuestion && shuffledItems.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
                {shuffledItems.map((item, index) => {
                  const isSelected = userSequence.includes(item.id) || selectedItems.includes(item.id);
                  const selectionOrder = userSequence.indexOf(item.id) + 1;

                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleItemSelect(item.id)}
                      disabled={isSelected && currentQuestion.type !== 'missing_object'}
                      className={`bg-white rounded-2xl p-4 shadow-lg border-2 transition-all duration-200 ${isSelected
                        ? 'border-blue-500 bg-blue-50 scale-105'
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-xl'
                        }`}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-xl mb-2"
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://via.placeholder.com/150/4F46E5/FFFFFF?text=${encodeURIComponent(item.name)}`;
                        }}
                      />
                      <p className="text-center text-sm font-medium text-gray-700 mb-1">
                        {item.name}
                      </p>
                      {selectionOrder > 0 && currentQuestion.type !== 'missing_object' && (
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mx-auto">
                          {selectionOrder}
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}

            {gamePhase === 'feedback' && (
              <div className="text-center py-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}
                >
                  {isCorrect ? <CheckCircle size={40} /> : <XCircle size={40} />}
                </motion.div>
                <h3 className={`text-2xl font-bold mb-4 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  {isCorrect ? '🎉 Correct!' : '❌ Not quite right'}
                </h3>
                <p className="text-gray-600">
                  {isCorrect
                    ? 'Great job! Moving to the next challenge...'
                    : 'Don\'t worry, let\'s try another one...'
                  }
                </p>
              </div>
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

export default MemoryAssessment;
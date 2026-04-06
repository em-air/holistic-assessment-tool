import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase-client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
import { ProgressTracker } from '../utils/progressTracker';
import { logger } from '../utils/logger';
import { QuizProgressBar, QuizNavigation, QuizResultsScreen } from '../components/quiz';
import { useSpeech } from '../hooks';
import { ROUTES } from '../routes';

/**
 * SpellingTest - Refactored
 * 
 * Now uses reusable components:
 * - QuizProgressBar: Progress display
 * - QuizNavigation: Prev/Next buttons with dots
 * - QuizResultsScreen: Results display
 * - useSpeech hook: Text-to-speech
 * 
 * Reduced from 445 lines to ~200 lines
 */
interface WordMeta {
  index: number;
  wordId: string;
  difficulty: string;
  hint?: string;
}

interface ServerResult {
  wordId: string;
  userAnswer: string | undefined;
  correctWord: string;
  isCorrect: boolean;
}

const SpellingTest = () => {
  const { grade } = useParams<{ grade: string }>();
  const navigate = useNavigate();
  const [wordMeta, setWordMeta] = useState<WordMeta[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [gradeDescription, setGradeDescription] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [serverResults, setServerResults] = useState<ServerResult[]>([]);
  const [serverScore, setServerScore] = useState(0);
  const startTimeRef = useRef<number>(Date.now());

  const { speak, isSpeaking } = useSpeech({
    rate: 0.7,
    pitch: 1.2,
    preferFemaleVoice: true,
  });

  // Start a spelling session on the backend
  useEffect(() => {
    if (!grade) return;
    const startSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;
        const response = await fetch(`${API_BASE_URL}/api/quiz-content/spelling/start`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ grade: parseInt(grade), quizType: 'spelling', wordCount: 10 }),
        });
        const data = await response.json();
        if (data.success) {
          setSessionId(data.sessionId);
          setWordMeta(data.words);
          setGradeDescription(data.gradeDescription || '');
          startTimeRef.current = Date.now();
        }
      } catch (error) {
        logger.error('Error starting spelling session:', error);
      }
    };
    startSession();
  }, [grade]);

  // Save quiz results when completed
  useEffect(() => {
    if (showResults && serverResults.length > 0 && grade) {
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      ProgressTracker.saveQuizResult({
        quizId: 'spelling-test',
        quizName: `Spelling Test - Grade ${grade}`,
        category: 'academic',
        subcategory: 'spelling',
        score: serverScore,
        totalQuestions: serverResults.length,
        percentage: serverResults.length > 0 ? Math.round((serverScore / serverResults.length) * 100) : 0,
        timeSpent,
        completedAt: new Date().toISOString(),
        gradeLevel: `Grade ${grade}`,
      });
      logger.log('Spelling Test result saved via ProgressTracker');
    }
  }, [showResults, serverResults, serverScore, grade]);

  const handleAnswerChange = (wordId: string, answer: string) => {
    if (wordId === wordMeta[currentIndex]?.wordId) {
      setCurrentAnswer(answer);
    }
    setAnswers(prev => ({ ...prev, [wordId]: answer }));
  };

  const goToNext = () => {
    if (currentIndex < wordMeta.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setCurrentAnswer(answers[wordMeta[currentIndex + 1]?.wordId] || '');
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setCurrentAnswer(answers[wordMeta[currentIndex - 1]?.wordId] || '');
    }
  };

  const submitTest = async () => {
    if (!sessionId) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      // Submit each answer to the backend
      for (const meta of wordMeta) {
        const userAnswer = answers[meta.wordId] || '';
        await fetch(`${API_BASE_URL}/api/quiz-content/spelling/submit-answer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ sessionId, wordId: meta.wordId, answer: userAnswer }),
        });
      }
      // Complete the session to get results
      const completeRes = await fetch(`${API_BASE_URL}/api/quiz-content/spelling/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ sessionId }),
      });
      const completeData = await completeRes.json();
      if (completeData.success) {
        setServerResults(completeData.results);
        setServerScore(completeData.score);
      }
    } catch (error) {
      logger.error('Error completing spelling test:', error);
    }
    setShowResults(true);
  };

  const restartTest = () => {
    setCurrentIndex(0);
    setAnswers({});
    setShowResults(false);
    setCurrentAnswer('');
    setServerResults([]);
    setServerScore(0);
    startTimeRef.current = Date.now();
    // Re-start a new session
    if (grade) {
      const startNewSession = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.access_token) return;
          const response = await fetch(`${API_BASE_URL}/api/quiz-content/spelling/start`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ grade: parseInt(grade), quizType: 'spelling', wordCount: 10 }),
          });
          const data = await response.json();
          if (data.success) {
            setSessionId(data.sessionId);
            setWordMeta(data.words);
          }
        } catch { /* ignore */ }
      };
      startNewSession();
    }
  };

  // Loading state
  if (!grade || wordMeta.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Loading Spelling Test...</h2>
          <button
            onClick={() => navigate(ROUTES.SPELLING_GRADES)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
          >
            Back to Grade Selection
          </button>
        </div>
      </div>
    );
  }

  const currentWord = wordMeta[currentIndex];

  // Results screen using reusable component
  if (showResults) {
    const resultDetails = serverResults.map(r => ({
      label: 'Correct spelling',
      userAnswer: r.userAnswer || '',
      correctAnswer: r.correctWord,
      isCorrect: r.isCorrect,
    }));

    return (
      <QuizResultsScreen
        score={serverScore}
        totalQuestions={wordMeta.length}
        quizName="Spelling Test"
        grade={parseInt(grade)}
        onRetry={restartTest}
        backPath="/spelling-grades"
        categoryPath="/category/academic"
        showDetails={true}
        resultDetails={resultDetails}
        backgroundGradient="from-blue-100 via-purple-50 to-pink-100"
      />
    );
  }

  const answeredIndices = wordMeta
    .map((meta, index) => (answers[meta.wordId] ? index : -1))
    .filter(i => i !== -1);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Grade {grade} Spelling Test</h1>
          <p className="text-gray-600 mb-4">{gradeDescription}</p>

          <QuizProgressBar
            currentQuestion={currentIndex}
            totalQuestions={wordMeta.length}
          />
        </motion.div>

        {/* Current Word Test */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className="bg-white rounded-2xl p-8 shadow-lg mb-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Listen to the word and spell it:
              </h2>

              {/* Speaker Button */}
              <motion.button
                onClick={async () => {
                  if (!sessionId) return;
                  try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session?.access_token) return;
                    const res = await fetch(`${API_BASE_URL}/api/quiz-content/spelling/speak`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${session.access_token}`,
                      },
                      body: JSON.stringify({ sessionId, wordId: currentWord.wordId }),
                    });
                    const data = await res.json();
                    if (data.success && data.word) {
                      speak(data.word);
                    }
                  } catch { /* ignore */ }
                }}
                disabled={isSpeaking}
                className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-4xl mb-6 transition-all duration-200 ${isSpeaking
                    ? 'bg-purple-200 text-purple-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 text-white hover:scale-105 shadow-lg'
                  }`}
                whileTap={{ scale: 0.95 }}
              >
                {isSpeaking ? '⏸️' : '🔊'}
              </motion.button>

              <div className="mb-4 text-sm text-gray-500">
                {isSpeaking ? 'Playing word...' : 'Click the speaker to hear the word'}
              </div>

              {/* Input Field */}
              <div className="mb-6">
                <input
                  type="text"
                  value={currentAnswer}
                  onChange={(e) => handleAnswerChange(currentWord.wordId, e.target.value)}
                  placeholder="Type your spelling here..."
                  className="w-full max-w-md px-4 py-3 text-xl text-center border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                  autoFocus
                />
              </div>

              <div className="mb-6">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    currentWord.difficulty === 'easy'
                      ? 'bg-green-100 text-green-700'
                      : currentWord.difficulty === 'medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                  }`}
                >
                  {currentWord.difficulty.charAt(0).toUpperCase() + currentWord.difficulty.slice(1)} Word
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mb-8">
          <QuizNavigation
            currentIndex={currentIndex}
            totalQuestions={wordMeta.length}
            onPrevious={goToPrevious}
            onNext={goToNext}
            onSubmit={submitTest}
            isLastQuestion={currentIndex === wordMeta.length - 1}
            answeredIndices={answeredIndices}
          />
        </div>

        {/* Back Button */}
        <div className="text-center">
          <button
            onClick={() => navigate(ROUTES.SPELLING_GRADES)}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-colors"
          >
            ← Back to Grade Selection
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpellingTest;
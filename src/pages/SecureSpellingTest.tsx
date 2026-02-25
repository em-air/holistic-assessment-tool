/**
 * Secure Spelling Test Page
 * 
 * This is the secure version that fetches quiz content from the backend.
 * No answers are stored in the frontend code - all validation happens server-side.
 * 
 * SECURITY FEATURES:
 * 1. Session-based quiz management
 * 2. Server-side answer validation
 * 3. Answers only revealed after submission
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Volume2, Check, X, RotateCcw, Loader2 } from 'lucide-react';
import {
    startSpellingSession,
    submitSpellingAnswer,
    completeSpellingSession,
    getSpellingWordAudio,
    SpellingSession,
    SpellingQuizResult,
} from '../services/secureQuizService';
import { saveQuizResult } from '../services/quizResultsService';
import { logger } from '../utils/logger';
import FloatingBackground from '../components/FloatingBackground';
import { ROUTES } from '../routes';

const SecureSpellingTest: React.FC = () => {
    const navigate = useNavigate();
    const { grade } = useParams<{ grade: string }>();
    const gradeNum = parseInt(grade || '1', 10);

    // Session state
    const [session, setSession] = useState<SpellingSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Quiz state
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [showResult, setShowResult] = useState(false);
    const [lastResult, setLastResult] = useState<{
        correct: boolean;
        correctWord: string;
    } | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [showQuizComplete, setShowQuizComplete] = useState(false);
    const [finalResults, setFinalResults] = useState<SpellingQuizResult | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);

    // Start session on mount
    useEffect(() => {
        const initSession = async () => {
            setLoading(true);
            setError(null);

            const newSession = await startSpellingSession(gradeNum, 10);
            if (newSession) {
                setSession(newSession);
            } else {
                setError('Failed to start quiz session. Please try again.');
            }

            setLoading(false);
        };

        initSession();
    }, [gradeNum]);

    // Focus input when ready
    useEffect(() => {
        if (!loading && !showResult && !showQuizComplete && inputRef.current) {
            inputRef.current.focus();
        }
    }, [loading, currentIndex, showResult, showQuizComplete]);

    // Speak word function
    const speakWord = useCallback(async () => {
        if (!session || !session.words[currentIndex]) return;

        setIsSpeaking(true);
        const word = await getSpellingWordAudio(
            session.sessionId,
            session.words[currentIndex].wordId
        );

        if (word && 'speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.rate = 0.8;
            utterance.pitch = 1;
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);
            speechSynthesis.cancel();
            speechSynthesis.speak(utterance);
        } else {
            setIsSpeaking(false);
        }
    }, [session, currentIndex]);

    // Handle answer submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session) return;

        const currentWord = session.words[currentIndex];
        const result = await submitSpellingAnswer(
            session.sessionId,
            currentWord.wordId,
            userInput.trim()
        );

        if (result) {
            setLastResult({
                correct: result.correct,
                correctWord: result.correctWord,
            });
            setShowResult(true);
        }
    };

    // Handle next word
    const handleNextWord = async () => {
        if (!session) return;

        if (currentIndex < session.words.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setUserInput('');
            setShowResult(false);
            setLastResult(null);
        } else {
            // Complete the session
            const results = await completeSpellingSession(session.sessionId);
            if (results) {
                setFinalResults(results);

                // Save to database
                saveQuizResult({
                    quiz_id: 'spelling-test-secure',
                    quiz_name: `Spelling Test - Grade ${gradeNum}`,
                    category: 'academic',
                    subcategory: 'spelling',
                    score: results.score,
                    total_questions: results.totalQuestions,
                    time_spent: results.timeSpent,
                    grade_level: `Grade ${gradeNum}`,
                }).catch(err => {
                    logger.error('Failed to save quiz result:', err);
                });
            }
            setShowQuizComplete(true);
        }
    };

    // Reset quiz
    const resetQuiz = async () => {
        setLoading(true);
        const newSession = await startSpellingSession(gradeNum, 10);
        if (newSession) {
            setSession(newSession);
            setCurrentIndex(0);
            setUserInput('');
            setShowResult(false);
            setLastResult(null);
            setShowQuizComplete(false);
            setFinalResults(null);
        }
        setLoading(false);
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
                    <p className="text-lg text-gray-600">Loading quiz...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !session) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full text-center">
                    <div className="text-5xl mb-4">❌</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Oops!</h2>
                    <p className="text-gray-600 mb-6">{error || 'Something went wrong'}</p>
                    <button
                        onClick={() => navigate(ROUTES.SPELLING_GRADES)}
                        className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-6 rounded-lg font-medium"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    // Quiz Complete Screen
    if (showQuizComplete && finalResults) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 relative overflow-hidden">
                <FloatingBackground />

                <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl max-w-md w-full text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', delay: 0.2 }}
                            className="text-6xl mb-6"
                        >
                            {finalResults.percentage >= 80 ? '🌟' : finalResults.percentage >= 60 ? '🎉' : '💪'}
                        </motion.div>

                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            {finalResults.percentage >= 80 ? 'Excellent!' : finalResults.percentage >= 60 ? 'Good Job!' : 'Keep Practicing!'}
                        </h1>

                        <p className="text-gray-600 mb-6">Grade {gradeNum} Spelling Test Complete</p>

                        <div className="text-5xl font-bold text-purple-600 mb-2">
                            {finalResults.score}/{finalResults.totalQuestions}
                        </div>

                        <p className="text-xl text-gray-700 mb-8">{finalResults.percentage}% Correct</p>

                        {/* Results breakdown */}
                        <div className="bg-gray-50 rounded-xl p-4 mb-6 max-h-48 overflow-y-auto">
                            {finalResults.results.map((result, i) => (
                                <div
                                    key={result.wordId}
                                    className={`flex items-center justify-between py-2 border-b last:border-b-0 ${result.isCorrect ? 'text-green-600' : 'text-red-600'
                                        }`}
                                >
                                    <span className="text-sm">
                                        {i + 1}. {result.correctWord}
                                    </span>
                                    <span className="text-xs">
                                        {result.isCorrect ? '✓ Correct' : `✗ "${result.userAnswer || '-'}"`}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={resetQuiz}
                                className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 px-6 rounded-lg font-bold transition-colors"
                            >
                                🔄 Try Again
                            </button>

                            <button
                                onClick={() => navigate(ROUTES.SPELLING_GRADES)}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-bold transition-colors"
                            >
                                📚 Try Another Grade
                            </button>

                            <button
                                onClick={() => navigate(ROUTES.CATEGORY_ACADEMIC_SKILLS)}
                                className="w-full bg-gray-400 hover:bg-gray-500 text-white py-3 px-6 rounded-lg font-bold transition-colors"
                            >
                                🏠 Back to Academic Tests
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    const currentWord = session.words[currentIndex];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 relative overflow-hidden">
            <FloatingBackground />

            {/* Header */}
            <div className="relative z-10 p-6">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate(ROUTES.SPELLING_GRADES)}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span>Back</span>
                    </button>

                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-800">Grade {gradeNum} Spelling</h1>
                        <p className="text-gray-600">
                            Question {currentIndex + 1} of {session.words.length}
                        </p>
                    </div>

                    <button
                        onClick={resetQuiz}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-lg transition-colors"
                    >
                        <RotateCcw size={20} />
                        <span>Reset</span>
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 max-w-2xl mx-auto">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <motion.div
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentIndex + 1) / session.words.length) * 100}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex items-center justify-center min-h-[60vh] px-6">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl max-w-lg w-full"
                >
                    {/* Difficulty badge */}
                    <div className="text-center mb-4">
                        <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${currentWord.difficulty === 'easy'
                                ? 'bg-green-100 text-green-700'
                                : currentWord.difficulty === 'medium'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                        >
                            {currentWord.difficulty}
                        </span>
                    </div>

                    {/* Speaker Button */}
                    <div className="text-center mb-8">
                        <motion.button
                            onClick={speakWord}
                            disabled={isSpeaking}
                            className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-lg transition-all ${isSpeaking
                                ? 'bg-purple-600 animate-pulse'
                                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                                }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Volume2 className="w-12 h-12 text-white" />
                        </motion.button>
                        <p className="mt-4 text-gray-600">
                            {isSpeaking ? 'Playing...' : 'Click to hear the word'}
                        </p>
                    </div>

                    {/* Answer Form */}
                    <AnimatePresence mode="wait">
                        {!showResult ? (
                            <motion.form
                                key="input"
                                onSubmit={handleSubmit}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-4"
                            >
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={userInput}
                                    onChange={e => setUserInput(e.target.value)}
                                    placeholder="Type the word you hear..."
                                    className="w-full px-4 py-4 text-xl text-center border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                                    autoComplete="off"
                                    autoCapitalize="off"
                                />

                                <button
                                    type="submit"
                                    disabled={!userInput.trim()}
                                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Check Answer
                                </button>
                            </motion.form>
                        ) : (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center"
                            >
                                {/* Result Icon */}
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring' }}
                                    className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${lastResult?.correct ? 'bg-green-500' : 'bg-red-500'
                                        }`}
                                >
                                    {lastResult?.correct ? (
                                        <Check className="w-10 h-10 text-white" />
                                    ) : (
                                        <X className="w-10 h-10 text-white" />
                                    )}
                                </motion.div>

                                {/* Result Message */}
                                <h2
                                    className={`text-2xl font-bold mb-2 ${lastResult?.correct ? 'text-green-600' : 'text-red-600'
                                        }`}
                                >
                                    {lastResult?.correct ? 'Correct!' : 'Not quite!'}
                                </h2>

                                {!lastResult?.correct && (
                                    <div className="mb-4">
                                        <p className="text-gray-600">The correct spelling is:</p>
                                        <p className="text-2xl font-bold text-purple-600">{lastResult?.correctWord}</p>
                                        <p className="text-gray-500 text-sm mt-2">You wrote: "{userInput}"</p>
                                    </div>
                                )}

                                {/* Next Button */}
                                <button
                                    onClick={handleNextWord}
                                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-purple-700 transition-all mt-4"
                                >
                                    {currentIndex < session.words.length - 1 ? 'Next Word →' : 'See Results'}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Hint */}
                    {currentWord.hint && !showResult && (
                        <p className="text-center text-gray-500 text-sm mt-4">Hint: {currentWord.hint}</p>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default SecureSpellingTest;

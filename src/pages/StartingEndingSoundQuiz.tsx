import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Volume2, RotateCcw } from 'lucide-react';
import { AudioPlayer, calculateQuizStats } from '../utils/soundQuizUtils';
import type { QuestionData, QuizResult, SoundQuestion } from '../types/quiz';
import { supabase } from '../supabase-client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
import { ProgressTracker } from '../utils/progressTracker';
import SoundQuestionDisplay from '../components/SoundQuestionDisplay';
import { ROUTES } from '../routes';
import SoundOptionButtons from '../components/SoundOptionButtons';
import FeedbackMessage from '../components/FeedbackMessage';
import { logger } from '../utils/logger';
import { ROUTES } from '../routes';
import FloatingBackground from '../components/FloatingBackground';

const StartingEndingSoundQuiz: React.FC = () => {
  const navigate = useNavigate();
  const { grade: gradeParam } = useParams<{ grade: string }>();
  const grade = parseInt(gradeParam || '1');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect' | null; message: string }>({ type: null, message: '' });
  const [score, setScore] = useState(0);
  const [timePerQuestion, setTimePerQuestion] = useState<number[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState<Date>(new Date());
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [startTime] = useState<Date>(new Date());
  const [isAudioLoading, setIsAudioLoading] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = 10;

  // Initialize quiz questions from backend
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/quiz-content/starting-ending-sounds/grade/${grade}`);
        const data = await response.json();
        if (!data.success || !data.questions || data.questions.length === 0) {
          logger.error('No words found for grade:', grade);
          return;
        }
        const words: SoundQuestion[] = data.questions;
        // Shuffle and select words
        const shuffled = [...words].sort(() => Math.random() - 0.5);
        const beginningCount = Math.ceil(totalQuestions / 2);
        const endingCount = totalQuestions - beginningCount;
        const beginningWords = shuffled.slice(0, beginningCount);
        const endingWords = shuffled.slice(0, endingCount);

        // Build question stubs and fetch options from backend
        const questionStubs = [
          ...beginningWords.map(w => ({ question: w, questionType: 'beginning' as const })),
          ...endingWords.map(w => ({ question: w, questionType: 'ending' as const })),
        ];

        const questionsWithOptions: QuestionData[] = await Promise.all(
          questionStubs.map(async (stub) => {
            try {
              const optRes = await fetch(`${API_BASE_URL}/api/quiz-content/starting-ending-sounds/options`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questionId: stub.question.id, questionType: stub.questionType }),
              });
              const optData = await optRes.json();
              return {
                question: stub.question,
                questionType: stub.questionType,
                correctAnswer: '', // not needed — server validates
                options: optData.success ? optData.options : [],
              };
            } catch {
              return { question: stub.question, questionType: stub.questionType, correctAnswer: '', options: [] };
            }
          })
        );
        setQuestions(questionsWithOptions);
        setQuestionStartTime(new Date());
      } catch (error) {
        logger.error('Error initializing quiz:', error);
      }
    };
    fetchQuestions();
  }, [grade]);

  // Removed automatic audio playback - now only plays when listen button is clicked

  const playQuestionAudio = async () => {
    if (!currentQuestion) return;
    
    setIsAudioLoading(true);
    try {
      await AudioPlayer.playAudio(currentQuestion.question.audioUrl, currentQuestion.question.word);
    } catch (error) {
      logger.warn('Audio playback failed:', error);
    } finally {
      setIsAudioLoading(false);
    }
  };

  const handleAnswerSelect = async (answer: string) => {
    if (selectedAnswer || showNext) return;

    setSelectedAnswer(answer);
    const questionTime = (new Date().getTime() - questionStartTime.getTime()) / 1000;
    setTimePerQuestion([...timePerQuestion, questionTime]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      const response = await fetch(`${API_BASE_URL}/api/quiz-content/starting-ending-sounds/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          questionId: currentQuestion.question.id,
          questionType: currentQuestion.questionType,
          answer,
        }),
      });
      const result = await response.json();
      if (result.isCorrect) {
        setScore(score + 1);
        setFeedback({ type: 'correct', message: 'Correct!' });
      } else {
        setFeedback({
          type: 'incorrect',
          message: `Not quite! The ${currentQuestion.questionType} sound is "${result.correctAnswer || answer}"`,
        });
      }
    } catch {
      setFeedback({ type: 'incorrect', message: 'Error checking answer' });
    }

    setShowNext(true);
    setTimeout(() => { handleNext(); }, 2000);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setFeedback({ type: null, message: '' });
      setShowNext(false);
      setQuestionStartTime(new Date());
    } else {
      completeQuiz();
    }
  };

  const completeQuiz = () => {
    setIsQuizComplete(true);
    
    const stats = calculateQuizStats([...timePerQuestion]);
    const percentage = Math.round((score / questions.length) * 100);
    
    const result: QuizResult = {
      totalQuestions: questions.length,
      correctAnswers: score,
      incorrectAnswers: questions.length - score,
      timePerQuestion: [...timePerQuestion],
      totalTime: stats.totalTime,
      percentage,
      grade
    };

    // Save to progress tracker
    ProgressTracker.saveQuizResult({
      quizId: 'starting-ending-sound-quiz',
      quizName: 'Beginning & Ending Sounds',
      category: 'oral',
      subcategory: 'phonics',
      score: score,
      totalQuestions: questions.length,
      percentage: percentage,
      timeSpent: Math.round(stats.totalTime),
      completedAt: new Date().toISOString(),
      gradeLevel: `Grade ${grade}`,
      additionalData: { result }
    });
  };

  const handleRestart = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/quiz-content/starting-ending-sounds/grade/${grade}`);
      const data = await response.json();
      if (data.success && data.questions) {
        const words: SoundQuestion[] = data.questions;
        const shuffled = [...words].sort(() => Math.random() - 0.5);
        const beginningCount = Math.ceil(totalQuestions / 2);
        const endingCount = totalQuestions - beginningCount;
        const questionStubs = [
          ...shuffled.slice(0, beginningCount).map(w => ({ question: w, questionType: 'beginning' as const })),
          ...shuffled.slice(0, endingCount).map(w => ({ question: w, questionType: 'ending' as const })),
        ];
        const questionsWithOptions: QuestionData[] = await Promise.all(
          questionStubs.map(async (stub) => {
            try {
              const optRes = await fetch(`${API_BASE_URL}/api/quiz-content/starting-ending-sounds/options`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questionId: stub.question.id, questionType: stub.questionType }),
              });
              const optData = await optRes.json();
              return { question: stub.question, questionType: stub.questionType, correctAnswer: '', options: optData.success ? optData.options : [] };
            } catch {
              return { question: stub.question, questionType: stub.questionType, correctAnswer: '', options: [] };
            }
          })
        );
        setQuestions(questionsWithOptions);
      }
    } catch { /* ignore */ }
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setFeedback({ type: null, message: '' });
    setScore(0);
    setTimePerQuestion([]);
    setQuestionStartTime(new Date());
    setIsQuizComplete(false);
    setShowNext(false);
  };

  // Show loading screen while questions are being generated
  if (questions.length === 0 && !isQuizComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cyan-50 relative overflow-hidden">
        <FloatingBackground />
        <div className="bg-white rounded-3xl shadow-lg p-8 text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Loading Grade {grade} Questions...</div>
          <div className="text-sm text-gray-500 mt-2">Preparing your phonics quiz</div>
        </div>
      </div>
    );
  }
  
  // Show error if no current question but questions exist
  if (!currentQuestion && questions.length > 0 && !isQuizComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cyan-50 relative overflow-hidden">
        <FloatingBackground />
        <div className="bg-white rounded-3xl shadow-lg p-8 text-center relative z-10">
          <div className="text-xl text-red-600 mb-4">Error Loading Question</div>
          <button 
            onClick={() => navigate(-1)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (isQuizComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    const stats = calculateQuizStats(timePerQuestion);

    return (
      <div className="flex items-center justify-center min-h-screen bg-cyan-50 relative overflow-hidden p-4">
        <FloatingBackground />
        <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full text-center relative z-10">
          <h2 className="text-3xl font-bold text-purple-600 mb-4">Quiz Complete!</h2>
          <div className="text-6xl mb-4">🎯</div>
          
          <div className="space-y-3 mb-6">
            <p className="text-xl text-gray-700">
              Score: <span className="font-bold text-green-600">{score}</span> out of{" "}
              <span className="font-bold">{questions.length}</span>
            </p>
            <p className="text-lg text-gray-600">
              Accuracy: <span className="font-bold text-blue-600">{percentage}%</span>
            </p>
            <p className="text-sm text-gray-500">
              Total Time: {Math.floor(stats.totalTime / 60)}m {Math.floor(stats.totalTime % 60)}s
            </p>
            <p className="text-sm text-gray-500">
              Grade {grade} • Beginning & Ending Sounds
            </p>
          </div>

          <div className="flex flex-col space-y-3">
            <button
              onClick={handleRestart}
              className="flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full text-lg transition-colors shadow-lg"
            >
              <RotateCcw size={20} />
              <span>Try Again</span>
            </button>
            <button
              onClick={() => navigate(-1)}
              className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-full text-lg transition-colors shadow-lg"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyan-50 relative overflow-hidden p-4">
      <FloatingBackground />
      {/* Header with back button */}
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white/60 backdrop-blur-sm rounded-lg transition-all duration-300 ease-out hover:bg-white/80 hover:shadow-md transform hover:scale-105"
        >
          <ArrowLeft size={20} className="transform group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-medium">back</span>
        </button>
      </div>

      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white rounded-3xl shadow-lg p-6 max-w-4xl w-full">
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 font-medium">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className="text-sm text-gray-600 font-medium">
                Score: {score}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Question type instruction */}
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              {currentQuestion.questionType === 'beginning' 
                ? 'Select the beginning sound' 
                : 'Select the ending sound'
              }
            </h1>
            <p className="text-lg text-gray-600">
              Listen to the word and choose the {currentQuestion.questionType} sound
            </p>
          </div>

          {/* Question Display */}
          <SoundQuestionDisplay 
            question={currentQuestion}
            grade={grade}
            onPlayAudio={playQuestionAudio}
            isAudioLoading={isAudioLoading}
          />

          {/* Answer Options */}
          <SoundOptionButtons
            options={currentQuestion.options}
            selectedAnswer={selectedAnswer}
            correctAnswer={currentQuestion.correctAnswer}
            onAnswerSelect={handleAnswerSelect}
            showNext={showNext}
          />

          {/* Feedback */}
          <FeedbackMessage feedback={feedback} />

          {/* Next Button */}
          {showNext && (
            <div className="text-center mt-6">
              <button
                onClick={handleNext}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full text-lg transition-colors shadow-lg"
              >
                {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StartingEndingSoundQuiz;
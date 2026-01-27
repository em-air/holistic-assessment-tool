import { useState, useCallback, useRef } from 'react';

interface QuizQuestion {
  id: string | number;
  [key: string]: unknown;
}

interface UseQuizStateOptions<T extends QuizQuestion> {
  questions: T[];
  onComplete?: (score: number, totalQuestions: number, timeSpent: number) => void;
}

interface UseQuizStateReturn<T extends QuizQuestion> {
  // State
  currentQuestionIndex: number;
  currentQuestion: T | undefined;
  score: number;
  isComplete: boolean;
  hasAnswered: boolean;
  isCorrect: boolean | null;
  timeSpent: number;
  // Computed
  totalQuestions: number;
  percentage: number;
  progress: number;
  // Actions
  submitAnswer: (correct: boolean, points?: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  resetQuiz: () => void;
  setHasAnswered: (value: boolean) => void;
}

/**
 * Custom hook for managing quiz state
 * Handles question navigation, scoring, timing, and completion
 */
export function useQuizState<T extends QuizQuestion>({
  questions,
  onComplete,
}: UseQuizStateOptions<T>): UseQuizStateReturn<T> {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  const startTimeRef = useRef<number>(Date.now());

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex];
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;
  const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);

  const submitAnswer = useCallback((correct: boolean, points: number = 1) => {
    setIsCorrect(correct);
    setHasAnswered(true);
    
    if (correct) {
      setScore(prev => prev + points);
    }
  }, []);

  const nextQuestion = useCallback(() => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setHasAnswered(false);
      setIsCorrect(null);
    } else {
      setIsComplete(true);
      const finalTimeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      onComplete?.(score + (isCorrect ? 1 : 0), totalQuestions, finalTimeSpent);
    }
  }, [currentQuestionIndex, totalQuestions, score, isCorrect, onComplete]);

  const previousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setHasAnswered(false);
      setIsCorrect(null);
    }
  }, [currentQuestionIndex]);

  const resetQuiz = useCallback(() => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setIsComplete(false);
    setHasAnswered(false);
    setIsCorrect(null);
    startTimeRef.current = Date.now();
  }, []);

  return {
    // State
    currentQuestionIndex,
    currentQuestion,
    score,
    isComplete,
    hasAnswered,
    isCorrect,
    timeSpent,
    // Computed
    totalQuestions,
    percentage,
    progress,
    // Actions
    submitAnswer,
    nextQuestion,
    previousQuestion,
    resetQuiz,
    setHasAnswered,
  };
}

export default useQuizState;

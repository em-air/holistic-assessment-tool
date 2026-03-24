import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useQuizState } from './useQuizState';

const mockQuestions = [
  { id: 'q1', text: 'Question 1', correctAnswer: 'A' },
  { id: 'q2', text: 'Question 2', correctAnswer: 'B' },
  { id: 'q3', text: 'Question 3', correctAnswer: 'C' },
  { id: 'q4', text: 'Question 4', correctAnswer: 'A' },
  { id: 'q5', text: 'Question 5', correctAnswer: 'B' },
];

describe('useQuizState', () => {
  describe('initial state', () => {
    it('should start at question index 0', () => {
      const { result } = renderHook(() =>
        useQuizState({ questions: mockQuestions })
      );
      expect(result.current.currentQuestionIndex).toBe(0);
    });

    it('should have score 0', () => {
      const { result } = renderHook(() =>
        useQuizState({ questions: mockQuestions })
      );
      expect(result.current.score).toBe(0);
    });

    it('should not be complete', () => {
      const { result } = renderHook(() =>
        useQuizState({ questions: mockQuestions })
      );
      expect(result.current.isComplete).toBe(false);
    });

    it('should not have answered', () => {
      const { result } = renderHook(() =>
        useQuizState({ questions: mockQuestions })
      );
      expect(result.current.hasAnswered).toBe(false);
    });

    it('should have correct total questions', () => {
      const { result } = renderHook(() =>
        useQuizState({ questions: mockQuestions })
      );
      expect(result.current.totalQuestions).toBe(5);
    });

    it('should return the first question as currentQuestion', () => {
      const { result } = renderHook(() =>
        useQuizState({ questions: mockQuestions })
      );
      expect(result.current.currentQuestion).toEqual(mockQuestions[0]);
    });

    it('should have 0 percentage initially', () => {
      const { result } = renderHook(() =>
        useQuizState({ questions: mockQuestions })
      );
      expect(result.current.percentage).toBe(0);
    });
  });

  describe('submitAnswer', () => {
    it('should increment score on correct answer', () => {
      const { result } = renderHook(() =>
        useQuizState({ questions: mockQuestions })
      );

      act(() => {
        result.current.submitAnswer(true);
      });

      expect(result.current.score).toBe(1);
      expect(result.current.hasAnswered).toBe(true);
      expect(result.current.isCorrect).toBe(true);
    });

    it('should not increment score on wrong answer', () => {
      const { result } = renderHook(() =>
        useQuizState({ questions: mockQuestions })
      );

      act(() => {
        result.current.submitAnswer(false);
      });

      expect(result.current.score).toBe(0);
      expect(result.current.hasAnswered).toBe(true);
      expect(result.current.isCorrect).toBe(false);
    });

    it('should support custom point values', () => {
      const { result } = renderHook(() =>
        useQuizState({ questions: mockQuestions })
      );

      act(() => {
        result.current.submitAnswer(true, 3);
      });

      expect(result.current.score).toBe(3);
    });
  });

  describe('navigation', () => {
    it('should advance to next question', () => {
      const { result } = renderHook(() =>
        useQuizState({ questions: mockQuestions })
      );

      act(() => {
        result.current.submitAnswer(true);
      });
      act(() => {
        result.current.nextQuestion();
      });

      expect(result.current.currentQuestionIndex).toBe(1);
      expect(result.current.currentQuestion).toEqual(mockQuestions[1]);
      expect(result.current.hasAnswered).toBe(false);
      expect(result.current.isCorrect).toBeNull();
    });

    it('should go back to previous question', () => {
      const { result } = renderHook(() =>
        useQuizState({ questions: mockQuestions })
      );

      // Go to question 2
      act(() => {
        result.current.submitAnswer(true);
      });
      act(() => {
        result.current.nextQuestion();
      });

      // Go back to question 1
      act(() => {
        result.current.previousQuestion();
      });

      expect(result.current.currentQuestionIndex).toBe(0);
    });

    it('should not go below index 0', () => {
      const { result } = renderHook(() =>
        useQuizState({ questions: mockQuestions })
      );

      act(() => {
        result.current.previousQuestion();
      });

      expect(result.current.currentQuestionIndex).toBe(0);
    });

    it('should complete quiz on last question nextQuestion', () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() =>
        useQuizState({ questions: mockQuestions, onComplete })
      );

      // Answer all 5 questions
      for (let i = 0; i < 5; i++) {
        act(() => {
          result.current.submitAnswer(i % 2 === 0); // alternating correct/wrong
        });
        act(() => {
          result.current.nextQuestion();
        });
      }

      expect(result.current.isComplete).toBe(true);
      expect(onComplete).toHaveBeenCalledTimes(1);
      // 3 correct out of 5 (indices 0, 2, 4)
      expect(onComplete).toHaveBeenCalledWith(3, 5, expect.any(Number));
    });
  });

  describe('resetQuiz', () => {
    it('should reset all state', () => {
      const { result } = renderHook(() =>
        useQuizState({ questions: mockQuestions })
      );

      // Answer a couple questions
      act(() => {
        result.current.submitAnswer(true);
      });
      act(() => {
        result.current.nextQuestion();
      });
      act(() => {
        result.current.submitAnswer(false);
      });

      // Reset
      act(() => {
        result.current.resetQuiz();
      });

      expect(result.current.currentQuestionIndex).toBe(0);
      expect(result.current.score).toBe(0);
      expect(result.current.isComplete).toBe(false);
      expect(result.current.hasAnswered).toBe(false);
      expect(result.current.isCorrect).toBeNull();
    });
  });

  describe('computed values', () => {
    it('should calculate percentage correctly', () => {
      const { result } = renderHook(() =>
        useQuizState({ questions: mockQuestions })
      );

      act(() => {
        result.current.submitAnswer(true);
      });
      act(() => {
        result.current.nextQuestion();
      });
      act(() => {
        result.current.submitAnswer(true);
      });

      // 2 out of 5 = 40%
      expect(result.current.percentage).toBe(40);
    });

    it('should track progress based on current position', () => {
      const { result } = renderHook(() =>
        useQuizState({ questions: mockQuestions })
      );

      // At question 1 of 5 = 20%
      expect(result.current.progress).toBe(20);

      act(() => {
        result.current.submitAnswer(true);
      });
      act(() => {
        result.current.nextQuestion();
      });

      // At question 2 of 5 = 40%
      expect(result.current.progress).toBe(40);
    });
  });

  describe('edge cases', () => {
    it('should handle empty questions array', () => {
      const { result } = renderHook(() =>
        useQuizState({ questions: [] })
      );

      expect(result.current.totalQuestions).toBe(0);
      expect(result.current.percentage).toBe(0);
      expect(result.current.progress).toBe(0);
      expect(result.current.currentQuestion).toBeUndefined();
    });

    it('should handle single question quiz', () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() =>
        useQuizState({
          questions: [{ id: 'q1', text: 'Only question' }],
          onComplete,
        })
      );

      act(() => {
        result.current.submitAnswer(true);
      });
      act(() => {
        result.current.nextQuestion();
      });

      expect(result.current.isComplete).toBe(true);
      expect(onComplete).toHaveBeenCalledWith(1, 1, expect.any(Number));
    });
  });
});

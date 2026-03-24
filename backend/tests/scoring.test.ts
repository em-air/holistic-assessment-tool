import { describe, it, expect } from 'vitest';

/**
 * Tests for the scoring/percentage logic used across the application.
 *
 * The formula is extracted from backend/src/routes/results.ts:
 *   percentage = Math.min(100, Math.max(0, Math.round((score / total_questions) * 100)));
 */

function calculatePercentage(score: number, totalQuestions: number): number {
  return Math.min(100, Math.max(0, Math.round((score / totalQuestions) * 100)));
}

describe('Quiz scoring logic', () => {
  describe('calculatePercentage', () => {
    it('should return 100% for a perfect score', () => {
      expect(calculatePercentage(10, 10)).toBe(100);
    });

    it('should return 0% for zero correct', () => {
      expect(calculatePercentage(0, 10)).toBe(0);
    });

    it('should return 50% for half correct', () => {
      expect(calculatePercentage(5, 10)).toBe(50);
    });

    it('should round to nearest integer', () => {
      // 1/3 = 33.33... → 33
      expect(calculatePercentage(1, 3)).toBe(33);
      // 2/3 = 66.66... → 67
      expect(calculatePercentage(2, 3)).toBe(67);
    });

    it('should clamp to 100% when score exceeds total (Likert)', () => {
      // Some quizzes use Likert scoring where score > total_questions
      expect(calculatePercentage(15, 10)).toBe(100);
      expect(calculatePercentage(200, 100)).toBe(100);
    });

    it('should clamp to 0% for negative scores', () => {
      expect(calculatePercentage(-5, 10)).toBe(0);
    });

    it('should handle single-question quizzes', () => {
      expect(calculatePercentage(1, 1)).toBe(100);
      expect(calculatePercentage(0, 1)).toBe(0);
    });

    it('should handle large quizzes', () => {
      expect(calculatePercentage(75, 100)).toBe(75);
      expect(calculatePercentage(99, 100)).toBe(99);
    });
  });
});

describe('Progress calculation', () => {
  function calculateProgress(completed: number, total: number): number {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  it('should return 0 when no quizzes available', () => {
    expect(calculateProgress(0, 0)).toBe(0);
  });

  it('should return 0 when nothing completed', () => {
    expect(calculateProgress(0, 10)).toBe(0);
  });

  it('should return 100 when all completed', () => {
    expect(calculateProgress(10, 10)).toBe(100);
  });

  it('should calculate partial progress', () => {
    expect(calculateProgress(3, 10)).toBe(30);
  });
});

describe('Average score calculation', () => {
  function calculateAvgScore(percentages: number[]): number {
    if (percentages.length === 0) return 0;
    return Math.round(percentages.reduce((sum, p) => sum + p, 0) / percentages.length);
  }

  it('should return 0 for empty results', () => {
    expect(calculateAvgScore([])).toBe(0);
  });

  it('should return the score for a single result', () => {
    expect(calculateAvgScore([85])).toBe(85);
  });

  it('should average multiple results', () => {
    expect(calculateAvgScore([80, 90, 70])).toBe(80);
  });

  it('should round the average', () => {
    expect(calculateAvgScore([80, 90, 75])).toBe(82);
  });

  it('should handle all perfect scores', () => {
    expect(calculateAvgScore([100, 100, 100])).toBe(100);
  });

  it('should handle all zero scores', () => {
    expect(calculateAvgScore([0, 0, 0])).toBe(0);
  });
});

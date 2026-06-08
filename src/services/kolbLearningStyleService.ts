// Kolb Learning Style Scoring Engine
// Pure client-side — no API required.
// Based on the 2-axis Kolb Experiential Learning Model.

import {
  kolbQuestions,
  type KolbDimension,
  type KolbStyleId,
} from '../data/kolbQuizData';

export interface KolbScores {
  AE: number;
  RO: number;
  AC: number;
  CE: number;
}

export interface KolbAxes {
  /** Active vs Reflective: AE - RO */
  x: number;
  /** Abstract vs Concrete: AC - CE */
  y: number;
}

export interface KolbResult {
  scores: KolbScores;
  axes: KolbAxes;
  primaryStyle: KolbStyleId;
  /** The highest-scoring single dimension label */
  secondaryDimension: KolbDimension;
}

/**
 * Computes Kolb scores from a map of questionId → chosen option id (A/B/C/D).
 */
export function computeKolbScores(answers: Record<number, 'A' | 'B' | 'C' | 'D'>): KolbScores {
  const scores: KolbScores = { AE: 0, RO: 0, AC: 0, CE: 0 };

  for (const question of kolbQuestions) {
    const chosen = answers[question.id];
    if (!chosen) continue;
    const option = question.options.find(o => o.id === chosen);
    if (option) {
      scores[option.dimension] += 1;
    }
  }

  return scores;
}

/**
 * Converts raw dimension scores to Kolb's 2-axis model.
 *   X-axis = AE − RO  (positive = more Active, negative = more Reflective)
 *   Y-axis = AC − CE  (positive = more Abstract, negative = more Concrete)
 */
export function computeAxes(scores: KolbScores): KolbAxes {
  return {
    x: scores.AE - scores.RO,
    y: scores.AC - scores.CE,
  };
}

/**
 * Classifies Kolb learning style from axes.
 *
 *   Quadrant mapping (standard Kolb 1984):
 *   x > 0, y < 0 → Accommodating  (Active + Concrete)
 *   x < 0, y < 0 → Diverging      (Reflective + Concrete)
 *   x < 0, y > 0 → Assimilating   (Reflective + Abstract)
 *   x > 0, y > 0 → Converging     (Active + Abstract)
 *   tie           → Mixed Profile
 */
export function classifyStyle(axes: KolbAxes): KolbStyleId {
  const { x, y } = axes;

  if (x > 0 && y < 0) return 'Accommodating';
  if (x < 0 && y < 0) return 'Diverging';
  if (x < 0 && y > 0) return 'Assimilating';
  if (x > 0 && y > 0) return 'Converging';

  return 'Mixed Profile';
}

/**
 * Returns the dimension with the second-highest score.
 * Used as a secondary style indicator in the UI.
 */
export function getSecondaryDimension(scores: KolbScores): KolbDimension {
  const sorted = (Object.entries(scores) as [KolbDimension, number][]).sort(
    (a, b) => b[1] - a[1]
  );
  return sorted[1][0];
}

/**
 * Full scoring pipeline. Accepts answers keyed by question id.
 */
export function calculateKolbResult(
  answers: Record<number, 'A' | 'B' | 'C' | 'D'>
): KolbResult {
  const scores = computeKolbScores(answers);
  const axes = computeAxes(scores);
  const primaryStyle = classifyStyle(axes);
  const secondaryDimension = getSecondaryDimension(scores);

  return { scores, axes, primaryStyle, secondaryDimension };
}

/** Human-readable label for each raw dimension code */
export const DIMENSION_LABELS: Record<KolbDimension, string> = {
  AE: 'Active Experimentation',
  RO: 'Reflective Observation',
  AC: 'Abstract Conceptualization',
  CE: 'Concrete Experience',
};

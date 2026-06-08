// VARK scoring engine — pure client-side, no API required.

import { type LearningDimension } from '../data/varkQuizData';

export type VarkAnswers = Record<number, 'A' | 'B' | 'C' | 'D'>;

export interface VarkScores {
  visual: number;
  auditory: number;
  reading: number;
  kinesthetic: number;
}

export interface VarkResult {
  scores: VarkScores;
  percentages: VarkScores;
  primaryDimension: LearningDimension;
  secondaryDimension: LearningDimension;
  isMixed: boolean;
  /** 'mixed' when isMixed, otherwise same as primaryDimension */
  profileKey: LearningDimension | 'mixed';
}

/**
 * Computes raw dimension counts from the answers map.
 * Each answer contributes +1 to its dimension.
 */
export function computeVarkScores(
  answers: VarkAnswers,
  dimensionMap: Record<number, Record<'A' | 'B' | 'C' | 'D', LearningDimension>>
): VarkScores {
  const scores: VarkScores = { visual: 0, auditory: 0, reading: 0, kinesthetic: 0 };
  for (const [qIdStr, optionId] of Object.entries(answers)) {
    const qId = Number(qIdStr);
    const dim = dimensionMap[qId]?.[optionId];
    if (dim) scores[dim]++;
  }
  return scores;
}

/**
 * Full scoring pipeline.
 * Mixed = top two scores differ by 2 or fewer.
 */
export function calculateVarkResult(
  answers: VarkAnswers,
  dimensionMap: Record<number, Record<'A' | 'B' | 'C' | 'D', LearningDimension>>
): VarkResult {
  const scores = computeVarkScores(answers, dimensionMap);
  const total = Object.values(scores).reduce((s, n) => s + n, 0);

  const ranked = (Object.entries(scores) as [LearningDimension, number][]).sort(
    (a, b) => b[1] - a[1]
  );

  const primaryDimension = ranked[0][0];
  const secondaryDimension = ranked[1][0];
  const isMixed = ranked[0][1] - ranked[1][1] <= 2;
  const profileKey: LearningDimension | 'mixed' = isMixed ? 'mixed' : primaryDimension;

  const percentages: VarkScores = {
    visual: total > 0 ? Math.round((scores.visual / total) * 100) : 0,
    auditory: total > 0 ? Math.round((scores.auditory / total) * 100) : 0,
    reading: total > 0 ? Math.round((scores.reading / total) * 100) : 0,
    kinesthetic: total > 0 ? Math.round((scores.kinesthetic / total) * 100) : 0,
  };

  return { scores, percentages, primaryDimension, secondaryDimension, isMixed, profileKey };
}

/**
 * Builds the dimension lookup map from the questions array.
 * Avoids coupling the service to the data import.
 */
export function buildDimensionMap(
  questions: { id: number; options: { id: 'A' | 'B' | 'C' | 'D'; dimension: LearningDimension }[] }[]
): Record<number, Record<'A' | 'B' | 'C' | 'D', LearningDimension>> {
  const map: Record<number, Record<'A' | 'B' | 'C' | 'D', LearningDimension>> = {};
  for (const q of questions) {
    map[q.id] = {} as Record<'A' | 'B' | 'C' | 'D', LearningDimension>;
    for (const opt of q.options) {
      map[q.id][opt.id] = opt.dimension;
    }
  }
  return map;
}

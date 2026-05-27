/**
 * Quiz Computation Helpers
 *
 * Pure functions for score calculation and answer checking.
 * These do not import data files — they accept the data they need as arguments.
 */

// ─── Spelling ─────────────────────────────────────────────────────────────────

export const SPELLING_GRADE_DESCRIPTIONS: Record<number, string> = {
  1: 'Simple 3-4 letter words with basic phonics',
  2: '4-5 letter words with simple consonant blends',
  3: '5-6 letter words with digraphs and basic suffixes',
  4: '6-7 letter words with more complex patterns',
  5: '7-8 letter words with prefixes and suffixes',
  6: '8-9 letter words with advanced patterns',
  7: '9-10 letter words with complex spelling patterns',
  8: 'Advanced vocabulary with challenging spelling patterns',
};

export function validateSpellingAnswer(
  correctWord: string,
  userAnswer: string
): { correct: boolean; correctWord: string } {
  const normalised = userAnswer.trim().toLowerCase();
  const correct = normalised === correctWord.toLowerCase();
  return { correct, correctWord };
}

// ─── Attention Control ────────────────────────────────────────────────────────

export type AttentionQuestion = {
  id: number;
  subscale: 'focusing' | 'shifting';
  reverse: boolean;
};

export function calculateAttentionScores(
  responses: Record<number, number>,
  questions: AttentionQuestion[]
) {
  let focusingScore = 0;
  let shiftingScore = 0;
  let focusingCount = 0;
  let shiftingCount = 0;

  for (const question of questions) {
    const response = responses[question.id];
    if (response !== undefined) {
      const score = question.reverse ? 5 - response : response;
      if (question.subscale === 'focusing') {
        focusingScore += score;
        focusingCount++;
      } else {
        shiftingScore += score;
        shiftingCount++;
      }
    }
  }

  const focusingAverage = focusingCount > 0 ? focusingScore / focusingCount : 0;
  const shiftingAverage = shiftingCount > 0 ? shiftingScore / shiftingCount : 0;
  const totalScore = focusingScore + shiftingScore;
  const totalPossible = (focusingCount + shiftingCount) * 4;
  const percentageScore = totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;

  return {
    focusing: { raw: focusingScore, average: focusingAverage, count: focusingCount },
    shifting: { raw: shiftingScore, average: shiftingAverage, count: shiftingCount },
    total: { raw: totalScore, percentage: percentageScore, possible: totalPossible },
  };
}

export function interpretScores(scores: ReturnType<typeof calculateAttentionScores>) {
  const { focusing, shifting, total } = scores;

  const focusingLevel =
    focusing.average >= 3 ? 'Good' : focusing.average >= 2 ? 'Fair' : 'Needs Support';
  const shiftingLevel =
    shifting.average >= 3 ? 'Good' : shifting.average >= 2 ? 'Fair' : 'Needs Support';
  const overallLevel =
    total.percentage >= 75 ? 'Strong' : total.percentage >= 50 ? 'Moderate' : 'Developing';

  return {
    focusing: {
      level: focusingLevel,
      description:
        focusingLevel === 'Good'
          ? 'Shows good ability to maintain focus and concentrate on tasks.'
          : focusingLevel === 'Fair'
            ? 'Shows some ability to focus but may benefit from strategies to improve concentration.'
            : 'May have difficulty maintaining focus and could benefit from attention support strategies.',
    },
    shifting: {
      level: shiftingLevel,
      description:
        shiftingLevel === 'Good'
          ? 'Shows good ability to switch attention between tasks and adapt to changes.'
          : shiftingLevel === 'Fair'
            ? 'Shows some flexibility in attention but may benefit from practice with task switching.'
            : 'May have difficulty switching attention between tasks and adapting to changes.',
    },
    overall: {
      level: overallLevel,
      description:
        overallLevel === 'Strong'
          ? 'Shows strong attentional control abilities across both focusing and shifting.'
          : overallLevel === 'Moderate'
            ? 'Shows moderate attentional control with room for improvement in some areas.'
            : 'Attentional control skills are still developing and may benefit from targeted support.',
    },
  };
}

export function getRecommendations(interpretation: ReturnType<typeof interpretScores>) {
  const recommendations: string[] = [];

  if (interpretation.focusing.level !== 'Good') {
    recommendations.push(
      'Practice mindfulness exercises to improve focus',
      'Create a quiet, distraction-free study environment',
      'Break tasks into smaller, manageable chunks',
      'Use visual cues and reminders to stay on task'
    );
  }

  if (interpretation.shifting.level !== 'Good') {
    recommendations.push(
      'Practice switching between different types of activities',
      'Use transition cues when changing tasks',
      'Work on cognitive flexibility exercises',
      'Practice planning and organizing multiple tasks'
    );
  }

  if (interpretation.overall.level === 'Developing') {
    recommendations.push(
      'Consider consulting with a school counselor or educational specialist',
      'Discuss attention strategies with teachers',
      'Establish consistent routines and structure',
      'Consider professional assessment if difficulties persist'
    );
  }

  return recommendations;
}

// ─── Learning Styles ──────────────────────────────────────────────────────────

type LearningStyleId = 'visual' | 'auditory' | 'reading-writing';

export type LearningStyleResultId =
  | 'visual'
  | 'auditory'
  | 'reading-writing'
  | 'mixed-visual-auditory'
  | 'mixed-visual-reading-writing'
  | 'mixed-auditory-reading-writing'
  | 'mixed-all';

// Canonical style order for building consistent mixed result keys
const STYLE_ORDER: LearningStyleId[] = ['visual', 'auditory', 'reading-writing'];

export function calculateLearningStyle(
  answers: Record<string, string>,
  questions: Array<{ id: string; options: Array<{ id: string; style: string }> }>
): {
  visual: number;
  auditory: number;
  'reading-writing': number;
  dominantStyle: LearningStyleId;
  result: LearningStyleResultId;
} {
  const scores: Record<LearningStyleId, number> = {
    visual: 0,
    auditory: 0,
    'reading-writing': 0,
  };

  for (const [questionId, answerId] of Object.entries(answers)) {
    const question = questions.find(q => q.id === questionId);
    if (!question) continue;
    const option = question.options.find(o => o.id === answerId);
    if (option && option.style in scores) {
      scores[option.style as LearningStyleId] += 1;
    }
  }

  const sorted = (Object.entries(scores) as [LearningStyleId, number][])
    .sort((a, b) => b[1] - a[1]);

  const [top, second, third] = sorted;
  const dominantStyle = top[0];

  let result: LearningStyleResultId;

  if (top[1] === second[1] && second[1] === third[1]) {
    result = 'mixed-all';
  } else if (top[1] - second[1] <= 1) {
    // Order the pair canonically so the key is always consistent
    const pair = [top[0], second[0]].sort(
      (a, b) => STYLE_ORDER.indexOf(a) - STYLE_ORDER.indexOf(b)
    );
    result = `mixed-${pair[0]}-${pair[1]}` as LearningStyleResultId;
  } else {
    result = top[0];
  }

  return {
    visual: scores.visual,
    auditory: scores.auditory,
    'reading-writing': scores['reading-writing'],
    dominantStyle,
    result,
  };
}

// ─── Spot the Difference ──────────────────────────────────────────────────────

export function checkSpotDifference(
  differences: Array<{ x: number; y: number; radius: number }>,
  clickX: number,
  clickY: number
): { found: boolean; differenceIndex: number } {
  for (let i = 0; i < differences.length; i++) {
    const diff = differences[i];
    const distance = Math.sqrt((clickX - diff.x) ** 2 + (clickY - diff.y) ** 2);
    if (distance <= diff.radius) {
      return { found: true, differenceIndex: i };
    }
  }
  return { found: false, differenceIndex: -1 };
}

// ─── Logical Sequencing ───────────────────────────────────────────────────────

export function checkLogicalSequencingAnswer(
  correctOrder: number[],
  submittedOrder: number[]
): boolean {
  if (correctOrder.length !== submittedOrder.length) return false;
  return correctOrder.every((val, idx) => val === submittedOrder[idx]);
}

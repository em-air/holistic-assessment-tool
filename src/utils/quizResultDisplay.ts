import type { QuizResult } from './progressTracker';

const LEARNING_STYLE_LABELS: Record<string, string> = {
  visual: 'Visual',
  auditory: 'Auditory',
  reading: 'Reading/Writing',
  'reading-writing': 'Reading/Writing',
  kinesthetic: 'Kinesthetic',
};

const SEL_STRENGTH_LABELS: Record<string, string> = {
  EA: 'Emotional Awareness',
  PS: 'Prosocial Skills',
  SR: 'Self-Regulation',
};

export function getDominantLearningStyle(result: QuizResult): string | null {
  const ad = result.additionalData;
  if (!ad) return null;
  if (ad.dominantStyle) {
    return LEARNING_STYLE_LABELS[ad.dominantStyle] ?? ad.dominantStyle;
  }
  if (ad.primaryDimension) {
    const key = ad.primaryDimension === 'reading' ? 'reading-writing' : ad.primaryDimension;
    return LEARNING_STYLE_LABELS[key] ?? ad.primaryDimension;
  }
  return null;
}

export function getSelStrengthLabel(result: QuizResult): string | null {
  const ad = result.additionalData;
  if (!ad) return null;
  if (ad.primaryTitle) return ad.primaryTitle;
  if (ad.primaryStrength) {
    return SEL_STRENGTH_LABELS[ad.primaryStrength] ?? ad.primaryStrength;
  }
  return null;
}

export function getQuizResultLabel(result: QuizResult): { value: string; caption: string } | null {
  if (result.quizId === 'learning-styles') {
    const style = getDominantLearningStyle(result);
    return style ? { value: style, caption: 'Learning Style' } : null;
  }
  if (result.quizId === 'social-emotional') {
    const strength = getSelStrengthLabel(result);
    return strength ? { value: strength, caption: 'Top Strength' } : null;
  }
  if (result.quizId === 'attention-assessment') {
    const level =
      result.additionalData?.attentionLevel ||
      (result.percentage >= 75 ? 'Strong' : result.percentage >= 60 ? 'Moderate' : 'Developing');
    return { value: level, caption: 'Attention Level' };
  }
  return null;
}

export type SelDimensionKey = 'EA' | 'PS' | 'SR';

export const SEL_DIMENSION_LABELS: Record<SelDimensionKey, string> = {
  EA: 'Emotional Awareness',
  PS: 'Prosocial Skills',
  SR: 'Self-Regulation',
};

export const SEL_RESULT_PROFILES: Record<
  SelDimensionKey,
  { title: string; description: string; suggestions: string[] }
> = {
  EA: {
    title: 'Emotional Awareness Strength',
    description:
      'The student seems good at noticing and understanding feelings. Recognizing emotions can help them communicate and solve problems.',
    suggestions: [
      'Talk about feelings with people they trust',
      'Keep a feelings journal',
      'Practice naming emotions when they notice them',
    ],
  },
  PS: {
    title: 'Prosocial Strength',
    description:
      'The student seems good at helping others, cooperating, and being a supportive friend.',
    suggestions: [
      'Include others in activities',
      'Practice teamwork',
      'Continue showing kindness every day',
    ],
  },
  SR: {
    title: 'Self-Regulation Strength',
    description:
      'The student seems good at staying calm, handling challenges, and trying again when things are difficult.',
    suggestions: [
      'Keep practicing perseverance',
      'Use calming strategies when things feel hard',
      'Break difficult tasks into smaller steps',
    ],
  },
};

export function getSelPrimaryStrength(
  scores: Record<SelDimensionKey, number>,
): SelDimensionKey {
  return (Object.entries(scores) as [SelDimensionKey, number][])
    .sort((a, b) => b[1] - a[1])[0][0];
}

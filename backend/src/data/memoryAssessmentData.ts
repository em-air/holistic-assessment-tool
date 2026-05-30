/**
 * Memory Assessment Data
 * Working memory tests with sequence recall and missing object tasks.
 */

export interface MemoryItem {
  id: string;
  name: string;
  image: string;
  category: 'object';
}

export interface SequenceQuestion {
  id: string;
  type: 'sequence_recall' | 'missing_object';
  title: string;
  instruction: string;
  items: MemoryItem[];
  correctSequence?: string[]; // Server-side only
  missingItemId?: string; // Server-side only
  allChoices?: MemoryItem[];
  difficulty: 1 | 2 | 3 | 4 | 5;
}

/**
 * Generate a sequence recall question
 */
export const generateSequenceQuestion = (difficulty: number, items: MemoryItem[]): SequenceQuestion => {
  const objects = [...items];
  const itemCount = Math.min(3 + difficulty - 1, 5);
  
  // Shuffle and select items
  for (let i = objects.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [objects[i], objects[j]] = [objects[j], objects[i]];
  }
  
  const selectedItems = objects.slice(0, itemCount);
  const correctSequence = selectedItems.map(item => item.id);
  
  return {
    id: `sequence_${Date.now()}`,
    type: 'sequence_recall',
    title: 'Picture Sequence Memory',
    instruction: `Remember the order of these ${itemCount} pictures. You'll need to put them back in the correct order.`,
    items: selectedItems,
    correctSequence,
    difficulty: difficulty as 1 | 2 | 3 | 4 | 5
  };
};

/**
 * Generate a missing object question
 */
export const generateMissingObjectQuestion = (difficulty: number, items: MemoryItem[]): SequenceQuestion => {
  const objects = [...items];
  const showCount = Math.min(4 + difficulty, 6);
  const choiceCount = 4;
  
  // Shuffle objects
  for (let i = objects.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [objects[i], objects[j]] = [objects[j], objects[i]];
  }
  
  const objectsToShow = objects.slice(0, showCount);
  const correctAnswerItem = objectsToShow[Math.floor(Math.random() * objectsToShow.length)];
  
  const remainingObjects = objects.filter(item => !objectsToShow.some(shown => shown.id === item.id));
  const decoyChoices = remainingObjects.slice(0, choiceCount - 1);
  
  // Shuffle choices
  const allChoices = [correctAnswerItem, ...decoyChoices];
  for (let i = allChoices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allChoices[i], allChoices[j]] = [allChoices[j], allChoices[i]];
  }
  
  return {
    id: `missing_${Date.now()}`,
    type: 'missing_object',
    title: 'Missing Object Memory',
    instruction: `Look at these ${showCount} objects carefully. Then pick the one that was in the original group!`,
    items: objectsToShow,
    missingItemId: correctAnswerItem.id,
    allChoices,
    difficulty: difficulty as 1 | 2 | 3 | 4 | 5
  };
};

/**
 * Verify sequence answer (server-side validation)
 */
export const checkSequenceAnswer = (submittedSequence: string[], correctSequence: string[]): boolean => {
  if (submittedSequence.length !== correctSequence.length) return false;
  return submittedSequence.every((id, index) => id === correctSequence[index]);
};

/**
 * Verify missing object answer (server-side validation)
 */
export const checkMissingObjectAnswer = (selectedId: string, correctId: string): boolean => {
  return selectedId === correctId;
};

/**
 * Performance evaluation
 */
export const evaluatePerformance = (correctAnswers: number, totalQuestions: number, difficulty: number) => {
  const percentage = (correctAnswers / totalQuestions) * 100;
  const difficultyBonus = difficulty * 5;
  const finalScore = Math.min(percentage + difficultyBonus, 100);
  
  let level = 'Needs Practice';
  if (finalScore >= 90) level = 'Excellent';
  else if (finalScore >= 75) level = 'Very Good';
  else if (finalScore >= 60) level = 'Good';
  else if (finalScore >= 45) level = 'Fair';
  
  return {
    percentage: Math.round(percentage),
    finalScore: Math.round(finalScore),
    level,
    recommendations: getRecommendations(level)
  };
};

const getRecommendations = (level: string): string[] => {
  const recommendations: Record<string, string[]> = {
    'Excellent': [
      'Continue challenging yourself with more complex sequences',
      'Try real-world memory games and puzzles',
      'Practice with longer sequences to maintain skills'
    ],
    'Very Good': [
      'Practice with slightly longer sequences',
      'Try memory games with more items',
      'Focus on visual attention during presentations'
    ],
    'Good': [
      'Practice daily with simple memory exercises',
      'Use memory strategies like grouping items',
      'Increase focus time gradually'
    ],
    'Fair': [
      'Start with shorter sequences (2-3 items)',
      'Practice memory games regularly',
      'Use visual and verbal rehearsal strategies'
    ],
    'Needs Practice': [
      'Begin with very simple 2-item sequences',
      'Practice basic attention and focus exercises',
      'Consider working with a learning specialist'
    ]
  };
  
  return recommendations[level] || recommendations['Fair'];
};

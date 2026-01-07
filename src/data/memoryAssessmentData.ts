// Memory Assessment Data and Types
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
  correctSequence?: string[]; // For sequence recall
  missingItemId?: string; // For missing object tasks
  allChoices?: MemoryItem[]; // For missing object - all possible answers including correct one
  difficulty: 1 | 2 | 3 | 4 | 5;
}

// Sample memory items with reliable image URLs
export const memoryItems: MemoryItem[] = [
  // Objects for sequence recall and missing object tasks
  { id: 'apple', name: 'Apple', image: 'https://images.unsplash.com/photo-1568702846914-96b305d2uj8b?auto=format&fit=crop&w=400&q=80', category: 'object' },
  { id: 'dog', name: 'Dog', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=400&q=80', category: 'object' },
  { id: 'ball', name: 'Ball', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=80', category: 'object' },
  { id: 'car', name: 'Car', image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=400&q=80', category: 'object' },
  { id: 'house', name: 'House', image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=400&q=80', category: 'object' },
  { id: 'tree', name: 'Tree', image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=400&q=80', category: 'object' },
  { id: 'book', name: 'Book', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80', category: 'object' },
  { id: 'chair', name: 'Chair', image: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=400&q=80', category: 'object' },
  { id: 'cat', name: 'Cat', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80', category: 'object' },
  { id: 'flower', name: 'Flower', image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=400&q=80', category: 'object' },
  { id: 'bicycle', name: 'Bicycle', image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=400&q=80', category: 'object' },
  { id: 'cup', name: 'Cup', image: 'https://images.unsplash.com/photo-1517256673644-36ad11246d21?auto=format&fit=crop&w=400&q=80', category: 'object' }
];

// Generate random sequence questions
export const generateSequenceQuestion = (type: SequenceQuestion['type'], difficulty: number): SequenceQuestion => {
  const objects = memoryItems.filter(item => item.category === 'object');
  
  switch (type) {
    case 'sequence_recall': {
      const itemCount = Math.min(3 + difficulty - 1, 5); // 3-5 items based on difficulty
      const selectedItems = objects.sort(() => Math.random() - 0.5).slice(0, itemCount);
      const correctSequence = selectedItems.map(item => item.id);
      
      return {
        id: `sequence_${Date.now()}`,
        type: 'sequence_recall',
        title: 'Picture Sequence Memory',
        instruction: `Remember the order of these ${itemCount} pictures. You'll need to put them back in the correct order.`,
        items: selectedItems,
        correctSequence,
        difficulty: difficulty as any
      };
    }
    
    case 'missing_object': {
      const showCount = Math.min(4 + difficulty, 6); // 5-6 objects to show initially
      const choiceCount = 4; // Always show 4 choices
      
      // Select objects to show initially - randomize from all available objects
      const objectsToShow = objects.sort(() => Math.random() - 0.5).slice(0, showCount);
      const correctAnswerItem = objectsToShow[Math.floor(Math.random() * objectsToShow.length)];
      
      // Create choices: the correct answer + 3 random others that weren't shown
      const remainingObjects = objects.filter(item => !objectsToShow.some(shown => shown.id === item.id));
      const decoyChoices = remainingObjects.sort(() => Math.random() - 0.5).slice(0, choiceCount - 1);
      const allChoices = [correctAnswerItem, ...decoyChoices].sort(() => Math.random() - 0.5);
      

      
      const result: SequenceQuestion = {
        id: `missing_${Date.now()}`,
        type: 'missing_object',
        title: 'Missing Object Memory', 
        instruction: `Look at these ${showCount} objects carefully. Then I'll show you some choices - pick the one that was in the original group!`,
        items: objectsToShow, // Objects shown initially
        missingItemId: correctAnswerItem.id, // The correct answer
        allChoices: allChoices, // The 4 choices to select from
        difficulty: difficulty as any
      };
      


      
      return result;
    }
    
    default:
      throw new Error('Invalid question type');
  }
};

// Performance evaluation
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
  const recommendations: { [key: string]: string[] } = {
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

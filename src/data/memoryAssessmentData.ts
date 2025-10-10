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

// Sample memory items - REPLACE THESE IMAGE PATHS WITH YOUR ACTUAL IMAGES
export const memoryItems: MemoryItem[] = [
  // Objects for sequence recall and missing object tasks
  { id: 'apple', name: 'Apple', image: 'https://plus.unsplash.com/premium_photo-1724249990837-f6dfcb7f3eaa?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YXBwbGV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=600', category: 'object' },
  { id: 'dog', name: 'Dog', image: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=880', category: 'object' },
  { id: 'ball', name: 'Ball', image: 'https://images.unsplash.com/vector-1751489957370-ff0280bb54d1?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=880', category: 'object' },
  { id: 'car', name: 'Car', image: 'https://images.unsplash.com/vector-1743702228669-15c868db27e6?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=880', category: 'object' },
  { id: 'house', name: 'House', image: 'https://plus.unsplash.com/premium_photo-1689609950112-d66095626efb?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1974', category: 'object' },
  { id: 'tree', name: 'Tree', image: 'https://plus.unsplash.com/premium_photo-1666900816782-202bbcd67f42?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8dHJlZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600', category: 'object' },
  { id: 'book', name: 'Book', image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1000', category: 'object' },
  { id: 'chair', name: 'Chair', image: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1000', category: 'object' },
  { id: 'cat', name: 'Cat', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1000', category: 'object' },
  { id: 'flower', name: 'Flower', image: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=688', category: 'object' },
  { id: 'bicycle', name: 'Bicycle', image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170', category: 'object' },
  { id: 'cup', name: 'Cup', image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1000', category: 'object' }
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

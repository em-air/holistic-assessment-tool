/**
 * Backend Quiz Data - Oral Language
 * 
 * Vocabulary, sentence-building, and storytelling questions.
 */

export interface OralLanguageOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface SequenceImage {
  id: string;
  image: string;
  correctOrder: number;
  description?: string;
}

export interface OralLanguageQuestion {
  id: string;
  type: 'vocabulary' | 'sentence-building' | 'storytelling';
  level: number;
  question: string;
  image: string;
  options: OralLanguageOption[];
  // For storytelling sequence questions
  sequenceImages?: SequenceImage[];
  correctSequence?: string[];
  feedback?: {
    correct: string;
    incorrect: string;
  };
}

export const oralLanguageQuestions: OralLanguageQuestion[] = [
  // Vocabulary Level 1
  {
    id: 'vocab_1_1',
    type: 'vocabulary',
    level: 1,
    question: 'What is this?',
    image: 'https://media.istockphoto.com/id/1439436349/photo/red-apple-isolated-on-white-background.jpg',
    options: [
      { id: 'a', text: 'Apple', isCorrect: true },
      { id: 'b', text: 'Orange', isCorrect: false },
      { id: 'c', text: 'Banana', isCorrect: false }
    ]
  },
  {
    id: 'vocab_1_2',
    type: 'vocabulary',
    level: 1,
    question: 'What is this?',
    image: 'https://media.istockphoto.com/id/2124102567/photo/orange-fruit-with-leaf.jpg',
    options: [
      { id: 'a', text: 'Orange', isCorrect: true },
      { id: 'b', text: 'Apple', isCorrect: false },
      { id: 'c', text: 'Banana', isCorrect: false }
    ]
  },
  // Sentence Building Level 2
  {
    id: 'sentence_2_1',
    type: 'sentence-building',
    level: 2,
    question: 'What is the boy doing?',
    image: 'https://cdn.pixabay.com/photo/2023/07/18/12/56/little-boy-8134737_1280.jpg',
    options: [
      { id: 'a', text: 'Playing with the dog', isCorrect: false },
      { id: 'b', text: 'Feeding the dog', isCorrect: true },
      { id: 'c', text: 'Walking the dog', isCorrect: false }
    ]
  },
  // Storytelling / Story Sequencing
  {
    id: 'story_1_1',
    type: 'storytelling',
    level: 1,
    question: 'Put these pictures in the right order to tell the story of "Getting Ready for School"',
    image: '',
    options: [],
    sequenceImages: [
      {
        id: 'wake_up',
        image: 'https://i.postimg.cc/jD4fXB28/st1-1.png',
        correctOrder: 1,
        description: 'Child waking up in bed'
      },
      {
        id: 'go_to_school',
        image: 'https://i.postimg.cc/dhjCBg3z/st1-3.png',
        correctOrder: 3,
        description: 'Child walking to school'
      },
      {
        id: 'brush_teeth',
        image: 'https://i.postimg.cc/CRs8N953/st1-2.png',
        correctOrder: 2,
        description: 'Child brushing teeth'
      }
    ],
    correctSequence: ['wake_up', 'brush_teeth', 'go_to_school'],
    feedback: {
      correct: 'Perfect! You got the morning routine in the right order.',
      incorrect: 'Think about what you do first when you wake up in the morning!'
    }
  },
  {
    id: 'story_2_1',
    type: 'storytelling',
    level: 2,
    question: 'Put these pictures in the right order to tell the story of "Making a Sandwich"',
    image: '',
    options: [],
    sequenceImages: [
      {
        id: 'add_filling',
        image: 'https://images.unsplash.com/photo-1717048888698-277377758ff1?auto=format&fit=crop&q=80&w=600',
        correctOrder: 2,
        description: 'Adding peanut butter and jam'
      },
      {
        id: 'get_bread',
        image: 'https://plus.unsplash.com/premium_photo-1700767194982-b72f275582bd?auto=format&fit=crop&q=60&w=600',
        correctOrder: 1,
        description: 'Taking bread from the bag'
      },
      {
        id: 'eat_sandwich',
        image: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&q=80&w=600',
        correctOrder: 3,
        description: 'Eating the finished sandwich'
      }
    ],
    correctSequence: ['get_bread', 'add_filling', 'eat_sandwich'],
    feedback: {
      correct: 'Great job! You made the sandwich in the right order.',
      incorrect: 'Remember: first get the bread, then add the filling, then eat!'
    }
  },
  {
    id: 'story_3_1',
    type: 'storytelling',
    level: 3,
    question: 'Put these pictures in the right order to tell the story of "Planting a Flower"',
    image: '',
    options: [],
    sequenceImages: [
      {
        id: 'water_plant',
        image: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=600',
        correctOrder: 3,
        description: 'Watering the plant'
      },
      {
        id: 'dig_hole',
        image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=80&w=600',
        correctOrder: 1,
        description: 'Digging a hole in the soil'
      },
      {
        id: 'plant_seed',
        image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&q=80&w=600',
        correctOrder: 2,
        description: 'Planting the seed'
      }
    ],
    correctSequence: ['dig_hole', 'plant_seed', 'water_plant'],
    feedback: {
      correct: 'Excellent! You know how to plant a flower!',
      incorrect: 'First dig a hole, then plant the seed, then water it!'
    }
  }
];

/**
 * Get questions by type and level
 */
export const getOralLanguageQuestions = (
  type?: 'vocabulary' | 'sentence-building' | 'storytelling',
  level?: number
): OralLanguageQuestion[] => {
  let filtered = oralLanguageQuestions;
  
  if (type) {
    filtered = filtered.filter(q => q.type === type);
  }
  if (level !== undefined) {
    filtered = filtered.filter(q => q.level === level);
  }
  
  return filtered;
};

/**
 * Get question for frontend (options without isCorrect)
 */
export const getOralLanguageQuestionForFrontend = (questionId: string): {
  id: string;
  type: string;
  level: number;
  question: string;
  image: string;
  options: { id: string; text: string }[];
} | undefined => {
  const question = oralLanguageQuestions.find(q => q.id === questionId);
  if (!question) return undefined;
  
  return {
    id: question.id,
    type: question.type,
    level: question.level,
    question: question.question,
    image: question.image,
    options: question.options.map(o => ({ id: o.id, text: o.text })).sort(() => Math.random() - 0.5),
  };
};

/**
 * Validate answer
 */
export const validateOralLanguageAnswer = (questionId: string, answerId: string): {
  correct: boolean;
  correctAnswer: string;
} => {
  const question = oralLanguageQuestions.find(q => q.id === questionId);
  if (!question) return { correct: false, correctAnswer: '' };
  
  const correctOption = question.options.find(o => o.isCorrect);
  const userOption = question.options.find(o => o.id === answerId);
  
  return {
    correct: userOption?.isCorrect || false,
    correctAnswer: correctOption?.text || '',
  };
};

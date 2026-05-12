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
        image: 'https://images.pexels.com/photos/7504649/pexels-photo-7504649.jpeg',
        correctOrder: 1,
        description: 'Child waking up in bed'
      },
      {
        id: 'go_to_school',
        image: 'https://cdn.pixabay.com/photo/2016/09/12/23/59/student-1666118_1280.jpg',
        correctOrder: 3,
        description: 'Child walking to school'
      },
      {
        id: 'brush_teeth',
        image: 'https://images.pexels.com/photos/7086233/pexels-photo-7086233.jpeg',
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
        image: 'https://images.unsplash.com/photo-1717048888698-277377758ff1?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170',
        correctOrder: 2,
        description: 'Adding peanut butter and jam'
      },
      {
        id: 'get_bread',
        image: 'https://plus.unsplash.com/premium_photo-1700767194982-b72f275582bd?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aG9sZGluZyUyMGJyZWFkfGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=600',
        correctOrder: 1,
        description: 'Taking bread from the bag'
      },
      {
        id: 'eat_sandwich',
        image: 'https://plus.unsplash.com/premium_photo-1679166276587-0085a4bf7aef?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8ZWF0aW5nJTIwc2FuZHdpY2h8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=600',
        correctOrder: 3,
        description: 'Child eating the finished sandwich'
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
        id: 'flower_grows',
        image: 'https://images.unsplash.com/photo-1592683249810-bdf5c51eaf0a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170',
        correctOrder: 3,
        description: 'Beautiful flower blooming'
      },
      {
        id: 'plant_seed',
        image: 'https://images.pexels.com/photos/169523/pexels-photo-169523.jpeg',
        correctOrder: 1,
        description: 'Putting seed in the soil'
      },
      {
        id: 'water_plant',
        image: 'https://images.unsplash.com/photo-1599277100479-3252d492a19a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1112',
        correctOrder: 2,
        description: 'Watering the planted seed'
      }
    ],
    correctSequence: ['plant_seed', 'water_plant', 'flower_grows'],
    feedback: {
      correct: 'Excellent! You know how to plant a flower!',
      incorrect: 'First plant the seed, then water it, then watch it grow!'
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

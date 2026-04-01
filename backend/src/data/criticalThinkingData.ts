/**
 * Backend Quiz Data - Critical Thinking
 * 
 * Critical thinking questions (analogies, categories, etc.)
 */

export interface CriticalThinkingQuestion {
  id: string;
  type: 'analogy' | 'category' | 'sequence' | 'odd-one-out';
  question: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const criticalThinkingQuestions: CriticalThinkingQuestion[] = [
  // Analogies
  {
    id: 'ct-1',
    type: 'analogy',
    question: 'Bird is to fly as fish is to ___',
    options: [
      { id: 'a', text: 'swim', isCorrect: true },
      { id: 'b', text: 'walk', isCorrect: false },
      { id: 'c', text: 'run', isCorrect: false },
      { id: 'd', text: 'jump', isCorrect: false }
    ],
    explanation: 'Birds fly in the air, fish swim in water.',
    difficulty: 'easy'
  },
  {
    id: 'ct-2',
    type: 'analogy',
    question: 'Hot is to cold as day is to ___',
    options: [
      { id: 'a', text: 'night', isCorrect: true },
      { id: 'b', text: 'morning', isCorrect: false },
      { id: 'c', text: 'afternoon', isCorrect: false },
      { id: 'd', text: 'evening', isCorrect: false }
    ],
    explanation: 'Hot and cold are opposites, just like day and night.',
    difficulty: 'easy'
  },
  // Categories
  {
    id: 'ct-3',
    type: 'category',
    question: 'Which group contains only fruits?',
    options: [
      { id: 'a', text: 'Apple, Banana, Carrot', isCorrect: false },
      { id: 'b', text: 'Apple, Banana, Orange', isCorrect: true },
      { id: 'c', text: 'Apple, Lettuce, Orange', isCorrect: false },
      { id: 'd', text: 'Carrot, Banana, Potato', isCorrect: false }
    ],
    explanation: 'Apple, Banana, and Orange are all fruits. Carrot, Lettuce, and Potato are vegetables.',
    difficulty: 'easy'
  },
  // Odd one out
  {
    id: 'ct-4',
    type: 'odd-one-out',
    question: 'Which one does not belong? Dog, Cat, Bird, Chair',
    options: [
      { id: 'a', text: 'Dog', isCorrect: false },
      { id: 'b', text: 'Cat', isCorrect: false },
      { id: 'c', text: 'Bird', isCorrect: false },
      { id: 'd', text: 'Chair', isCorrect: true }
    ],
    explanation: 'Dog, Cat, and Bird are all animals. Chair is furniture.',
    difficulty: 'easy'
  },
  // Sequences
  {
    id: 'ct-5',
    type: 'sequence',
    question: 'What comes next? 2, 4, 6, 8, ___',
    options: [
      { id: 'a', text: '10', isCorrect: true },
      { id: 'b', text: '9', isCorrect: false },
      { id: 'c', text: '12', isCorrect: false },
      { id: 'd', text: '11', isCorrect: false }
    ],
    explanation: 'The pattern adds 2 each time: 2+2=4, 4+2=6, 6+2=8, 8+2=10',
    difficulty: 'easy'
  }
];

/**
 * Get questions by type
 */
export const getCriticalThinkingQuestions = (
  type?: 'analogy' | 'category' | 'sequence' | 'odd-one-out',
  difficulty?: 'easy' | 'medium' | 'hard'
): CriticalThinkingQuestion[] => {
  let filtered = criticalThinkingQuestions;
  
  if (type) filtered = filtered.filter(q => q.type === type);
  if (difficulty) filtered = filtered.filter(q => q.difficulty === difficulty);
  
  return filtered;
};

/**
 * Get question for frontend
 */
export const getCriticalThinkingQuestionForFrontend = (questionId: string): {
  id: string;
  type: string;
  question: string;
  difficulty: string;
  options: { id: string; text: string }[];
} | undefined => {
  const question = criticalThinkingQuestions.find(q => q.id === questionId);
  if (!question) return undefined;
  
  return {
    id: question.id,
    type: question.type,
    question: question.question,
    difficulty: question.difficulty,
    options: question.options.map(o => ({ id: o.id, text: o.text })).sort(() => Math.random() - 0.5),
  };
};

/**
 * Validate answer
 */
export const validateCriticalThinkingAnswer = (questionId: string, answerId: string): {
  correct: boolean;
  correctAnswer: string;
  explanation: string;
} => {
  const question = criticalThinkingQuestions.find(q => q.id === questionId);
  if (!question) return { correct: false, correctAnswer: '', explanation: '' };
  
  const correctOption = question.options.find(o => o.isCorrect);
  const userOption = question.options.find(o => o.id === answerId);
  
  return {
    correct: userOption?.isCorrect || false,
    correctAnswer: correctOption?.text || '',
    explanation: question.explanation || '',
  };
};

// ============================================
// CATEGORY QUIZ (Drag & Drop Sorting)
// ============================================

export interface CategoryItem {
  id: string;
  name: string;
  image: string;
  correctCategory: string;
}

export interface CategoryQuestion {
  id: string;
  instruction: string;
  categories: string[];
  items: CategoryItem[];
}

type CategoryGrade = 'grade1' | 'grade2' | 'grade3' | 'grade4';

export const categoryQuestions: Record<CategoryGrade, CategoryQuestion[]> = {
  grade1: [
    {
      id: 'c1_1',
      instruction: 'Sort these into Animals and Fruits',
      categories: ['Animals', 'Fruits'],
      items: [
        { id: 'cat', name: 'Cat', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150&h=150&fit=crop&crop=center', correctCategory: 'Animals' },
        { id: 'dog', name: 'Dog', image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&h=150&fit=crop&crop=center', correctCategory: 'Animals' },
        { id: 'apple', name: 'Apple', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=150&h=150&fit=crop&crop=center', correctCategory: 'Fruits' },
        { id: 'banana', name: 'Banana', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=150&h=150&fit=crop&crop=center', correctCategory: 'Fruits' }
      ]
    },
    {
      id: 'c1_2',
      instruction: 'Sort these into Colors and Numbers',
      categories: ['Colors', 'Numbers'],
      items: [
        { id: 'ten', name: 'Ten', image: 'https://images.unsplash.com/photo-1631453494181-f762d692583a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dGVufGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=600', correctCategory: 'Numbers' },
        { id: 'red', name: 'Red', image: 'https://images.unsplash.com/photo-1611242320536-f12d3541249b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170', correctCategory: 'Colors' },
        { id: 'blue', name: 'Blue', image: 'https://images.unsplash.com/photo-1614850523011-8f49ffc73908?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170', correctCategory: 'Colors' },
        { id: 'five', name: 'Five', image: 'https://plus.unsplash.com/premium_photo-1669349127530-23d9e3dab307?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=880', correctCategory: 'Numbers' }
      ]
    }
  ],
  grade2: [
    {
      id: 'c2_1',
      instruction: 'Sort these into School Items and Toys',
      categories: ['School Items', 'Toys'],
      items: [
        { id: 'pencil', name: 'Pencil', image: 'https://plus.unsplash.com/premium_vector-1720893352647-9afd7d84fa79?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=880', correctCategory: 'School Items' },
        { id: 'eraser', name: 'Eraser', image: 'https://images.unsplash.com/photo-1667532447990-51c6704ef358?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2080', correctCategory: 'School Items' },
        { id: 'book', name: 'Book', image: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1976', correctCategory: 'School Items' },
        { id: 'ball', name: 'Ball', image: 'https://plus.unsplash.com/premium_photo-1709589145461-4797b4e80e9c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070', correctCategory: 'Toys' },
        { id: 'doll', name: 'Doll', image: 'https://images.unsplash.com/photo-1612506001235-f0d0892aa11b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZG9sbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600', correctCategory: 'Toys' },
        { id: 'car', name: 'Toy Car', image: 'https://images.unsplash.com/photo-1609708536965-6e5b915b195b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dG95JTIwY2FyfGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=600', correctCategory: 'Toys' }
      ]
    },
    {
      id: 'c2_2',
      instruction: 'Sort these into Indoor and Outdoor activities',
      categories: ['Indoor', 'Outdoor'],
      items: [
        { id: 'reading', name: 'Reading', image: 'https://plus.unsplash.com/premium_vector-1727952231396-e301fbf4ef1b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=880', correctCategory: 'Indoor' },
        { id: 'cooking', name: 'Cooking', image: 'https://images.unsplash.com/photo-1528712306091-ed0763094c98?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y29va2luZ3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600', correctCategory: 'Indoor' },
        { id: 'running', name: 'Running', image: 'https://images.unsplash.com/photo-1486218119243-13883505764c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8cnVubmluZ3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600', correctCategory: 'Outdoor' },
        { id: 'swimming', name: 'Swimming', image: 'https://plus.unsplash.com/premium_photo-1664475361436-e37f6f2ba407?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8c3dpbW1pbmd8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=600', correctCategory: 'Outdoor' }
      ]
    }
  ],
  grade3: [
    {
      id: 'c3_1',
      instruction: 'Sort these into Fruits and Vegetables',
      categories: ['Fruits', 'Vegetables'],
      items: [
        { id: 'apple', name: 'Apple', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=150&h=150&fit=crop&crop=center', correctCategory: 'Fruits' },
        { id: 'kiwi', name: 'Kiwi', image: 'https://images.unsplash.com/photo-1585059895524-72359e06133a?w=150&h=150&fit=crop&crop=center', correctCategory: 'Fruits' },
        { id: 'strawberry', name: 'Strawberry', image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=150&h=150&fit=crop&crop=center', correctCategory: 'Fruits' },
        { id: 'tomato', name: 'Tomato', image: 'https://images.unsplash.com/photo-1582284540020-8acbe03f4924?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=735', correctCategory: 'Fruits' },
        { id: 'cucumber', name: 'Cucumber', image: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=150&h=150&fit=crop&crop=center', correctCategory: 'Vegetables' },
        { id: 'spinach', name: 'Spinach', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=150&h=150&fit=crop&crop=center', correctCategory: 'Vegetables' }
      ]
    },
    {
      id: 'c3_2',
      instruction: 'Sort these by Size',
      categories: ['Small', 'Large'],
      items: [
        { id: 'mouse', name: 'Mouse', image: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=150&h=150&fit=crop&crop=center', correctCategory: 'Small' },
        { id: 'ant', name: 'Ant', image: 'https://plus.unsplash.com/premium_vector-1732722159929-50a849c772ce?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=996', correctCategory: 'Small' },
        { id: 'elephant', name: 'Elephant', image: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=150&h=150&fit=crop&crop=center', correctCategory: 'Large' },
        { id: 'whale', name: 'Whale', image: 'https://plus.unsplash.com/premium_vector-1722145193505-ac236cb1d8e4?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8d2hhbGV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=600', correctCategory: 'Large' }
      ]
    }
  ],
  grade4: [
    {
      id: 'c4_1',
      instruction: 'Sort these animals by their habitat',
      categories: ['Land Animals', 'Water Animals', 'Air Animals'],
      items: [
        { id: 'lion', name: 'Lion', image: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=150&h=150&fit=crop&crop=center', correctCategory: 'Land Animals' },
        { id: 'frog', name: 'Frog', image: 'https://plus.unsplash.com/premium_vector-1731552809287-77ae59448109?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZnJvZ3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600', correctCategory: 'Land Animals' },
        { id: 'dolphin', name: 'Dolphin', image: 'https://plus.unsplash.com/premium_vector-1722145193220-5eb206260842?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZG9scGhpbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600', correctCategory: 'Water Animals' },
        { id: 'shark', name: 'Shark', image: 'https://plus.unsplash.com/premium_vector-1741191978319-3ff9d0e3e9ae?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1112', correctCategory: 'Water Animals' },
        { id: 'eagle', name: 'Eagle', image: 'https://plus.unsplash.com/premium_vector-1719245268509-2cd8228d06ee?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZWFnbGV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=600', correctCategory: 'Air Animals' },
        { id: 'parrot', name: 'Parrot', image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=725', correctCategory: 'Air Animals' }
      ]
    },
    {
      id: 'c4_2',
      instruction: 'Sort these by their state of matter',
      categories: ['Solid', 'Liquid', 'Gas'],
      items: [
        { id: 'rock', name: 'Rock', image: 'https://images.unsplash.com/vector-1752609379935-1e3a71d8dc78?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=880', correctCategory: 'Solid' },
        { id: 'ice', name: 'Ice', image: 'https://images.unsplash.com/photo-1737099950797-d0a4baf12af3?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8aWNlJTIwY3ViZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600', correctCategory: 'Solid' },
        { id: 'water', name: 'Water', image: 'https://plus.unsplash.com/premium_vector-1727952230707-372d1ba06834?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8d2F0ZXJ8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=600', correctCategory: 'Liquid' },
        { id: 'juice', name: 'Juice', image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8anVpY2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=600', correctCategory: 'Liquid' },
        { id: 'air', name: 'Air', image: 'https://media.istockphoto.com/id/1347708317/vector/wind-weather-thin-line-icon.jpg?s=612x612&w=0&k=20&c=_CZj2l6ecQpFu4doH4nrDTipA6g1zAIfn93IrFn3N4s=', correctCategory: 'Gas' },
        { id: 'steam', name: 'Steam', image: 'https://images.unsplash.com/photo-1635191535841-a6d4d88e1612?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070', correctCategory: 'Gas' }
      ]
    }
  ]
};

/**
 * Get category questions by grade (strips correctCategory for frontend)
 */
export const getCategoryQuestions = (grade: string): {
  id: string;
  instruction: string;
  categories: string[];
  items: { id: string; name: string; image: string }[];
}[] => {
  const gradeKey = grade as CategoryGrade;
  const questions = categoryQuestions[gradeKey];
  if (!questions) return [];

  return questions.map(q => ({
    id: q.id,
    instruction: q.instruction,
    categories: q.categories,
    items: q.items.map(item => ({
      id: item.id,
      name: item.name,
      image: item.image,
    })),
  }));
};

/**
 * Validate a category item placement
 */
export const validateCategoryItemPlacement = (
  questionId: string,
  itemId: string,
  droppedCategory: string,
  grade: string
): { correct: boolean; correctCategory: string } => {
  const gradeKey = grade as CategoryGrade;
  const questions = categoryQuestions[gradeKey];
  if (!questions) return { correct: false, correctCategory: '' };

  const question = questions.find(q => q.id === questionId);
  if (!question) return { correct: false, correctCategory: '' };

  const item = question.items.find(i => i.id === itemId);
  if (!item) return { correct: false, correctCategory: '' };

  return {
    correct: droppedCategory === item.correctCategory,
    correctCategory: item.correctCategory,
  };
};

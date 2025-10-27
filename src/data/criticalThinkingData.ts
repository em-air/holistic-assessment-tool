// Critical Thinking Quiz Data

export interface AnalogyQuestion {
  id: string;
  question: string;
  choices: string[];
  correctAnswer: number; // index of correct choice
  explanation?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  correctCategory: string;
}

export interface CategoryQuestion {
  id: string;
  instruction: string;
  categories: string[];
  items: CategoryItem[];
}

// Analogy Questions by Grade Level
export const analogyQuestions = {
  grade1: [
    {
      id: 'g1_1',
      question: 'If cats meow, then dogs ___',
      choices: ['bark', 'fly', 'swim'],
      correctAnswer: 0,
      explanation: 'Dogs bark just like cats meow'
    },
    {
      id: 'g1_2',
      question: 'If the sun is hot, ice is ___',
      choices: ['cold', 'warm', 'bright'],
      correctAnswer: 0,
      explanation: 'Ice is the opposite of hot - it is cold'
    },
    {
      id: 'g1_3',
      question: 'If a bird has wings, a fish has ___',
      choices: ['fins', 'fur', 'leaves'],
      correctAnswer: 0,
      explanation: 'Fish use fins to swim, like birds use wings to fly'
    },
    {
      id: 'g1_4',
      question: 'If people walk, cars ___',
      choices: ['drive', 'fly', 'swim'],
      correctAnswer: 0,
      explanation: 'Cars drive on roads like people walk on paths'
    },
    {
      id: 'g1_5',
      question: 'If rain is wet, fire is ___',
      choices: ['hot', 'cold', 'blue'],
      correctAnswer: 0,
      explanation: 'Fire is hot, which is different from wet rain'
    }
  ] as AnalogyQuestion[],

  grade2: [
    {
      id: 'g2_1',
      question: 'Day is to sun as night is to ___',
      choices: ['moon', 'cloud', 'star'],
      correctAnswer: 0,
      explanation: 'The moon lights up the night like the sun lights up the day'
    },
    {
      id: 'g2_2',
      question: 'Pen is to write as brush is to ___',
      choices: ['paint', 'eat', 'walk'],
      correctAnswer: 0,
      explanation: 'We use a brush to paint, just like we use a pen to write'
    },
    {
      id: 'g2_3',
      question: 'Cow is to milk as hen is to ___',
      choices: ['egg', 'wool', 'grass'],
      correctAnswer: 0,
      explanation: 'Hens give us eggs, like cows give us milk'
    },
    {
      id: 'g2_4',
      question: 'Eyes are to see as ears are to ___',
      choices: ['hear', 'smell', 'touch'],
      correctAnswer: 0,
      explanation: 'We use our ears to hear, like we use our eyes to see'
    },
    {
      id: 'g2_5',
      question: 'Kitchen is to cook as bedroom is to ___',
      choices: ['sleep', 'read', 'play'],
      correctAnswer: 0,
      explanation: 'We sleep in the bedroom, like we cook in the kitchen'
    }
  ] as AnalogyQuestion[],

  grade3: [
    {
      id: 'g3_1',
      question: 'Sam is taller than Jane, Jane is taller than Ben. Who is the shortest?',
      choices: ['Ben', 'Jane', 'Sam'],
      correctAnswer: 0,
      explanation: 'Ben is shorter than Jane, and Jane is shorter than Sam'
    },
    {
      id: 'g3_2',
      question: 'If winter is cold, summer is ___',
      choices: ['hot', 'rainy', 'snowy'],
      correctAnswer: 0,
      explanation: 'Summer is the opposite season from winter - it is hot'
    },
    {
      id: 'g3_3',
      question: 'If teacher teaches, doctor ___',
      choices: ['heals', 'cooks', 'paints'],
      correctAnswer: 0,
      explanation: 'A doctor heals people, like a teacher teaches students'
    },
    {
      id: 'g3_4',
      question: 'Morning is to breakfast as evening is to ___',
      choices: ['dinner', 'lunch', 'snack'],
      correctAnswer: 0,
      explanation: 'We eat dinner in the evening, like we eat breakfast in the morning'
    },
    {
      id: 'g3_5',
      question: 'Library is to books as museum is to ___',
      choices: ['art', 'food', 'games'],
      correctAnswer: 0,
      explanation: 'Museums display art, like libraries have books'
    }
  ] as AnalogyQuestion[],

  grade4: [
    {
      id: 'g4_1',
      question: 'Seed is to plant as egg is to ___',
      choices: ['bird', 'leaf', 'water'],
      correctAnswer: 0,
      explanation: 'An egg grows into a bird, like a seed grows into a plant'
    },
    {
      id: 'g4_2',
      question: 'Foot is to shoe as hand is to ___',
      choices: ['glove', 'hat', 'scarf'],
      correctAnswer: 0,
      explanation: 'Gloves go on hands, like shoes go on feet'
    },
    {
      id: 'g4_3',
      question: 'Book is to read as guitar is to ___',
      choices: ['play', 'sing', 'write'],
      correctAnswer: 0,
      explanation: 'We play a guitar, like we read a book'
    },
    {
      id: 'g4_4',
      question: 'Captain is to ship as pilot is to ___',
      choices: ['airplane', 'car', 'train'],
      correctAnswer: 0,
      explanation: 'A pilot controls an airplane, like a captain controls a ship'
    },
    {
      id: 'g4_5',
      question: 'Author is to book as composer is to ___',
      choices: ['music', 'painting', 'movie'],
      correctAnswer: 0,
      explanation: 'A composer creates music, like an author creates books'
    }
  ] as AnalogyQuestion[]
};

// Category Questions by Grade Level
export const categoryQuestions = {
  grade1: [
    {
      id: 'c1_1',
      instruction: 'Sort these into Animals and Fruits',
      categories: ['Animals', 'Fruits'],
      items: [
        { id: 'cat', name: 'Cat', correctCategory: 'Animals' },
        { id: 'dog', name: 'Dog', correctCategory: 'Animals' },
        { id: 'apple', name: 'Apple', correctCategory: 'Fruits' },
        { id: 'banana', name: 'Banana', correctCategory: 'Fruits' }
      ]
    },
    {
      id: 'c1_2',
      instruction: 'Sort these into Colors and Numbers',
      categories: ['Colors', 'Numbers'],
      items: [
        { id: 'red', name: 'Red', correctCategory: 'Colors' },
        { id: 'blue', name: 'Blue', correctCategory: 'Colors' },
        { id: 'five', name: 'Five', correctCategory: 'Numbers' },
        { id: 'ten', name: 'Ten', correctCategory: 'Numbers' }
      ]
    }
  ] as CategoryQuestion[],

  grade2: [
    {
      id: 'c2_1',
      instruction: 'Sort these into School Items and Toys',
      categories: ['School Items', 'Toys'],
      items: [
        { id: 'pencil', name: 'Pencil', correctCategory: 'School Items' },
        { id: 'eraser', name: 'Eraser', correctCategory: 'School Items' },
        { id: 'book', name: 'Book', correctCategory: 'School Items' },
        { id: 'ball', name: 'Ball', correctCategory: 'Toys' },
        { id: 'doll', name: 'Doll', correctCategory: 'Toys' },
        { id: 'car', name: 'Toy Car', correctCategory: 'Toys' }
      ]
    },
    {
      id: 'c2_2',
      instruction: 'Sort these into Indoor and Outdoor activities',
      categories: ['Indoor', 'Outdoor'],
      items: [
        { id: 'reading', name: 'Reading', correctCategory: 'Indoor' },
        { id: 'cooking', name: 'Cooking', correctCategory: 'Indoor' },
        { id: 'running', name: 'Running', correctCategory: 'Outdoor' },
        { id: 'swimming', name: 'Swimming', correctCategory: 'Outdoor' }
      ]
    }
  ] as CategoryQuestion[],

  grade3: [
    {
      id: 'c3_1',
      instruction: 'Sort these into Fruits and Vegetables',
      categories: ['Fruits', 'Vegetables'],
      items: [
        { id: 'apple', name: 'Apple', correctCategory: 'Fruits' },
        { id: 'kiwi', name: 'Kiwi', correctCategory: 'Fruits' },
        { id: 'strawberry', name: 'Strawberry', correctCategory: 'Fruits' },
        { id: 'tomato', name: 'Tomato', correctCategory: 'Fruits' },
        { id: 'cucumber', name: 'Cucumber', correctCategory: 'Vegetables' },
        { id: 'spinach', name: 'Spinach', correctCategory: 'Vegetables' }
      ]
    },
    {
      id: 'c3_2',
      instruction: 'Sort these by Size',
      categories: ['Small', 'Large'],
      items: [
        { id: 'mouse', name: 'Mouse', correctCategory: 'Small' },
        { id: 'ant', name: 'Ant', correctCategory: 'Small' },
        { id: 'elephant', name: 'Elephant', correctCategory: 'Large' },
        { id: 'whale', name: 'Whale', correctCategory: 'Large' }
      ]
    }
  ] as CategoryQuestion[],

  grade4: [
    {
      id: 'c4_1',
      instruction: 'Sort these animals by their habitat',
      categories: ['Land Animals', 'Water Animals', 'Air Animals'],
      items: [
        { id: 'lion', name: 'Lion', correctCategory: 'Land Animals' },
        { id: 'frog', name: 'Frog', correctCategory: 'Land Animals' },
        { id: 'dolphin', name: 'Dolphin', correctCategory: 'Water Animals' },
        { id: 'shark', name: 'Shark', correctCategory: 'Water Animals' },
        { id: 'eagle', name: 'Eagle', correctCategory: 'Air Animals' },
        { id: 'parrot', name: 'Parrot', correctCategory: 'Air Animals' }
      ]
    },
    {
      id: 'c4_2',
      instruction: 'Sort these by their state of matter',
      categories: ['Solid', 'Liquid', 'Gas'],
      items: [
        { id: 'rock', name: 'Rock', correctCategory: 'Solid' },
        { id: 'ice', name: 'Ice', correctCategory: 'Solid' },
        { id: 'water', name: 'Water', correctCategory: 'Liquid' },
        { id: 'juice', name: 'Juice', correctCategory: 'Liquid' },
        { id: 'air', name: 'Air', correctCategory: 'Gas' },
        { id: 'steam', name: 'Steam', correctCategory: 'Gas' }
      ]
    }
  ] as CategoryQuestion[]
};

// Grade selection options
export const gradeOptions = [
  { value: 'grade1', label: 'Grade 1', description: 'Basic relationships and simple concepts' },
  { value: 'grade2', label: 'Grade 2', description: 'Comparative logic and everyday connections' },
  { value: 'grade3', label: 'Grade 3', description: 'Age, size, and order reasoning' },
  { value: 'grade4', label: 'Grade 4', description: 'Abstract reasoning and complex relationships' }
];

export type GradeLevel = 'grade1' | 'grade2' | 'grade3' | 'grade4';
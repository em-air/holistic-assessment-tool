// Critical Thinking Quiz Data

export interface AnalogyQuestion {
  id: string;
  question: string;
  image?: string; // Optional image for the question
  choices: string[];
  correctAnswer: number; // index of correct choice
  explanation?: string;
}

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

// Analogy Questions by Grade Level
export const analogyQuestions = {
  grade1: [
    {
      id: 'g1_1',
      question: 'If cats meow, then dogs ___',
      image: 'https://images.unsplash.com/photo-1679904486411-8b67c253b218?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687',
      choices: ['bark', 'fly', 'swim'],
      correctAnswer: 0,
      explanation: 'Dogs bark just like cats meow'
    },
    {
      id: 'g1_2',
      question: 'If the sun is hot, ice is ___',
      image: 'https://img.pikbest.com/png-images/qianku/a-piece-of-ice-and-the-sun_2196335.png!sw800',
      choices: ['cold', 'warm', 'bright'],
      correctAnswer: 0,
      explanation: 'Ice is the opposite of hot - it is cold'
    },
    {
      id: 'g1_3',
      question: 'If a bird has wings, a fish has ___',
      image: 'https://media.istockphoto.com/id/1383049107/vector/goldfish-close-up-on-a-white-background-character.jpg?s=612x612&w=0&k=20&c=XMBE_Cm0WM5fyQpBAmPtczJsdDcgjqBy6jAkyp8bQsE=',
      choices: ['fins', 'fur', 'leaves'],
      correctAnswer: 0,
      explanation: 'Fish use fins to swim, like birds use wings to fly'
    },
    {
      id: 'g1_4',
      question: 'If people walk, cars ___',
      image: 'https://image.cnbcfm.com/api/v1/image/106371067-1580811346910gettyimages-157603740.jpeg?v=1580811486',
      choices: ['drive', 'fly', 'swim'],
      correctAnswer: 0,
      explanation: 'Cars drive on roads like people walk on paths'
    },
    {
      id: 'g1_5',
      question: 'If rain is wet, fire is ___',
      image: 'https://images.unsplash.com/photo-1555165498-52fb517c055b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070',
      choices: ['hot', 'cold', 'blue'],
      correctAnswer: 0,
      explanation: 'Fire is hot, which is different from wet rain'
    }
  ] as AnalogyQuestion[],

  grade2: [
    {
      id: 'g2_1',
      question: 'Day is to sun as night is to ___',
      image: 'https://images.unsplash.com/photo-1590418606746-018840f9cd0f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1974',
      choices: ['moon', 'cloud', 'star'],
      correctAnswer: 0,
      explanation: 'The moon lights up the night like the sun lights up the day'
    },
    {
      id: 'g2_2',
      question: 'Pen is to write as brush is to ___',
      image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop&crop=center',
      choices: ['paint', 'eat', 'walk'],
      correctAnswer: 0,
      explanation: 'We use a brush to paint, just like we use a pen to write'
    },
    {
      id: 'g2_3',
      question: 'Cow is to milk as hen is to ___',
      image: 'https://images.unsplash.com/photo-1580866177074-5c0b1b924d32?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170',
      choices: ['egg', 'wool', 'grass'],
      correctAnswer: 0,
      explanation: 'Hens give us eggs, like cows give us milk'
    },
    {
      id: 'g2_4',
      question: 'Eyes are to see as ears are to ___',
      image: 'https://images.unsplash.com/photo-1757041036433-e26807bda7be?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZWFyJTIwaGVhcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600',
      choices: ['hear', 'smell', 'touch'],
      correctAnswer: 0,
      explanation: 'We use our ears to hear, like we use our eyes to see'
    },
    {
      id: 'g2_5',
      question: 'Kitchen is to cook as bedroom is to ___',
      image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170',
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
        { id: 'five', name: 'Five', image: 'https://plus.unsplash.com/premium_photo-1669349127530-23d9e3dab307?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=880', correctCategory: 'Numbers' },
      ]
    }
  ] as CategoryQuestion[],

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
  ] as CategoryQuestion[],

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
  ] as CategoryQuestion[],

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
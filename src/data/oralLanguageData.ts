// Types and data for Oral Language Quiz
export interface OralLanguageOption {
  id: string;
  text: string;
  image?: string;
  isCorrect: boolean;
}

export interface SequenceImage {
  id: string;
  image: string;
  correctOrder: number; // 1, 2, 3 for the correct sequence
  description?: string;
}

export interface OralLanguageQuestion {
  id: string;
  type: 'vocabulary' | 'sentence-building' | 'storytelling' | 'story-retell';
  level: number;
  question: string;
  image: string;
  options: OralLanguageOption[];
  sequenceImages?: SequenceImage[]; // For storytelling sequence questions
  correctSequence?: string[]; // Array of image IDs in correct order
  feedback?: {
    correct: string;
    incorrect: string;
  };
}

export interface QuizCategory {
  id: 'vocabulary' | 'sentence-building' | 'storytelling' | 'story-retell';
  title: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
  icon: string;
  color: string;
  questions: OralLanguageQuestion[];
}

// Translations for the interface
export const oralLanguageTranslations = {
  en: {
    title: "Oral Language Assessment",
    subtitle: "Choose an activity to test language skills",
    backToCategories: "Back",
    level: "Level",
    question: "Question",
    of: "of",
    correct: "Correct!",
    tryAgain: "Try again!",
    nextQuestion: "Next Question",
    complete: "Quiz Complete!",
    score: "Score",
    restart: "Restart",
    backToSelection: "Back",
    excellent: "Excellent work!",
    good: "Good job!",
    keepTrying: "Keep practicing!"
  },
  ar: {
    title: "تقييم اللغة الشفهية",
    subtitle: "اختر نشاطاً لاختبار المهارات اللغوية",
    backToCategories: "العودة إلى الفئات",
    level: "المستوى",
    question: "السؤال",
    of: "من",
    correct: "صحيح!",
    tryAgain: "حاول مرة أخرى!",
    nextQuestion: "السؤال التالي",
    complete: "اكتمل الاختبار!",
    score: "النتيجة",
    restart: "إعادة البدء",
    backToSelection: "العودة إلى الاختيار",
    excellent: "عمل ممتاز!",
    good: "أحسنت!",
    keepTrying: "استمر في التدريب!"
  }
};

// Quiz categories data
export const oralLanguageCategories: QuizCategory[] = [
  {
    id: 'vocabulary',
    title: {
      en: 'Vocabulary & Naming (Name It!)',
      ar: 'المفردات والتسمية (اذكر اسمها!)'
    },
    description: {
      en: 'Identify and name objects, actions, and categories',
      ar: 'تحديد وتسمية الأشياء والأفعال والفئات'
    },
    icon: '🏷️',
    color: 'bg-blue-500',
    questions: [
      // Level 1: Everyday items
      {
        id: 'vocab_1_1',
        type: 'vocabulary',
        level: 1,
        question: 'What is this?',
        image: 'https://media.istockphoto.com/id/1439436349/photo/red-apple-isolated-on-white-background-clipping-path-full-depth-of-field.jpg?s=1024x1024&w=is&k=20&c=nLsFHzSx_Xjfeh9CvYEZ2DISi2ASdRvB2fFnoJaMu_0=',
        options: [
          { id: 'a', text: 'Apple', isCorrect: true },
          { id: 'b', text: 'Orange', isCorrect: false },
          { id: 'c', text: 'Banana', isCorrect: false }
        ],
        feedback: {
          correct: 'Great! This is an apple.',
          incorrect: 'This is an apple. Try to remember!'
        }
      },
      {
        id: 'vocab_1_2',
        type: 'vocabulary',
        level: 1,
        question: 'What is this?',
        image: 'https://media.istockphoto.com/id/2124102567/photo/orange-fruit-with-leaf.jpg?s=1024x1024&w=is&k=20&c=RB8bCCUKQTTOZngeJz8YQ9Q9qoLI4AHpQlQUfipwvH4=',
        options: [
          { id: 'a', text: 'Orange', isCorrect: true },
          { id: 'b', text: 'Apple', isCorrect: false },
          { id: 'c', text: 'Banana', isCorrect: false }
        ],
        feedback: {
          correct: 'Excellent! This is an apple.',
          incorrect: 'This is an apple. It\'s red and sweet!'
        }
      },
      {
        id: 'vocab_1_3',
        type: 'vocabulary',
        level: 1,
        question: 'What is this?',
        image: 'https://images.unsplash.com/photo-1494905998402-395d579af36f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        options: [
          { id: 'a', text: 'Bus', isCorrect: false },
          { id: 'b', text: 'Bicycle', isCorrect: false },
          { id: 'c', text: 'Car', isCorrect: true }
        ],
        feedback: {
          correct: 'Perfect! This is a car.',
          incorrect: 'This is a car. It has four wheels!'
        }
      },
      // Level 2: Actions
      {
        id: 'vocab_2_1',
        type: 'vocabulary',
        level: 2,
        question: 'What is the person doing?',
        image: 'https://cdn.pixabay.com/photo/2017/02/03/05/32/man-2034538_1280.png',
        options: [
          { id: 'a', text: 'Walking', isCorrect: false },
          { id: 'b', text: 'Running', isCorrect: true },
          { id: 'c', text: 'Jumping', isCorrect: false }
        ],
        feedback: {
          correct: 'Great! The person is running.',
          incorrect: 'The person is running fast!'
        }
      },
      {
        id: 'vocab_2_2',
        type: 'vocabulary',
        level: 2,
        question: 'What is the person doing?',
        image: 'https://media.istockphoto.com/id/1208379871/photo/close-up-of-young-happy-woman-eating-pasta-at-dining-table.jpg?s=1024x1024&w=is&k=20&c=AuDLNG7W6sK-Abmh7q7t_3GuvTD3BGa3T2Ip0D34VY0=',
        options: [
          { id: 'a', text: 'Drinking', isCorrect: false },
          { id: 'b', text: 'Sleeping', isCorrect: false },
          { id: 'c', text: 'Eating', isCorrect: true }
        ],
        feedback: {
          correct: 'Excellent! The person is eating.',
          incorrect: 'The person is eating food!'
        }
      },
      // Level 3: Categories
      {
        id: 'vocab_3_1',
        type: 'vocabulary',
        level: 3,
        question: 'Which of these are fruits?',
        image: 'https://media.istockphoto.com/id/133305215/photo/fresh-fruits.jpg?s=1024x1024&w=is&k=20&c=at3L_fswbzkYfVfRT6kE8_R8j7Abpd0Up8v0PJpLb_E=',
        options: [
          { id: 'a', text: 'Apple, Orange, Banana', isCorrect: true },
          { id: 'b', text: 'Apple, Cherry, Grape', isCorrect: false },
          { id: 'c', text: 'Mango, Pineapple, Kiwi', isCorrect: false }
        ],
        feedback: {
          correct: 'Perfect! These are all fruits.',
          incorrect: 'Fruits are things we eat that grow on trees!'
        }
      }
    ]
  },
  {
    id: 'sentence-building',
    title: {
      en: 'Sentence Building (Picture Talk)',
      ar: 'بناء الجمل (الحديث عن الصور)'
    },
    description: {
      en: 'Understand sentence structure and meaning from pictures',
      ar: 'فهم بناء الجملة والمعنى من الصور'
    },
    icon: '💬',
    color: 'bg-green-500',
    questions: [
      {
        id: 'sentence_1_1',
        type: 'sentence-building',
        level: 1,
        question: 'Who is in the picture?',
        image: 'https://cdn.pixabay.com/photo/2019/10/18/19/50/boy-and-dog-in-field-4560039_1280.jpg',
        options: [
          { id: 'a', text: 'A boy', isCorrect: true },
          { id: 'b', text: 'A girl', isCorrect: false },
          { id: 'c', text: 'A man', isCorrect: false }
        ],
        feedback: {
          correct: 'Right! There is a boy in the picture.',
          incorrect: 'Look carefully - there is a boy in the picture!'
        }
      },
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
        ],
        feedback: {
          correct: 'Excellent! The boy is feeding the dog.',
          incorrect: 'The boy is giving food to the dog!'
        }
      },
      {
        id: 'sentence_3_1',
        type: 'sentence-building',
        level: 3,
        question: 'Why do you think he is doing that?',
        image: 'https://cdn.pixabay.com/photo/2018/06/12/15/08/question-mark-3470783_1280.jpg',
        options: [
          { id: 'a', text: 'Because the dog is hungry', isCorrect: true },
          { id: 'b', text: 'Because he is bored', isCorrect: false },
          { id: 'c', text: 'Because it is raining', isCorrect: false }
        ],
        feedback: {
          correct: 'Great thinking! Dogs need food when they are hungry.',
          incorrect: 'Think about why animals need food!'
        }
      }
    ]
  },
  {
    id: 'storytelling',
    title: {
      en: 'Story Sequencing (Put in Order)',
      ar: 'ترتيب القصة (رتب بالترتيب)'
    },
    description: {
      en: 'Arrange pictures in the correct story sequence',
      ar: 'رتب الصور بالتسلسل الصحيح للقصة'
    },
    icon: '📖',
    color: 'bg-purple-500',
    questions: [
      {
        id: 'story_1_1',
        type: 'storytelling',
        level: 1,
        question: 'Put these pictures in the right order to tell the story of "Getting Ready for School"',
        image: '', // Not used for sequence questions
        options: [], // Not used for sequence questions
        sequenceImages: [
          {
            id: 'wake_up',
            image: 'https://images.pexels.com/photos/7504649/pexels-photo-7504649.jpeg',
            correctOrder: 1,
            description: 'Child waking up in bed'
          },
          {
            id: 'go_to_school',
            image: 'https://pixabay.com/images/download/dimitrisvetsikas1969-student-1666118_1920.jpg',
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
        image: '', // Not used for sequence questions
        options: [], // Not used for sequence questions
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
          correct: 'Excellent! You know how to make a sandwich step by step.',
          incorrect: 'Think about what you need to do first to make a sandwich!'
        }
      },
      {
        id: 'story_3_1',
        type: 'storytelling',
        level: 3,
        question: 'Put these pictures in the right order to tell the story of "Planting a Flower"',
        image: '', // Not used for sequence questions
        options: [], // Not used for sequence questions
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
          correct: 'Amazing! You understand how plants grow from seeds.',
          incorrect: 'Think about what needs to happen first for a flower to grow!'
        }
      }
    ]
  },
  {
    id: 'story-retell',
    title: {
      en: 'Story Retell',
      ar: 'إعادة سرد القصة'
    },
    description: {
      en: 'Read a story and retell it using Beginning, Middle, and End',
      ar: 'اقرأ قصة وأعد سردها باستخدام البداية والوسط والنهاية'
    },
    icon: '📚',
    color: 'bg-indigo-500',
    questions: [] // This will navigate to the separate Story Retell quiz
  }
];
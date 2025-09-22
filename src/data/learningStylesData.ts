export interface QuizOption {
  id: string;
  text: {
    en: string;
    ar: string; // Arabic text (placeholder for now)
  };
  style: 'visual' | 'auditory' | 'reading-writing';
}

export interface QuizQuestion {
  id: string;
  category: 'visual' | 'auditory' | 'reading-writing';
  question: {
    en: string;
    ar: string; // Arabic text (placeholder for now)
  };
  options: QuizOption[];
}

export interface LearningStyle {
  id: 'visual' | 'auditory' | 'reading-writing';
  name: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
  color: string;
  icon: string;
}

export const learningStyles: LearningStyle[] = [
  {
    id: 'visual',
    name: {
      en: 'Visual Learner',
      ar: 'المتعلم البصري'
    },
    description: {
      en: 'You learn best through visual aids, diagrams, charts, and seeing information presented visually.',
      ar: 'تتعلم بشكل أفضل من خلال المساعدات البصرية والمخططات والرسوم البيانية ورؤية المعلومات مقدمة بصرياً.'
    },
    color: 'bg-blue-500',
    icon: '👁️'
  },
  {
    id: 'auditory',
    name: {
      en: 'Auditory Learner',
      ar: 'المتعلم السمعي'
    },
    description: {
      en: 'You learn best through listening, discussions, and hearing information explained verbally.',
      ar: 'تتعلم بشكل أفضل من خلال الاستماع والمناقشات وسماع المعلومات شرح شفهياً.'
    },
    color: 'bg-green-500',
    icon: '🎧'
  },
  {
    id: 'reading-writing',
    name: {
      en: 'Reading/Writing Learner',
      ar: 'المتعلم القرائي/الكتابي'
    },
    description: {
      en: 'You learn best through reading, writing, taking notes, and working with text-based materials.',
      ar: 'تتعلم بشكل أفضل من خلال القراءة والكتابة وتدوين الملاحظات والعمل مع المواد النصية.'
    },
    color: 'bg-purple-500',
    icon: '📖'
  }
];

export const quizQuestions: QuizQuestion[] = [
  // Visual Learner Questions
  {
    id: 'visual-q1',
    category: 'visual',
    question: {
      en: 'When your teacher explains something new, you understand it best when...',
      ar: 'عندما يشرح لك المعلم شيئاً جديداً، تفهمه بشكل أفضل عندما...'
    },
    options: [
      {
        id: 'visual-q1-a',
        text: {
          en: 'You see pictures or charts',
          ar: 'ترى الصور أو المخططات'
        },
        style: 'visual'
      },
      {
        id: 'visual-q1-b',
        text: {
          en: 'You listen to the explanation',
          ar: 'تستمع إلى الشرح'
        },
        style: 'auditory'
      },
      {
        id: 'visual-q1-c',
        text: {
          en: 'You do the activity yourself',
          ar: 'تقوم بالنشاط بنفسك'
        },
        style: 'reading-writing'
      }
    ]
  },
  {
    id: 'visual-q2',
    category: 'visual',
    question: {
      en: 'If you have to remember a list of things, what helps you most?',
      ar: 'إذا كان عليك تذكر قائمة من الأشياء، ما الذي يساعدك أكثر؟'
    },
    options: [
      {
        id: 'visual-q2-a',
        text: {
          en: 'Drawing or looking at a mind map',
          ar: 'الرسم أو النظر إلى خريطة ذهنية'
        },
        style: 'visual'
      },
      {
        id: 'visual-q2-b',
        text: {
          en: 'Saying the list out loud',
          ar: 'قول القائمة بصوت عالٍ'
        },
        style: 'auditory'
      },
      {
        id: 'visual-q2-c',
        text: {
          en: 'Acting out the steps',
          ar: 'تمثيل الخطوات'
        },
        style: 'reading-writing'
      }
    ]
  },
  
  // Auditory Learner Questions
  {
    id: 'auditory-q1',
    category: 'auditory',
    question: {
      en: 'You are learning a song for a school event. What do you enjoy most?',
      ar: 'تتعلم أغنية لحدث مدرسي. ما الذي تستمتع به أكثر؟'
    },
    options: [
      {
        id: 'auditory-q1-a',
        text: {
          en: 'Listening to the tune many times',
          ar: 'الاستماع إلى اللحن مرات عديدة'
        },
        style: 'auditory'
      },
      {
        id: 'auditory-q1-b',
        text: {
          en: 'Reading the lyrics silently',
          ar: 'قراءة كلمات الأغنية بصمت'
        },
        style: 'reading-writing'
      },
      {
        id: 'auditory-q1-c',
        text: {
          en: 'Dancing or clapping to the beat',
          ar: 'الرقص أو التصفيق على الإيقاع'
        },
        style: 'visual'
      }
    ]
  },
  {
    id: 'auditory-q2',
    category: 'auditory',
    question: {
      en: 'When you are confused about homework, what do you prefer?',
      ar: 'عندما تشعر بالحيرة حول الواجب المنزلي، ماذا تفضل؟'
    },
    options: [
      {
        id: 'auditory-q2-a',
        text: {
          en: 'Ask someone to explain it aloud',
          ar: 'أطلب من أحد أن يشرحه بصوت عالٍ'
        },
        style: 'auditory'
      },
      {
        id: 'auditory-q2-b',
        text: {
          en: 'Look for a video with sound',
          ar: 'أبحث عن فيديو بصوت'
        },
        style: 'auditory'
      },
      {
        id: 'auditory-q2-c',
        text: {
          en: 'Read the written steps',
          ar: 'أقرأ الخطوات المكتوبة'
        },
        style: 'reading-writing'
      }
    ]
  },

  // Reading/Writing Learner Questions
  {
    id: 'reading-q1',
    category: 'reading-writing',
    question: {
      en: 'If you are trying to learn a new game, you like to...',
      ar: 'إذا كنت تحاول تعلم لعبة جديدة، تحب أن...'
    },
    options: [
      {
        id: 'reading-q1-a',
        text: {
          en: 'Read the instructions carefully',
          ar: 'تقرأ التعليمات بعناية'
        },
        style: 'reading-writing'
      },
      {
        id: 'reading-q1-b',
        text: {
          en: 'Watch someone demonstrate',
          ar: 'تشاهد أحداً يوضح'
        },
        style: 'visual'
      },
      {
        id: 'reading-q1-c',
        text: {
          en: 'Try it and figure it out while playing',
          ar: 'تجربها واستكشافها أثناء اللعب'
        },
        style: 'auditory'
      }
    ]
  },
  {
    id: 'reading-q2',
    category: 'reading-writing',
    question: {
      en: 'You need to remember a science fact. What works best?',
      ar: 'تحتاج لتذكر حقيقة علمية. ما الذي يعمل بشكل أفضل؟'
    },
    options: [
      {
        id: 'reading-q2-a',
        text: {
          en: 'Write it down a few times',
          ar: 'أكتبها عدة مرات'
        },
        style: 'reading-writing'
      },
      {
        id: 'reading-q2-b',
        text: {
          en: 'Say it aloud',
          ar: 'أقولها بصوت عالٍ'
        },
        style: 'auditory'
      },
      {
        id: 'reading-q2-c',
        text: {
          en: 'Draw a picture of it',
          ar: 'أرسم صورة عنها'
        },
        style: 'visual'
      }
    ]
  }
];

export const quizTexts = {
  title: {
    en: 'Learning Styles Quiz',
    ar: 'اختبار أساليب التعلم'
  },
  subtitle: {
    en: 'Discover how you learn best!',
    ar: 'اكتشف كيف تتعلم بأفضل طريقة!'
  },
  startButton: {
    en: 'Start Quiz',
    ar: 'ابدأ الاختبار'
  },
  nextButton: {
    en: 'Next Question',
    ar: 'السؤال التالي'
  },
  finishButton: {
    en: 'See Results',
    ar: 'عرض النتائج'
  },
  resultTitle: {
    en: 'Your Learning Style Results',
    ar: 'نتائج أسلوب التعلم الخاص بك'
  },
  dominantStyle: {
    en: 'Your dominant learning style is:',
    ar: 'أسلوب التعلم السائد لديك هو:'
  },
  retakeButton: {
    en: 'Retake Quiz',
    ar: 'إعادة الاختبار'
  },
  questionProgress: {
    en: 'Question',
    ar: 'السؤال'
  },
  of: {
    en: 'of',
    ar: 'من'
  }
};
import type { LearningStyleResultId } from '../services/learningStylesService';

export interface LearningStyle {
  id: LearningStyleResultId;
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
    name: { en: 'Visual Learner', ar: 'المتعلم البصري' },
    description: {
      en: 'You learn best through visual aids, diagrams, charts, and seeing information presented visually.',
      ar: 'تتعلم بشكل أفضل من خلال المساعدات البصرية والمخططات والرسوم البيانية ورؤية المعلومات مقدمة بصرياً.',
    },
    color: 'bg-blue-500',
    icon: '👁️',
  },
  {
    id: 'auditory',
    name: { en: 'Auditory Learner', ar: 'المتعلم السمعي' },
    description: {
      en: 'You learn best through listening, discussions, and hearing information explained verbally.',
      ar: 'تتعلم بشكل أفضل من خلال الاستماع والمناقشات وسماع المعلومات شرح شفهياً.',
    },
    color: 'bg-green-500',
    icon: '🎧',
  },
  {
    id: 'reading-writing',
    name: { en: 'Reading/Writing Learner', ar: 'المتعلم القرائي/الكتابي' },
    description: {
      en: 'You learn best through reading, writing, taking notes, and working with text-based materials.',
      ar: 'تتعلم بشكل أفضل من خلال القراءة والكتابة وتدوين الملاحظات والعمل مع المواد النصية.',
    },
    color: 'bg-purple-500',
    icon: '📖',
  },
  {
    id: 'mixed-visual-auditory',
    name: { en: 'Visual & Auditory Learner', ar: 'المتعلم البصري والسمعي' },
    description: {
      en: 'You learn well through both visual aids and listening. Mix diagrams and discussions for best results.',
      ar: 'تتعلم بشكل جيد من خلال المساعدات البصرية والاستماع. امزج المخططات والمناقشات للحصول على أفضل النتائج.',
    },
    color: 'bg-indigo-500',
    icon: '👁️🎧',
  },
  {
    id: 'mixed-visual-reading-writing',
    name: { en: 'Visual & Reading/Writing Learner', ar: 'المتعلم البصري والقرائي/الكتابي' },
    description: {
      en: 'You learn well through both seeing information visually and working with written text and notes.',
      ar: 'تتعلم بشكل جيد من خلال رؤية المعلومات بصرياً والعمل مع النصوص المكتوبة والملاحظات.',
    },
    color: 'bg-violet-500',
    icon: '👁️📖',
  },
  {
    id: 'mixed-auditory-reading-writing',
    name: { en: 'Auditory & Reading/Writing Learner', ar: 'المتعلم السمعي والقرائي/الكتابي' },
    description: {
      en: 'You learn well through both listening and working with written materials. Combine both for best retention.',
      ar: 'تتعلم بشكل جيد من خلال الاستماع والعمل مع المواد المكتوبة. امزج الاثنين لأفضل استيعاب.',
    },
    color: 'bg-teal-500',
    icon: '🎧📖',
  },
  {
    id: 'mixed-all',
    name: { en: 'Mixed Learner', ar: 'المتعلم المتعدد الأساليب' },
    description: {
      en: 'You learn equally well through visual, auditory, and reading/writing methods — a true multimodal learner.',
      ar: 'تتعلم بشكل جيد من خلال الأساليب البصرية والسمعية والقرائية/الكتابية — أنت متعلم متعدد الأساليب حقيقي.',
    },
    color: 'bg-amber-500',
    icon: '🌟',
  },
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
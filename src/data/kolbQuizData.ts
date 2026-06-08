// Kolb Learning Style Quiz Data
// 16-question balanced set across AE / RO / AC / CE dimensions
// Designed for children aged 6–12

export type KolbDimension = 'AE' | 'RO' | 'AC' | 'CE';

export type KolbStyleId =
  | 'Accommodating'
  | 'Diverging'
  | 'Assimilating'
  | 'Converging'
  | 'Mixed Profile';

export interface KolbOption {
  id: 'A' | 'B' | 'C' | 'D';
  label: string;
  description: string;
  example: string;
  dimension: KolbDimension;
}

export interface KolbQuestion {
  id: number;
  question: string;
  options: KolbOption[];
}

export const kolbQuestions: KolbQuestion[] = [
  {
    id: 1,
    question: 'When you get a new board game, what do you do first?',
    options: [
      {
        id: 'A',
        label: 'Start playing right away',
        description: 'I learn by trying things myself.',
        example: 'I open the box and begin playing without reading rules first.',
        dimension: 'AE',
      },
      {
        id: 'B',
        label: 'Watch someone else play first',
        description: 'I learn by watching before trying.',
        example: 'I see my friend play before I join.',
        dimension: 'RO',
      },
      {
        id: 'C',
        label: 'Read the rules carefully',
        description: 'I like understanding instructions first.',
        example: 'I read the instruction booklet before starting.',
        dimension: 'AC',
      },
      {
        id: 'D',
        label: 'Think of real-life examples',
        description: 'I understand better when I connect to real life.',
        example: 'I compare the game to something I already know.',
        dimension: 'CE',
      },
    ],
  },
  {
    id: 2,
    question: 'When learning math in class, you prefer:',
    options: [
      {
        id: 'A',
        label: 'Try problems immediately',
        description: 'I learn by practicing right away.',
        example: 'I solve questions as soon as the teacher explains.',
        dimension: 'AE',
      },
      {
        id: 'B',
        label: 'Watch examples first',
        description: 'I learn by observing how it\'s done.',
        example: 'I watch the teacher solve one problem first.',
        dimension: 'RO',
      },
      {
        id: 'C',
        label: 'Understand the formula first',
        description: 'I like clear rules and explanations.',
        example: 'I learn the formula before doing exercises.',
        dimension: 'AC',
      },
      {
        id: 'D',
        label: 'Think of real-life uses',
        description: 'I learn better with real examples.',
        example: 'I think of money when learning addition.',
        dimension: 'CE',
      },
    ],
  },
  {
    id: 3,
    question: 'When solving a puzzle, you usually:',
    options: [
      {
        id: 'A',
        label: 'Try different moves quickly',
        description: 'I experiment until something works.',
        example: 'I keep trying puzzle pieces until they fit.',
        dimension: 'AE',
      },
      {
        id: 'B',
        label: 'Look carefully before acting',
        description: 'I observe before I try.',
        example: 'I study the puzzle before touching pieces.',
        dimension: 'RO',
      },
      {
        id: 'C',
        label: 'Plan the solution first',
        description: 'I think step-by-step before acting.',
        example: 'I decide where pieces go before moving them.',
        dimension: 'AC',
      },
      {
        id: 'D',
        label: 'Relate it to real objects',
        description: 'I connect puzzles to real things.',
        example: 'I imagine it as a real picture I\'m building.',
        dimension: 'CE',
      },
    ],
  },
  {
    id: 4,
    question: 'When learning something new on YouTube, you:',
    options: [
      {
        id: 'A',
        label: 'Try it while watching',
        description: 'I learn by doing immediately.',
        example: 'I follow along and try it as the video plays.',
        dimension: 'AE',
      },
      {
        id: 'B',
        label: 'Watch the whole video first',
        description: 'I learn by observing first.',
        example: 'I watch before trying anything.',
        dimension: 'RO',
      },
      {
        id: 'C',
        label: 'Understand the steps clearly',
        description: 'I focus on instructions and logic.',
        example: 'I pause to understand each step.',
        dimension: 'AC',
      },
      {
        id: 'D',
        label: 'Think how it applies in life',
        description: 'I connect it to real situations.',
        example: 'I think where I could use this skill.',
        dimension: 'CE',
      },
    ],
  },
  {
    id: 5,
    question: 'In group projects, you tend to:',
    options: [
      {
        id: 'A',
        label: 'Start doing tasks quickly',
        description: 'I like to take action fast.',
        example: 'I start building or writing immediately.',
        dimension: 'AE',
      },
      {
        id: 'B',
        label: 'Watch what others are doing first',
        description: 'I observe before joining in.',
        example: 'I see how others contribute first.',
        dimension: 'RO',
      },
      {
        id: 'C',
        label: 'Plan everything first',
        description: 'I like structure and planning.',
        example: 'I create a plan before starting work.',
        dimension: 'AC',
      },
      {
        id: 'D',
        label: 'Focus on real outcomes',
        description: 'I care about practical results.',
        example: 'I think about how the project helps people.',
        dimension: 'CE',
      },
    ],
  },
  {
    id: 6,
    question: 'When you make a mistake, you:',
    options: [
      {
        id: 'A',
        label: 'Try again immediately',
        description: 'I learn by retrying quickly.',
        example: 'I try again without stopping too long.',
        dimension: 'AE',
      },
      {
        id: 'B',
        label: 'Think about what happened',
        description: 'I reflect before trying again.',
        example: 'I think why I got it wrong.',
        dimension: 'RO',
      },
      {
        id: 'C',
        label: 'Figure out the rule',
        description: 'I try to understand the logic.',
        example: 'I find out what rule I missed.',
        dimension: 'AC',
      },
      {
        id: 'D',
        label: 'Connect it to real experience',
        description: 'I learn through real examples.',
        example: 'I remember a similar mistake before.',
        dimension: 'CE',
      },
    ],
  },
  {
    id: 7,
    question: 'When reading instructions, you:',
    options: [
      {
        id: 'A',
        label: 'Skip and start doing',
        description: 'I learn by doing first.',
        example: 'I start without reading everything.',
        dimension: 'AE',
      },
      {
        id: 'B',
        label: 'Read carefully first',
        description: 'I like to observe before acting.',
        example: 'I read everything before starting.',
        dimension: 'RO',
      },
      {
        id: 'C',
        label: 'Analyze each step',
        description: 'I focus on structure and logic.',
        example: 'I break instructions into steps.',
        dimension: 'AC',
      },
      {
        id: 'D',
        label: 'Think how it applies',
        description: 'I connect instructions to real use.',
        example: 'I imagine using it in real life.',
        dimension: 'CE',
      },
    ],
  },
  {
    id: 8,
    question: 'When playing sports or games, you:',
    options: [
      {
        id: 'A',
        label: 'Jump in and play',
        description: 'I learn by doing.',
        example: 'I start playing without much planning.',
        dimension: 'AE',
      },
      {
        id: 'B',
        label: 'Watch others first',
        description: 'I learn by observation.',
        example: 'I watch experienced players first.',
        dimension: 'RO',
      },
      {
        id: 'C',
        label: 'Think about strategy',
        description: 'I plan before acting.',
        example: 'I think about best moves before playing.',
        dimension: 'AC',
      },
      {
        id: 'D',
        label: 'Think about real-life skills',
        description: 'I connect skills to real life.',
        example: 'I think how sports skills help in real life.',
        dimension: 'CE',
      },
    ],
  },
  {
    id: 9,
    question: 'When learning science, you prefer:',
    options: [
      {
        id: 'A',
        label: 'Do experiments',
        description: 'I learn by trying things.',
        example: 'I mix things to see what happens.',
        dimension: 'AE',
      },
      {
        id: 'B',
        label: 'Watch experiments first',
        description: 'I observe before trying.',
        example: 'I watch teacher demonstrations.',
        dimension: 'RO',
      },
      {
        id: 'C',
        label: 'Understand theory',
        description: 'I like explanations and rules.',
        example: 'I learn why things happen.',
        dimension: 'AC',
      },
      {
        id: 'D',
        label: 'Relate to real life',
        description: 'I connect science to real situations.',
        example: 'I think about weather or cooking.',
        dimension: 'CE',
      },
    ],
  },
  {
    id: 10,
    question: 'When learning from mistakes in games, you:',
    options: [
      {
        id: 'A',
        label: 'Try again quickly',
        description: 'I improve by repeating actions.',
        example: 'I replay the level immediately.',
        dimension: 'AE',
      },
      {
        id: 'B',
        label: 'Watch what went wrong',
        description: 'I observe before retrying.',
        example: 'I check what caused the loss.',
        dimension: 'RO',
      },
      {
        id: 'C',
        label: 'Figure out strategy',
        description: 'I think logically about solutions.',
        example: 'I change my strategy for next try.',
        dimension: 'AC',
      },
      {
        id: 'D',
        label: 'Think of real-life lessons',
        description: 'I learn from real situations.',
        example: 'I compare it to real challenges.',
        dimension: 'CE',
      },
    ],
  },
  {
    id: 11,
    question: 'When studying for a test, you:',
    options: [
      {
        id: 'A',
        label: 'Practice questions',
        description: 'I learn by doing exercises.',
        example: 'I solve practice tests repeatedly.',
        dimension: 'AE',
      },
      {
        id: 'B',
        label: 'Review notes quietly',
        description: 'I learn by reflecting.',
        example: 'I read my notes carefully.',
        dimension: 'RO',
      },
      {
        id: 'C',
        label: 'Memorize concepts',
        description: 'I focus on understanding rules.',
        example: 'I memorize formulas and facts.',
        dimension: 'AC',
      },
      {
        id: 'D',
        label: 'Use real-life examples',
        description: 'I connect study to real world.',
        example: 'I think how math is used in shopping.',
        dimension: 'CE',
      },
    ],
  },
  {
    id: 12,
    question: 'When learning something hard, you:',
    options: [
      {
        id: 'A',
        label: 'Keep trying',
        description: 'I learn by persistence.',
        example: 'I keep attempting until I get it.',
        dimension: 'AE',
      },
      {
        id: 'B',
        label: 'Pause and think',
        description: 'I reflect before continuing.',
        example: 'I take time to think it through.',
        dimension: 'RO',
      },
      {
        id: 'C',
        label: 'Break it into steps',
        description: 'I use logic to simplify.',
        example: 'I divide the problem into parts.',
        dimension: 'AC',
      },
      {
        id: 'D',
        label: 'Relate to something familiar',
        description: 'I use real-life connections.',
        example: 'I compare it to something I already know.',
        dimension: 'CE',
      },
    ],
  },
  {
    id: 13,
    question: 'When someone explains something, you:',
    options: [
      {
        id: 'A',
        label: 'Try it immediately',
        description: 'I learn by doing.',
        example: 'I try what they said right away.',
        dimension: 'AE',
      },
      {
        id: 'B',
        label: 'Listen carefully',
        description: 'I observe and absorb information.',
        example: 'I focus on the explanation fully.',
        dimension: 'RO',
      },
      {
        id: 'C',
        label: 'Ask for logic behind it',
        description: 'I want to understand reasoning.',
        example: 'I ask why it works.',
        dimension: 'AC',
      },
      {
        id: 'D',
        label: 'Relate it to experience',
        description: 'I connect to real situations.',
        example: 'I think where I\'ve seen it before.',
        dimension: 'CE',
      },
    ],
  },
  {
    id: 14,
    question: 'When building something (like LEGO), you:',
    options: [
      {
        id: 'A',
        label: 'Start building freely',
        description: 'I learn by experimenting.',
        example: 'I build without instructions first.',
        dimension: 'AE',
      },
      {
        id: 'B',
        label: 'Look at instructions first',
        description: 'I observe before doing.',
        example: 'I study the manual before starting.',
        dimension: 'RO',
      },
      {
        id: 'C',
        label: 'Follow a plan step-by-step',
        description: 'I prefer structured logic.',
        example: 'I follow instructions exactly.',
        dimension: 'AC',
      },
      {
        id: 'D',
        label: 'Think how it looks in real life',
        description: 'I use real-world imagination.',
        example: 'I imagine what I\'m building in real life.',
        dimension: 'CE',
      },
    ],
  },
  {
    id: 15,
    question: 'When learning a new app or game, you:',
    options: [
      {
        id: 'A',
        label: 'Press buttons and explore',
        description: 'I learn by experimenting.',
        example: 'I try every feature to see what happens.',
        dimension: 'AE',
      },
      {
        id: 'B',
        label: 'Watch tutorial first',
        description: 'I observe before trying.',
        example: 'I watch a guide video.',
        dimension: 'RO',
      },
      {
        id: 'C',
        label: 'Read instructions or tips',
        description: 'I like structured learning.',
        example: 'I read help pages or guides.',
        dimension: 'AC',
      },
      {
        id: 'D',
        label: 'Relate to similar apps',
        description: 'I use past experience.',
        example: 'I compare it to apps I already know.',
        dimension: 'CE',
      },
    ],
  },
  {
    id: 16,
    question: 'When learning best, you feel:',
    options: [
      {
        id: 'A',
        label: 'Excited to try things',
        description: 'I learn by action.',
        example: 'I want to jump in and start immediately.',
        dimension: 'AE',
      },
      {
        id: 'B',
        label: 'Comfortable watching first',
        description: 'I prefer observation.',
        example: 'I feel safe watching before doing.',
        dimension: 'RO',
      },
      {
        id: 'C',
        label: 'Happy when things make sense',
        description: 'I like logical understanding.',
        example: 'I feel good when I understand rules.',
        dimension: 'AC',
      },
      {
        id: 'D',
        label: 'Best when connected to real life',
        description: 'I learn through experience.',
        example: 'I like when learning relates to real life.',
        dimension: 'CE',
      },
    ],
  },
];

// ─── Presentation data for each Kolb style ──────────────────────────

export interface KolbStylePresentation {
  id: KolbStyleId;
  name: string;
  tagline: string;
  description: string;
  strengths: string[];
  tips: string[];
  icon: string;
  color: string;
  gradient: string;
}

export const kolbStyles: KolbStylePresentation[] = [
  {
    id: 'Accommodating',
    name: 'The Doer',
    tagline: 'You learn best by diving in and trying things!',
    description:
      'You love taking action and exploring by doing. You are great at hands-on tasks and enjoy working in teams to get things done.',
    strengths: [
      'Takes action quickly',
      'Great at hands-on activities',
      'Adapts easily to new situations',
      'Works well in teams',
    ],
    tips: [
      'Try doing experiments and projects',
      'Learn by building and making things',
      'Work with friends on activities',
      'Use trial-and-error to discover new things',
    ],
    icon: '🚀',
    color: 'text-orange-600',
    gradient: 'from-orange-400 to-amber-500',
  },
  {
    id: 'Diverging',
    name: 'The Imagineer',
    tagline: 'You learn best by watching, feeling, and coming up with ideas!',
    description:
      'You are creative and love exploring ideas. You enjoy observing the world, imagining possibilities, and seeing things from different angles.',
    strengths: [
      'Highly creative and imaginative',
      'Great at brainstorming ideas',
      'Sees many perspectives',
      'Sensitive and empathetic',
    ],
    tips: [
      'Use art, stories, or drawing to explore topics',
      'Watch videos or demonstrations first',
      'Talk about how things connect to real life',
      'Work in groups to share and discuss ideas',
    ],
    icon: '🌈',
    color: 'text-purple-600',
    gradient: 'from-purple-400 to-pink-500',
  },
  {
    id: 'Assimilating',
    name: 'The Thinker',
    tagline: 'You learn best by thinking through ideas and understanding how things work!',
    description:
      'You love understanding ideas and theories. You enjoy quiet thinking, researching, and putting information together in a logical way.',
    strengths: [
      'Excellent at logical thinking',
      'Great at researching and organizing information',
      'Understands complex ideas well',
      'Patient and thorough',
    ],
    tips: [
      'Use charts, diagrams, and notes',
      'Read books and detailed explanations',
      'Take time to understand before acting',
      'Organize information into clear steps',
    ],
    icon: '🔬',
    color: 'text-blue-600',
    gradient: 'from-blue-400 to-indigo-500',
  },
  {
    id: 'Converging',
    name: 'The Problem Solver',
    tagline: 'You learn best by applying ideas to real problems!',
    description:
      'You are practical and love solving problems. You enjoy applying what you know to fix things and find solutions that actually work.',
    strengths: [
      'Excellent problem-solver',
      'Strong logical and technical thinking',
      'Good at applying knowledge to real tasks',
      'Focused and goal-oriented',
    ],
    tips: [
      'Work on puzzles, experiments, and challenges',
      'Apply what you learn to real-world tasks',
      'Use step-by-step methods to solve problems',
      'Try coding, building, or engineering activities',
    ],
    icon: '⚙️',
    color: 'text-green-600',
    gradient: 'from-green-400 to-teal-500',
  },
  {
    id: 'Mixed Profile',
    name: 'The All-Rounder',
    tagline: 'You use many different ways to learn — that\'s a superpower!',
    description:
      'You have a balanced mix of learning preferences. You can adapt to many styles, making you flexible and versatile in different situations.',
    strengths: [
      'Very flexible and adaptable',
      'Can learn in many different ways',
      'Works well in all kinds of situations',
      'Balances action and reflection',
    ],
    tips: [
      'Mix different learning methods together',
      'Try a bit of everything: reading, doing, watching, discussing',
      'Notice which method works best for each subject',
      'Use your flexibility to help others learn too',
    ],
    icon: '⭐',
    color: 'text-amber-600',
    gradient: 'from-amber-400 to-yellow-500',
  },
];

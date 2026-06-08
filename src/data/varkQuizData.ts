// VARK Learning Preferences Quiz Data
// Designed for children aged 6–12
// Based on the VARK framework (Visual, Auditory, Reading/Writing, Kinesthetic)
// Measures learning PREFERENCES, not fixed personality types.

export type LearningDimension = 'visual' | 'auditory' | 'reading' | 'kinesthetic';

export interface VarkOption {
  id: 'A' | 'B' | 'C' | 'D';
  label: string;
  example: string;
  dimension: LearningDimension;
}

export interface VarkQuestion {
  id: number;
  question: string;
  options: VarkOption[];
}

export const varkQuestions: VarkQuestion[] = [
  {
    id: 1,
    question: 'You get a new toy. How do you figure out how it works?',
    options: [
      { id: 'A', label: 'Look at the pictures on the box', example: 'I look at pictures to see what it should do.', dimension: 'visual' },
      { id: 'B', label: 'Ask someone to explain it', example: 'I ask a parent or friend how it works.', dimension: 'auditory' },
      { id: 'C', label: 'Read the instructions', example: 'I read the steps first.', dimension: 'reading' },
      { id: 'D', label: 'Start pressing buttons and trying things', example: 'I learn by testing it myself.', dimension: 'kinesthetic' },
    ],
  },
  {
    id: 2,
    question: 'Your teacher shows a new math problem. What helps most?',
    options: [
      { id: 'A', label: 'Seeing it drawn on the board', example: 'The teacher draws pictures or examples.', dimension: 'visual' },
      { id: 'B', label: 'Hearing the explanation', example: 'The teacher talks through the answer.', dimension: 'auditory' },
      { id: 'C', label: 'Reading the workbook example', example: 'I learn from written examples.', dimension: 'reading' },
      { id: 'D', label: 'Doing practice questions', example: 'I solve questions myself.', dimension: 'kinesthetic' },
    ],
  },
  {
    id: 3,
    question: 'You are learning a new game.',
    options: [
      { id: 'A', label: 'Watch someone play first', example: 'I learn by watching.', dimension: 'visual' },
      { id: 'B', label: 'Listen to the rules', example: 'Someone explains the game to me.', dimension: 'auditory' },
      { id: 'C', label: 'Read the rule sheet', example: 'I read how the game works.', dimension: 'reading' },
      { id: 'D', label: 'Play a round myself', example: 'I learn while playing.', dimension: 'kinesthetic' },
    ],
  },
  {
    id: 4,
    question: 'You need to build a LEGO model.',
    options: [
      { id: 'A', label: 'Follow the pictures', example: 'I use the diagrams.', dimension: 'visual' },
      { id: 'B', label: 'Have someone tell me the steps', example: 'Someone explains what to do.', dimension: 'auditory' },
      { id: 'C', label: 'Read the written instructions', example: 'I follow written directions.', dimension: 'reading' },
      { id: 'D', label: 'Build and adjust as I go', example: 'I learn through trial and error.', dimension: 'kinesthetic' },
    ],
  },
  {
    id: 5,
    question: 'When learning a new dance or sports move...',
    options: [
      { id: 'A', label: 'Watch it being demonstrated', example: 'I copy what I see.', dimension: 'visual' },
      { id: 'B', label: 'Listen to coaching instructions', example: 'I learn from what is said.', dimension: 'auditory' },
      { id: 'C', label: 'Read step-by-step directions', example: 'I learn from written steps.', dimension: 'reading' },
      { id: 'D', label: 'Practice it repeatedly', example: 'I learn by doing it many times.', dimension: 'kinesthetic' },
    ],
  },
  {
    id: 6,
    question: 'You need to remember homework.',
    options: [
      { id: 'A', label: 'See it written on the board', example: 'I remember by seeing it.', dimension: 'visual' },
      { id: 'B', label: 'Hear the teacher remind us', example: 'I remember by listening.', dimension: 'auditory' },
      { id: 'C', label: 'Write it down myself', example: 'Writing helps me remember.', dimension: 'reading' },
      { id: 'D', label: 'Start it right away', example: 'Doing it helps me remember.', dimension: 'kinesthetic' },
    ],
  },
  {
    id: 7,
    question: 'You are learning about animals.',
    options: [
      { id: 'A', label: 'See pictures and videos', example: 'I learn by looking.', dimension: 'visual' },
      { id: 'B', label: 'Listen to someone talk about them', example: 'I learn by listening.', dimension: 'auditory' },
      { id: 'C', label: 'Read facts about them', example: 'I learn by reading.', dimension: 'reading' },
      { id: 'D', label: 'Visit a zoo or interact with animals', example: 'I learn by experience.', dimension: 'kinesthetic' },
    ],
  },
  {
    id: 8,
    question: 'You get lost in a large building.',
    options: [
      { id: 'A', label: 'Look at a map', example: 'Pictures help me find my way.', dimension: 'visual' },
      { id: 'B', label: 'Ask someone for directions', example: 'I prefer spoken directions.', dimension: 'auditory' },
      { id: 'C', label: 'Read signs', example: 'Written information helps me.', dimension: 'reading' },
      { id: 'D', label: 'Walk around and explore', example: 'I figure it out by moving around.', dimension: 'kinesthetic' },
    ],
  },
  {
    id: 9,
    question: 'You want to learn a magic trick.',
    options: [
      { id: 'A', label: 'Watch a video', example: 'I learn by seeing.', dimension: 'visual' },
      { id: 'B', label: 'Listen to someone explain it', example: 'I learn by hearing.', dimension: 'auditory' },
      { id: 'C', label: 'Read instructions', example: 'I learn from written steps.', dimension: 'reading' },
      { id: 'D', label: 'Practice it myself', example: 'I learn through doing.', dimension: 'kinesthetic' },
    ],
  },
  {
    id: 10,
    question: 'When doing science...',
    options: [
      { id: 'A', label: 'Look at diagrams', example: 'Pictures help me understand.', dimension: 'visual' },
      { id: 'B', label: 'Listen to explanations', example: 'Talking helps me understand.', dimension: 'auditory' },
      { id: 'C', label: 'Read information', example: 'Reading helps me understand.', dimension: 'reading' },
      { id: 'D', label: 'Do the experiment', example: 'Hands-on learning helps me.', dimension: 'kinesthetic' },
    ],
  },
  {
    id: 11,
    question: 'You are learning a new board game.',
    options: [
      { id: 'A', label: 'Watch others play', example: 'I learn by watching.', dimension: 'visual' },
      { id: 'B', label: 'Listen to the rules', example: 'I learn by listening.', dimension: 'auditory' },
      { id: 'C', label: 'Read the rules', example: 'I learn by reading.', dimension: 'reading' },
      { id: 'D', label: 'Start playing', example: 'I learn by doing.', dimension: 'kinesthetic' },
    ],
  },
  {
    id: 12,
    question: 'You want to learn how to draw something.',
    options: [
      { id: 'A', label: 'Look at a picture', example: 'I copy what I see.', dimension: 'visual' },
      { id: 'B', label: 'Listen to instructions', example: 'Someone tells me what to do.', dimension: 'auditory' },
      { id: 'C', label: 'Read a drawing guide', example: 'I follow written steps.', dimension: 'reading' },
      { id: 'D', label: 'Practice drawing it', example: 'I learn by trying.', dimension: 'kinesthetic' },
    ],
  },
  {
    id: 13,
    question: 'You are learning about space.',
    options: [
      { id: 'A', label: 'Look at pictures and videos', example: 'Visuals help me learn.', dimension: 'visual' },
      { id: 'B', label: 'Listen to a teacher explain', example: 'Talking helps me learn.', dimension: 'auditory' },
      { id: 'C', label: 'Read a book about space', example: 'Reading helps me learn.', dimension: 'reading' },
      { id: 'D', label: 'Build a model of the solar system', example: 'Making things helps me learn.', dimension: 'kinesthetic' },
    ],
  },
  {
    id: 14,
    question: 'You are trying a new app.',
    options: [
      { id: 'A', label: 'Look at screenshots', example: 'Pictures help me understand.', dimension: 'visual' },
      { id: 'B', label: 'Listen to someone explain it', example: 'Spoken instructions help me.', dimension: 'auditory' },
      { id: 'C', label: 'Read help pages', example: 'Written instructions help me.', dimension: 'reading' },
      { id: 'D', label: 'Tap around and explore', example: 'I learn through trying.', dimension: 'kinesthetic' },
    ],
  },
  {
    id: 15,
    question: 'You need to learn classroom rules.',
    options: [
      { id: 'A', label: 'See a poster with pictures', example: 'Pictures help me remember.', dimension: 'visual' },
      { id: 'B', label: 'Hear the teacher explain them', example: 'Listening helps me remember.', dimension: 'auditory' },
      { id: 'C', label: 'Read the rules sheet', example: 'Reading helps me remember.', dimension: 'reading' },
      { id: 'D', label: 'Practice following them', example: 'Doing helps me remember.', dimension: 'kinesthetic' },
    ],
  },
  {
    id: 16,
    question: 'When learning something difficult, what helps most?',
    options: [
      { id: 'A', label: 'Seeing examples', example: 'Pictures and demonstrations help.', dimension: 'visual' },
      { id: 'B', label: 'Talking about it', example: 'Discussion helps me understand.', dimension: 'auditory' },
      { id: 'C', label: 'Reading about it', example: 'Written information helps me learn.', dimension: 'reading' },
      { id: 'D', label: 'Doing it myself', example: 'Practice helps me learn.', dimension: 'kinesthetic' },
    ],
  },
];

// ─── Result profiles ────────────────────────────────────────────────

export interface VarkProfile {
  dimension: LearningDimension | 'mixed';
  name: string;
  preferenceStatement: string;
  description: string;
  likes: string[];
  tips: string[];
  icon: string;
  color: string;
  gradient: string;
  barColor: string;
}

export const varkProfiles: Record<LearningDimension | 'mixed', VarkProfile> = {
  visual: {
    dimension: 'visual',
    name: 'Pictures & Videos',
    preferenceStatement: 'You currently seem to prefer learning through pictures, diagrams, and videos.',
    description:
      'You understand things best when you can see them. Colours, charts, and demonstrations make a big difference for you!',
    likes: ['Pictures and diagrams', 'Videos and animations', 'Colour-coded notes', 'Demonstrations and shows'],
    tips: [
      'Draw pictures or diagrams of what you are learning',
      'Use colour when writing notes',
      'Watch videos about topics you find tricky',
      'Ask your teacher for diagrams or visual examples',
    ],
    icon: '👁️',
    color: 'text-blue-600',
    gradient: 'from-blue-400 to-cyan-500',
    barColor: 'bg-blue-500',
  },
  auditory: {
    dimension: 'auditory',
    name: 'Listening & Talking',
    preferenceStatement: 'You currently seem to prefer learning through listening, talking, and discussion.',
    description:
      'You pick things up quickly when you can hear them or talk about them. Conversations and explanations work best for you!',
    likes: ['Discussions and conversations', 'Explanations and storytelling', 'Listening to instructions', 'Asking questions out loud'],
    tips: [
      'Read things out loud when studying',
      'Talk through problems with a friend or family member',
      'Listen to educational podcasts or videos',
      'Ask your teacher to explain things verbally',
    ],
    icon: '🎧',
    color: 'text-green-600',
    gradient: 'from-green-400 to-emerald-500',
    barColor: 'bg-green-500',
  },
  reading: {
    dimension: 'reading',
    name: 'Reading & Writing',
    preferenceStatement: 'You currently seem to prefer learning through reading and writing things down.',
    description:
      'You learn well when you can read information or write things down. Books, notes, and written instructions help you the most!',
    likes: ['Books and articles', 'Written instructions', 'Taking notes', 'Worksheets and written summaries'],
    tips: [
      'Write down key points when learning something new',
      'Make lists and notes in your own words',
      'Use books, worksheets, or written guides',
      'Rewrite your notes to help remember them',
    ],
    icon: '📖',
    color: 'text-purple-600',
    gradient: 'from-purple-400 to-violet-500',
    barColor: 'bg-purple-500',
  },
  kinesthetic: {
    dimension: 'kinesthetic',
    name: 'Doing & Practising',
    preferenceStatement: 'You currently seem to prefer learning by doing things and getting hands-on experience.',
    description:
      'You learn best when you can move, build, and try things yourself. Activities and real-life practice stick in your memory!',
    likes: ['Experiments and projects', 'Hands-on activities', 'Building and making things', 'Practice and repetition'],
    tips: [
      'Use real objects or models when studying',
      'Try things out yourself rather than just watching',
      'Take breaks and move around while studying',
      'Connect what you learn to real-life activities',
    ],
    icon: '🙌',
    color: 'text-orange-600',
    gradient: 'from-orange-400 to-amber-500',
    barColor: 'bg-orange-500',
  },
  mixed: {
    dimension: 'mixed',
    name: 'Mixed Preferences',
    preferenceStatement: 'You seem to enjoy learning in more than one way — that is a real strength!',
    description:
      'You are flexible! You can learn well through different methods. This means you can adapt easily and get the most out of many types of activities.',
    likes: ['Variety of activities', 'Both visual and hands-on tasks', 'Listening and also reading', 'Different types of lessons'],
    tips: [
      'Mix different learning methods together',
      'Try a bit of everything: pictures, reading, listening, and doing',
      'Notice which method feels easiest for each subject',
      'Your flexibility is a superpower — use it!',
    ],
    icon: '⭐',
    color: 'text-amber-600',
    gradient: 'from-amber-400 to-yellow-500',
    barColor: 'bg-amber-500',
  },
};

export const DIMENSION_DISPLAY_NAMES: Record<LearningDimension, string> = {
  visual: 'Pictures & Videos',
  auditory: 'Listening & Talking',
  reading: 'Reading & Writing',
  kinesthetic: 'Doing & Practising',
};

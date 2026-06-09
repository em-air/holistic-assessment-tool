import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import FloatingBackground from '../components/FloatingBackground';
import { ROUTES } from '../routes';

// ─── Types ────────────────────────────────────────────────────────

type DimensionKey = 'EA' | 'PS' | 'SR';

type DimensionScores = {
  EA?: number;
  PS?: number;
  SR?: number;
};

interface QuizOption {
  id: string;
  label: string;
  example: string;
  scores: DimensionScores;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: QuizOption[];
}

// ─── Data ─────────────────────────────────────────────────────────

const questions: QuizQuestion[] = [
  {
    id: 1,
    question: 'When you feel upset, what do you usually do?',
    options: [
      {
        id: 'A',
        label: 'Talk to someone I trust',
        example: 'I tell my parent, teacher, or friend how I feel.',
        scores: { EA: 2, SR: 1 },
      },
      {
        id: 'B',
        label: 'Take a break and calm down',
        example: 'I sit quietly, breathe, or do something relaxing.',
        scores: { SR: 2, EA: 1 },
      },
      {
        id: 'C',
        label: 'Keep my feelings to myself',
        example: "I don't tell anyone I'm upset.",
        scores: { EA: 0 },
      },
      {
        id: 'D',
        label: "I don't know what to do",
        example: "I feel confused when I'm upset.",
        scores: { EA: -1, SR: -1 },
      },
    ],
  },
  {
    id: 2,
    question: 'You notice a classmate sitting alone and looking sad. What would you most likely do?',
    options: [
      {
        id: 'A',
        label: 'Invite them to join me',
        example: 'I ask them if they want to play or sit with me.',
        scores: { PS: 2 },
      },
      {
        id: 'B',
        label: 'Tell a teacher or trusted adult',
        example: 'I ask an adult to help.',
        scores: { PS: 1 },
      },
      {
        id: 'C',
        label: 'Watch but do nothing',
        example: "I notice them but don't say anything.",
        scores: { PS: 0 },
      },
      {
        id: 'D',
        label: 'Walk away',
        example: 'I keep doing what I was doing.',
        scores: { PS: -1 },
      },
    ],
  },
  {
    id: 3,
    question: 'When something is difficult and you make a mistake, what do you usually think?',
    options: [
      {
        id: 'A',
        label: 'I can keep trying and improve',
        example: 'I know practice helps me get better.',
        scores: { SR: 2 },
      },
      {
        id: 'B',
        label: 'I ask someone for help',
        example: 'I ask a teacher, parent, or friend.',
        scores: { SR: 2, PS: 1 },
      },
      {
        id: 'C',
        label: 'I get frustrated and want to stop',
        example: "I feel upset and don't want to continue.",
        scores: { SR: 0 },
      },
      {
        id: 'D',
        label: 'I avoid doing it again',
        example: "I don't want to try that activity anymore.",
        scores: { SR: -1 },
      },
    ],
  },
  {
    id: 4,
    question: 'A friend disagrees with you during a game. What do you usually do?',
    options: [
      {
        id: 'A',
        label: 'Listen and talk about it',
        example: 'We try to solve the problem together.',
        scores: { PS: 2, SR: 1 },
      },
      {
        id: 'B',
        label: 'Ask someone to help',
        example: 'A teacher or adult helps us figure it out.',
        scores: { PS: 1, SR: 1 },
      },
      {
        id: 'C',
        label: 'Get upset',
        example: 'I argue or get angry.',
        scores: { SR: 0 },
      },
      {
        id: 'D',
        label: 'Walk away',
        example: 'I stop playing and leave.',
        scores: { PS: -1, SR: -1 },
      },
    ],
  },
  {
    id: 5,
    question: 'When you have a strong feeling like happiness, sadness, or anger, which sounds most like you?',
    options: [
      {
        id: 'A',
        label: "I usually know what I'm feeling and why",
        example: 'I can explain what made me feel that way.',
        scores: { EA: 2 },
      },
      {
        id: 'B',
        label: 'I know how I feel most of the time',
        example: 'I usually understand my feelings.',
        scores: { EA: 1 },
      },
      {
        id: 'C',
        label: "Sometimes I know, sometimes I don't",
        example: "I'm not always sure what I'm feeling.",
        scores: { EA: 0 },
      },
      {
        id: 'D',
        label: "I often don't know what I'm feeling",
        example: 'My feelings can be confusing.',
        scores: { EA: -1 },
      },
    ],
  },
];

// ─── Result profiles ──────────────────────────────────────────────

const DIMENSION_LABELS: Record<DimensionKey, string> = {
  EA: 'Emotional Awareness',
  PS: 'Prosocial Skills',
  SR: 'Self-Regulation',
};

const DIMENSION_ICONS: Record<DimensionKey, string> = {
  EA: '💛',
  PS: '🤝',
  SR: '🌟',
};

const DIMENSION_COLORS: Record<DimensionKey, { bar: string; bg: string; text: string }> = {
  EA: { bar: 'bg-yellow-400', bg: 'bg-yellow-50', text: 'text-yellow-700' },
  PS: { bar: 'bg-teal-400', bg: 'bg-teal-50', text: 'text-teal-700' },
  SR: { bar: 'bg-indigo-400', bg: 'bg-indigo-50', text: 'text-indigo-700' },
};

const RESULT_PROFILES: Record<DimensionKey, { title: string; description: string; suggestions: string[]; bgColor: string }> = {
  EA: {
    title: 'Emotional Awareness Strength',
    description:
      'You seem good at noticing and understanding feelings. Recognizing emotions can help you communicate and solve problems.',
    suggestions: ['Talk about feelings with people you trust', 'Keep a feelings journal', 'Practice naming emotions when you notice them'],
    bgColor: 'bg-amber-400',
  },
  PS: {
    title: 'Prosocial Strength',
    description:
      'You seem good at helping others, cooperating, and being a supportive friend.',
    suggestions: ['Include others in activities', 'Practice teamwork', 'Continue showing kindness every day'],
    bgColor: 'bg-teal-500',
  },
  SR: {
    title: 'Self-Regulation Strength',
    description:
      'You seem good at staying calm, handling challenges, and trying again when things are difficult.',
    suggestions: ['Keep practicing perseverance', 'Use calming strategies when things feel hard', 'Break difficult tasks into smaller steps'],
    bgColor: 'bg-violet-500',
  },
};

// ─── Option colours ───────────────────────────────────────────────

const OPTION_COLORS = [
  {
    base: 'bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-400 text-gray-700',
    selected: 'bg-blue-500 border-blue-600 text-white',
    badgeBase: 'bg-blue-500 text-white',
    badgeSelected: 'bg-white/30 text-white',
  },
  {
    base: 'bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-400 text-gray-700',
    selected: 'bg-green-500 border-green-600 text-white',
    badgeBase: 'bg-green-500 text-white',
    badgeSelected: 'bg-white/30 text-white',
  },
  {
    base: 'bg-purple-50 border-purple-200 hover:bg-purple-100 hover:border-purple-400 text-gray-700',
    selected: 'bg-purple-500 border-purple-600 text-white',
    badgeBase: 'bg-purple-500 text-white',
    badgeSelected: 'bg-white/30 text-white',
  },
  {
    base: 'bg-orange-50 border-orange-200 hover:bg-orange-100 hover:border-orange-400 text-gray-700',
    selected: 'bg-orange-500 border-orange-600 text-white',
    badgeBase: 'bg-orange-500 text-white',
    badgeSelected: 'bg-white/30 text-white',
  },
];

// ─── Scoring ──────────────────────────────────────────────────────

function computeScores(answers: Record<number, string>): Record<DimensionKey, number> {
  const scores: Record<DimensionKey, number> = { EA: 0, PS: 0, SR: 0 };
  Object.entries(answers).forEach(([qIdStr, optionId]) => {
    const qId = Number(qIdStr);
    const question = questions.find(q => q.id === qId);
    if (!question) return;
    const option = question.options.find(o => o.id === optionId);
    if (!option) return;
    (Object.entries(option.scores) as [DimensionKey, number][]).forEach(([key, value]) => {
      scores[key] += value;
    });
  });
  return scores;
}

function getPrimaryStrength(scores: Record<DimensionKey, number>): DimensionKey {
  return (Object.entries(scores) as [DimensionKey, number][]).sort((a, b) => b[1] - a[1])[0][0];
}

// ─── Screen: Welcome ──────────────────────────────────────────────

const WelcomeScreen: React.FC<{ onStart: () => void; onBack: () => void }> = ({ onStart, onBack }) => (
  <motion.div
    key="sel-welcome"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 1.05 }}
    transition={{ duration: 0.5 }}
    className="max-w-2xl mx-auto text-center"
  >
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2, type: 'spring', bounce: 0.4 }}
      className="text-8xl mb-6 inline-block"
    >
      🌈
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <h2 className="text-4xl font-extrabold text-gray-800 mb-3">
        Social-Emotional Learning Assessment
      </h2>
      <p className="text-lg text-gray-600 mb-8 leading-relaxed">
        This assessment explores how you understand emotions, interact with others, and handle challenges.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {(['EA', 'PS', 'SR'] as DimensionKey[]).map((key, idx) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 + idx * 0.1 }}
            className={`${DIMENSION_COLORS[key].bg} rounded-2xl p-4 text-center shadow-sm`}
          >
            <div className="text-3xl mb-2">{DIMENSION_ICONS[key]}</div>
            <p className={`font-bold text-sm ${DIMENSION_COLORS[key].text}`}>{DIMENSION_LABELS[key]}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-md mb-8 text-left text-sm text-gray-600 space-y-2">
        <p className="flex items-center gap-2"><span>📝</span> <strong>5 questions</strong></p>
        <p className="flex items-center gap-2"><span>⏱️</span> Takes approximately <strong>1–2 minutes</strong></p>
        <p className="flex items-center gap-2"><span>✅</span> <strong>No right or wrong answers</strong></p>
        <p className="flex items-center gap-2"><span>💬</span> Choose the answer that <strong>sounds most like you</strong></p>
        <p className="mt-3 text-xs text-gray-400 italic">
          This quiz identifies your current social-emotional strengths — not a label or judgment. Everyone is different!
        </p>
      </div>

      <button
        onClick={onStart}
        className="w-full max-w-xs py-4 px-8 rounded-2xl bg-teal-500 text-white text-xl font-bold shadow-lg hover:bg-teal-400 active:scale-95 transition-all"
      >
        Begin Assessment ✨
      </button>

      <div className="mt-4">
        <button
          onClick={onBack}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← Back to Assessments
        </button>
      </div>
    </motion.div>
  </motion.div>
);

// ─── Screen: Question ─────────────────────────────────────────────

interface QuestionScreenProps {
  questionIndex: number;
  selectedOption: string | null;
  onSelect: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const QuestionScreen: React.FC<QuestionScreenProps> = ({
  questionIndex,
  selectedOption,
  onSelect,
  onNext,
  onBack,
}) => {
  const question = questions[questionIndex];
  const questionNumber = questionIndex + 1;
  const total = questions.length;
  const isLast = questionIndex === total - 1;

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="max-w-2xl mx-auto"
    >
      <div className="flex items-center justify-between mb-2 text-sm font-semibold text-gray-500">
        <span>Question {questionNumber} of {total}</span>
        <span>{Math.round(((questionNumber - 1) / total) * 100)}%</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full mb-7">
        <motion.div
          className="h-2 bg-teal-500 rounded-full"
          animate={{ width: `${((questionNumber - 1) / total) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-7 mb-5">
        <div className="text-5xl text-center mb-5">🤔</div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 text-center leading-relaxed mb-7">
          {question.question}
        </h2>

        <div className="grid grid-cols-1 gap-3">
          {question.options.map((option, idx) => {
            const colors = OPTION_COLORS[idx];
            const isSelected = selectedOption === option.id;
            return (
              <button
                key={option.id}
                onClick={() => onSelect(option.id)}
                className={`w-full text-left rounded-2xl border-2 p-4 transition-all duration-200 cursor-pointer
                  ${isSelected ? colors.selected : colors.base}`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold
                      ${isSelected ? colors.badgeSelected : colors.badgeBase}`}
                  >
                    {option.id}
                  </span>
                  <div>
                    <p className="font-semibold text-sm md:text-base leading-snug">{option.label}</p>
                    <p className={`text-xs mt-1 leading-relaxed ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                      {option.example}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="py-3 px-6 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!selectedOption}
          className="flex-1 py-3 px-6 rounded-2xl bg-teal-500 text-white font-bold hover:bg-teal-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          {isLast ? 'See My Results 🎉' : 'Next →'}
        </button>
      </div>
    </motion.div>
  );
};

// ─── Screen: Results ─────────────────────────────────────────────

interface ResultScreenProps {
  scores: Record<DimensionKey, number>;
  onRetake: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ scores, onRetake }) => {
  const navigate = useNavigate();
  const primaryKey = getPrimaryStrength(scores);
  const profile = RESULT_PROFILES[primaryKey];

  // Determine a sensible max for the bar chart (minimum of 4 to avoid full-bar on 0)
  const maxScore = Math.max(4, ...Object.values(scores));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto"
    >
      {/* Primary strength card */}
      <div className={`${profile.bgColor} rounded-3xl shadow-xl p-8 text-white text-center mb-5`}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
          className="text-7xl mb-3"
        >
          {DIMENSION_ICONS[primaryKey]}
        </motion.div>
        <h2 className="text-3xl font-extrabold mb-2">{profile.title}</h2>
        <p className="text-base leading-relaxed opacity-95 max-w-md mx-auto">{profile.description}</p>
        <div className="inline-block mt-4 bg-white/20 rounded-full px-4 py-1 text-xs font-semibold tracking-wide uppercase">
          Current Strength
        </div>
      </div>

      {/* Score breakdown */}
      <div className="bg-white rounded-3xl shadow-md p-6 mb-4">
        <h3 className="font-bold text-gray-800 mb-4 text-lg">Your SEL Scores</h3>
        <div className="space-y-4">
          {(['EA', 'PS', 'SR'] as DimensionKey[]).map(dim => {
            const raw = scores[dim];
            const pct = Math.max(0, Math.round((raw / maxScore) * 100));
            const colors = DIMENSION_COLORS[dim];
            const isPrimary = dim === primaryKey;
            return (
              <div key={dim}>
                <div className="flex items-center justify-between mb-1">
                  <span className="flex items-center gap-2 font-semibold text-sm text-gray-700">
                    <span>{DIMENSION_ICONS[dim]}</span>
                    {DIMENSION_LABELS[dim]}
                    {isPrimary && (
                      <span className={`ml-1 text-xs font-bold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                        Top Strength
                      </span>
                    )}
                  </span>
                  <span className="text-sm font-bold text-gray-500">{pct}%</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-3 rounded-full ${colors.bar}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Growth suggestions */}
      <div className="bg-white rounded-3xl shadow-md p-6 mb-4">
        <h3 className="font-bold text-gray-800 mb-3 text-lg">Ideas for Growth 🌱</h3>
        <ul className="space-y-2">
          {profile.suggestions.map((s, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-green-500 font-bold mt-0.5">✓</span>
              {s}
            </li>
          ))}
        </ul>
      </div>

      {/* Encouragement note */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 text-sm text-amber-800 leading-relaxed">
        💡 <strong>Remember:</strong> This is not a test — there are no right or wrong answers. These results show your current strengths and areas you can explore further. Everyone grows at their own pace!
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onRetake}
          className="flex-1 py-3 px-6 rounded-2xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={() => navigate(ROUTES.LEARNING_ASSESSMENTS)}
          className="flex-1 py-3 px-6 rounded-2xl bg-indigo-500 text-white font-bold hover:bg-indigo-400 transition-all active:scale-95"
        >
          Back to Assessments
        </button>
      </div>
    </motion.div>
  );
};

// ─── Main component ───────────────────────────────────────────────

type Phase = 'welcome' | 'quiz' | 'results';

const SocialEmotionalQuiz: React.FC = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('welcome');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const currentQuestion = questions[questionIndex];
  const selectedOption = answers[currentQuestion?.id] ?? null;

  function handleStart() {
    setPhase('quiz');
    setQuestionIndex(0);
  }

  function handleSelect(optionId: string) {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: optionId }));
  }

  function handleNext() {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex(i => i + 1);
    } else {
      setPhase('results');
    }
  }

  function handleBack() {
    if (questionIndex === 0) {
      setPhase('welcome');
    } else {
      setQuestionIndex(i => i - 1);
    }
  }

  function handleRetake() {
    setAnswers({});
    setQuestionIndex(0);
    setPhase('welcome');
  }

  const scores = computeScores(answers);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-sky-50 via-white to-indigo-50">
      <FloatingBackground />
      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="flex-1 px-4 py-8 md:py-12">
          <AnimatePresence mode="wait">
            {phase === 'welcome' && (
              <WelcomeScreen
                key="welcome"
                onStart={handleStart}
                onBack={() => navigate(ROUTES.LEARNING_ASSESSMENTS)}
              />
            )}
            {phase === 'quiz' && (
              <QuestionScreen
                key={`question-${questionIndex}`}
                questionIndex={questionIndex}
                selectedOption={selectedOption}
                onSelect={handleSelect}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
            {phase === 'results' && (
              <ResultScreen
                key="results"
                scores={scores}
                onRetake={handleRetake}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SocialEmotionalQuiz;

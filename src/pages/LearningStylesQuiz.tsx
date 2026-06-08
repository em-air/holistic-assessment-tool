import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import FloatingBackground from '../components/FloatingBackground';
import AssessmentProgressBar from '../components/AssessmentProgressBar';
import MindSectionReport from '../components/MindSectionReport';
import { ROUTES } from '../routes';
import {
  varkQuestions,
  varkProfiles,
  DIMENSION_DISPLAY_NAMES,
  type LearningDimension,
} from '../data/varkQuizData';
import {
  calculateVarkResult,
  buildDimensionMap,
  type VarkAnswers,
  type VarkResult,
  type VarkScores,
} from '../services/varkScoringService';
import { ProgressTracker } from '../utils/progressTracker';

// ─── Constants ──────────────────────────────────────────────────────

type OptionId = 'A' | 'B' | 'C' | 'D';

const OPTION_COLORS: {
  base: string;
  selected: string;
  badgeBase: string;
  badgeSelected: string;
}[] = [
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

// ─── Welcome screen ──────────────────────────────────────────────────

const WelcomeScreen: React.FC<{ totalQuestions: number; onStart: () => void }> = ({
  totalQuestions,
  onStart,
}) => (
  <motion.div
    key="welcome"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 1.05 }}
    transition={{ duration: 0.5 }}
    className="max-w-2xl mx-auto text-center"
  >
    <motion.div
      initial={{ scale: 0, rotate: 0 }}
      animate={{ scale: 1, rotate: 360 }}
      transition={{ duration: 1, delay: 0.2, type: 'spring', bounce: 0.4 }}
      className="text-8xl mb-6 inline-block"
    >
      🧠
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <h2 className="text-4xl font-extrabold text-gray-800 mb-3">
        How Do You Like to Learn?
      </h2>
      <p className="text-lg text-gray-600 mb-8 leading-relaxed">
        Answer {totalQuestions} quick questions to find out what kinds of activities help you learn best!
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {(['visual', 'auditory', 'reading', 'kinesthetic'] as LearningDimension[]).map((key, idx) => {
          const p = varkProfiles[key];
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 + idx * 0.1 }}
              className={`bg-gradient-to-br ${p.gradient} rounded-2xl p-4 text-white text-center shadow-md`}
            >
              <div className="text-3xl mb-1">{p.icon}</div>
              <p className="font-bold text-xs leading-tight">{p.name}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-md mb-8 text-left text-sm text-gray-600 space-y-2">
        <p className="flex items-center gap-2"><span>👁️</span> Some people learn best by <strong>seeing</strong> pictures and videos</p>
        <p className="flex items-center gap-2"><span>🎧</span> Some people learn best by <strong>listening</strong> and talking</p>
        <p className="flex items-center gap-2"><span>📖</span> Some people learn best by <strong>reading</strong> and writing things down</p>
        <p className="flex items-center gap-2"><span>🙌</span> Some people learn best by <strong>doing</strong> and trying things out</p>
        <p className="mt-3 text-xs text-gray-400 italic">
          This quiz discovers your learning preferences — not a fixed label. Many people enjoy more than one way of learning!
        </p>
      </div>

      <button
        onClick={onStart}
        className="w-full max-w-xs py-4 px-8 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xl font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all"
      >
        Start Quiz ✨
      </button>

      <p className="text-sm text-gray-400 mt-4">
        📝 {totalQuestions} questions · ⏱️ about 5 minutes
      </p>
    </motion.div>
  </motion.div>
);

// ─── Question slide ────────────────────────────────────────────────

interface QuestionSlideProps {
  questionIndex: number;
  totalQuestions: number;
  selectedOption: OptionId | null;
  onSelect: (id: OptionId) => void;
  onNext: () => void;
  onBack: () => void;
}

const QuestionSlide: React.FC<QuestionSlideProps> = ({
  questionIndex,
  totalQuestions,
  selectedOption,
  onSelect,
  onNext,
  onBack,
}) => {
  const question = varkQuestions[questionIndex];
  const questionNumber = questionIndex + 1;
  const isLast = questionIndex === totalQuestions - 1;

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
        <span>Question {questionNumber} of {totalQuestions}</span>
        <span>{Math.round(((questionNumber - 1) / totalQuestions) * 100)}%</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full mb-7">
        <motion.div
          className="h-2 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full"
          animate={{ width: `${((questionNumber - 1) / totalQuestions) * 100}%` }}
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
                    <p className="font-semibold text-sm md:text-base leading-snug">
                      {option.label}
                    </p>
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
          disabled={questionIndex === 0}
          className="py-3 px-6 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!selectedOption}
          className="flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          {isLast ? 'See My Results 🎉' : 'Next →'}
        </button>
      </div>
    </motion.div>
  );
};

// ─── Result screen ─────────────────────────────────────────────────

interface ResultViewProps {
  result: VarkResult;
  onRetake: () => void;
}

const DIMENSION_ORDER: LearningDimension[] = ['visual', 'auditory', 'reading', 'kinesthetic'];

const ResultView: React.FC<ResultViewProps> = ({ result, onRetake }) => {
  const navigate = useNavigate();
  const profile = varkProfiles[result.profileKey];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto"
    >
      <div
        className={`bg-gradient-to-br ${profile.gradient} rounded-3xl shadow-xl p-8 text-white text-center mb-5`}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
          className="text-7xl mb-3"
        >
          {profile.icon}
        </motion.div>
        <h2 className="text-3xl font-extrabold mb-2">{profile.name}</h2>
        <p className="text-base leading-relaxed opacity-95 max-w-md mx-auto">
          {profile.preferenceStatement}
        </p>
        <div className="inline-block mt-4 bg-white/20 rounded-full px-4 py-1 text-xs font-semibold tracking-wide uppercase">
          Learning Preference Profile
        </div>
      </div>

      {result.isMixed && (
        <div className="bg-white rounded-2xl shadow-md px-5 py-4 mb-5 flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <p className="text-sm text-gray-700 leading-relaxed">
            You scored highly in more than one area — that is great! It means you can adapt to
            many types of lessons. Your top two preferences are{' '}
            <strong>{DIMENSION_DISPLAY_NAMES[result.primaryDimension]}</strong> and{' '}
            <strong>{DIMENSION_DISPLAY_NAMES[result.secondaryDimension]}</strong>.
          </p>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-md p-6 mb-4">
        <p className="text-gray-700 leading-relaxed">{profile.description}</p>
      </div>

      <div className="bg-white rounded-3xl shadow-md p-6 mb-4">
        <h3 className="font-bold text-gray-800 mb-4">Your Preference Breakdown</h3>
        <div className="space-y-3">
          {DIMENSION_ORDER.map(dim => {
            const pct = result.percentages[dim as keyof VarkScores];
            const p = varkProfiles[dim];
            return (
              <div key={dim}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-1.5 text-gray-600">
                    <span>{p.icon}</span>
                    {DIMENSION_DISPLAY_NAMES[dim]}
                  </span>
                  <span className="font-semibold text-gray-800">{pct}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${p.barColor}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mt-4 italic">
          These are preferences, not fixed labels. They can change as you grow and learn new things.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-3xl shadow-md p-5">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span>❤️</span> You tend to enjoy
          </h3>
          <ul className="space-y-2">
            {profile.likes.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-green-500 font-bold mt-0.5">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-3xl shadow-md p-5">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span>💡</span> Tips that may help you
          </h3>
          <ul className="space-y-2">
            {profile.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-blue-500 font-bold mt-0.5">→</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onRetake}
          className="flex-1 py-3 px-6 rounded-2xl border-2 border-indigo-300 text-indigo-700 font-semibold hover:bg-indigo-50 transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={() => navigate(ROUTES.CATEGORIES)}
          className="flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold hover:opacity-90 transition-opacity"
        >
          Back to Categories
        </button>
      </div>
    </motion.div>
  );
};

// ─── Main page ───────────────────────────────────────────────────────

const LearningStylesQuiz: React.FC = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<VarkAnswers>({});
  const [selectedOption, setSelectedOption] = useState<OptionId | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<VarkResult | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [startTime] = useState<number>(Date.now());

  const totalQuestions = varkQuestions.length;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  const dimensionMap = useMemo(() => buildDimensionMap(varkQuestions), []);

  const handleSelect = (optionId: OptionId) => {
    setSelectedOption(optionId);
    setAnswers(prev => ({ ...prev, [varkQuestions[currentIndex].id]: optionId }));
  };

  const handleNext = () => {
    if (!selectedOption) return;
    const mergedAnswers = { ...answers, [varkQuestions[currentIndex].id]: selectedOption };

    if (isLastQuestion) {
      const varkResult = calculateVarkResult(mergedAnswers, dimensionMap);
      setResult(varkResult);

      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      const topScore = Math.max(...Object.values(varkResult.scores));
      const percentage = Math.round((topScore / totalQuestions) * 100);

      ProgressTracker.saveQuizResult({
        quizId: 'learning-styles',
        quizName: 'Learning Styles Quiz',
        subcategory: 'learning-style',
        score: topScore,
        totalQuestions,
        percentage,
        timeSpent,
        completedAt: new Date().toISOString(),
        additionalData: {
          profileKey: varkResult.profileKey,
          isMixed: varkResult.isMixed,
          primaryDimension: varkResult.primaryDimension,
          secondaryDimension: varkResult.secondaryDimension,
          percentages: varkResult.percentages,
        },
      });

      setShowResults(true);
    } else {
      const nextQ = varkQuestions[currentIndex + 1];
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(mergedAnswers[nextQ.id] ?? null);
    }
  };

  const handleBack = () => {
    if (currentIndex === 0) return;
    const prevQ = varkQuestions[currentIndex - 1];
    setCurrentIndex(prev => prev - 1);
    setSelectedOption(answers[prevQ.id] ?? null);
  };

  const handleRetake = () => {
    setIsStarted(false);
    setCurrentIndex(0);
    setAnswers({});
    setSelectedOption(null);
    setShowResults(false);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      <FloatingBackground />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl md:text-3xl font-bold text-gray-800"
          >
            Learning Styles Quiz
          </motion.h1>
        </div>

        <div className="mb-6">
          <AssessmentProgressBar onShowReport={() => setShowReport(true)} />
        </div>

        <AnimatePresence mode="wait">
          {!isStarted && !showResults && (
            <WelcomeScreen
              key="welcome"
              totalQuestions={totalQuestions}
              onStart={() => setIsStarted(true)}
            />
          )}

          {isStarted && !showResults && (
            <QuestionSlide
              key={`q-${currentIndex}`}
              questionIndex={currentIndex}
              totalQuestions={totalQuestions}
              selectedOption={selectedOption}
              onSelect={handleSelect}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {showResults && result && (
            <ResultView key="results" result={result} onRetake={handleRetake} />
          )}
        </AnimatePresence>

        {showReport && <MindSectionReport onClose={() => setShowReport(false)} />}
      </div>
    </div>
  );
};

export default LearningStylesQuiz;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import FloatingBackground from '../components/FloatingBackground';
import { ROUTES } from '../routes';
import {
  kolbQuestions,
  kolbStyles,
  type KolbQuestion,
  type KolbStylePresentation,
} from '../data/kolbQuizData';
import {
  calculateKolbResult,
  DIMENSION_LABELS,
  type KolbResult,
} from '../services/kolbLearningStyleService';
import { ProgressTracker } from '../utils/progressTracker';

// ─── Types ──────────────────────────────────────────────────────────

type OptionId = 'A' | 'B' | 'C' | 'D';
type Answers = Record<number, OptionId>;

// ─── Option button colours (one per option slot) ─────────────────────

const OPTION_COLORS = [
  {
    base: 'bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-400',
    selected: 'bg-blue-500 border-blue-600 text-white',
    badge: 'bg-blue-500 text-white',
  },
  {
    base: 'bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-400',
    selected: 'bg-green-500 border-green-600 text-white',
    badge: 'bg-green-500 text-white',
  },
  {
    base: 'bg-purple-50 border-purple-200 hover:bg-purple-100 hover:border-purple-400',
    selected: 'bg-purple-500 border-purple-600 text-white',
    badge: 'bg-purple-500 text-white',
  },
  {
    base: 'bg-orange-50 border-orange-200 hover:bg-orange-100 hover:border-orange-400',
    selected: 'bg-orange-500 border-orange-600 text-white',
    badge: 'bg-orange-500 text-white',
  },
];

// ─── Sub-components ──────────────────────────────────────────────────

interface QuestionSlideProps {
  question: KolbQuestion;
  selectedOption: OptionId | null;
  onSelect: (id: OptionId) => void;
  questionNumber: number;
  totalQuestions: number;
}

const QuestionSlide: React.FC<QuestionSlideProps> = ({
  question,
  selectedOption,
  onSelect,
  questionNumber,
  totalQuestions,
}) => (
  <motion.div
    key={question.id}
    initial={{ opacity: 0, x: 60 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -60 }}
    transition={{ duration: 0.35, ease: 'easeOut' }}
    className="max-w-2xl mx-auto"
  >
    {/* Progress indicator */}
    <div className="flex items-center justify-between mb-4">
      <span className="text-sm font-semibold text-gray-500">
        Question {questionNumber} of {totalQuestions}
      </span>
      <span className="text-sm font-semibold text-gray-500">
        {Math.round(((questionNumber - 1) / totalQuestions) * 100)}%
      </span>
    </div>

    {/* Progress bar */}
    <div className="w-full h-2 bg-gray-200 rounded-full mb-8">
      <motion.div
        className="h-2 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${((questionNumber - 1) / totalQuestions) * 100}%` }}
        transition={{ duration: 0.4 }}
      />
    </div>

    {/* Question card */}
    <div className="bg-white rounded-3xl shadow-lg p-8 mb-6">
      <div className="text-5xl text-center mb-6">🤔</div>
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 text-center leading-relaxed mb-8">
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
                ${isSelected ? colors.selected : `${colors.base} text-gray-700`}`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold
                    ${isSelected ? 'bg-white/30 text-white' : colors.badge}`}
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
  </motion.div>
);

// ─── Result screen ────────────────────────────────────────────────────

interface ResultViewProps {
  result: KolbResult;
  style: KolbStylePresentation;
  onRetake: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ result, style, onRetake }) => {
  const navigate = useNavigate();
  const totalAnswered = Object.keys(result.scores).reduce(
    (sum, k) => sum + result.scores[k as keyof typeof result.scores],
    0
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="max-w-2xl mx-auto"
    >
      {/* Main result card */}
      <div className={`bg-gradient-to-br ${style.gradient} rounded-3xl shadow-xl p-8 text-white text-center mb-6`}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
          className="text-7xl mb-4"
        >
          {style.icon}
        </motion.div>
        <h2 className="text-3xl font-extrabold mb-1">{style.name}</h2>
        <p className="text-lg font-medium opacity-90 mb-4">{style.tagline}</p>
        <div className="inline-block bg-white/20 rounded-full px-4 py-1 text-sm font-semibold">
          Learning Preference Profile
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-3xl shadow-md p-6 mb-4">
        <p className="text-gray-700 leading-relaxed text-base">{style.description}</p>
      </div>

      {/* Strengths & Tips */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-3xl shadow-md p-6">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span>💪</span> Your Strengths
          </h3>
          <ul className="space-y-2">
            {style.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-green-500 font-bold mt-0.5">✓</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-3xl shadow-md p-6">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span>💡</span> Learning Tips
          </h3>
          <ul className="space-y-2">
            {style.tips.map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-blue-500 font-bold mt-0.5">→</span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Dimension score bars */}
      <div className="bg-white rounded-3xl shadow-md p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">Your Preference Breakdown</h3>
        <div className="space-y-3">
          {(Object.entries(result.scores) as [keyof typeof result.scores, number][]).map(
            ([dim, score]) => (
              <div key={dim}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{DIMENSION_LABELS[dim]}</span>
                  <span className="font-semibold text-gray-800">
                    {totalAnswered > 0 ? Math.round((score / totalAnswered) * 100) : 0}%
                  </span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${totalAnswered > 0 ? (score / totalAnswered) * 100 : 0}%`,
                    }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                  />
                </div>
              </div>
            )
          )}
        </div>
        <p className="text-xs text-gray-400 mt-4">
          This is a learning preference profile, not a fixed personality type.
          Your preferences can change and overlap.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onRetake}
          className="flex-1 py-3 px-6 rounded-2xl border-2 border-indigo-300 text-indigo-700 font-semibold hover:bg-indigo-50 transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={() => navigate(ROUTES.CATEGORIES)}
          className="flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity"
        >
          Back to Categories
        </button>
      </div>
    </motion.div>
  );
};

// ─── Welcome screen ────────────────────────────────────────────────────

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => (
  <motion.div
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
        Answer 16 fun questions to discover your personal learning style!
      </p>

      {/* Style preview cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {kolbStyles.filter(s => s.id !== 'Mixed Profile').map((style, idx) => (
          <motion.div
            key={style.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 + idx * 0.1 }}
            className={`bg-gradient-to-br ${style.gradient} rounded-2xl p-4 text-white text-center shadow-md`}
          >
            <div className="text-3xl mb-2">{style.icon}</div>
            <p className="font-bold text-sm">{style.name}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-md mb-8 text-left">
        <h3 className="font-bold text-gray-800 mb-3">What you'll find out:</h3>
        <ul className="space-y-2 text-gray-600 text-sm">
          <li className="flex items-center gap-2"><span>🚀</span> Whether you like jumping in and doing things</li>
          <li className="flex items-center gap-2"><span>👀</span> Whether you prefer to watch and think first</li>
          <li className="flex items-center gap-2"><span>📐</span> Whether you love rules and step-by-step logic</li>
          <li className="flex items-center gap-2"><span>🌍</span> Whether real-life examples help you most</li>
        </ul>
      </div>

      <button
        onClick={onStart}
        className="w-full max-w-xs py-4 px-8 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xl font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all"
      >
        Start Quiz ✨
      </button>
    </motion.div>
  </motion.div>
);

// ─── Main page ──────────────────────────────────────────────────────────

const KolbLearningStyleQuiz: React.FC = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [selectedOption, setSelectedOption] = useState<OptionId | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<KolbResult | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [startTime] = useState<number>(Date.now());

  const totalQuestions = kolbQuestions.length;
  const currentQuestion = kolbQuestions[currentIndex];
  const isLastQuestion = currentIndex === totalQuestions - 1;

  const handleSelectOption = (optionId: OptionId) => {
    setSelectedOption(optionId);
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: optionId }));
  };

  const handleNext = () => {
    if (!selectedOption) return;

    if (isLastQuestion) {
      finishQuiz({ ...answers, [currentQuestion.id]: selectedOption });
    } else {
      setCurrentIndex(prev => prev + 1);
      // Pre-fill if the user navigated back
      const nextQuestion = kolbQuestions[currentIndex + 1];
      setSelectedOption(answers[nextQuestion.id] ?? null);
    }
  };

  const handleBack = () => {
    if (currentIndex === 0) return;
    const prevQuestion = kolbQuestions[currentIndex - 1];
    setCurrentIndex(prev => prev - 1);
    setSelectedOption(answers[prevQuestion.id] ?? null);
  };

  const finishQuiz = (finalAnswers: Answers) => {
    const kolbResult = calculateKolbResult(finalAnswers);
    setResult(kolbResult);

    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const dominantScore = Math.max(...Object.values(kolbResult.scores));
    const percentage = Math.round((dominantScore / totalQuestions) * 100);

    ProgressTracker.saveQuizResult({
      quizId: 'kolb-learning-style',
      quizName: 'Kolb Learning Style Quiz',
      subcategory: 'learning-style',
      score: dominantScore,
      totalQuestions,
      percentage,
      timeSpent,
      completedAt: new Date().toISOString(),
      additionalData: {
        primaryStyle: kolbResult.primaryStyle,
        axes: kolbResult.axes,
        scores: kolbResult.scores,
      },
    });

    setShowResults(true);
  };

  const handleRetake = () => {
    setIsStarted(false);
    setCurrentIndex(0);
    setAnswers({});
    setSelectedOption(null);
    setShowResults(false);
    setResult(null);
  };

  const resultStyle = result
    ? kolbStyles.find(s => s.id === result.primaryStyle) ?? kolbStyles[kolbStyles.length - 1]
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      <FloatingBackground />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl md:text-3xl font-bold text-gray-800"
          >
            Learning Style Quiz
          </motion.h1>
        </div>

        <AnimatePresence mode="wait">
          {!isStarted && !showResults && (
            <WelcomeScreen key="welcome" onStart={() => setIsStarted(true)} />
          )}

          {isStarted && !showResults && currentQuestion && (
            <motion.div key={`q-${currentIndex}`}>
              <QuestionSlide
                question={currentQuestion}
                selectedOption={selectedOption}
                onSelect={handleSelectOption}
                questionNumber={currentIndex + 1}
                totalQuestions={totalQuestions}
              />

              {/* Navigation */}
              <div className="max-w-2xl mx-auto flex justify-between gap-4 mt-2">
                <button
                  onClick={handleBack}
                  disabled={currentIndex === 0}
                  className="py-3 px-6 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!selectedOption}
                  className="flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  {isLastQuestion ? 'See My Results 🎉' : 'Next →'}
                </button>
              </div>
            </motion.div>
          )}

          {showResults && result && resultStyle && (
            <ResultView
              key="results"
              result={result}
              style={resultStyle}
              onRetake={handleRetake}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default KolbLearningStyleQuiz;

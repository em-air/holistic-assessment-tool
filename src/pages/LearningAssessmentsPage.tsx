import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import FloatingBackground from '../components/FloatingBackground';
import { ROUTES } from '../routes';

// ─── Types ────────────────────────────────────────────────────────

interface AssessmentConfig {
  id: string;
  icon: string;
  title: string;
  description: string;
  duration: string;
  route: string;
  bandColor: string;
  buttonColor: string;
  tagColor: string;
}

// ─── Assessment list ──────────────────────────────────────────────

const ASSESSMENTS: AssessmentConfig[] = [
  {
    id: 'preferences',
    icon: '🧠',
    title: 'Learning Preferences Quiz',
    description:
      'Discover how you prefer to learn, such as through pictures, listening, reading, or hands-on activities.',
    duration: '~5 minutes · 12 questions',
    route: ROUTES.LEARNING_PREFERENCES_QUIZ,
    bandColor: 'bg-violet-500',
    buttonColor: 'bg-violet-500 hover:bg-violet-400',
    tagColor: 'bg-violet-100 text-violet-700',
  },
  {
    id: 'social-emotional',
    icon: '🌈',
    title: 'Social-Emotional Learning (SEL) Quiz',
    description:
      'Explore your social and emotional strengths, including understanding feelings, helping others, and handling challenges.',
    duration: '~1–2 minutes · 5 questions',
    route: ROUTES.SEL_QUIZ,
    bandColor: 'bg-teal-500',
    buttonColor: 'bg-teal-500 hover:bg-teal-400',
    tagColor: 'bg-teal-100 text-teal-700',
  },
];

// ─── AssessmentCard ───────────────────────────────────────────────

interface AssessmentCardProps {
  config: AssessmentConfig;
  index: number;
}

const AssessmentCard: React.FC<AssessmentCardProps> = ({ config, index }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 + index * 0.15 }}
      className="bg-white rounded-3xl shadow-lg overflow-hidden"
    >
      {/* Colour band */}
      <div className={`${config.bandColor} h-2`} />

      <div className="p-6 md:p-8">
        <div className="flex items-start gap-4 mb-4">
          <div className="text-5xl flex-shrink-0">{config.icon}</div>
          <div>
            <h3 className="text-xl md:text-2xl font-extrabold text-gray-800 leading-snug mb-1">
              {config.title}
            </h3>
            <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${config.tagColor}`}>
              {config.duration}
            </span>
          </div>
        </div>

        <p className="text-gray-600 leading-relaxed mb-6">{config.description}</p>

        <button
          onClick={() => navigate(config.route)}
          className={`w-full py-3 px-6 rounded-2xl ${config.buttonColor} text-white font-bold text-base shadow-md hover:opacity-90 active:scale-95 transition-all`}
        >
          Start Assessment →
        </button>
      </div>
    </motion.div>
  );
};

// ─── Main page ────────────────────────────────────────────────────

const LearningAssessmentsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-sky-50 via-white to-indigo-50">
      <FloatingBackground />
      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="flex-1 px-4 py-8 md:py-12 max-w-2xl mx-auto w-full">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <div className="text-7xl mb-4">📚</div>
            <h1 className="text-4xl font-extrabold text-gray-800 mb-3">Learning Assessments</h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-md mx-auto">
              Choose an assessment to discover more about how you learn and how you feel.
            </p>
          </motion.div>

          {/* Cards */}
          <div className="flex flex-col gap-5">
            {ASSESSMENTS.map((config, idx) => (
              <AssessmentCard key={config.id} config={config} index={idx} />
            ))}
          </div>

          {/* Back link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-8"
          >
            <button
              onClick={() => navigate(-1)}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              ← Go Back
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LearningAssessmentsPage;

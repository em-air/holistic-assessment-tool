import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../i18n';

interface QuizResultsScreenProps {
    score: number;
    totalQuestions: number;
    quizTitle: string;
    onRetry?: () => void;
    onTryAnotherGrade?: () => void;
    backPath?: string;
    accentColor?: 'purple' | 'blue' | 'green' | 'orange';
}

/**
 * Reusable Quiz Results Screen
 * Shows final score with celebration animation and action buttons
 */
export const QuizResultsScreen = ({
    score,
    totalQuestions,
    quizTitle,
    onRetry,
    onTryAnotherGrade,
    backPath = '/categories',
    accentColor = 'purple',
}: QuizResultsScreenProps) => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const percentage = Math.round((score / totalQuestions) * 100);

    const getPerformanceEmoji = () => {
        if (percentage >= 90) return '🌟';
        if (percentage >= 70) return '🎉';
        if (percentage >= 50) return '👍';
        return '💪';
    };

    const getPerformanceMessage = () => {
        if (percentage >= 90) return t('results.outstanding');
        if (percentage >= 70) return t('results.greatJob');
        if (percentage >= 50) return t('results.goodEffort');
        return t('results.keepPracticing');
    };

    const colorClasses = {
        purple: {
            bg: 'bg-purple-500',
            text: 'text-purple-600',
            button: 'bg-purple-500 hover:bg-purple-600',
        },
        blue: {
            bg: 'bg-blue-500',
            text: 'text-blue-600',
            button: 'bg-blue-500 hover:bg-blue-600',
        },
        green: {
            bg: 'bg-emerald-500',
            text: 'text-emerald-600',
            button: 'bg-emerald-500 hover:bg-emerald-600',
        },
        orange: {
            bg: 'bg-orange-500',
            text: 'text-orange-600',
            button: 'bg-orange-500 hover:bg-orange-600',
        },
    };

    const colors = colorClasses[accentColor];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50 max-w-md w-full text-center mx-auto"
        >
            {/* Celebration Emoji */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className={`w-20 h-20 ${colors.bg} rounded-full flex items-center justify-center mx-auto mb-6`}
            >
                <span className="text-4xl">{getPerformanceEmoji()}</span>
            </motion.div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{getPerformanceMessage()}</h1>
            <p className="text-gray-600 mb-6">{quizTitle}</p>

            {/* Score Display */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`text-6xl font-bold ${colors.text} mb-2`}
            >
                {score}/{totalQuestions}
            </motion.div>

            <p className="text-xl text-gray-700 mb-2">
                {t('results.youGot')} {score} {t('results.outOf')} {totalQuestions} {t('results.correct')}
            </p>

            <p className="text-lg text-gray-600 mb-8">{t('results.thats')} {percentage}%!</p>

            {/* Progress Ring */}
            <div className="relative w-24 h-24 mx-auto mb-8">
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                        fill="none"
                    />
                    <motion.circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        className={colors.text}
                        initial={{ strokeDasharray: '0 251' }}
                        animate={{ strokeDasharray: `${(percentage / 100) * 251} 251` }}
                        transition={{ duration: 1, delay: 0.5 }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-xl font-bold ${colors.text}`}>{percentage}%</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
                {onRetry && (
                    <motion.button
                        onClick={onRetry}
                        className={`w-full ${colors.button} text-white py-3 px-6 rounded-lg font-bold transition-colors duration-200`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {t('quiz.tryAgain')}
                    </motion.button>
                )}

                {onTryAnotherGrade && (
                    <motion.button
                        onClick={onTryAnotherGrade}
                        className={`w-full ${colors.button} text-white py-3 px-6 rounded-lg font-bold transition-colors duration-200`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {t('quiz.tryAnotherGrade')}
                    </motion.button>
                )}

                <motion.button
                    onClick={() => navigate(backPath)}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-bold transition-colors duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {t('quiz.backToCategories')}
                </motion.button>
            </div>
        </motion.div>
    );
};

export default QuizResultsScreen;

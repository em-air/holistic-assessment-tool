import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface QuizCompletionProps {
    score: number;
    totalQuestions: number;
    quizName: string;
    onRetry?: () => void;
    nextQuizPath?: string;
    categoryPath?: string;
}

/**
 * Reusable quiz completion screen
 * Shows score, feedback, and navigation options
 */
export const QuizCompletion = ({
    score,
    totalQuestions,
    quizName,
    onRetry,
    nextQuizPath,
    categoryPath = '/categories',
}: QuizCompletionProps) => {
    const navigate = useNavigate();
    const percentage = Math.round((score / totalQuestions) * 100);

    const getGrade = () => {
        if (percentage >= 90) return { grade: 'Excellent!', emoji: '🌟', color: 'text-green-600' };
        if (percentage >= 75) return { grade: 'Great Job!', emoji: '🎉', color: 'text-blue-600' };
        if (percentage >= 60) return { grade: 'Good Work!', emoji: '👍', color: 'text-yellow-600' };
        return { grade: 'Keep Practicing!', emoji: '💪', color: 'text-orange-600' };
    };

    const { grade, emoji, color } = getGrade();

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-100 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center"
            >
                {/* Celebration emoji */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
                    className="text-7xl mb-6"
                >
                    {emoji}
                </motion.div>

                {/* Quiz Name */}
                <h2 className="text-xl text-slate-600 mb-2">{quizName}</h2>

                {/* Grade */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`text-3xl font-bold ${color} mb-6`}
                >
                    {grade}
                </motion.h1>

                {/* Score display */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-r from-violet-100 to-purple-100 rounded-2xl p-6 mb-8"
                >
                    <div className="text-5xl font-bold text-violet-600 mb-2">
                        {score}/{totalQuestions}
                    </div>
                    <div className="text-slate-600">
                        {percentage}% Correct
                    </div>
                </motion.div>

                {/* Progress ring */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="relative w-32 h-32 mx-auto mb-8"
                >
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="#e2e8f0"
                            strokeWidth="12"
                            fill="none"
                        />
                        <motion.circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="url(#gradient)"
                            strokeWidth="12"
                            fill="none"
                            strokeLinecap="round"
                            initial={{ strokeDasharray: '0 352' }}
                            animate={{ strokeDasharray: `${(percentage / 100) * 352} 352` }}
                            transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#8b5cf6" />
                                <stop offset="100%" stopColor="#7c3aed" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-violet-600">{percentage}%</span>
                    </div>
                </motion.div>

                {/* Action buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="space-y-3"
                >
                    {onRetry && (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onRetry}
                            className="w-full py-3 px-6 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all"
                        >
                            🔄 Try Again
                        </motion.button>
                    )}

                    {nextQuizPath && (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate(nextQuizPath)}
                            className="w-full py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all"
                        >
                            ➡️ Next Quiz
                        </motion.button>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(categoryPath)}
                        className="w-full py-3 px-6 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-all"
                    >
                        📚 Back to Categories
                    </motion.button>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default QuizCompletion;

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
    getNumericGrade,
    canAccessQuizGrade,
    getLockedReason
} from '../../utils/gradeUtils';
import { ROUTES } from '../../routes';
import FloatingBackground from '../FloatingBackground';

interface GradeSelectorProps {
    title: string;
    description?: string;
    icon?: ReactNode;
    grades?: number[];
    onSelectGrade: (grade: number) => void;
    backPath: string;
    gradientFrom?: string;
    gradientTo?: string;
    accentColor?: string;
    /** Category for access control (e.g., 'academic', 'oral', 'mind') */
    category?: 'mind' | 'oral' | 'academic';
    /** Subcategory for access control (e.g., 'spelling', 'story-retell') */
    subcategory?: string;
}

/**
 * Reusable Grade Selector component with access control
 * Used by quizzes that need grade-specific content (Blending, Spelling, Writing, etc.)
 * 
 * Grades that the user cannot access are shown with a lock icon and greyed out.
 */
export const GradeSelector = ({
    title,
    description = 'Choose your grade level to begin',
    icon,
    grades = [1, 2, 3],
    onSelectGrade,
    backPath,
    gradientFrom = 'from-purple-300',
    gradientTo = 'to-indigo-500',
    accentColor = 'purple',
    category = 'academic',
    subcategory = 'spelling',
}: GradeSelectorProps) => {
    const navigate = useNavigate();
    const { grade: userGrade, isAdmin, user } = useAuth();
    const numericUserGrade = getNumericGrade(userGrade);

    const colorClasses = {
        purple: {
            button: 'bg-purple-500 hover:bg-purple-600',
            iconBg: 'bg-purple-500',
            lockedButton: 'bg-gray-400',
        },
        blue: {
            button: 'bg-blue-500 hover:bg-blue-600',
            iconBg: 'bg-blue-500',
            lockedButton: 'bg-gray-400',
        },
        green: {
            button: 'bg-emerald-500 hover:bg-emerald-600',
            iconBg: 'bg-emerald-500',
            lockedButton: 'bg-gray-400',
        },
        orange: {
            button: 'bg-orange-500 hover:bg-orange-600',
            iconBg: 'bg-orange-500',
            lockedButton: 'bg-gray-400',
        },
    };

    const colors = colorClasses[accentColor as keyof typeof colorClasses] || colorClasses.purple;

    const isLocked = (grade: number): boolean => {
        if (!user) return true;
        return !canAccessQuizGrade(numericUserGrade, category, subcategory, grade, isAdmin);
    };

    const handleGradeClick = (grade: number) => {
        if (!user) {
            navigate(ROUTES.AUTH);
            return;
        }
        if (!isLocked(grade)) {
            onSelectGrade(grade);
        }
    };

    return (
        <div className={`min-h-screen bg-violet-50 relative overflow-hidden`}>
            <FloatingBackground />
            {/* Back Button */}
            <div className="relative z-10 p-6">
                <button
                    onClick={() => navigate(backPath)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-lg transition-colors duration-200"
                >
                    <ArrowLeft size={20} />
                    <span>Back</span>
                </button>
            </div>

            <div className="relative z-10 flex items-center justify-center min-h-screen px-6 pb-20 -mt-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50 max-w-md w-full"
                >
                    {/* Header */}
                    <div className="text-center mb-6">
                        {icon && (
                            <div className={`w-16 h-16 ${colors.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                                {icon}
                            </div>
                        )}
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">{title}</h1>
                        <p className="text-gray-600">{description}</p>
                    </div>

                    {/* Grade Restriction Notice */}
                    {user && userGrade && !isAdmin && (
                        <motion.div
                            className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-xl text-center"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <p className="text-blue-700 text-sm">
                                📚 You are signed in as <span className="font-bold">{userGrade}</span>.
                                {category === 'academic' && ' Only your grade\'s content is available.'}
                            </p>
                        </motion.div>
                    )}

                    {/* Grade Buttons */}
                    <div className="space-y-4">
                        {grades.map((grade) => {
                            const locked = isLocked(grade);
                            const lockReason = getLockedReason(numericUserGrade, category, subcategory, grade, isAdmin);

                            return (
                                <motion.button
                                    key={grade}
                                    onClick={() => handleGradeClick(grade)}
                                    className={`w-full py-4 px-6 rounded-lg font-bold text-xl transition-all duration-200 relative ${locked
                                            ? `${colors.lockedButton} text-white/70 cursor-not-allowed`
                                            : `${colors.button} text-white`
                                        }`}
                                    whileHover={locked ? {} : { scale: 1.02 }}
                                    whileTap={locked ? {} : { scale: 0.98 }}
                                    title={lockReason || undefined}
                                    disabled={locked}
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        {locked && <Lock size={18} />}
                                        Grade {grade}
                                    </span>
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default GradeSelector;

import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ReactNode } from 'react';

interface QuizHeaderProps {
    title: string;
    subtitle?: string;
    backPath: string;
    onReset?: () => void;
    showReset?: boolean;
    leftContent?: ReactNode;
    rightContent?: ReactNode;
    gradientColors?: string;
}

/**
 * Reusable Quiz Header component
 * Provides consistent header with back button, title, and optional reset
 */
export const QuizHeader = ({
    title,
    subtitle,
    backPath,
    onReset,
    showReset = true,
    leftContent,
    rightContent,
    gradientColors = 'from-violet-600 to-purple-600',
}: QuizHeaderProps) => {
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-between mb-6">
            {/* Left: Back Button */}
            <motion.button
                onClick={() => navigate(backPath)}
                className="group flex items-center space-x-2 px-4 py-2 text-slate-600 rounded-lg transition-all duration-300 ease-out hover:text-slate-800 hover:bg-white/50 hover:shadow-md"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <ArrowLeft
                    size={20}
                    className="transform group-hover:-translate-x-1 transition-transform duration-300"
                />
                <span className="font-medium">Back</span>
            </motion.button>

            {leftContent}

            {/* Center: Title */}
            <div className="text-center flex-1">
                <h1 className={`text-2xl md:text-3xl font-bold bg-gradient-to-r ${gradientColors} bg-clip-text text-transparent`}>
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-slate-600 text-sm mt-1">{subtitle}</p>
                )}
            </div>

            {rightContent}

            {/* Right: Reset Button */}
            {showReset && onReset ? (
                <motion.button
                    onClick={onReset}
                    className={`group relative px-4 py-2 bg-gradient-to-r ${gradientColors} text-white rounded-full font-medium overflow-hidden transition-all duration-300 ease-out hover:shadow-lg`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <span className="flex items-center gap-2">
                        <RotateCcw size={18} />
                        <span className="hidden sm:inline">Reset</span>
                    </span>
                </motion.button>
            ) : (
                <div className="w-20" /> // Spacer for layout balance
            )}
        </div>
    );
};

export default QuizHeader;

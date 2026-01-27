import React from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

interface LockedGradeCardProps {
    grade: number;
    reason?: string;
    description?: string;
    wordCount?: number | string;
    index?: number;
}

/**
 * A grade card component that displays a locked/inaccessible grade
 * with visual indicators and a reason tooltip.
 */
export const LockedGradeCard: React.FC<LockedGradeCardProps> = ({
    grade,
    reason = 'This quiz is not available for your grade.',
    description,
    wordCount,
    index = 0,
}) => {
    return (
        <motion.div
            className="bg-white rounded-2xl p-6 shadow-lg border-2 opacity-50 cursor-not-allowed border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 0.5, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            title={reason}
        >
            <div className="text-center relative">
                {/* Lock Icon */}
                <div className="absolute -top-2 -right-2 bg-gray-500 text-white p-1.5 rounded-full">
                    <Lock size={14} />
                </div>

                {/* Grade Number */}
                <div className="bg-gray-400 text-white text-2xl font-bold w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    {grade}
                </div>

                {/* Grade Title */}
                <h3 className="text-xl font-semibold text-gray-500 mb-2">
                    Grade {grade}
                </h3>

                {/* Description */}
                {description && (
                    <p className="text-sm text-gray-400 leading-relaxed">
                        {description}
                    </p>
                )}

                {/* Lock reason tooltip */}
                <div className="mt-3 text-xs font-medium text-gray-400 flex items-center justify-center gap-1">
                    <Lock size={12} />
                    <span>Locked</span>
                </div>

                {/* Word/Question Count */}
                {wordCount && (
                    <div className="mt-2 text-xs text-gray-400">
                        {wordCount} {typeof wordCount === 'number' ? 'items' : ''}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default LockedGradeCard;

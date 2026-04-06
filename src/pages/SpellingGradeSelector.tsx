import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../supabase-client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
import { useAuth } from '../contexts/AuthContext';
import {
  getNumericGrade,
  canAccessQuizGrade,
  getLockedReason,
  getCategoryBlockedMessage
} from '../utils/gradeUtils';
import { ROUTES, spellingTestRoute } from '../routes';

interface GradeInfo {
  grade: number;
  description: string;
  wordCount: number;
}

const SpellingGradeSelector: React.FC = () => {
  const navigate = useNavigate();
  const { grade: userGrade, isAdmin, user } = useAuth();
  const userNumericGrade = getNumericGrade(userGrade);
  const [grades, setGrades] = useState<GradeInfo[]>([]);

  // Fetch grade list from backend
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/quiz-content/spelling/grades`)
      .then(r => r.json())
      .then(data => { if (data.success) setGrades(data.grades); })
      .catch(() => {});
  }, []);

  // Check if the whole category is blocked
  const categoryBlockedMessage = getCategoryBlockedMessage(userNumericGrade, 'academic');

  const handleGradeSelect = (grade: number) => {
    if (!user) {
      navigate(ROUTES.AUTH);
      return;
    }
    if (canAccessQuizGrade(userNumericGrade, 'academic', 'spelling', grade, isAdmin)) {
      navigate(spellingTestRoute(grade));
    }
  };

  const isGradeLocked = (grade: number): boolean => {
    if (!user) return true;
    return !canAccessQuizGrade(userNumericGrade, 'academic', 'spelling', grade, isAdmin);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-4xl p-3 rounded-full shadow-lg mr-4">
              📝
            </div>
            <h1 className="text-4xl font-bold text-gray-800">
              Spelling Test
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose your grade level to start the spelling test. Each grade has words appropriate for that level!
          </p>
        </motion.div>

        {/* Category Blocked Message (for grades 6-8 if applicable) */}
        {categoryBlockedMessage && (
          <motion.div
            className="mb-6 p-4 bg-yellow-50 border border-yellow-300 rounded-xl text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-yellow-800 font-medium">
              ⚠️ {categoryBlockedMessage}
            </p>
          </motion.div>
        )}

        {/* Grade Restriction Notice */}
        {user && userGrade && !isAdmin && !categoryBlockedMessage && (
          <motion.div
            className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-blue-700 font-medium">
              📚 You are signed in as a <span className="font-bold">{userGrade}</span> student.
              Only Grade {userNumericGrade} content is available.
            </p>
          </motion.div>
        )}

        {/* Grade Selection Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {grades.map((gradeData, index) => {
            const locked = isGradeLocked(gradeData.grade);
            const lockReason = getLockedReason(userNumericGrade, 'academic', 'spelling', gradeData.grade, isAdmin);

            return (
              <motion.div
                key={gradeData.grade}
                className={`bg-white rounded-2xl p-6 shadow-lg transition-shadow duration-300 border-2 ${locked
                    ? 'opacity-50 cursor-not-allowed border-gray-200'
                    : 'hover:shadow-xl cursor-pointer hover:border-purple-300'
                  }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: locked ? 0.5 : 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={locked ? {} : {
                  scale: 1.05,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                }}
                whileTap={locked ? {} : { scale: 0.95 }}
                onClick={() => handleGradeSelect(gradeData.grade)}
                title={lockReason || undefined}
              >
                <div className="text-center relative">
                  {locked && (
                    <div className="absolute -top-2 -right-2 bg-gray-500 text-white p-1.5 rounded-full">
                      <Lock size={14} />
                    </div>
                  )}

                  <div className={`text-white text-2xl font-bold w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg ${locked ? 'bg-gray-400' : 'bg-gradient-to-r from-blue-500 to-purple-600'
                    }`}>
                    {gradeData.grade}
                  </div>

                  <h3 className={`text-xl font-semibold mb-2 ${locked ? 'text-gray-400' : 'text-gray-800'}`}>
                    Grade {gradeData.grade}
                  </h3>

                  <p className={`text-sm leading-relaxed ${locked ? 'text-gray-400' : 'text-gray-600'}`}>
                    {gradeData.description}
                  </p>

                  <div className={`mt-3 text-xs font-medium ${locked ? 'text-gray-400' : 'text-purple-600'}`}>
                    {gradeData.wordCount} words
                  </div>
                </div>

                {/* Hover Arrow */}
                {!locked && (
                  <motion.div
                    className="text-center mt-3 text-purple-500 opacity-0"
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="text-lg">→</div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Back Button */}
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <button
            onClick={() => navigate(ROUTES.CATEGORY_ACADEMIC_SKILLS)}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            ← Back to Academic Tests
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default SpellingGradeSelector;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import FloatingBackground from '../components/FloatingBackground';
import { useAuth } from '../contexts/AuthContext';
import {
  getNumericGrade,
  canAccessQuizGrade
} from '../utils/gradeUtils';
import { ROUTES, oralSentenceBuildingGradeRoute, categoryRoute } from '../routes';
import { sentenceBuildingGrades } from '../data/sentenceBuildingData';

const SentenceBuildingGradeSelector: React.FC = () => {
  const navigate = useNavigate();
  const { grade: userGrade, isAdmin, user } = useAuth();
  const userNumericGrade = getNumericGrade(userGrade);

  const handleGradeSelect = (grade: number) => {
    if (!user) {
      navigate(ROUTES.AUTH);
      return;
    }
    if (canAccessQuizGrade(userNumericGrade, 'oral', 'oral-language', grade, isAdmin)) {
      navigate(oralSentenceBuildingGradeRoute(grade));
    }
  };

  const isGradeLocked = (grade: number): boolean => {
    if (!user) return true;
    return !canAccessQuizGrade(userNumericGrade, 'oral', 'oral-language', grade, isAdmin);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-emerald-100 relative overflow-hidden">
      <FloatingBackground />

      {/* Header with back button */}
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={() => navigate(categoryRoute('oral-skills'))}
          className="group flex items-center space-x-2 px-4 py-2 text-white bg-black/20 backdrop-blur-sm rounded-lg transition-all duration-300 ease-out hover:bg-black/30 hover:shadow-md transform hover:scale-105"
        >
          <ArrowLeft size={20} className="transform group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-medium">back</span>
        </button>
      </div>

      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-6xl w-full">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={40} className="text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Sentence Building
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Build sentences from pictures! Start with simple identification and progress to
              complex sentence construction and inference.
            </p>

            {/* Grade Restriction Notice */}
            {user && userGrade && !isAdmin && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl inline-block"
              >
                <p className="text-green-700 font-medium text-sm">
                  💬 You can only access <span className="font-bold">Grade {userNumericGrade}</span> content.
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Grade Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {sentenceBuildingGrades.map((gradeInfo, index) => {
              const locked = isGradeLocked(gradeInfo.grade);
              return (
                <motion.div
                  key={gradeInfo.grade}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`group transform transition-all duration-300 ${locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
                  onClick={() => handleGradeSelect(gradeInfo.grade)}
                >
                  <div className={`bg-white rounded-3xl shadow-lg p-8 h-full border-2 transition-all duration-300 relative overflow-hidden ${locked ? 'border-gray-200' : 'border-transparent group-hover:border-green-300'}`}>
                    {/* Lock Icon */}
                    {locked && (
                      <div className="absolute top-4 right-4 bg-gray-500 text-white p-2 rounded-full z-20">
                        <Lock size={16} />
                      </div>
                    )}

                    {/* Background gradient */}
                    <div className={`absolute inset-0 ${locked ? 'bg-gray-300' : `bg-gradient-to-br ${gradeInfo.color}`} opacity-5 ${locked ? '' : 'group-hover:opacity-10'} transition-opacity duration-300`}></div>

                    {/* Content */}
                    <div className="relative z-10">
                      {/* Grade number and difficulty */}
                      <div className="flex justify-between items-start mb-6">
                        <div className={`text-4xl font-bold ${locked ? 'text-gray-400' : `bg-gradient-to-r ${gradeInfo.color} bg-clip-text text-transparent`}`}>
                          {gradeInfo.title}
                        </div>
                        <span className={`
                        px-3 py-1 rounded-full text-sm font-semibold text-white
                        ${locked ? 'bg-gray-400' :
                            gradeInfo.grade === 1 ? 'bg-green-500' :
                              gradeInfo.grade === 2 ? 'bg-blue-500' :
                                gradeInfo.grade === 3 ? 'bg-purple-500' : 'bg-red-500'}
                      `}>
                          {gradeInfo.difficulty}
                        </span>
                      </div>

                      {/* Description */}
                      <p className={`text-lg mb-4 font-medium ${locked ? 'text-gray-400' : 'text-gray-600'}`}>
                        {gradeInfo.description}
                      </p>

                      {/* Question count */}
                      <div className={`rounded-lg p-3 mb-6 ${locked ? 'bg-gray-100' : 'bg-green-50'}`}>
                        <p className={`text-sm font-semibold text-center ${locked ? 'text-gray-400' : 'text-green-700'}`}>
                          💬 {gradeInfo.questions.length} Questions
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="flex justify-between items-center pt-6 mt-6 border-t border-gray-100">
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${locked ? 'text-gray-400' : 'text-gray-700'}`}>{gradeInfo.questions.length}</div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide">Questions</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${locked ? 'text-gray-400' : 'text-gray-700'}`}>~{gradeInfo.grade + 4}</div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide">Minutes</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 max-w-3xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                How Sentence Building Works
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg mb-3">
                    1
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">Look at the Picture</h4>
                  <p className="text-center">Carefully observe the image and think about what you see</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg mb-3">
                    2
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">Read the Question</h4>
                  <p className="text-center">Understand what is being asked about the picture</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg mb-3">
                    3
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">Choose the Best Answer</h4>
                  <p className="text-center">Pick the sentence that best matches the picture</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SentenceBuildingGradeSelector;

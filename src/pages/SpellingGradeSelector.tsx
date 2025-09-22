import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { spellingData } from '../data/spellingData';

const SpellingGradeSelector: React.FC = () => {
  const navigate = useNavigate();

  const handleGradeSelect = (grade: number) => {
    navigate(`/spelling-test/${grade}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 p-6">
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

        {/* Grade Selection Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {spellingData.map((gradeData, index) => (
            <motion.div
              key={gradeData.grade}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer border-2 hover:border-purple-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleGradeSelect(gradeData.grade)}
            >
              <div className="text-center">
                {/* Grade Number */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-2xl font-bold w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  {gradeData.grade}
                </div>
                
                {/* Grade Title */}
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Grade {gradeData.grade}
                </h3>
                
                {/* Description */}
                <p className="text-sm text-gray-600 leading-relaxed">
                  {gradeData.description}
                </p>
                
                {/* Word Count */}
                <div className="mt-3 text-xs text-purple-600 font-medium">
                  {gradeData.words.length} words
                </div>
              </div>
              
              {/* Hover Arrow */}
              <motion.div
                className="text-center mt-3 text-purple-500 opacity-0"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-lg">→</div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Back Button */}
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <button
            onClick={() => navigate('/category/academic')}
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
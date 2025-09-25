import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { writingData } from '../data/writingData';
import { BookOpen, Pencil, Users, Target, ArrowLeft } from 'lucide-react';

const WritingGradeSelector: React.FC = () => {
  const navigate = useNavigate();

  const handleGradeSelect = (grade: number) => {
    navigate(`/writing-test/${grade}`);
  };

  const getGradeIcon = (grade: number) => {
    if (grade <= 2) return <Pencil className="w-8 h-8" />;
    if (grade <= 5) return <BookOpen className="w-8 h-8" />;
    if (grade <= 6) return <Users className="w-8 h-8" />;
    return <Target className="w-8 h-8" />;
  };

  const getGradeDescription = (grade: number) => {
    if (grade <= 2) return "Simple sentences & basic writing";
    if (grade <= 5) return "Paragraphs & story writing";
    if (grade <= 6) return "Essays & opinion writing";
    return "Advanced analysis & research writing";
  };

  const getGradientColor = (grade: number) => {
    if (grade <= 2) return "from-pink-400 to-red-400";
    if (grade <= 5) return "from-blue-400 to-purple-400";
    if (grade <= 6) return "from-green-400 to-teal-400";
    return "from-purple-400 to-indigo-500";
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
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white text-4xl p-3 rounded-full shadow-lg mr-4">
              ✍️
            </div>
            <h1 className="text-4xl font-bold text-gray-800">
              Writing Assessment
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose your grade level to start writing! Each grade has different topics and writing goals.
          </p>
        </motion.div>

        {/* Grade Selection Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {writingData.map((gradeData, index) => (
            <motion.div
              key={gradeData.grade}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-purple-300 group"
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
                {/* Grade Icon */}
                <div className={`bg-gradient-to-r ${getGradientColor(gradeData.grade)} text-white p-4 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {getGradeIcon(gradeData.grade)}
                </div>
                
                {/* Grade Number */}
                <div className="text-3xl font-bold text-gray-800 mb-2">
                  Grade {gradeData.grade}
                </div>
                
                {/* Description */}
                <p className="text-sm text-gray-600 leading-relaxed mb-3">
                  {getGradeDescription(gradeData.grade)}
                </p>
                
                {/* Topics Count */}
                <div className="text-xs text-purple-600 font-medium mb-3">
                  {gradeData.topics.length} writing topics
                </div>

                {/* Word Count Range */}
                <div className="text-xs text-gray-500 mb-3">
                  {gradeData.topics[0].wordCount.min}-{gradeData.topics[0].wordCount.max} words
                </div>
                
                {/* Skill Focus Preview */}
                <div className="flex flex-wrap gap-1 justify-center">
                  {gradeData.skillFocus.slice(0, 2).map((skill, skillIndex) => (
                    <span
                      key={skillIndex}
                      className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                  {gradeData.skillFocus.length > 2 && (
                    <span className="text-purple-600 text-xs">
                      +{gradeData.skillFocus.length - 2} more
                    </span>
                  )}
                </div>
              </div>
              
              {/* Hover Arrow */}
              <motion.div
                className="text-center mt-4 text-purple-500 opacity-0 group-hover:opacity-100"
                transition={{ duration: 0.2 }}
              >
                <div className="text-lg">→ Start Writing</div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Features Preview */}
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-lg mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">What's Included:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <div className="text-3xl mb-2">📝</div>
              <h4 className="font-medium text-gray-800">Writing Prompts</h4>
              <p className="text-sm text-gray-600">Age-appropriate topics that spark creativity</p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">📊</div>
              <h4 className="font-medium text-gray-800">Smart Evaluation</h4>
              <p className="text-sm text-gray-600">Grade-specific rubrics and feedback</p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">🎯</div>
              <h4 className="font-medium text-gray-800">Skill Building</h4>
              <p className="text-sm text-gray-600">Focus on grade-level writing skills</p>
            </div>
          </div>
        </motion.div>

        {/* Back Button */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <button
            onClick={() => navigate('/category/academic-skills')}
            className="inline-flex items-center px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Academic Tests
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default WritingGradeSelector;
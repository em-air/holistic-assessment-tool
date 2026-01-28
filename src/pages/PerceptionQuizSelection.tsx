import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Eye, Search, List } from 'lucide-react';
import { motion } from 'framer-motion';
import FloatingBackground from '../components/FloatingBackground';

const PerceptionQuizSelection: React.FC = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();

  const perceptionQuizzes = [
    {
      id: 'missing-object',
      title: 'Missing Object',
      subtitle: 'Visual Memory',
      description: 'Identify which object was removed from a set of pictures',
      icon: Search,
      route: '/category/mind/perception/missing-object',
      color: 'from-pink-500 to-rose-600',
      difficulty: 'All Ages'
    },
    {
      id: 'sentence-difference',
      title: 'Find Sentence Differences',
      subtitle: 'Text Perception',
      description: 'Identify differences between similar sentences',
      icon: Search,
      route: '/category/mind/perception/sentence-difference',
      color: 'from-green-500 to-emerald-600',
      difficulty: 'Grades 1-4'
    },
    {
      id: 'logical-sequencing',
      title: 'Logical Sequencing',
      subtitle: 'Sequential Processing',
      description: 'Arrange sentences in the correct logical order',
      icon: List,
      route: '/category/mind/perception/logical-sequencing',
      color: 'from-purple-500 to-pink-600',
      difficulty: 'Grades 1-4'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-indigo-100 relative overflow-hidden">
      <FloatingBackground />

      {/* Header with back button */}
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={() => navigate('/category/mind')}
          className="group flex items-center space-x-2 px-4 py-2 text-white bg-black/20 backdrop-blur-sm rounded-lg transition-all duration-300 ease-out hover:bg-black/30 hover:shadow-md transform hover:scale-105"
        >
          <ArrowLeft size={20} className="transform group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-medium">back</span>
        </button>
      </div>

      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-4xl w-full">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Eye size={40} className="text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Perception Activities
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose a perception activity to test your visual processing and logical thinking skills
            </p>
          </motion.div>

          {/* Quiz Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {perceptionQuizzes.map((quiz, index) => {
              const IconComponent = quiz.icon;

              return (
                <motion.div
                  key={quiz.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                  onClick={() => navigate(quiz.route)}
                >
                  <div className="bg-white rounded-3xl shadow-lg p-8 h-full border-2 border-transparent group-hover:border-blue-300 transition-all duration-300 relative overflow-hidden">
                    {/* Background gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${quiz.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>

                    {/* Content */}
                    <div className="relative z-10 text-center">
                      {/* Icon */}
                      <div className={`w-16 h-16 bg-gradient-to-r ${quiz.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                        <IconComponent size={32} className="text-white" />
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-gray-800 mb-1">
                        {quiz.title}
                      </h3>

                      {/* Subtitle */}
                      <p className="text-xs text-gray-500 font-medium bg-gray-100 inline-block px-2 py-0.5 rounded mb-3">
                        ({quiz.subtitle})
                      </p>

                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-4 min-h-[2.5rem]">
                        {quiz.description}
                      </p>

                      {/* Difficulty */}
                      <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        {quiz.difficulty}
                      </span>

                      {/* Play Button */}
                      <div className="mt-6">
                        <div className={`
                          inline-flex items-center px-6 py-3 rounded-xl font-semibold text-white
                          bg-gradient-to-r ${quiz.color} 
                          transform transition-all duration-200 
                          group-hover:shadow-lg group-hover:scale-105
                        `}>
                          Start Quiz
                        </div>
                      </div>
                    </div>

                    {/* Hover effect */}
                    <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-blue-200 transition-all duration-300"></div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-12 text-center"
          >
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                About Perception Activities
              </h3>
              <p className="text-gray-600 text-sm">
                These activities help develop visual processing skills, attention to detail,
                and logical thinking abilities. Each quiz targets different aspects of perception
                and cognitive processing to provide a comprehensive assessment.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PerceptionQuizSelection;
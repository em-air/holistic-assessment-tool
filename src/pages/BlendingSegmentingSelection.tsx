import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Volume2, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import FloatingBackground from '../components/FloatingBackground';
import { categoryRoute, blendingQuizRoute, segmentingQuizRoute } from '../routes';

const BlendingSegmentingSelection: React.FC = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams();

  const quizOptions = [
    {
      id: 'blending',
      title: 'Blending Quiz',
      description: 'Combine sounds to form words',
      icon: Volume2,
      color: 'from-green-400 to-emerald-500',
      route: blendingQuizRoute(categoryId!)
    },
    {
      id: 'segmenting',
      title: 'Segmenting Quiz',
      description: 'Break words into individual sounds',
      icon: Zap,
      color: 'from-purple-400 to-pink-500',
      route: segmentingQuizRoute(categoryId!)
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-500 relative overflow-hidden">
      <FloatingBackground />
      
      <div className="relative z-10 p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-white hover:text-gray-200 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg transition-colors duration-200"
        >
          <ArrowLeft size={20} />
          <span>Back to Category</span>
        </button>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl w-full"
        >
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
              Blending and Segmenting
            </h1>
            <p className="text-xl text-white/90 drop-shadow">
              Choose a quiz to practice your phonemic awareness skills
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {quizOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => navigate(option.route)}
                  className="group relative bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 hover:scale-105 text-left overflow-hidden"
                >
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${option.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className={`w-16 h-16 bg-gradient-to-br ${option.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-gray-900">
                      {option.title}
                    </h2>
                    
                    <p className="text-gray-600 group-hover:text-gray-700">
                      {option.description}
                    </p>

                    {/* Arrow indicator */}
                    <div className="mt-4 flex items-center text-indigo-600 group-hover:text-indigo-700 font-semibold">
                      <span>Start Quiz</span>
                      <svg 
                        className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Info Box */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              💡 What's the difference?
            </h3>
            <div className="space-y-2 text-gray-700">
              <p>
                <strong>Blending:</strong> You'll hear individual sounds and combine them to make a word (e.g., /c/ /a/ /t/ → "cat")
              </p>
              <p>
                <strong>Segmenting:</strong> You'll hear a word and break it into individual sounds (e.g., "dog" → /d/ /o/ /g/)
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default BlendingSegmentingSelection;

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Brain, Target, Eye, Focus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AttentionMemorySelection: React.FC = () => {
  const navigate = useNavigate();

  const assessmentOptions = [
    {
      id: 'attention',
      title: 'Attention Assessment',
      subtitle: 'Focus & Attention Control',
      description: 'Evaluate your ability to focus and shift attention using a research-based questionnaire.',
      icon: Focus,
      color: 'from-blue-400 to-purple-500',
      borderColor: 'border-blue-200 hover:border-blue-400',
      features: [
        'Measures attentional focusing ability',
        'Assesses attention shifting skills', 
        'Based on validated research',
        'Provides detailed feedback'
      ],
      route: '/attention-assessment',
      duration: '10-15 minutes'
    },
    {
      id: 'memory',
      title: 'Memory Games',
      subtitle: 'Memory & Cognitive Tasks',
      description: 'Test your memory skills with interactive games and challenges.',
      icon: Brain,
      color: 'from-emerald-400 to-teal-500',
      borderColor: 'border-emerald-200 hover:border-emerald-400',
      features: [
        'Visual memory challenges',
        'Sequence memory games',
        'Progressive difficulty levels',
        'Interactive gameplay'
      ],
      route: '/attention-quiz',
      duration: '15-20 minutes'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-300 via-purple-400 to-pink-500 py-8">
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/categories/mind')}
            className="group flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-all duration-300 ease-out hover:text-purple-100 hover:bg-white/20 hover:shadow-md transform hover:scale-105 hover:-translate-y-0.5"
          >
            <ArrowLeft size={20} className="transform group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-medium">Back to Mind</span>
          </button>
        </div>

        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            Attention & Memory
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto drop-shadow-md">
            Choose an assessment to evaluate your cognitive abilities
          </p>
        </motion.div>

        {/* Assessment Options */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          {assessmentOptions.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className={`bg-white/95 backdrop-blur-sm rounded-2xl border-2 ${option.borderColor} p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 cursor-pointer`}
              onClick={() => navigate(option.route)}
            >
              {/* Icon and Title */}
              <div className="flex items-center mb-6">
                <div className={`w-16 h-16 bg-gradient-to-r ${option.color} rounded-2xl flex items-center justify-center mr-4 shadow-lg`}>
                  <option.icon size={28} className="text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-1">
                    {option.title}
                  </h3>
                  <p className="text-sm text-gray-500 font-medium">
                    {option.subtitle}
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 mb-6 leading-relaxed">
                {option.description}
              </p>

              {/* Features */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                  What's Included:
                </h4>
                <ul className="space-y-2">
                  {option.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600">
                      <Eye size={16} className="text-gray-400 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Duration and CTA */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-500">
                  <Target size={16} className="mr-1" />
                  {option.duration}
                </div>
                <div className={`px-4 py-2 bg-gradient-to-r ${option.color} text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200`}>
                  Start Assessment
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-4xl mx-auto mt-12 bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl"
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Understanding Attention & Memory
            </h3>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div>
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                  <Focus size={20} className="mr-2 text-blue-500" />
                  Attention Assessment
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Based on validated research from the Attentional Control Scale for Children (ACS-C), 
                  this assessment measures your ability to focus on tasks and shift attention when needed. 
                  It provides insights into your attentional control abilities.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                  <Brain size={20} className="mr-2 text-emerald-500" />
                  Memory Games
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Interactive games that challenge different aspects of memory including visual memory, 
                  sequence memory, and working memory. These activities help assess and exercise your 
                  cognitive abilities through engaging gameplay.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AttentionMemorySelection;
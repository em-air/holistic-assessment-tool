import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Brain, Target, Eye, Focus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AssessmentProgressBar from '../components/AssessmentProgressBar';
import MindSectionReport from '../components/MindSectionReport';
import FloatingBackground from '../components/FloatingBackground';
import { ROUTES } from '../routes';

const AttentionMemorySelection: React.FC = () => {
  const navigate = useNavigate();
  const [showReport, setShowReport] = useState(false);

  const assessmentOptions = [
    {
      id: 'attention-questionnaire',
      title: 'Attention Questionnaire',
      subtitle: 'Attention',
      description: 'Evaluate your ability to focus and shift attention using a research-based questionnaire.',
      icon: Focus,
      color: 'bg-blue-500',
      route: ROUTES.ATTENTION_QUIZ,
      duration: '10-15 minutes'
    },
    {
      id: 'picture-sequence',
      title: 'Picture Sequence',
      subtitle: 'Memory',
      description: 'Remember the order of 3-5 pictures and recall the sequence.',
      icon: Eye,
      color: 'bg-purple-500',
      route: ROUTES.PICTURE_SEQUENCE,
      startType: 'sequence_recall',
      duration: '10 minutes'
    }
  ];

  return (
    <div className="min-h-screen bg-purple-50 relative overflow-hidden py-8">
      <FloatingBackground />
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(ROUTES.CATEGORY_MIND)}
            className="group flex items-center space-x-2 px-4 py-2 text-gray-700 rounded-lg transition-all duration-300 ease-out hover:text-purple-700 hover:bg-white/60 hover:shadow-md transform hover:scale-105 hover:-translate-y-0.5"
          >
            <ArrowLeft size={20} className="transform group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-medium">Back</span>
          </button>
        </div>

        {/* Progress Bar for Mind Section */}
        <div className="mb-6">
          <AssessmentProgressBar
            onShowReport={() => setShowReport(true)}
          />
        </div>

        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 drop-shadow-sm">
            Attention & Memory
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose an assessment to evaluate your cognitive abilities
          </p>
        </motion.div>

        {/* Assessment Options */}
        <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6 justify-center">
          {assessmentOptions.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              {/* Icon and Title */}
              <div className="text-center mb-4">
                <div className={`w-16 h-16 ${option.color} rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                  <option.icon size={28} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">
                  {option.title}
                </h3>
                <p className="text-xs text-gray-500 font-medium bg-gray-100 inline-block px-2 py-0.5 rounded mb-2">
                  ({option.subtitle})
                </p>
              </div>

              {/* Description */}
              <p className="text-gray-600 mb-4 leading-relaxed text-sm text-center">
                {option.description}
              </p>

              {/* Duration */}
              <div className="flex items-center justify-center text-xs text-gray-500 mb-4">
                <Target size={14} className="mr-1" />
                {option.duration}
              </div>

              {/* Start Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(option.route)}
                className={`w-full px-4 py-3 ${option.color} hover:brightness-110 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200`}
              >
                Start Quiz
              </motion.button>
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

        {/* Report Modal */}
        {showReport && (
          <MindSectionReport onClose={() => setShowReport(false)} />
        )}
      </div>
    </div>
  );
};

export default AttentionMemorySelection;
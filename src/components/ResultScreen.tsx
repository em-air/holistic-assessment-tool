import React from 'react';
import { motion } from 'framer-motion';
import { learningStyles, LearningStyle } from '../data/learningStylesData';

interface LearningStyleScore {
  style: 'visual' | 'auditory' | 'reading-writing';
  score: number;
  percentage: number;
}

interface ResultScreenProps {
  scores: LearningStyleScore[];
  dominantStyle: LearningStyle;
  language: 'en' | 'ar';
  onRetake: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({
  scores,
  dominantStyle,
  language,
  onRetake
}) => {
  const maxScore = Math.max(...scores.map(s => s.score));

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, type: "spring", bounce: 0.4 }}
          className="text-8xl mb-6"
        >
          🎉
        </motion.div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Your Learning Style Results
        </h1>
        <p className="text-xl text-gray-600">
          Discover how you learn best and optimize your study methods!
        </p>
      </motion.div>

      {/* Dominant Style Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white mb-12 shadow-2xl"
      >
        <div className="text-center">
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-6xl mb-4"
          >
            {dominantStyle.icon}
          </motion.div>
          <h2 className="text-2xl font-bold mb-4">
            Your dominant learning style is:
          </h2>
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-4xl font-extrabold mb-6"
          >
            {dominantStyle.name[language]}
          </motion.h3>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-lg leading-relaxed max-w-2xl mx-auto"
          >
            {dominantStyle.description[language]}
          </motion.p>
        </div>
      </motion.div>

      {/* Scores Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white rounded-2xl shadow-lg p-8 mb-8"
      >
        <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">
          Your Learning Style Profile
        </h3>
        
        <div className="space-y-6">
          {scores.map((scoreData, index) => {
            const styleInfo = learningStyles.find(s => s.id === scoreData.style)!;
            const isHighest = scoreData.score === maxScore;
            
            return (
              <motion.div
                key={scoreData.style}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + (index * 0.1) }}
                className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                  isHighest ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-3xl mr-4">{styleInfo.icon}</span>
                    <div>
                      <h4 className="text-lg font-bold text-gray-800">
                        {styleInfo.name[language]}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {scoreData.score} out of {scores.reduce((total, s) => total + s.score, 0)} points
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-800">
                      {scoreData.percentage}%
                    </div>
                    {isHighest && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.8 + (index * 0.1) }}
                        className="text-yellow-500"
                      >
                        👑
                      </motion.div>
                    )}
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${scoreData.percentage}%` }}
                    transition={{ duration: 1, delay: 0.6 + (index * 0.1), ease: "easeOut" }}
                    className={`h-4 rounded-full ${
                      isHighest ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : styleInfo.color
                    }`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Learning Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 mb-8"
      >
        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          💡 Study Tips for {dominantStyle.name[language]}
        </h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dominantStyle.id === 'visual' && (
            <>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl mb-2">📊</div>
                <h4 className="font-semibold text-gray-800 mb-2">Use Visual Aids</h4>
                <p className="text-sm text-gray-600">Create charts, diagrams, and mind maps to organize information</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl mb-2">🌈</div>
                <h4 className="font-semibold text-gray-800 mb-2">Color Coding</h4>
                <p className="text-sm text-gray-600">Use different colors to highlight and categorize information</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl mb-2">📹</div>
                <h4 className="font-semibold text-gray-800 mb-2">Watch Videos</h4>
                <p className="text-sm text-gray-600">Use educational videos and visual demonstrations</p>
              </div>
            </>
          )}
          
          {dominantStyle.id === 'auditory' && (
            <>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl mb-2">🗣️</div>
                <h4 className="font-semibold text-gray-800 mb-2">Discuss & Explain</h4>
                <p className="text-sm text-gray-600">Talk through concepts with others or explain them out loud</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl mb-2">🎵</div>
                <h4 className="font-semibold text-gray-800 mb-2">Use Audio Resources</h4>
                <p className="text-sm text-gray-600">Listen to podcasts, audiobooks, and recorded lectures</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl mb-2">👥</div>
                <h4 className="font-semibold text-gray-800 mb-2">Study Groups</h4>
                <p className="text-sm text-gray-600">Join study groups and participate in discussions</p>
              </div>
            </>
          )}
          
          {dominantStyle.id === 'reading-writing' && (
            <>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl mb-2">📝</div>
                <h4 className="font-semibold text-gray-800 mb-2">Take Detailed Notes</h4>
                <p className="text-sm text-gray-600">Write comprehensive notes and summaries</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl mb-2">📚</div>
                <h4 className="font-semibold text-gray-800 mb-2">Read Extensively</h4>
                <p className="text-sm text-gray-600">Use textbooks, articles, and written materials</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl mb-2">✍️</div>
                <h4 className="font-semibold text-gray-800 mb-2">Write to Learn</h4>
                <p className="text-sm text-gray-600">Use writing exercises and essay practice</p>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onRetake}
          className="px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
        >
          🔄 Retake Quiz
        </motion.button>
        
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
        >
          📊 View More Assessments
        </motion.button>
      </motion.div>
    </div>
  );
};

export default ResultScreen;
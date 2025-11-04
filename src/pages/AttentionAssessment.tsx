import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle, Brain, Target, TrendingUp, AlertCircle, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { attentionControlQuestions, calculateAttentionScores, interpretScores, getRecommendations } from '../data/attentionControlData';

interface AttentionResults {
  focusingScore: number;
  shiftingScore: number;
  totalScore: number;
  focusingPercentage: number;
  shiftingPercentage: number;
  totalPercentage: number;
  interpretation: {
    focusing: { level: string; description: string };
    shifting: { level: string; description: string };
    overall: { level: string; description: string };
    recommendations: string[];
  };
}

const AttentionAssessment: React.FC = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<number[]>(new Array(attentionControlQuestions.length).fill(0));
  const [isCompleted, setIsCompleted] = useState(false);
  const [results, setResults] = useState<AttentionResults | null>(null);

  const question = attentionControlQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / attentionControlQuestions.length) * 100;

  const handleResponse = (value: number) => {
    const newResponses = [...responses];
    newResponses[currentQuestion] = value;
    setResponses(newResponses);
  };

  const handleNext = () => {
    if (currentQuestion < attentionControlQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      completeAssessment();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const completeAssessment = () => {
    // Convert responses array to the format expected by calculateAttentionScores
    const responseMap: Record<number, number> = {};
    attentionControlQuestions.forEach((question, index) => {
      responseMap[question.id] = responses[index];
    });
    
    const scores = calculateAttentionScores(responseMap);
    const interpretation = interpretScores(scores);
    
    // Generate recommendations based on the interpretation
    const recommendations: string[] = [];
    
    if (interpretation.focusing.level !== 'Good') {
      recommendations.push(
        'Practice mindfulness exercises to improve focus',
        'Create a quiet, distraction-free study environment',
        'Break tasks into smaller, manageable chunks'
      );
    }

    if (interpretation.shifting.level !== 'Good') {
      recommendations.push(
        'Practice switching between different types of activities',
        'Use transition cues when changing tasks',
        'Work on cognitive flexibility exercises'
      );
    }

    if (interpretation.overall.level === 'Developing') {
      recommendations.push(
        'Consider discussing attention strategies with teachers',
        'Establish consistent routines and structure'
      );
    }

    const assessmentResults: AttentionResults = {
      focusingScore: scores.focusing.raw,
      shiftingScore: scores.shifting.raw,
      totalScore: scores.total.raw,
      focusingPercentage: Math.round((scores.focusing.raw / (scores.focusing.count * 4)) * 100),
      shiftingPercentage: Math.round((scores.shifting.raw / (scores.shifting.count * 4)) * 100),
      totalPercentage: Math.round(scores.total.percentage),
      interpretation: {
        focusing: interpretation.focusing,
        shifting: interpretation.shifting,
        overall: interpretation.overall,
        recommendations: recommendations
      }
    };

    setResults(assessmentResults);
    setIsCompleted(true);
  };

  const resetAssessment = () => {
    setCurrentQuestion(0);
    setResponses(new Array(attentionControlQuestions.length).fill(0));
    setIsCompleted(false);
    setResults(null);
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-blue-600 bg-blue-100';
    if (percentage >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreIcon = (percentage: number) => {
    if (percentage >= 80) return <Star className="w-5 h-5" />;
    if (percentage >= 60) return <CheckCircle className="w-5 h-5" />;
    if (percentage >= 40) return <TrendingUp className="w-5 h-5" />;
    return <AlertCircle className="w-5 h-5" />;
  };

  if (isCompleted && results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-300 via-purple-400 to-pink-500 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain size={36} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Assessment Complete!
              </h1>
              <p className="text-gray-600">
                Here are your attention control results
              </p>
            </div>

            {/* Score Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-700">Focusing Ability</h3>
                  <div className={`p-2 rounded-lg ${getScoreColor(results.focusingPercentage)}`}>
                    {getScoreIcon(results.focusingPercentage)}
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-2">
                  {results.focusingPercentage}%
                </div>
                <div className="text-sm text-gray-600">
                  {results.focusingScore}/36 points
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-700">Attention Shifting</h3>
                  <div className={`p-2 rounded-lg ${getScoreColor(results.shiftingPercentage)}`}>
                    {getScoreIcon(results.shiftingPercentage)}
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-2">
                  {results.shiftingPercentage}%
                </div>
                <div className="text-sm text-gray-600">
                  {results.shiftingScore}/24 points
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-700">Overall Score</h3>
                  <div className={`p-2 rounded-lg ${getScoreColor(results.totalPercentage)}`}>
                    {getScoreIcon(results.totalPercentage)}
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-2">
                  {results.totalPercentage}%
                </div>
                <div className="text-sm text-gray-600">
                  {results.totalScore}/60 points
                </div>
              </div>
            </div>

            {/* Interpretation */}
            <div className="space-y-6 mb-8">
              <div className="bg-blue-50 rounded-2xl p-6">
                <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Focusing Ability
                </h3>
                <p className="text-blue-700 leading-relaxed">
                  {results.interpretation.focusing.description}
                </p>
              </div>

              <div className="bg-purple-50 rounded-2xl p-6">
                <h3 className="font-semibold text-purple-800 mb-3 flex items-center">
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Attention Shifting
                </h3>
                <p className="text-purple-700 leading-relaxed">
                  {results.interpretation.shifting.description}
                </p>
              </div>

              <div className="bg-green-50 rounded-2xl p-6">
                <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                  <Brain className="w-5 h-5 mr-2" />
                  Overall Assessment
                </h3>
                <p className="text-green-700 leading-relaxed mb-4">
                  {results.interpretation.overall.description}
                </p>
                
                <h4 className="font-semibold text-green-800 mb-3">Recommendations:</h4>
                <ul className="space-y-2">
                  {results.interpretation.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start text-green-700">
                      <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={resetAssessment}
                className="px-8 py-3 border-2 border-blue-500 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-200 transform hover:scale-105"
              >
                Take Again
              </button>
              <button
                onClick={() => navigate('/attention-memory-selection')}
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                Try Memory Games
              </button>
              <button
                onClick={() => navigate('/attention-memory-selection')}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                Back
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-300 via-purple-400 to-pink-500 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/attention-memory-selection')}
            className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-all duration-300 hover:bg-white/20"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <div className="text-white text-sm font-medium">
            Question {currentQuestion + 1} of {attentionControlQuestions.length}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/30 rounded-full h-3 mb-8">
          <motion.div
            className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full shadow-lg"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl mb-8"
          >
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-white font-bold">{currentQuestion + 1}</span>
                </div>
                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {question.subscale === 'focusing' ? 'Focusing Ability' : 'Attention Shifting'}
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-4 leading-relaxed">
                {question.kidFriendlyQuestion}
              </h2>
              
              <p className="text-gray-600 text-sm">
                Choose the option that best describes how often this applies to you:
              </p>
            </div>

            {/* Response Options */}
            <div className="space-y-3">
              {['Never', 'Sometimes', 'Often', 'Always'].map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleResponse(index + 1)}
                  className={`w-full p-4 text-left rounded-2xl border-2 transition-all duration-200 ${
                    responses[currentQuestion] === index + 1
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 text-gray-800 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                      responses[currentQuestion] === index + 1
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {responses[currentQuestion] === index + 1 && (
                        <CheckCircle className="w-4 h-4 text-white" fill="currentColor" />
                      )}
                    </div>
                    <span className="font-medium text-inherit">{option}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              currentQuestion === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md transform hover:scale-105'
            }`}
          >
            <ArrowLeft size={20} />
            <span>Previous</span>
          </button>

          <button
            onClick={handleNext}
            disabled={responses[currentQuestion] === 0}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              responses[currentQuestion] === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg transform hover:scale-105'
            }`}
          >
            <span>{currentQuestion === attentionControlQuestions.length - 1 ? 'Complete' : 'Next'}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttentionAssessment;

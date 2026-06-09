import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle, Brain, Target, TrendingUp, AlertCircle, Star, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProgressTracker } from '../utils/progressTracker';
import MindSectionReport from '../components/MindSectionReport';
import { ROUTES } from '../routes';
import FloatingBackground from '../components/FloatingBackground';
import {
  calculateAttentionAssessmentResults,
  getAttentionControlQuestions,
  type AttentionControlQuestion,
  type AttentionResults,
} from '../services/attentionControlService';

const AttentionAssessment: React.FC = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<AttentionControlQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [results, setResults] = useState<AttentionResults | null>(null);
  const [startTime] = useState<Date>(new Date());
  const [showReport, setShowReport] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const question = questions[currentQuestion];
  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  // Fetch questions from API
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);

      try {
        const loadedQuestions = await getAttentionControlQuestions();
        if (loadedQuestions.length > 0) {
          setQuestions(loadedQuestions);
          setResponses(new Array(loadedQuestions.length).fill(0));
        } else {
          throw new Error('No attention assessment questions are available.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load questions');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleResponse = (value: number) => {
    const newResponses = [...responses];
    newResponses[currentQuestion] = value;
    setResponses(newResponses);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
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

  const completeAssessment = async () => {
    // Build response map for API
    const responseMap: Record<number, number> = {};
    questions.forEach((q, index) => {
      responseMap[q.id] = responses[index];
    });

    setSubmissionError(null);
    const assessmentResults = await calculateAttentionAssessmentResults(responseMap);
    if (!assessmentResults) {
      setSubmissionError('Unable to calculate your results right now. Please try again.');
      return;
    }

    setResults(assessmentResults);
    setIsCompleted(true);

    ProgressTracker.saveQuizResult({
      quizId: 'attention-assessment',
      quizName: 'Attention Control Assessment',
      subcategory: 'attention',
      score: assessmentResults.totalScore,
      totalQuestions: questions.length,
      percentage: assessmentResults.totalPercentage,
      timeSpent: Math.round((new Date().getTime() - startTime.getTime()) / 1000),
      completedAt: new Date().toISOString(),
      additionalData: {
        attentionLevel: assessmentResults.interpretation.overall.level,
        attentionDescription: assessmentResults.interpretation.overall.description,
        focusingLevel: assessmentResults.interpretation.focusing.level,
        shiftingLevel: assessmentResults.interpretation.shifting.level,
        focusingPercentage: assessmentResults.focusingPercentage,
        shiftingPercentage: assessmentResults.shiftingPercentage,
      }
    });
  };

  const resetAssessment = () => {
    setCurrentQuestion(0);
    setResponses(new Array(questions.length).fill(0));
    setIsCompleted(false);
    setResults(null);
    setSubmissionError(null);
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
      <div className="min-h-screen bg-indigo-50 relative overflow-hidden py-8">
        <FloatingBackground />
        <div className="container mx-auto px-4 max-w-4xl relative z-10">
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
                onClick={() => navigate(ROUTES.ATTENTION_MEMORY)}
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                Try Memory Games
              </button>
              <button
                onClick={() => navigate(ROUTES.ATTENTION_MEMORY)}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                Back
              </button>
            </div>
          </motion.div>

          {/* Report Modal */}
          {showReport && (
            <MindSectionReport onClose={() => setShowReport(false)} />
          )}
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-indigo-50 relative overflow-hidden flex items-center justify-center">
        <FloatingBackground />
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-700">Loading questions...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-indigo-50 relative overflow-hidden flex items-center justify-center">
        <FloatingBackground />
        <div className="text-center bg-white rounded-2xl p-8 shadow-xl max-w-md relative z-10">
          <XCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Failed to Load</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(ROUTES.ATTENTION_MEMORY)}
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-6 rounded-xl"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // No questions loaded
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-indigo-50 relative overflow-hidden flex items-center justify-center">
        <FloatingBackground />
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-700">Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-indigo-50 relative overflow-hidden py-8">
      <FloatingBackground />
      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(ROUTES.ATTENTION_MEMORY)}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 rounded-lg transition-all duration-300 hover:bg-white/60"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <div className="text-gray-700 text-sm font-medium">
            Question {currentQuestion + 1} of {questions.length}
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

              {question.example && (
                <p className="text-sm text-gray-500 italic mb-4 leading-relaxed">
                  {question.example}
                </p>
              )}

              <p className="text-gray-600 text-sm">
                Choose the option that best describes how often this applies to you:
              </p>
            </div>

            {/* Response Options */}
            <div className="space-y-3">
              {['Never', 'Sometimes', 'Many Times', 'Always'].map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleResponse(index + 1)}
                  className={`w-full p-4 text-left rounded-2xl border-2 transition-all duration-200 ${responses[currentQuestion] === index + 1
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 text-gray-800 hover:text-gray-900'
                    }`}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${responses[currentQuestion] === index + 1
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
        {submissionError && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 text-center">
            {submissionError}
          </div>
        )}

        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${currentQuestion === 0
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
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${responses[currentQuestion] === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg transform hover:scale-105'
              }`}
          >
            <span>{currentQuestion === questions.length - 1 ? 'Complete' : 'Next'}</span>
            <ArrowRight size={20} />
          </button>
        </div>

        {/* Report Modal */}
        {showReport && (
          <MindSectionReport onClose={() => setShowReport(false)} />
        )}
      </div>
    </div>
  );
};

export default AttentionAssessment;

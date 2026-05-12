import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { evaluateWritingWithGemini, WritingEvaluation } from '../services/geminiService';
import { ProgressTracker } from '../utils/progressTracker';
import { ArrowLeft, Clock, Target, BookOpen, Lightbulb, CheckCircle, Star, RefreshCw, Sparkles, Brain } from 'lucide-react';
import { logger } from '../utils/logger';
import { ROUTES } from '../routes';
import { getWritingTopics, type WritingTopic, type GradeWritingData } from '../services/writingQuizService';

const WritingTest: React.FC = () => {
  const { grade } = useParams<{ grade: string }>();
  const navigate = useNavigate();
  const [gradeData, setGradeData] = useState<GradeWritingData | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<WritingTopic | null>(null);
  const [studentText, setStudentText] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<WritingEvaluation | null>(null);
  const [showTopicSelection, setShowTopicSelection] = useState(true);
  const [timeStarted, setTimeStarted] = useState<Date | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [isLoadingGradeData, setIsLoadingGradeData] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const hasSavedResultRef = useRef(false);

  // Save results to progress tracker (and database) when evaluation is complete
  useEffect(() => {
    if (evaluation && selectedTopic && grade && !hasSavedResultRef.current) {
      hasSavedResultRef.current = true;
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      const score = Math.round(evaluation.overallScore);

      ProgressTracker.saveQuizResult({
        quizId: 'writing-test',
        quizName: `Writing Test - Grade ${grade}`,
        category: 'academic',
        subcategory: 'writing',
        score,
        totalQuestions: evaluation.maxScore,
        percentage: evaluation.maxScore > 0 ? Math.round((score / evaluation.maxScore) * 100) : 0,
        timeSpent,
        completedAt: new Date().toISOString(),
        gradeLevel: `Grade ${grade}`,
        additionalData: {
          topic: selectedTopic.title,
          scores: evaluation.scores,
          wordCount,
        },
      });
      logger.log('Writing Test result saved via ProgressTracker');
    }
    // Reset the guard when evaluation is cleared (new test)
    if (!evaluation) {
      hasSavedResultRef.current = false;
    }
  }, [evaluation, selectedTopic, grade, wordCount]);

  useEffect(() => {
    let isMounted = true;

    const loadWritingTopics = async () => {
      if (!grade) {
        if (isMounted) {
          setGradeData(null);
          setLoadError('Missing grade');
          setIsLoadingGradeData(false);
        }
        return;
      }

      setIsLoadingGradeData(true);
      setLoadError(null);

      const data = await getWritingTopics(parseInt(grade, 10));

      if (!isMounted) {
        return;
      }

      if (!data) {
        setGradeData(null);
        setLoadError('Unable to load writing topics.');
      } else {
        setGradeData(data);
      }

      setIsLoadingGradeData(false);
    };

    void loadWritingTopics();

    return () => {
      isMounted = false;
    };
  }, [grade]);

  useEffect(() => {
    // Count words in the text
    const words = studentText.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [studentText]);

  const handleTopicSelect = (topic: WritingTopic) => {
    setSelectedTopic(topic);
    setShowTopicSelection(false);
    setTimeStarted(new Date());
    startTimeRef.current = Date.now();  // Reset timer when topic is selected
  };

  const evaluateWriting = async () => {
    if (!selectedTopic || !gradeData || !grade) return;

    setIsEvaluating(true);

    try {
      const evaluation = await evaluateWritingWithGemini(
        studentText,
        parseInt(grade),
        selectedTopic.title
      );
      
      setEvaluation(evaluation);
    } catch (error) {
      logger.error('Error evaluating writing:', error);
      
      // Fallback to simple evaluation if Gemini fails
      const words = studentText.trim().split(/\s+/).filter(word => word.length > 0);
      const currentWordCount = words.length;
      
      const fallbackEvaluation: WritingEvaluation = {
        overallScore: Math.min(36, Math.max(6, currentWordCount / 10 + studentText.length / 50)),
        maxScore: 36,
        grade: grade,
        feedback: "Thank you for your writing! Keep practicing to improve your skills.",
        strengths: ["You completed the writing task", "You shared your ideas", "You tried your best"],
        areasForImprovement: ["Keep practicing writing", "Focus on clear ideas"],
        scores: {
          ideas: 3,
          organization: 3,
          voice: 2,
          wordChoice: 2,
          sentenceFluency: 3,
          conventions: 2
        },
        suggestions: [
          "Keep writing every day to improve your skills",
          "Read your work out loud to check if it makes sense",
          "Ask a teacher or parent to help you with spelling and punctuation"
        ]
      };
      
      setEvaluation(fallbackEvaluation);
    } finally {
      setIsEvaluating(false);
    }
  };

  const resetWriting = () => {
    setStudentText('');
    setEvaluation(null);
    setSelectedTopic(null);
    setShowTopicSelection(true);
    setTimeStarted(null);
    setWordCount(0);
  };

  if (isLoadingGradeData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">✍️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Loading Writing Assessment...</h2>
        </div>
      </div>
    );
  }

  if (!gradeData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">✍️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Writing Assessment Unavailable</h2>
          <p className="mb-4 text-gray-600">{loadError || 'Writing topics could not be loaded for this grade.'}</p>
          <button
            onClick={() => navigate(ROUTES.WRITING_GRADES)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
          >
            Back to Grade Selection
          </button>
        </div>
      </div>
    );
  }

  if (showTopicSelection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Grade {grade} Writing Topics</h1>
            <p className="text-gray-600 mb-4">Choose a topic that interests you!</p>
            <div className="bg-white rounded-xl p-4 shadow-md inline-block">
              <p className="text-sm text-gray-700">
                <strong>Word Count Goal:</strong> {gradeData.topics[0].wordCount.min}-{gradeData.topics[0].wordCount.max} words
              </p>
            </div>
          </motion.div>

          {/* Topic Selection */}
          <div className="grid gap-6 mb-8">
            {gradeData.topics.map((topic, index) => (
              <motion.div
                key={topic.id}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-purple-300 group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleTopicSelect(topic)}
              >
                <div className="flex items-start">
                  <div className="bg-gradient-to-r from-purple-400 to-pink-400 text-white p-3 rounded-full mr-4 group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{topic.title}</h3>
                    <p className="text-gray-700 mb-3">{topic.prompt}</p>
                    <p className="text-sm text-gray-600 mb-4">{topic.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {topic.criteria.map((criteria, criteriaIndex) => (
                        <span
                          key={criteriaIndex}
                          className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full"
                        >
                          {criteria}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="text-2xl">→</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Back Button */}
          <div className="text-center">
            <button
              onClick={() => navigate(ROUTES.WRITING_GRADES)}
              className="inline-flex items-center px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Grade Selection
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show AI evaluation loading screen
  if (isEvaluating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 p-6 flex items-center justify-center">
        <motion.div 
          className="text-center max-w-md mx-auto"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center"
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <Brain className="w-12 h-12 text-white" />
          </motion.div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-4">AI Teacher is Reading...</h2>
          <p className="text-gray-600 mb-6 text-lg">
            Our AI teacher is carefully analyzing your writing using advanced language understanding.
          </p>
          
          <div className="space-y-3 text-left bg-white rounded-xl p-4 shadow-lg">
            <motion.div 
              className="flex items-center text-gray-700"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              Analyzing ideas and content
            </motion.div>
            <motion.div 
              className="flex items-center text-gray-700"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
            >
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              Checking organization and structure  
            </motion.div>
            <motion.div 
              className="flex items-center text-gray-700"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.5 }}
            >
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              Evaluating writing voice and style
            </motion.div>
            <motion.div 
              className="flex items-center text-gray-700"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 2 }}
            >
              <motion.div
                className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full mr-2"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              Generating personalized feedback...
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (evaluation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Results Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-6xl mb-4">
              {Math.round((evaluation.overallScore / evaluation.maxScore) * 100) >= 85 ? '🏆' : 
               Math.round((evaluation.overallScore / evaluation.maxScore) * 100) >= 70 ? '⭐' : '💪'}
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Writing Complete!</h1>
            <h2 className="text-2xl font-semibold text-purple-600 mb-4">
              "{selectedTopic?.title}"
            </h2>
            <div className="bg-white rounded-2xl p-6 shadow-lg inline-block">
              <div className="text-3xl font-bold text-gray-800 mb-2">{evaluation.overallScore}/{evaluation.maxScore}</div>
              <div className="text-lg text-gray-600">Score: {Math.round((evaluation.overallScore / evaluation.maxScore) * 100)}%</div>
              <div className="text-sm text-gray-500 mt-2">
                Word Count: {wordCount}
                {selectedTopic && wordCount >= selectedTopic.wordCount.min && wordCount <= selectedTopic.wordCount.max ? 
                  <span className="text-green-600 ml-2">✓ Meets requirement</span> : 
                  <span className="text-orange-600 ml-2">⚠ Try writing {selectedTopic?.wordCount.min}-{selectedTopic?.wordCount.max} words</span>
                }
              </div>
            </div>
          </motion.div>

          {/* Fallback Warning Banner */}
          {evaluation.isFallback && (
            <motion.div
              className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-800 font-medium">
                    {evaluation.errorType === 'rate_limit' 
                      ? 'AI service is busy - showing basic feedback'
                      : evaluation.errorType === 'service_unavailable'
                      ? 'AI service temporarily unavailable - showing basic feedback'
                      : 'AI detailed analysis unavailable - showing basic feedback'}
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Your writing has been saved. Try refreshing the evaluation in a few moments for detailed AI analysis.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Overall Comment */}
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-lg mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-500" />
              AI Teacher's Feedback
            </h3>
            <p className="text-gray-700 text-lg">{evaluation.feedback}</p>
          </motion.div>

          {/* Detailed Scoring */}
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-lg mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Brain className="w-5 h-5 mr-2 text-purple-500" />
              Detailed AI Analysis
            </h3>
            <div className="space-y-4">
              {Object.entries(evaluation.scores).map(([criteria, score], index) => (
                <motion.div
                  key={criteria}
                  className="border-l-4 border-purple-300 pl-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800 capitalize">
                      {criteria.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <div className="flex items-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        score >= 5 ? 'bg-green-100 text-green-800' :
                        score >= 3 ? 'bg-blue-100 text-blue-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {score}/6
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        score >= 5 ? 'bg-green-500' :
                        score >= 3 ? 'bg-blue-500' :
                        'bg-orange-500'
                      }`}
                      style={{ width: `${(score / 6) * 100}%` }}
                    ></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Strengths and Next Steps */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <motion.div
              className="bg-green-50 rounded-2xl p-6 shadow-lg border-2 border-green-200"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Your Strengths
              </h3>
              <ul className="space-y-2">
                {evaluation.strengths.map((strength: string, index: number) => (
                  <li key={index} className="text-green-700 flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              className="bg-orange-50 rounded-2xl p-6 shadow-lg border-2 border-orange-200"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 }}
            >
              <h3 className="text-lg font-semibold text-orange-800 mb-3 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2" />
                Areas to Improve
              </h3>
              <ul className="space-y-2">
                {evaluation.areasForImprovement.map((improvement: string, index: number) => (
                  <li key={index} className="text-orange-700 flex items-start">
                    <span className="text-orange-500 mr-2">•</span>
                    {improvement}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* AI Suggestions */}
          <motion.div
            className="bg-blue-50 rounded-2xl p-6 shadow-lg border-2 border-blue-200 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
              <Sparkles className="w-5 h-5 mr-2" />
              Writing Tips for You
            </h3>
            <ul className="space-y-2">
              {evaluation.suggestions.map((suggestion: string, index: number) => (
                <li key={index} className="text-blue-700 flex items-start">
                  <span className="text-blue-500 mr-2">💡</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {evaluation.isFallback && (
              <button
                onClick={async () => {
                  setIsEvaluating(true);
                  setEvaluation(null);
                  try {
                    const newEvaluation = await evaluateWritingWithGemini(
                      studentText,
                      parseInt(grade!),
                      selectedTopic!.title
                    );
                    setEvaluation(newEvaluation);
                    if (!newEvaluation.isFallback) {
                      logger.log('AI evaluation successful on retry');
                    }
                  } catch (error) {
                    logger.error('Retry evaluation failed:', error);
                    setEvaluation(evaluation); // Restore the fallback evaluation
                  } finally {
                    setIsEvaluating(false);
                  }
                }}
                disabled={isEvaluating}
                className="inline-flex items-center px-6 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white rounded-xl font-medium transition-colors shadow-lg"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isEvaluating ? 'animate-spin' : ''}`} />
                {isEvaluating ? 'Retrying...' : 'Retry AI Analysis'}
              </button>
            )}
            <button
              onClick={resetWriting}
              className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors shadow-lg"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Write Another Topic
            </button>
            <button
              onClick={() => navigate(ROUTES.WRITING_GRADES)}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-colors shadow-lg"
            >
              Choose Different Grade
            </button>
            <button
              onClick={() => navigate(ROUTES.CATEGORY_ACADEMIC_SKILLS)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-lg"
            >
              Back to Academic Tests
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Writing Interface Header */}
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-lg mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Grade {grade} Writing</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <Target className="w-4 h-4 mr-1" />
                Goal: {selectedTopic?.wordCount.min}-{selectedTopic?.wordCount.max} words
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-1" />
                {timeStarted && `Started ${timeStarted.toLocaleTimeString()}`}
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-xl p-4 border-l-4 border-purple-400">
            <h3 className="font-semibold text-purple-800 mb-2">{selectedTopic?.title}</h3>
            <p className="text-purple-700 mb-2">{selectedTopic?.prompt}</p>
            <p className="text-purple-600 text-sm">{selectedTopic?.description}</p>
          </div>
        </motion.div>

        {/* Writing Area */}
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-lg mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Your Writing</h3>
            <div className={`text-sm font-medium ${
              wordCount >= (selectedTopic?.wordCount.min || 0) && wordCount <= (selectedTopic?.wordCount.max || 1000)
                ? 'text-green-600' 
                : wordCount < (selectedTopic?.wordCount.min || 0)
                ? 'text-orange-600'
                : 'text-red-600'
            }`}>
              {wordCount} words
              {wordCount >= (selectedTopic?.wordCount.min || 0) && wordCount <= (selectedTopic?.wordCount.max || 1000) && (
                <span className="ml-1">✓</span>
              )}
            </div>
          </div>
          
          <textarea
            value={studentText}
            onChange={(e) => setStudentText(e.target.value)}
            placeholder={`Start writing about "${selectedTopic?.title}"...`}
            className="w-full h-80 p-4 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none resize-none text-lg leading-relaxed"
            style={{ 
              fontFamily: 'system-ui, sans-serif',
              lineHeight: '1.6'
            }}
          />
          
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Writing Skills Focus:</span>
            {gradeData?.skillFocus.map((skill, index) => (
              <span
                key={index}
                className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={evaluateWriting}
            disabled={studentText.trim().length < 10 || isEvaluating}
            className={`px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg ${
              studentText.trim().length >= 10 && !isEvaluating
                ? 'bg-green-600 hover:bg-green-700 text-white hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isEvaluating ? (
              <span className="flex items-center">
                <motion.div
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <Brain className="w-4 h-4 mr-1" />
                AI Evaluating...
              </span>
            ) : (
              <span className="flex items-center">
                <Sparkles className="w-4 h-4 mr-2" />
                Get AI Evaluation
              </span>
            )}
          </button>
          
          <button
            onClick={() => setShowTopicSelection(true)}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-colors shadow-lg"
          >
            Change Topic
          </button>
          
          <button
            onClick={() => navigate(ROUTES.WRITING_GRADES)}
            className="inline-flex items-center px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-colors shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Grades
          </button>
        </div>

        {/* Tips */}
        <motion.div
          className="mt-8 bg-blue-50 rounded-2xl p-6 shadow-lg border-2 border-blue-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
            <Lightbulb className="w-5 h-5 mr-2" />
            Writing Tips for Grade {grade}
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {selectedTopic?.criteria.map((tip, index) => (
              <div key={index} className="flex items-start text-blue-700">
                <span className="text-blue-500 mr-2">•</span>
                <span className="text-sm">{tip}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WritingTest;
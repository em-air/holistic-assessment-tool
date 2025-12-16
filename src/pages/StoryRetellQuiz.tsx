import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Book, CheckCircle, Lightbulb, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  StoryRetellQuestion,
  getStoriesForGrade
} from '../data/storyRetellData';
import { ProgressTracker } from '../utils/progressTracker';
import FloatingBackground from '../components/FloatingBackground';

const StoryRetellQuiz: React.FC = () => {
  const navigate = useNavigate();
  const { grade: gradeParam } = useParams<{ grade: string }>();
  const grade = parseInt(gradeParam || '1');

  // Quiz state
  const [stories, setStories] = useState<StoryRetellQuestion[]>([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [showStory, setShowStory] = useState(true);
  const [hasReadStory, setHasReadStory] = useState(false);
  
  // Multiple choice selections
  const [selectedBeginning, setSelectedBeginning] = useState<string | null>(null);
  const [selectedMiddle, setSelectedMiddle] = useState<string | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<string | null>(null);
  
  // UI state
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const totalStories = 3; // Number of stories per grade
  const currentStory = stories[currentStoryIndex];

  // Initialize quiz
  useEffect(() => {
    if (!grade) return;

    try {
      const gradeStories = getStoriesForGrade(grade, totalStories);
      console.log('Loaded stories for grade:', grade, gradeStories);
      setStories(gradeStories);
      setCurrentStoryIndex(0);
      setScore({ correct: 0, total: 0 });
      setShowResult(false);
    } catch (error) {
      console.error('Error loading story retell questions:', error);
    }
  }, [grade]);

  // Reset form when story changes
  useEffect(() => {
    if (currentStory) {
      setShowStory(true);
      setHasReadStory(false);
      setSelectedBeginning(null);
      setSelectedMiddle(null);
      setSelectedEnd(null);
      setIsSubmitted(false);
    }
  }, [currentStory]);

  const handleStartRetelling = () => {
    setShowStory(false);
    setHasReadStory(true);
  };

  const toggleStoryView = () => {
    setShowStory(!showStory);
  };

  const handleSubmit = () => {
    if (!currentStory || isSubmitted) return;
    
    // Validate that all sections are selected
    if (!selectedBeginning || !selectedMiddle || !selectedEnd) {
      alert('Please select an option for Beginning, Middle, and End');
      return;
    }

    // Check if answers are correct
    const beginningCorrect = currentStory.beginningOptions.find(opt => opt.id === selectedBeginning)?.isCorrect || false;
    const middleCorrect = currentStory.middleOptions.find(opt => opt.id === selectedMiddle)?.isCorrect || false;
    const endCorrect = currentStory.endOptions.find(opt => opt.id === selectedEnd)?.isCorrect || false;
    
    const correctCount = (beginningCorrect ? 1 : 0) + (middleCorrect ? 1 : 0) + (endCorrect ? 1 : 0);
    
    setScore(prev => ({
      correct: prev.correct + correctCount,
      total: prev.total + 3
    }));
    
    setIsSubmitted(true);
  };

  const handleNext = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    // Save progress
    const percentage = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
    
    ProgressTracker.saveQuizResult({
      quizId: 'story-retell',
      quizName: 'Story Retelling',
      subcategory: 'oral-language',
      score: score.correct,
      totalQuestions: score.total,
      percentage: percentage,
      timeSpent: 0,
      completedAt: new Date().toISOString(),
      gradeLevel: `Grade ${grade}`,
    });

    setShowResult(true);
  };

  if (!currentStory) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading stories...</p>
        </div>
      </div>
    );
  }

  if (showResult) {
    const percentage = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;

    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-indigo-100 relative overflow-hidden">
        <FloatingBackground />
        
        <div className="flex items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full text-center relative z-10"
          >
            <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
            
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Great Work!
            </h2>
            
            <p className="text-xl text-gray-600 mb-6">
              You completed all {stories.length} story retellings!
            </p>

            <div className="bg-blue-50 rounded-xl p-6 mb-6">
              <h3 className="text-2xl font-bold text-blue-800 mb-2">Your Score</h3>
              <p className="text-4xl font-bold text-blue-600 mb-2">{percentage}%</p>
              <p className="text-gray-600">
                {score.correct} out of {score.total} questions correct
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <p className="text-green-800">
                {percentage >= 80 ? '🌟 Excellent work! You have a strong understanding of story structure!' :
                 percentage >= 60 ? '👍 Good job! Keep practicing to improve your story comprehension.' :
                 '💪 Keep trying! Read stories carefully and think about the beginning, middle, and end.'}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/story-retell-quiz')}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200"
              >
                Try Different Grade
              </button>
              
              <button
                onClick={() => navigate('/oral-language-selection/oral-skills')}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200"
              >
                Back to Oral Skills
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-indigo-100 relative overflow-hidden">
      <FloatingBackground />
      
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
        <button
          onClick={() => navigate('/story-retell-quiz')}
          className="flex items-center space-x-2 px-4 py-2 text-white bg-black/20 backdrop-blur-sm rounded-lg hover:bg-black/30 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">back</span>
        </button>
        
        <div className="text-white text-center bg-black/20 backdrop-blur-sm rounded-lg px-4 py-2">
          <div className="text-sm opacity-90">Grade {grade} • Story Retell</div>
          <div className="font-bold">Story {currentStoryIndex + 1} of {stories.length}</div>
        </div>
        
        <div className="w-20"></div> {/* Spacer for symmetry */}
      </div>

      <div className="flex items-center justify-center min-h-screen p-4 pt-24">
        <div className="max-w-4xl w-full">
          <motion.div
            key={currentStoryIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl p-8"
          >
            {/* Story Title */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Book size={32} className="text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                {currentStory.title}
              </h2>
            </div>

            {/* Story Display */}
            {showStory && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6"
              >
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-blue-800">Read the Story</h3>
                    <span className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                      {currentStory.wordCount} words
                    </span>
                  </div>
                  <div className="prose prose-lg text-gray-700 leading-relaxed">
                    {currentStory.story}
                  </div>
                </div>

                {!hasReadStory && (
                  <div className="mt-6 text-center">
                    <button
                      onClick={handleStartRetelling}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-xl transition-colors duration-200 inline-flex items-center space-x-2"
                    >
                      <CheckCircle size={20} />
                      <span>I've Read the Story - Start Retelling</span>
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Retelling Form */}
            {hasReadStory && !isSubmitted && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {/* Toggle Story View Button */}
                <div className="mb-6 flex justify-center">
                  <button
                    onClick={toggleStoryView}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                  >
                    {showStory ? (
                      <>
                        <EyeOff size={16} />
                        <span>Hide Story</span>
                      </>
                    ) : (
                      <>
                        <Eye size={16} />
                        <span>Show Story</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start space-x-3">
                    <Lightbulb size={20} className="text-yellow-600 flex-shrink-0 mt-1" />
                    <p className="text-yellow-800 text-sm">
                      <strong>Instructions:</strong> Retell the story in your own words. Include the beginning, middle, and end. 
                      Don't forget to mention the main characters and important events!
                    </p>
                  </div>

                  {/* Beginning Section */}
                  {/* Beginning Section */}
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        1
                      </div>
                      <span className="font-semibold text-gray-800 text-lg">Beginning</span>
                    </div>
                    <p className="text-sm text-gray-600 ml-10 mb-3">
                      How did the story start?
                    </p>
                    <div className="ml-10 space-y-3">
                      {currentStory.beginningOptions.map((option) => (
                        <label
                          key={option.id}
                          className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            selectedBeginning === option.id
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                          } ${isSubmitted && option.isCorrect ? 'border-green-600 bg-green-100' : ''}
                          ${isSubmitted && selectedBeginning === option.id && !option.isCorrect ? 'border-red-500 bg-red-50' : ''}`}
                        >
                          <input
                            type="radio"
                            name="beginning"
                            value={option.id}
                            checked={selectedBeginning === option.id}
                            onChange={() => !isSubmitted && setSelectedBeginning(option.id)}
                            disabled={isSubmitted}
                            className="mt-1 mr-3"
                          />
                          <span className="flex-1 text-gray-700">{option.text}</span>
                          {isSubmitted && option.isCorrect && <CheckCircle className="text-green-600 ml-2" size={20} />}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Middle Section */}
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        2
                      </div>
                      <span className="font-semibold text-gray-800 text-lg">Middle</span>
                    </div>
                    <p className="text-sm text-gray-600 ml-10 mb-3">
                      What happened in the middle of the story?
                    </p>
                    <div className="ml-10 space-y-3">
                      {currentStory.middleOptions.map((option) => (
                        <label
                          key={option.id}
                          className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            selectedMiddle === option.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                          } ${isSubmitted && option.isCorrect ? 'border-blue-600 bg-blue-100' : ''}
                          ${isSubmitted && selectedMiddle === option.id && !option.isCorrect ? 'border-red-500 bg-red-50' : ''}`}
                        >
                          <input
                            type="radio"
                            name="middle"
                            value={option.id}
                            checked={selectedMiddle === option.id}
                            onChange={() => !isSubmitted && setSelectedMiddle(option.id)}
                            disabled={isSubmitted}
                            className="mt-1 mr-3"
                          />
                          <span className="flex-1 text-gray-700">{option.text}</span>
                          {isSubmitted && option.isCorrect && <CheckCircle className="text-blue-600 ml-2" size={20} />}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* End Section */}
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        3
                      </div>
                      <span className="font-semibold text-gray-800 text-lg">End</span>
                    </div>
                    <p className="text-sm text-gray-600 ml-10 mb-3">
                      How did the story end?
                    </p>
                    <div className="ml-10 space-y-3">
                      {currentStory.endOptions.map((option) => (
                        <label
                          key={option.id}
                          className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            selectedEnd === option.id
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                          } ${isSubmitted && option.isCorrect ? 'border-purple-600 bg-purple-100' : ''}
                          ${isSubmitted && selectedEnd === option.id && !option.isCorrect ? 'border-red-500 bg-red-50' : ''}`}
                        >
                          <input
                            type="radio"
                            name="end"
                            value={option.id}
                            checked={selectedEnd === option.id}
                            onChange={() => !isSubmitted && setSelectedEnd(option.id)}
                            disabled={isSubmitted}
                            className="mt-1 mr-3"
                          />
                          <span className="flex-1 text-gray-700">{option.text}</span>
                          {isSubmitted && option.isCorrect && <CheckCircle className="text-purple-600 ml-2" size={20} />}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="text-center pt-4">
                    <button
                      onClick={handleSubmit}
                      disabled={!selectedBeginning || !selectedMiddle || !selectedEnd || isSubmitted}
                      className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-xl transition-colors duration-200 inline-flex items-center space-x-2"
                    >
                      <CheckCircle size={20} />
                      <span>Check My Answers</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Submitted View */}
            {isSubmitted && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {/* Feedback Message */}
                <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6 mb-6">
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <Lightbulb size={32} className="text-blue-600" />
                    <h3 className="text-2xl font-bold text-blue-800">Check Your Answers!</h3>
                  </div>
                  <p className="text-center text-blue-700">
                    Look above to see which answers are correct (green) and which need improvement.
                  </p>
                </div>

                <div className="text-center">
                  <button
                    onClick={handleNext}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-xl transition-colors duration-200"
                  >
                    {currentStoryIndex < stories.length - 1 ? 'Next Story' : 'Finish Quiz'}
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default StoryRetellQuiz;
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Volume2, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FloatingBackground from '../components/FloatingBackground';
import { enhancedTTS } from '../utils/enhancedTTS';
import { saveQuizResult } from '../services/quizResultsService';

interface SegmentingQuestion {
  id: number;
  word: string;
  segments: string[];
  grade: number;
}

// Segmenting questions by grade level
const segmentingQuestions: SegmentingQuestion[] = [
  // Grade 1 Questions - Simple CVC words (3 sounds)
  { id: 1, word: 'cat', segments: ['/c/', '/a/', '/t/'], grade: 1 },
  { id: 2, word: 'dog', segments: ['/d/', '/o/', '/g/'], grade: 1 },
  { id: 3, word: 'sun', segments: ['/s/', '/u/', '/n/'], grade: 1 },
  { id: 4, word: 'pen', segments: ['/p/', '/e/', '/n/'], grade: 1 },
  { id: 5, word: 'map', segments: ['/m/', '/a/', '/p/'], grade: 1 },
  { id: 6, word: 'bed', segments: ['/b/', '/e/', '/d/'], grade: 1 },
  { id: 7, word: 'hat', segments: ['/h/', '/a/', '/t/'], grade: 1 },
  { id: 8, word: 'pin', segments: ['/p/', '/i/', '/n/'], grade: 1 },
  { id: 9, word: 'top', segments: ['/t/', '/o/', '/p/'], grade: 1 },
  { id: 10, word: 'bus', segments: ['/b/', '/u/', '/s/'], grade: 1 },

  // Grade 2 Questions - CCVC and CVCC words (4 sounds)
  { id: 11, word: 'stop', segments: ['/s/', '/t/', '/o/', '/p/'], grade: 2 },
  { id: 12, word: 'frog', segments: ['/f/', '/r/', '/o/', '/g/'], grade: 2 },
  { id: 13, word: 'plan', segments: ['/p/', '/l/', '/a/', '/n/'], grade: 2 },
  { id: 14, word: 'jump', segments: ['/j/', '/u/', '/m/', '/p/'], grade: 2 },
  { id: 15, word: 'tent', segments: ['/t/', '/e/', '/n/', '/t/'], grade: 2 },
  { id: 16, word: 'shop', segments: ['/sh/', '/o/', '/p/'], grade: 2 },
  { id: 17, word: 'chip', segments: ['/ch/', '/i/', '/p/'], grade: 2 },
  { id: 18, word: 'duck', segments: ['/d/', '/u/', '/ck/'], grade: 2 },
  { id: 19, word: 'ring', segments: ['/r/', '/i/', '/ng/'], grade: 2 },
  { id: 20, word: 'fish', segments: ['/f/', '/i/', '/sh/'], grade: 2 },

  // Grade 3 Questions - Complex blends and digraphs (4-5 sounds)
  { id: 21, word: 'spring', segments: ['/s/', '/p/', '/r/', '/i/', '/ng/'], grade: 3 },
  { id: 22, word: 'string', segments: ['/s/', '/t/', '/r/', '/i/', '/ng/'], grade: 3 },
  { id: 23, word: 'splash', segments: ['/s/', '/p/', '/l/', '/a/', '/sh/'], grade: 3 },
  { id: 24, word: 'thrill', segments: ['/th/', '/r/', '/i/', '/l/'], grade: 3 },
  { id: 25, word: 'shrink', segments: ['/sh/', '/r/', '/i/', '/ng/', '/k/'], grade: 3 },
  { id: 26, word: 'split', segments: ['/s/', '/p/', '/l/', '/i/', '/t/'], grade: 3 },
  { id: 27, word: 'crunch', segments: ['/c/', '/r/', '/u/', '/n/', '/ch/'], grade: 3 },
  { id: 28, word: 'bright', segments: ['/b/', '/r/', '/igh/', '/t/'], grade: 3 },
  { id: 29, word: 'flight', segments: ['/f/', '/l/', '/igh/', '/t/'], grade: 3 },
  { id: 30, word: 'stretch', segments: ['/s/', '/t/', '/r/', '/e/', '/ch/'], grade: 3 }
];

const SegmentingQuiz: React.FC = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userSegments, setUserSegments] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [currentQuestions, setCurrentQuestions] = useState<SegmentingQuestion[]>([]);
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  // Save quiz results to database when quiz is completed
  useEffect(() => {
    if (showResults && currentQuestions.length > 0 && selectedGrade) {
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      
      saveQuizResult({
        quiz_id: 'segmenting-quiz',
        quiz_name: `Segmenting Quiz - Grade ${selectedGrade}`,
        category: 'oral',
        subcategory: 'blending-segmenting',
        score,
        total_questions: currentQuestions.length,
        time_spent: timeSpent,
        grade_level: `Grade ${selectedGrade}`,
      }).then(result => {
        if (result.success) {
          console.log('Segmenting Quiz result saved to database');
        }
      }).catch(err => {
        console.error('Failed to save Segmenting Quiz result:', err);
      });
    }
  }, [showResults, score, currentQuestions.length, selectedGrade]);

  useEffect(() => {
    if (selectedGrade) {
      const questionsForGrade = segmentingQuestions.filter(q => q.grade === selectedGrade);
      setCurrentQuestions(questionsForGrade);
    }
  }, [selectedGrade]);

  useEffect(() => {
    enhancedTTS.preloadVoices().then(() => {
      console.log('TTS voices loaded for Segmenting Quiz');
    });
    
    return () => {
      enhancedTTS.cancel();
    };
  }, []);

  const handleGradeSelection = (grade: number) => {
    setSelectedGrade(grade);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResults(false);
    setUserSegments([]);
    setShowFeedback(false);
    startTimeRef.current = Date.now();  // Reset timer on grade selection
  };

  const playWord = async (word: string) => {
    setIsPlayingSound(true);
    
    try {
      await enhancedTTS.speak(word, {
        rate: 0.8,
        pitch: 1.1,
        volume: 1.0
      });
    } catch (error) {
      console.error('Error playing word:', error);
    } finally {
      setIsPlayingSound(false);
    }
  };

  const handleSegmentSelect = async (segment: string) => {
    if (showFeedback) return;
    
    // Play the actual sound of the phoneme when clicked (not the letter name)
    await playPhonemeSound(segment);
    
    const newSegments = [...userSegments, segment];
    setUserSegments(newSegments);
  };

  const playPhonemeSound = async (phoneme: string) => {
    try {
      // Get the actual sound representation instead of the letter name
      const soundToPlay = phonemeToSound[phoneme] || phoneme.replace(/\//g, '');
      await enhancedTTS.speak(soundToPlay, {
        rate: 0.75,
        pitch: 1.15,
        volume: 1.0
      });
    } catch (error) {
      console.error('Error playing phoneme sound:', error);
    }
  };

  const handleRemoveLastSegment = () => {
    if (showFeedback || userSegments.length === 0) return;
    
    const newSegments = userSegments.slice(0, -1);
    setUserSegments(newSegments);
  };

  const checkAnswer = () => {
    if (!currentQuestion || showFeedback || userSegments.length === 0) return;
    
    // Convert both arrays to strings for comparison, handling compounds
    const normalizedUserSegments = normalizeSegments(userSegments);
    const normalizedCorrectSegments = normalizeSegments(currentQuestion.segments);
    
    // Check if the normalized versions match
    const correct = normalizedUserSegments === normalizedCorrectSegments;
    
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      setScore(score + 1);
    }
  };

  // Normalize segments to handle compounds like /ng/ and alternative representations
  const normalizeSegments = (segments: string[]): string => {
    return segments.map(segment => {
      // Check for alternatives
      const normalized = segment;
      
      // Handle compounds - break down multi-letter phonemes if needed
      // For example, if user uses /ng/ it should match /n/ + /g/ and vice versa
      if (normalized === '/ng/') return 'ng';
      if (normalized === '/ch/') return 'ch';
      if (normalized === '/sh/') return 'sh';
      if (normalized === '/th/') return 'th';
      if (normalized === '/igh/') return 'igh';
      
      // Handle alternatives
      if (soundAlternatives[normalized]) {
        return soundAlternatives[normalized][0].replace(/\//g, '');
      }
      
      return normalized.replace(/\//g, '');
    }).join('');
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserSegments([]);
      setShowFeedback(false);
      setIsCorrect(false);
    } else {
      setShowResults(true);
    }
  };

  const resetQuiz = () => {
    setSelectedGrade(null);
    setCurrentQuestionIndex(0);
    setUserSegments([]);
    setShowFeedback(false);
    setIsCorrect(false);
    setScore(0);
    setShowResults(false);
    setCurrentQuestions([]);
    setIsPlayingSound(false);
    enhancedTTS.cancel();
  };

  const currentQuestion = currentQuestions[currentQuestionIndex];

  // Minimal phoneme options (no similar sounds)
  const allPhonemes = [
    '/a/', '/b/', '/c/', '/d/', '/e/', '/f/', '/h/', '/i/',
    '/l/', '/m/', '/n/', '/o/', '/p/', '/r/', '/s/', '/t/', '/u/',
    '/ch/', '/sh/', '/th/', '/ng/', '/igh/'
  ];

  // Alternative sounds that should be accepted as correct
  const soundAlternatives: { [key: string]: string[] } = {
    '/c/': ['/k/', '/ck/'],
    '/k/': ['/c/', '/ck/'],
    '/ck/': ['/c/', '/k/'],
    '/s/': ['/c/'],
    '/j/': ['/g/'],
    '/g/': ['/j/'],
    '/f/': ['/ph/'],
    '/ph/': ['/f/'],
    '/w/': ['/wh/'],
    '/wh/': ['/w/'],
    '/qu/': ['/kw/'],
    '/kw/': ['/qu/'],
    '/igh/': ['/i/'],
    '/i/': ['/igh/']
  };

  // Map phonemes to their actual sounds for TTS
  const phonemeToSound: { [key: string]: string } = {
    '/a/': 'ah',
    '/b/': 'buh',
    '/c/': 'kuh',
    '/d/': 'duh',
    '/e/': 'eh',
    '/f/': 'fff',
    '/h/': 'huh',
    '/i/': 'ih',
    '/l/': 'lll',
    '/m/': 'mmm',
    '/n/': 'nnn',
    '/o/': 'oh',
    '/p/': 'puh',
    '/r/': 'rrr',
    '/s/': 'sss',
    '/t/': 'tuh',
    '/u/': 'uh',
    '/ch/': 'chuh',
    '/sh/': 'shh',
    '/th/': 'thh',
    '/ng/': 'ng',
    '/igh/': 'eye'
  };

  // Grade Selection Screen
  if (!selectedGrade) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 relative overflow-hidden">
        <FloatingBackground />
        
        <div className="relative z-10 p-6">
          <button
            onClick={() => navigate(`/category/${categoryId}`)}
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
            className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50 max-w-md w-full"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Volume2 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Segmenting Quiz</h1>
              <p className="text-gray-600">Break words into individual sounds</p>
            </div>

            <div className="space-y-4">
              {[1, 2, 3].map((grade) => (
                <button
                  key={grade}
                  onClick={() => handleGradeSelection(grade)}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white py-4 px-6 rounded-lg font-bold text-xl transition-colors duration-200 transform hover:scale-105"
                >
                  Grade {grade}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Results Screen
  if (showResults) {
    const percentage = Math.round((score / currentQuestions.length) * 100);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 relative overflow-hidden">
        <FloatingBackground />
        
        <div className="relative z-10 p-6">
          <button
            onClick={() => navigate(`/category/${categoryId}`)}
            className="flex items-center space-x-2 text-white hover:text-gray-200 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft size={20} />
            <span>Back to Category</span>
          </button>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen px-6 pb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50 max-w-md w-full text-center"
          >
            <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">🎉</span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Quiz Complete!</h1>
            
            <div className="text-6xl font-bold text-purple-600 mb-4">
              {score}/{currentQuestions.length}
            </div>
            
            <p className="text-xl text-gray-700 mb-2">
              You got {score} out of {currentQuestions.length} correct
            </p>
            
            <p className="text-lg text-gray-600 mb-8">
              That's {percentage}%!
            </p>

            <div className="space-y-4">
              <button
                onClick={resetQuiz}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 px-6 rounded-lg font-bold transition-colors duration-200"
              >
                Try Another Grade
              </button>
              
              <button
                onClick={() => navigate('/categories')}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-bold transition-colors duration-200"
              >
                Back to Categories
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Quiz Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 relative overflow-hidden">
      <FloatingBackground />
      
      <div className="relative z-10 p-6">
        <button
          onClick={() => navigate(`/category/${categoryId}`)}
          className="flex items-center space-x-2 text-white hover:text-gray-200 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg transition-colors duration-200"
        >
          <ArrowLeft size={20} />
          <span>Back to Category</span>
        </button>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-6 pb-20">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50 max-w-2xl w-full"
        >
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
              <span>Grade {selectedGrade} Segmenting</span>
              <span>{currentQuestionIndex + 1} of {currentQuestions.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Listen to the word and break it into sounds
            </h2>
            
            <div className="bg-purple-100 rounded-2xl p-6 mb-4">
              <button
                onClick={() => playWord(currentQuestion?.word || '')}
                disabled={isPlayingSound}
                className={`
                  text-white p-6 rounded-full transition-all duration-200 transform shadow-lg
                  ${isPlayingSound 
                    ? 'bg-purple-600 animate-pulse cursor-not-allowed' 
                    : 'bg-purple-500 hover:bg-purple-600 hover:scale-110 cursor-pointer'
                  }
                `}
              >
                <Volume2 size={36} />
              </button>
              
              <p className="text-2xl font-bold text-gray-800 mt-4">
                {currentQuestion?.word}
              </p>
              
              <p className="text-gray-600 mt-2 text-sm">
                {isPlayingSound ? "Playing word..." : "Click to hear the word"}
              </p>
            </div>
          </div>

          {/* User's Segments */}
          <div className="mb-6">
            <div className="bg-gray-100 rounded-lg p-4 min-h-[80px] flex items-center justify-center">
              {userSegments.length === 0 ? (
                <p className="text-gray-400">Select sounds below to build the word</p>
              ) : (
                <div className="flex flex-wrap gap-2 justify-center">
                  {userSegments.map((segment, index) => (
                    <div
                      key={index}
                      className="bg-purple-500 text-white px-4 py-2 rounded-lg font-bold text-lg"
                    >
                      {segment}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Control Buttons */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleRemoveLastSegment}
                disabled={showFeedback || userSegments.length === 0}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-semibold transition-colors duration-200"
              >
                Remove Last
              </button>
              
              <button
                onClick={checkAnswer}
                disabled={showFeedback || userSegments.length === 0}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-semibold transition-colors duration-200"
              >
                Check Answer
              </button>
            </div>
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mb-6 p-4 rounded-lg ${
                  isCorrect ? 'bg-green-100 border-2 border-green-500' : 'bg-red-100 border-2 border-red-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {isCorrect ? (
                      <>
                        <CheckCircle className="text-green-600" size={24} />
                        <span className="text-green-800 font-bold">Correct!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="text-red-600" size={24} />
                        <span className="text-red-800 font-bold">Not quite right</span>
                      </>
                    )}
                  </div>
                  
                  <button
                    onClick={nextQuestion}
                    className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-6 rounded-lg font-semibold transition-colors duration-200"
                  >
                    {currentQuestionIndex < currentQuestions.length - 1 ? 'Next' : 'Finish'}
                  </button>
                </div>
                
                {!isCorrect && (
                  <div className="mt-3 text-gray-700">
                    <p className="font-semibold">Correct answer:</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {currentQuestion?.segments.map((segment, index) => (
                        <div
                          key={index}
                          className="bg-green-500 text-white px-3 py-1 rounded-lg font-bold"
                        >
                          {segment}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Phoneme Options */}
          <div>
            <p className="text-sm text-gray-600 mb-3 text-center">
              Click sounds to hear them, then select in order:
            </p>
            <div className="grid grid-cols-6 gap-3">
              {allPhonemes.map((phoneme) => (
                <button
                  key={phoneme}
                  onClick={() => handleSegmentSelect(phoneme)}
                  disabled={showFeedback}
                  className="bg-white hover:bg-purple-100 disabled:bg-gray-200 disabled:cursor-not-allowed border-2 border-purple-300 text-purple-700 py-4 px-2 rounded-lg font-bold text-lg transition-colors duration-200 hover:scale-105"
                >
                  {phoneme}
                </button>
              ))}
            </div>
          </div>

          {/* Score Display */}
          <div className="mt-6 text-center text-gray-600">
            Score: {score}/{currentQuestions.length}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SegmentingQuiz;

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Volume2, Mic } from 'lucide-react';
import { motion } from 'framer-motion';
import FloatingBackground from '../components/FloatingBackground';
import { enhancedTTS, phoneticSoundMap } from '../utils/enhancedTTS';
import { ProgressTracker } from '../utils/progressTracker';
import { logger } from '../utils/logger';
import { ROUTES, categoryRoute } from '../routes';

interface BlendingQuestion {
  id: number;
  sounds: string[];
  word: string;
  grade: number;
}

const blendingQuestions: BlendingQuestion[] = [
  // Grade 1 Questions - Simple CVC words
  { id: 1, sounds: ['/t/', '/a/', '/p/'], word: 'tap', grade: 1 },
  { id: 2, sounds: ['/c/', '/a/', '/t/'], word: 'cat', grade: 1 },
  { id: 3, sounds: ['/d/', '/o/', '/g/'], word: 'dog', grade: 1 },
  { id: 4, sounds: ['/s/', '/u/', '/n/'], word: 'sun', grade: 1 },
  { id: 5, sounds: ['/b/', '/e/', '/d/'], word: 'bed', grade: 1 },
  { id: 6, sounds: ['/m/', '/a/', '/p/'], word: 'map', grade: 1 },
  { id: 7, sounds: ['/r/', '/u/', '/g/'], word: 'rug', grade: 1 },
  { id: 8, sounds: ['/p/', '/i/', '/g/'], word: 'pig', grade: 1 },
  { id: 9, sounds: ['/b/', '/u/', '/s/'], word: 'bus', grade: 1 },
  { id: 10, sounds: ['/h/', '/a/', '/t/'], word: 'hat', grade: 1 },

  // Grade 2 Questions - CCVC and CVCC words
  { id: 11, sounds: ['/sh/', '/o/', '/p/'], word: 'shop', grade: 2 },
  { id: 12, sounds: ['/s/', '/t/', '/o/', '/p/'], word: 'stop', grade: 2 },
  { id: 13, sounds: ['/b/', '/l/', '/u/', '/e/'], word: 'blue', grade: 2 },
  { id: 14, sounds: ['/g/', '/r/', '/a/', '/s/', '/s/'], word: 'grass', grade: 2 },
  { id: 15, sounds: ['/t/', '/r/', '/u/', '/ck/'], word: 'truck', grade: 2 },
  { id: 16, sounds: ['/s/', '/p/', '/e/', '/l/', '/l/'], word: 'spell', grade: 2 },
  { id: 17, sounds: ['/th/', '/i/', '/ng/'], word: 'thing', grade: 2 },
  { id: 18, sounds: ['/wh/', '/e/', '/n/'], word: 'when', grade: 2 },
  { id: 19, sounds: ['/ch/', '/a/', '/i/', '/n/'], word: 'chain', grade: 2 },
  { id: 20, sounds: ['/s/', '/n/', '/a/', '/ck/'], word: 'snack', grade: 2 },

  // Grade 3 Questions - Complex blends and multisyllabic
  { id: 21, sounds: ['/h/', '/ou/', '/s/', '/e/'], word: 'house', grade: 3 },
  { id: 22, sounds: ['/s/', '/t/', '/r/', '/ong/'], word: 'strong', grade: 3 },
  { id: 23, sounds: ['/s/', '/p/', '/r/', '/i/', '/ng/'], word: 'spring', grade: 3 },
  { id: 24, sounds: ['/th/', '/r/', '/ough/'], word: 'through', grade: 3 },
  { id: 25, sounds: ['/s/', '/qu/', '/a/', '/r/', '/e/'], word: 'square', grade: 3 },
  { id: 26, sounds: ['/s/', '/c/', '/r/', '/a/', '/tch/'], word: 'scratch', grade: 3 },
  { id: 27, sounds: ['/f/', '/r/', '/i/', '/ght/'], word: 'fright', grade: 3 },
  { id: 28, sounds: ['/s/', '/p/', '/l/', '/a/', '/sh/'], word: 'splash', grade: 3 },
  { id: 29, sounds: ['/s/', '/t/', '/r/', '/ai/', '/ght/'], word: 'straight', grade: 3 },
  { id: 30, sounds: ['/c/', '/h/', '/a/', '/m/', '/p/', '/ion/'], word: 'champion', grade: 3 }
];

const BlendingQuiz: React.FC = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [currentQuestions, setCurrentQuestions] = useState<BlendingQuestion[]>([]);
  const [isPlayingSounds, setIsPlayingSounds] = useState(false);
  const [currentSoundIndex, setCurrentSoundIndex] = useState(-1);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [spokenWord, setSpokenWord] = useState<string>('');
  const [speechResult, setSpeechResult] = useState<'correct' | 'incorrect' | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Save quiz results when completed
  useEffect(() => {
    if (showResults && currentQuestions.length > 0 && selectedGrade) {
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      const percentage = Math.round((score / currentQuestions.length) * 100);
      
      ProgressTracker.saveQuizResult({
        quizId: 'blending-quiz',
        quizName: `Blending Quiz - Grade ${selectedGrade}`,
        category: 'oral',
        subcategory: 'blending-segmenting',
        score,
        totalQuestions: currentQuestions.length,
        percentage,
        timeSpent,
        completedAt: new Date().toISOString(),
        gradeLevel: `Grade ${selectedGrade}`,
      });
    }
  }, [showResults, score, currentQuestions.length, selectedGrade]);

  useEffect(() => {
    enhancedTTS.preloadVoices().then(() => {
      logger.log('TTS voices loaded for Blending Quiz');
    });
    
    return () => {
      enhancedTTS.cancel();
    };
  }, []);

  useEffect(() => {
    if (selectedGrade) {
      const questionsForGrade = blendingQuestions.filter(q => q.grade === selectedGrade);
      setCurrentQuestions(questionsForGrade);
    }
  }, [selectedGrade]);

  const handleGradeSelection = (grade: number) => {
    setSelectedGrade(grade);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResults(false);
    setHasAnswered(false);
    setIsListening(false);
    setSpokenWord('');
    setSpeechResult(null);
    startTimeRef.current = Date.now();  // Reset timer on grade selection
  };

  const playSounds = async (sounds: string[]) => {
    setIsPlayingSounds(true);
    setCurrentSoundIndex(-1);

    for (let i = 0; i < sounds.length; i++) {
      setCurrentSoundIndex(i);
      await playSound(sounds[i]);
      await new Promise(resolve => setTimeout(resolve, 800)); // Pause between sounds
    }

    // Play the plus signs and equals
    setCurrentSoundIndex(-1);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Say "equals"
    await playSound('equals');
    
    setIsPlayingSounds(false);
    setCurrentSoundIndex(-1);
  };

  const playSound = async (sound: string): Promise<void> => {
    let textToSpeak = sound;
    
    if (sound === 'equals') {
      textToSpeak = 'equals';
    } else {
      // Remove the slashes for pronunciation
      textToSpeak = sound.replace(/\//g, '');
      
      // Use phonetic mapping from enhanced TTS
      textToSpeak = phoneticSoundMap[textToSpeak] || textToSpeak;
    }
    
    try {
      await enhancedTTS.speak(textToSpeak, {
        rate: 0.75,
        pitch: 1.15,
        volume: 1.0
      });
    } catch (error) {
      logger.error('Error playing sound:', error);
    }
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
    setHasAnswered(true);
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    setIsListening(true);
    setSpeechResult(null);
    setSpokenWord('');

    recognition.onstart = () => {
      logger.log('Speech recognition started');
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim();
      setSpokenWord(transcript);
      
      const targetWord = currentQuestion?.word.toLowerCase();
      const isCorrect = transcript === targetWord;
      
      setSpeechResult(isCorrect ? 'correct' : 'incorrect');
      
      if (isCorrect) {
        setScore(prev => prev + 1);
      }
      
      setHasAnswered(true);
      setShowAnswer(true);
      
      // Auto advance after showing result
      setTimeout(() => {
        handleNextQuestion();
      }, 2500);
    };

    recognition.onerror = (event: any) => {
      logger.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      let errorMessage = 'Speech recognition failed. ';
      switch (event.error) {
        case 'no-speech':
          errorMessage += 'No speech was detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage += 'No microphone was found. Please check your microphone.';
          break;
        case 'not-allowed':
          errorMessage += 'Microphone access was denied. Please allow microphone access.';
          break;
        case 'network':
          errorMessage += 'Network error occurred. Please check your internet connection.';
          break;
        default:
          errorMessage += 'Please try again.';
      }
      alert(errorMessage);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleCorrect = () => {
    setScore(prev => prev + 1);
    handleNextQuestion();
  };

  const handleIncorrect = () => {
    handleNextQuestion();
  };

  const handleNextQuestion = () => {
    setTimeout(() => {
      if (currentQuestionIndex < currentQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setShowAnswer(false);
        setHasAnswered(false);
        setIsListening(false);
        setSpokenWord('');
        setSpeechResult(null);
      } else {
        setShowResults(true);
      }
    }, 1000);
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowAnswer(false);
      setHasAnswered(false);
      setIsPlayingSounds(false);
      setCurrentSoundIndex(-1);
      setIsListening(false);
      setSpokenWord('');
      setSpeechResult(null);
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
    }
  };

  const resetQuiz = () => {
    setSelectedGrade(null);
    setCurrentQuestionIndex(0);
    setShowAnswer(false);
    setScore(0);
    setShowResults(false);
    setCurrentQuestions([]);
    setIsPlayingSounds(false);
    setCurrentSoundIndex(-1);
    setHasAnswered(false);
    setIsListening(false);
    setSpokenWord('');
    setSpeechResult(null);
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  };

  const currentQuestion = currentQuestions[currentQuestionIndex];

  // Grade Selection Screen
  if (!selectedGrade) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-300 via-violet-400 to-indigo-500 relative overflow-hidden">
        <FloatingBackground />
        
        <div className="relative z-10 p-6">
          <button
            onClick={() => navigate(ROUTES.CATEGORIES)}
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
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Sound Blending</h1>
              <p className="text-gray-600">Choose your grade level to begin</p>
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
      <div className="min-h-screen bg-gradient-to-br from-purple-300 via-violet-400 to-indigo-500 relative overflow-hidden">
        <FloatingBackground />
        
        <div className="relative z-10 p-6">
          <button
            onClick={() => navigate(categoryRoute(categoryId!), { replace: true })}
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
                onClick={() => navigate(ROUTES.CATEGORIES, { replace: true })}
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
    <div className="min-h-screen bg-gradient-to-br from-purple-300 via-violet-400 to-indigo-500 relative overflow-hidden">
      <FloatingBackground />
      
      <div className="relative z-10 p-6">
        <button
          onClick={() => navigate(ROUTES.CATEGORIES)}
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
              <div className="flex items-center space-x-2">
                <span>Grade {selectedGrade} Blending</span>
                {currentQuestionIndex > 0 && (
                  <button
                    onClick={handlePreviousQuestion}
                    disabled={isPlayingSounds}
                    className="flex items-center space-x-1 text-purple-600 hover:text-purple-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                    title="Go to previous question"
                  >
                    <ArrowLeft size={16} />
                    <span className="text-xs">Back</span>
                  </button>
                )}
              </div>
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
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-6">
              Listen to the sounds and blend them together
            </h2>
            
            {/* Sound Display */}
            <div className="bg-purple-100 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-center space-x-2 text-2xl font-bold text-purple-700 mb-4 flex-wrap">
                {currentQuestion?.sounds.map((sound, index) => (
                  <React.Fragment key={index}>
                    <span 
                      className={`
                        px-3 py-2 rounded-lg transition-all duration-200
                        ${currentSoundIndex === index 
                          ? 'bg-purple-500 text-white scale-110' 
                          : 'bg-white text-purple-700'
                        }
                      `}
                    >
                      {sound}
                    </span>
                    {index < currentQuestion.sounds.length - 1 && (
                      <span className="text-purple-500 font-bold">+</span>
                    )}
                  </React.Fragment>
                ))}
                <span className="text-purple-500 font-bold text-3xl">=</span>
                <span className="text-purple-500 font-bold text-2xl">?</span>
              </div>
              
              {/* Play Button */}
              <button
                onClick={() => playSounds(currentQuestion?.sounds || [])}
                disabled={isPlayingSounds}
                className={`
                  text-white px-6 py-3 rounded-full transition-all duration-200 transform shadow-lg font-semibold
                  ${isPlayingSounds 
                    ? 'bg-purple-600 animate-pulse cursor-not-allowed' 
                    : 'bg-purple-500 hover:bg-purple-600 hover:scale-105 cursor-pointer'
                  }
                `}
                title={isPlayingSounds ? "Playing sounds..." : "Click to hear the sounds"}
              >
                <Volume2 className="inline mr-2" size={20} />
                {isPlayingSounds ? 'Playing...' : 'Play Sounds'}
              </button>
            </div>

            {/* Answer Section */}
            {!showAnswer && (
              <div className="space-y-4">
                <p className="text-gray-600 mb-4">
                  Say the word out loud and let us check if you're correct!
                </p>
                <div className="flex flex-col space-y-3 items-center">
                  <button
                    onClick={startListening}
                    disabled={isPlayingSounds || isListening}
                    className={`
                      text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform
                      ${isListening 
                        ? 'bg-red-500 animate-pulse cursor-not-allowed' 
                        : 'bg-red-500 hover:bg-red-600 hover:scale-105 cursor-pointer'
                      }
                      ${isPlayingSounds ? 'bg-gray-400 cursor-not-allowed' : ''}
                    `}
                  >
                    <Mic className="inline mr-2" size={20} />
                    {isListening ? 'Listening...' : 'Say the Word'}
                  </button>
                  
                  <div className="text-center text-sm text-gray-500">
                    <p>Or</p>
                  </div>
                  
                  <button
                    onClick={handleShowAnswer}
                    disabled={isPlayingSounds || isListening}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-200"
                  >
                    Just Show Answer
                  </button>
                </div>
              </div>
            )}

            {/* Show Answer and Feedback */}
            {showAnswer && (
              <div className="space-y-6">
                {/* Speech Recognition Result */}
                {spokenWord && speechResult && (
                  <div className={`rounded-xl p-4 ${speechResult === 'correct' ? 'bg-green-100' : 'bg-red-100'}`}>
                    <div className="text-center">
                      <p className="text-lg font-semibold mb-2">
                        You said: "<span className="font-bold">{spokenWord}</span>"
                      </p>
                      {speechResult === 'correct' ? (
                        <div className="text-green-700">
                          <div className="text-3xl mb-2">🎉</div>
                          <p className="text-xl font-bold">Correct! Well done!</p>
                        </div>
                      ) : (
                        <div className="text-red-700">
                          <div className="text-3xl mb-2">😊</div>
                          <p className="text-xl font-bold">Not quite, but good try!</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Correct Answer Display */}
                <div className="bg-blue-100 rounded-xl p-6">
                  <p className="text-lg text-gray-700 mb-2">The correct word is:</p>
                  <p className="text-4xl font-bold text-blue-700">{currentQuestion?.word}</p>
                </div>
                
                {/* Manual feedback buttons - only show if no speech recognition was used */}
                {!speechResult && !hasAnswered && (
                  <div className="space-y-4">
                    <p className="text-gray-700">Did you say it correctly?</p>
                    <div className="flex space-x-4 justify-center">
                      <button
                        onClick={handleCorrect}
                        className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
                      >
                        ✓ Yes, I got it right!
                      </button>
                      <button
                        onClick={handleIncorrect}
                        className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
                      >
                        ✗ No, I need practice
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Show "Next" button if speech recognition was used or manual feedback given */}
                {(speechResult || hasAnswered) && (
                  <div className="text-center">
                    <p className="text-gray-600 text-sm">
                      {currentQuestionIndex < currentQuestions.length - 1 
                        ? "Moving to next question..." 
                        : "Quiz complete!"
                      }
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Score Display */}
          <div className="text-center text-gray-600">
            Score: {score}/{currentQuestions.length}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BlendingQuiz;

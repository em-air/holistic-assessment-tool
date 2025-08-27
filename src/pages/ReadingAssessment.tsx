import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MicOff, Clock, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import FloatingBackground from '../components/FloatingBackground';

interface ReadingResult {
  wordsPerMinute: number;
  grade: number;
  season: 'Fall' | 'Winter' | 'Spring';
  level: 'Below Target' | 'At Target' | 'Above Target';
  targetRange: string;
  feedback: string;
}

// Target reading rates from the provided table
const TARGET_READING_RATES = {
  1: { Fall: [0, 10], Winter: [10, 50], Spring: [30, 90] },
  2: { Fall: [30, 80], Winter: [50, 100], Spring: [70, 130] },
  3: { Fall: [50, 110], Winter: [70, 120], Spring: [80, 140] },
  4: { Fall: [70, 120], Winter: [80, 130], Spring: [90, 140] },
  5: { Fall: [80, 130], Winter: [90, 140], Spring: [100, 150] },
  6: { Fall: [90, 140], Winter: [100, 150], Spring: [110, 160] },
  7: { Fall: [100, 150], Winter: [110, 160], Spring: [120, 170] },
  8: { Fall: [110, 160], Winter: [120, 180], Spring: [130, 180] }
};

const READING_TEXTS = {
  'grades-1-4': {
    title: 'Grades 1-4',
    text: `The Magic Garden

Once upon a time, there was a little girl named Sarah who loved to explore. Behind her house was a secret garden that no one else knew about. The garden was full of colorful flowers that danced in the wind. Red roses climbed up wooden fences, and yellow sunflowers grew as tall as trees.

Sarah visited the garden every day after school. She would sit on a small stone bench and read her favorite books. The garden was peaceful and quiet, except for the gentle buzzing of busy bees and the sweet songs of little birds.

One day, Sarah discovered something amazing. When she spoke kindly to the flowers, they seemed to grow bigger and brighter. The roses turned a deeper red, and the sunflowers reached even higher toward the sky. Sarah realized that her words had magic power in this special place.

She began to tell the flowers stories about her day at school. She shared her happy moments and her sad moments too. The garden listened to every word and responded with even more beautiful blooms. Pink tulips appeared where there were none before, and purple violets carpeted the ground.

Soon, butterflies came to visit the magical garden. They flew from flower to flower, spreading sparkles wherever they landed. Sarah watched in wonder as the garden transformed into the most beautiful place she had ever seen.

From that day forward, Sarah took care of the magic garden with love and kindness. She watered the plants when they were thirsty and pulled out weeds that tried to take over. The garden rewarded her care by blooming all year long, even in winter when other gardens were sleeping.

Sarah learned that magic happens when we treat the world with kindness and love. She shared this secret with her best friend, and together they made the garden even more magical. They planted new seeds and watched them grow into amazing flowers that no one had ever seen before.

The magic garden became a place where dreams came true and friendships grew stronger. Sarah and her friend would spend hours there, reading stories, sharing secrets, and watching the flowers dance in the gentle breeze. It was their special place where anything was possible.

Years later, when Sarah grew up, she still visited the magic garden. She brought her own children there and taught them the secret of speaking kindly to living things. The garden continued to bloom and grow, spreading its magic to each new generation.

And so the magic garden lived on, reminding everyone who visited that the most powerful magic of all is love and kindness. The flowers still dance in the wind, the butterflies still spread their sparkles, and the magic continues to grow stronger every day.`
  },
  'grades-5-8': {
    title: 'Grades 5-8',
    text: `The Discovery of the Hidden Civilization

Dr. Elena Rodriguez had been an archaeologist for fifteen years, but nothing had prepared her for what she was about to discover in the remote mountains of South America. Her team had been excavating what they believed to be a small settlement when they uncovered something extraordinary that would change our understanding of ancient civilizations forever.

The discovery began with a single golden artifact buried beneath layers of volcanic ash. The intricate patterns carved into the metal were unlike anything found in previously known cultures from this region. The symbols appeared to be a form of advanced writing system that combined mathematical equations with astronomical observations.

As the team carefully excavated the area, they revealed an entire underground city that had been perfectly preserved for over a thousand years. The volcanic eruption that had buried the settlement had also protected it from the elements, creating a time capsule of ancient life.

The architecture was remarkable in its sophistication. The buildings were constructed using advanced engineering techniques that shouldn't have existed during that time period. Aqueducts carried fresh water throughout the city, and a complex ventilation system provided air circulation to the underground chambers.

Most impressive were the libraries containing thousands of stone tablets covered in the mysterious script. Dr. Rodriguez's team worked tirelessly to decipher the language, and what they discovered was revolutionary. These ancient people had developed advanced knowledge in astronomy, mathematics, medicine, and agriculture that was centuries ahead of their time.

The tablets revealed detailed star charts that accurately predicted solar eclipses and planetary movements. They contained mathematical formulas for calculating areas and volumes that weren't discovered by European scholars until much later. Medical texts described surgical procedures and herbal remedies that modern science has only recently validated.

One particular set of tablets told the story of the civilization's downfall. The people had detected signs of the coming volcanic eruption through their astronomical observations. However, instead of fleeing, they chose to seal themselves in their underground city, believing they could wait out the disaster.

Archaeological evidence suggested that they survived for several months after the eruption, living off stored food supplies and underground water sources. The final tablets, written in increasingly desperate handwriting, documented their gradual realization that they would not survive.

Dr. Rodriguez was particularly moved by the last tablet, which appeared to be a message to future generations. It spoke of their hope that someday, people would discover their city and learn from their knowledge. They had deliberately preserved their most important discoveries in the deepest vaults of the city.

The discovery sparked international interest and debate among historians and archaeologists. Some questioned whether such advanced knowledge could have existed so long ago, while others argued that ancient civilizations were far more sophisticated than previously believed.

The site became one of the most important archaeological discoveries of the century. Museums worldwide displayed artifacts from the hidden city, and the deciphered tablets provided new insights into human history and scientific development.

Dr. Rodriguez continued to lead the excavation for several more years, uncovering new chambers and artifacts that added to the story of this remarkable civilization. Her work demonstrated that human ingenuity and scientific curiosity have existed throughout history, often in places and times we least expect to find them.

The hidden city stands as a testament to the achievements of ancient peoples and reminds us that there are still many mysteries waiting to be discovered beneath the earth's surface.`
  }
};

const ReadingAssessment: React.FC = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [selectedGrade, setSelectedGrade] = useState<number>(4);
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<ReadingResult | null>(null);
  const [assessmentState, setAssessmentState] = useState<'setup' | 'ready' | 'countdown' | 'recording' | 'complete'>('setup');
  const [countdown, setCountdown] = useState(0);
  const [currentText, setCurrentText] = useState('');

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const currentTranscriptRef = useRef<string>('');
  const currentInterimRef = useRef<string>('');
  const currentTimeLeftRef = useRef<number>(60);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;
      
      // Enhanced settings for better real-time performance
      if ('webkitSpeechRecognition' in window) {
        (recognition as any).webkitrecognition = true;
      }

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptSegment = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptSegment + ' ';
          } else {
            interimTranscript += transcriptSegment;
          }
        }
        
        // Update interim results in real-time
        setInterimTranscript(interimTranscript);
        currentInterimRef.current = interimTranscript;
        
        // Add final results to the permanent transcript
        if (finalTranscript) {
          setTranscript(prev => {
            const newTranscript = prev + finalTranscript;
            currentTranscriptRef.current = newTranscript;
            return newTranscript;
          });
        }
      };

      recognition.onstart = () => {
        console.log('Speech recognition started');
        setInterimTranscript('');
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        // Move any remaining interim transcript to final transcript
        if (interimTranscript.trim()) {
          setTranscript(prev => prev + ' ' + interimTranscript);
        }
        setInterimTranscript('');
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Set text based on selected grade range
    if (selectedGrade <= 4) {
      setCurrentText(READING_TEXTS['grades-1-4'].text);
    } else {
      setCurrentText(READING_TEXTS['grades-5-8'].text);
    }
  }, [selectedGrade]);

  // Auto-scroll transcript when new text is added
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript, interimTranscript]);

  // Keep refs updated with current state values
  useEffect(() => {
    currentTranscriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    currentInterimRef.current = interimTranscript;
  }, [interimTranscript]);

  useEffect(() => {
    currentTimeLeftRef.current = timeLeft;
  }, [timeLeft]);

  const startCountdown = () => {
    setAssessmentState('countdown');
    setCountdown(3);
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setTimeout(() => startRecording(), 500); // Small delay for "GO!" effect
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startRecording = () => {
    setAssessmentState('recording');
    setIsRecording(true);
    setTimeLeft(60);
    setTranscript('');
    setInterimTranscript('');
    setShowResults(false);
    setCountdown(0);

    // Reset refs
    currentTranscriptRef.current = '';
    currentInterimRef.current = '';
    currentTimeLeftRef.current = 60;

    // Start speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }

    // Start timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const newTimeLeft = prev <= 1 ? 0 : prev - 1;
        currentTimeLeftRef.current = newTimeLeft;
        
        if (prev <= 1) {
          stopAssessment(true); // Force flag = true when timer runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const proceedToAssessment = () => {
    setAssessmentState('ready');
  };

  const stopAssessment = (forceCalculate = false) => {
    console.log('stopAssessment called with forceCalculate:', forceCalculate);
    console.log('Current state at stop:', {
      transcript: currentTranscriptRef.current,
      interim: currentInterimRef.current,
      timeLeft: currentTimeLeftRef.current
    });
    
    setIsRecording(false);
    setAssessmentState('complete');
    
    // Force capture any remaining interim transcript before stopping
    if (currentInterimRef.current.trim()) {
      const combinedTranscript = currentTranscriptRef.current + ' ' + currentInterimRef.current;
      setTranscript(combinedTranscript);
      currentTranscriptRef.current = combinedTranscript;
      setInterimTranscript('');
      currentInterimRef.current = '';
    }
    
    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Use a longer delay when timer runs out to ensure all speech data is captured
    const delay = forceCalculate ? 1000 : 500;
    
    setTimeout(() => {
      calculateResultsWithCurrentState();
    }, delay);
  };

  const calculateResultsWithCurrentState = () => {
    // Get the most current values from refs
    const finalTranscript = currentTranscriptRef.current;
    const interim = currentInterimRef.current;
    const timeLeft = currentTimeLeftRef.current;
    
    // Combine all available transcript data
    const fullTranscript = (finalTranscript + ' ' + interim).trim();
    const wordCount = fullTranscript.split(/\s+/).filter(word => word.length > 0).length;
    const timeElapsed = 60 - timeLeft;
    const wordsPerMinute = timeElapsed > 0 ? Math.round((wordCount / timeElapsed) * 60) : 0;

    console.log('Calculating results with refs:', {
      finalTranscript,
      interim,
      fullTranscript,
      wordCount,
      timeElapsed,
      timeLeft,
      wordsPerMinute
    });

    // Find the best matching grade and season based on reading speed
    let bestGrade = selectedGrade;
    let bestSeason: 'Fall' | 'Winter' | 'Spring' = 'Fall';
    let level: 'Below Target' | 'At Target' | 'Above Target' = 'Below Target';
    let feedback: string = '';

    // Check all grades and seasons to find the best fit
    let found = false;
    
    for (let grade = 1; grade <= 8; grade++) {
      for (const season of ['Fall', 'Winter', 'Spring'] as const) {
        const targetRange = TARGET_READING_RATES[grade as keyof typeof TARGET_READING_RATES][season];
        const [minTarget, maxTarget] = targetRange;
        
        if (wordsPerMinute >= minTarget && wordsPerMinute <= maxTarget && !found) {
          bestGrade = grade;
          bestSeason = season;
          level = 'At Target';
          feedback = `Excellent work! Your reading speed of ${wordsPerMinute} WPM matches Grade ${bestGrade} ${bestSeason} level. You're reading at exactly the right pace for that level!`;
          found = true;
          break;
        }
      }
      if (found) break;
    }

    // If no exact match found, find the closest level
    if (!found) {
      let closestDifference = Infinity;
      let isAbove = false;

      for (let grade = 1; grade <= 8; grade++) {
        for (const season of ['Fall', 'Winter', 'Spring'] as const) {
          const targetRange = TARGET_READING_RATES[grade as keyof typeof TARGET_READING_RATES][season];
          const [minTarget, maxTarget] = targetRange;
          
          if (wordsPerMinute > maxTarget) {
            const difference = wordsPerMinute - maxTarget;
            if (difference < closestDifference) {
              closestDifference = difference;
              bestGrade = grade;
              bestSeason = season;
              level = 'Above Target';
              isAbove = true;
            }
          } else if (wordsPerMinute < minTarget) {
            const difference = minTarget - wordsPerMinute;
            if (difference < closestDifference) {
              closestDifference = difference;
              bestGrade = grade;
              bestSeason = season;
              level = 'Below Target';
              isAbove = false;
            }
          }
        }
      }

      if (isAbove) {
        feedback = `Outstanding! Your reading speed of ${wordsPerMinute} WPM is above Grade ${bestGrade} ${bestSeason} level. You're reading faster than expected for that grade level!`;
      } else {
        feedback = `Keep practicing! Your reading speed of ${wordsPerMinute} WPM is approaching Grade ${bestGrade} ${bestSeason} level. Try reading for 15-20 minutes daily to improve fluency.`;
      }
    }

    const result: ReadingResult = {
      wordsPerMinute,
      grade: bestGrade,
      season: bestSeason,
      level,
      targetRange: `${TARGET_READING_RATES[bestGrade as keyof typeof TARGET_READING_RATES][bestSeason][0]}-${TARGET_READING_RATES[bestGrade as keyof typeof TARGET_READING_RATES][bestSeason][1]} wpm`,
      feedback
    };

    setResults(result);
    setShowResults(true);
  };

  const resetAssessment = () => {
    setAssessmentState('setup');
    setCountdown(0);
    setIsRecording(false);
    setTimeLeft(60);
    setTranscript('');
    setInterimTranscript('');
    setShowResults(false);
    setResults(null);
    
    // Reset refs
    currentTranscriptRef.current = '';
    currentInterimRef.current = '';
    currentTimeLeftRef.current = 60;
  };

  if (showResults && results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-300 via-emerald-400 to-lime-500 relative overflow-hidden">
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

        <div className="relative z-10 px-6 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Reading Assessment Complete!</h1>
              <p className="text-gray-600">Here are your reading fluency results</p>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl font-bold text-emerald-600 mb-2">
                  {results.wordsPerMinute}
                </div>
                <div className="text-lg text-gray-600">Words Per Minute (WPM)</div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-1">Grade Level</div>
                  <div className="text-xl font-semibold text-gray-800">Grade {results.grade}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-1">Season</div>
                  <div className="text-xl font-semibold text-gray-800">{results.season}</div>
                </div>
              </div>

              <div className="text-center">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                  results.level === 'Above Target' ? 'bg-green-100 text-green-800' :
                  results.level === 'At Target' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {results.level}
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  Target Range: {results.targetRange}
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Feedback</h3>
                <p className="text-blue-700 text-sm leading-relaxed">
                  {results.feedback}
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={resetAssessment}
                  className="flex-1 bg-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors duration-200"
                >
                  Take Another Assessment
                </button>
                <button
                  onClick={() => navigate('/categories')}
                  className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors duration-200"
                >
                  Back to Categories
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-300 via-emerald-400 to-lime-500 relative overflow-hidden">
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

      <div className="relative z-10 px-6 pb-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
              Reading Fluency Assessment
            </h1>
            <p className="text-white/90 text-lg drop-shadow-md">
              Measure your reading speed with our speech-to-text assessment
            </p>
          </motion.div>

          {assessmentState === 'setup' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Setup Your Assessment</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Your Grade Level
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((grade) => (
                      <button
                        key={grade}
                        onClick={() => setSelectedGrade(grade)}
                        className={`py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                          selectedGrade === grade
                            ? 'bg-emerald-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Grade {grade}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">How it works:</h3>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>• You'll have 60 seconds to read the text aloud</li>
                    <li>• Speak clearly into your microphone</li>
                    <li>• We'll count the words you read correctly</li>
                    <li>• Your reading level will be determined based on your speed</li>
                  </ul>
                </div>

                <div className="bg-amber-50 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-800 mb-2">
                    Text Preview ({selectedGrade <= 4 ? 'Grades 1-4' : 'Grades 5-8'}):
                  </h4>
                  <p className="text-amber-700 text-sm leading-relaxed">
                    {currentText.substring(0, 200)}...
                  </p>
                </div>

                <button
                  onClick={proceedToAssessment}
                  className="w-full bg-emerald-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:bg-emerald-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <BookOpen className="w-6 h-6" />
                  <span>Continue to Assessment</span>
                </button>
              </div>
            </motion.div>
          ) : assessmentState === 'ready' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50 text-center"
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Ready to Start?</h2>
              
              <div className="mb-8">
                <div className="text-lg text-gray-600 mb-4">
                  Selected Grade: <span className="font-semibold text-emerald-600">Grade {selectedGrade}</span>
                </div>
                <div className="text-gray-600">
                  Text Level: <span className="font-semibold">{selectedGrade <= 4 ? 'Grades 1-4' : 'Grades 5-8'}</span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-8">
                <h3 className="font-semibold text-blue-800 mb-2">Instructions:</h3>
                <ul className="text-blue-700 text-sm space-y-1 text-left">
                  <li>• Click "Start Assessment" when you're ready</li>
                  <li>• You'll see a 3-2-1 countdown</li>
                  <li>• Read the text aloud clearly for 60 seconds</li>
                  <li>• The timer will stop automatically</li>
                </ul>
              </div>

              <button
                onClick={startCountdown}
                className="bg-emerald-600 text-white py-4 px-8 rounded-lg font-bold text-xl hover:bg-emerald-700 transition-colors duration-200 flex items-center justify-center space-x-3 mx-auto"
              >
                <span>🎯</span>
                <span>Start Assessment</span>
              </button>
            </motion.div>
          ) : assessmentState === 'countdown' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/95 backdrop-blur-sm rounded-2xl p-16 shadow-xl border border-white/50 text-center"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-8">Get Ready!</h2>
              <motion.div
                key={countdown}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`text-8xl font-bold mb-4 ${countdown > 0 ? 'text-emerald-600' : 'text-green-500'}`}
              >
                {countdown > 0 ? countdown : 'GO!'}
              </motion.div>
              <p className="text-lg text-gray-600">
                {countdown > 0 ? 'Start reading when you see "GO!"' : 'Start reading now!'}
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Timer and Status */}
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {isRecording ? (
                      <div className="flex items-center space-x-2 text-red-600">
                        <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                        <span className="font-medium">Recording...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <MicOff className="w-5 h-5" />
                        <span className="font-medium">Assessment Complete</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-2xl font-bold text-emerald-600">
                    <Clock className="w-6 h-6" />
                    <span>{timeLeft}s</span>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-emerald-600 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${((60 - timeLeft) / 60) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Side-by-side Reading Text and Transcript */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Reading Text */}
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-emerald-600" />
                    <span>Read this text aloud</span>
                  </h3>
                  <div className="text-sm text-gray-600 mb-3">
                    Level: {selectedGrade <= 4 ? 'Grades 1-4' : 'Grades 5-8'}
                  </div>
                  <div className="text-base leading-relaxed text-gray-700 bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                    {currentText}
                  </div>
                </div>

                {/* Transcript */}
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                    <span className={isRecording ? "text-red-600" : "text-gray-600"}>🎤</span>
                    <span>Speech Recognition</span>
                  </h3>
                  <div className="text-sm text-gray-600 mb-3 flex items-center justify-between">
                    <span>
                      {isRecording ? "🔴 Live transcription active" : "Recording stopped"}
                    </span>
                    {isRecording && (
                      <div className="flex items-center space-x-1 text-xs">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-red-600">LIVE</span>
                      </div>
                    )}
                  </div>
                  <div 
                    ref={transcriptRef}
                    className="min-h-[320px] p-4 bg-gray-50 rounded-lg text-gray-700 overflow-y-auto"
                  >
                    {isRecording ? (
                      <div className="space-y-2">
                        {/* Final transcript (confirmed words) */}
                        <div className="text-gray-800">
                          {transcript}
                          {/* Interim transcript (real-time words being spoken) */}
                          {interimTranscript && (
                            <span className="text-blue-600 italic opacity-80">
                              {interimTranscript}
                            </span>
                          )}
                        </div>
                        {/* Cursor indicator */}
                        {isRecording && (
                          <span className="inline-block w-2 h-5 bg-red-500 animate-pulse ml-1"></span>
                        )}
                      </div>
                    ) : transcript ? (
                      transcript
                    ) : (
                      "Speech recognition will appear here"
                    )}
                  </div>
                  
                  {(transcript || interimTranscript) && (
                    <div className="mt-3 text-sm text-gray-600 space-y-1">
                      <div>
                        Final words: <span className="font-semibold text-emerald-600">
                          {transcript.trim().split(/\s+/).filter(word => word.length > 0).length}
                        </span>
                      </div>
                      {interimTranscript && isRecording && (
                        <div>
                          Speaking: <span className="font-semibold text-blue-600 italic">
                            "{interimTranscript}"
                          </span>
                        </div>
                      )}
                      <div className="pt-1 border-t border-gray-200">
                        Total words: <span className="font-bold text-gray-800">
                          {(transcript + ' ' + interimTranscript).trim().split(/\s+/).filter(word => word.length > 0).length}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Manual stop button for early completion */}
              {isRecording && (
                <div className="text-center">
                  <button
                    onClick={() => stopAssessment(false)}
                    className="bg-red-600 text-white py-3 px-8 rounded-lg font-bold text-lg hover:bg-red-700 transition-colors duration-200 flex items-center justify-center space-x-2 mx-auto"
                  >
                    <MicOff className="w-5 h-5" />
                    <span>Stop Assessment Early</span>
                  </button>
                  <p className="text-white/80 text-sm mt-2">
                    Or let the timer run out automatically
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReadingAssessment;

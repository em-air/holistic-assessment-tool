import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import FloatingBackground from '../components/FloatingBackground';
import { ProgressTracker } from '../utils/progressTracker';
import { logger } from '../utils/logger';
import { ROUTES } from '../routes';
import {
  getVocabularyMatchingGrades,
  getVocabularyMatchingQuestions,
  type VocabularyMatchingGradeSummary,
  type VocabularyMatchingQuestion,
} from '../services/vocabularyMatchingService';

interface MatchedPair {
  wordId: string;
  definitionId: string;
}

const shuffleItems = (items: VocabularyMatchingQuestion[]) =>
  [...items].sort(() => Math.random() - 0.5);

const VocabularyMatching: React.FC = () => {
  const navigate = useNavigate();
  const [selectedGrade, setSelectedGrade] = useState<number>(4);
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [gradeSummaries, setGradeSummaries] = useState<VocabularyMatchingGradeSummary[]>([]);
  const [unlockedLevels, setUnlockedLevels] = useState<{ [key: number]: number }>({});
  const [vocabularyWords, setVocabularyWords] = useState<VocabularyMatchingQuestion[]>([]);
  const [shuffledWords, setShuffledWords] = useState<VocabularyMatchingQuestion[]>([]);
  const [shuffledDefinitions, setShuffledDefinitions] = useState<VocabularyMatchingQuestion[]>([]);
  const [matches, setMatches] = useState<MatchedPair[]>([]);
  const [draggedWord, setDraggedWord] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [completed, setCompleted] = useState<boolean>(false);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const hasSavedResultRef = useRef(false);

  // Save results to progress tracker when completed
  useEffect(() => {
    if (completed && showResults && !hasSavedResultRef.current) {
      hasSavedResultRef.current = true;
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      const totalWords = vocabularyWords.length || 5;
      const correctCount = matches.filter(m => m.wordId === m.definitionId).length;
      const percentage = totalWords > 0 ? Math.round((correctCount / totalWords) * 100) : 0;
      ProgressTracker.saveQuizResult({
        quizId: 'vocabulary-matching',
        quizName: `Vocabulary Matching - Grade ${selectedGrade}`,
        category: 'academic',
        subcategory: 'vocabulary',
        score: correctCount,
        totalQuestions: totalWords,
        percentage,
        timeSpent,
        completedAt: new Date().toISOString(),
        gradeLevel: `Grade ${selectedGrade}`,
        additionalData: { level: selectedLevel },
      });
      logger.log('Vocabulary Matching result saved via ProgressTracker');
    }
    // Reset the guard when starting a new attempt
    if (!completed) {
      hasSavedResultRef.current = false;
    }
  }, [completed, showResults, score, matches, vocabularyWords.length, selectedGrade, selectedLevel]);

  const currentGradeSummary = gradeSummaries.find((summary) => summary.grade === selectedGrade);

  useEffect(() => {
    let isMounted = true;

    const loadCatalog = async () => {
      setIsLoadingCatalog(true);
      const summaries = await getVocabularyMatchingGrades();

      if (!isMounted) {
        return;
      }

      setGradeSummaries(summaries);
      if (summaries.length === 0) {
        setLoadError('Vocabulary matching content is unavailable right now.');
      } else {
        setUnlockedLevels(
          summaries.reduce<Record<number, number>>((accumulator, summary) => {
            accumulator[summary.grade] = 1;
            return accumulator;
          }, {}),
        );
        if (!summaries.some((summary) => summary.grade === selectedGrade)) {
          setSelectedGrade(summaries[0].grade);
        }
      }

      setIsLoadingCatalog(false);
    };

    void loadCatalog();

    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize vocabulary for selected grade and level
  useEffect(() => {
    if (gradeSummaries.length === 0) {
      return;
    }

    let isMounted = true;

    const loadQuestions = async () => {
      setIsLoadingQuestions(true);

      const loadedQuestions = await getVocabularyMatchingQuestions(selectedGrade, selectedLevel);
      if (!isMounted) {
        return;
      }

      if (loadedQuestions.length === 0) {
        setLoadError('Vocabulary matching questions are unavailable right now.');
      } else {
        setLoadError(null);
      }

      setVocabularyWords(loadedQuestions);
      setShuffledWords(shuffleItems(loadedQuestions));
      setShuffledDefinitions(shuffleItems(loadedQuestions));
      setMatches([]);
      setScore(0);
      setShowResults(false);
      setCompleted(false);
      startTimeRef.current = Date.now();
      setIsLoadingQuestions(false);
    };

    void loadQuestions();

    return () => {
      isMounted = false;
    };
  }, [gradeSummaries, selectedGrade, selectedLevel]);

  // Reset to level 1 when grade changes
  useEffect(() => {
    setSelectedLevel(1);
  }, [selectedGrade]);

  const handleDragStart = (e: React.DragEvent, wordId: string) => {
    setDraggedWord(wordId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, definitionId: string) => {
    e.preventDefault();
    
    if (!draggedWord) return;

    // Check if this definition already has a match
    const existingMatch = matches.find(match => match.definitionId === definitionId);
    if (existingMatch) return;

    // Check if the word is already matched somewhere else
    const wordAlreadyMatched = matches.find(match => match.wordId === draggedWord);
    if (wordAlreadyMatched) return;

    // Create new match
    const newMatch: MatchedPair = {
      wordId: draggedWord,
      definitionId: definitionId
    };

    const updatedMatches = [...matches, newMatch];
    setMatches(updatedMatches);
    setDraggedWord(null);

    // Check if all words are matched
    if (updatedMatches.length === vocabularyWords.length) {
      calculateScore(updatedMatches);
      setCompleted(true);
      setShowResults(true);
    }
  };



  const calculateScore = (finalMatches: MatchedPair[]) => {
    let correctMatches = 0;
    
    finalMatches.forEach(match => {
      if (match.wordId === match.definitionId) {
        correctMatches++;
      }
    });

    // Calculate percentage based on attempted matches, not total words
    const percentage = finalMatches.length > 0 
      ? Math.round((correctMatches / finalMatches.length) * 100)
      : 0;
    setScore(percentage);

    // Unlock next level if score is 70% or higher and all words are matched
    if (percentage >= 70 && finalMatches.length === vocabularyWords.length) {
      const currentUnlockedLevel = unlockedLevels[selectedGrade];
      if (selectedLevel === currentUnlockedLevel && selectedLevel < 3) {
        setUnlockedLevels(prev => ({
          ...prev,
          [selectedGrade]: selectedLevel + 1
        }));
      }
    }
  };

  const handleLevelChange = (level: number) => {
    const maxUnlockedLevel = unlockedLevels[selectedGrade];
    if (level <= maxUnlockedLevel) {
      setSelectedLevel(level);
    }
  };

  const isLevelUnlocked = (level: number) => {
    return level <= (unlockedLevels[selectedGrade] ?? 1);
  };

  const isWordMatched = (wordId: string) => {
    return matches.some(match => match.wordId === wordId);
  };

  const isDefinitionMatched = (definitionId: string) => {
    return matches.some(match => match.definitionId === definitionId);
  };

  const getMatchedWord = (definitionId: string) => {
    const match = matches.find(match => match.definitionId === definitionId);
    if (!match) return null;
    return vocabularyWords.find(word => word.id === match.wordId);
  };

  const isCorrectMatch = (wordId: string, definitionId: string) => {
    return wordId === definitionId;
  };

  if (isLoadingCatalog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <FloatingBackground />
        <div className="relative z-10 rounded-2xl bg-white p-8 text-center shadow-xl">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Loading vocabulary matching</h1>
          <p className="text-gray-600">Fetching grade and level content...</p>
        </div>
      </div>
    );
  }

  if (loadError && vocabularyWords.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <FloatingBackground />
        <div className="relative z-10 rounded-2xl bg-white p-8 text-center shadow-xl max-w-lg mx-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Vocabulary Matching Unavailable</h1>
          <p className="text-gray-600 mb-6">{loadError}</p>
          <button
            onClick={() => navigate(ROUTES.CATEGORY_ACADEMIC_SKILLS)}
            className="bg-teal-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-600 transition-colors duration-200"
          >
            Back to Academic Skills
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      <FloatingBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-4">
        {/* Header */}
        <motion.div 
          className="text-center mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            📚 Vocabulary Matching
          </h1>
          <p className="text-sm text-gray-600 mb-4">
            Match each vocabulary word with its correct definition
          </p>
          
          {/* Grade Selection */}
          <div className="flex justify-center items-center space-x-6 mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Grade:</span>
              <div className="flex space-x-1">
                {gradeSummaries.map((summary) => (
                  <button
                    key={summary.grade}
                    onClick={() => setSelectedGrade(summary.grade)}
                    className={`px-3 py-1 text-sm rounded-lg font-medium transition-all duration-200 ${
                      selectedGrade === summary.grade
                        ? 'bg-teal-500 text-white shadow-lg transform scale-105'
                        : 'bg-teal-100 text-gray-700 border border-teal-300 hover:bg-teal-200'
                    }`}
                  >
                    {summary.grade}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Level Selection */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Level:</span>
              <div className="flex space-x-1">
                {(currentGradeSummary?.levels ?? []).map(({ level }) => {
                  const isUnlocked = isLevelUnlocked(level);
                  return (
                    <button
                      key={level}
                      onClick={() => handleLevelChange(level)}
                      disabled={!isUnlocked}
                      className={`px-3 py-1 text-sm rounded-lg font-medium transition-all duration-200 relative ${
                        selectedLevel === level && isUnlocked
                          ? 'bg-emerald-500 text-white shadow-lg transform scale-105'
                          : isUnlocked
                          ? 'bg-emerald-100 text-gray-700 border border-emerald-300 hover:bg-emerald-200'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {level}
                      {!isUnlocked && (
                        <span className="absolute -top-1 -right-1 text-xs">🔒</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Game Area */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {isLoadingQuestions && (
              <div className="lg:col-span-2 bg-white/90 rounded-2xl p-6 text-center shadow-md text-gray-600">
                Loading level content...
              </div>
            )}
            
            {/* Vocabulary Words (Left Side) */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-lg font-bold text-gray-800 mb-3 text-center">
                Vocabulary Words
              </h2>
              <div className="space-y-2">
                {shuffledWords.map((word, index) => (
                  <motion.div
                    key={word.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <div
                      draggable={!completed}
                      onDragStart={(e: React.DragEvent) => handleDragStart(e, word.id)}
                      className={`
                        p-3 rounded-lg shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing
                        ${isWordMatched(word.id) 
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed opacity-50' 
                          : 'bg-teal-100 hover:bg-teal-200 hover:shadow-lg hover:scale-102 border-2 border-transparent hover:border-teal-400'
                        }
                      `}
                    >
                      <span className="text-base font-semibold text-gray-800">
                        {word.word}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Definition Boxes (Right Side) */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-lg font-bold text-gray-800 mb-3 text-center">
                Definitions
              </h2>
              <div className="space-y-2">
                {shuffledDefinitions.map((definition, index) => {
                  const matchedWord = getMatchedWord(definition.id);
                  const isCorrect = matchedWord ? isCorrectMatch(matchedWord.id, definition.id) : false;
                  
                  return (
                    <motion.div
                      key={definition.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <div
                        onDragOver={handleDragOver}
                        onDrop={(e: React.DragEvent) => handleDrop(e, definition.id)}
                        className={`
                          p-3 rounded-lg shadow-md transition-all duration-200 min-h-[70px] flex items-center cursor-pointer
                          ${!isDefinitionMatched(definition.id)
                            ? 'bg-cyan-100 border-2 border-dashed border-cyan-300 hover:border-cyan-500 hover:bg-cyan-200'
                            : isCorrect
                            ? 'bg-green-100 border-2 border-green-400'
                            : 'bg-red-100 border-2 border-red-400'
                          }
                        `}
                      >
                        {matchedWord ? (
                          <div className="w-full">
                            <div className={`text-base font-semibold mb-1 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                              {matchedWord.word}
                            </div>
                            <div className="text-sm text-gray-700 leading-relaxed">
                              {definition.definition}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center w-full">
                            <div className="text-sm text-gray-700 font-medium leading-relaxed">
                              {definition.definition}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Results Modal */}
        {showResults && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">
                  {score >= 80 ? '🎉' : score >= 60 ? '👍' : '💪'}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Activity Complete!
                </h3>
                <div className="mb-6">
                  <div className="text-4xl font-bold text-teal-600 mb-2">
                    {score}%
                  </div>
                  <div className="text-gray-600 mb-2">
                    {score >= 70 && matches.length === vocabularyWords.length
                      ? 'Excellent! Level completed!' 
                      : score >= 70 
                      ? 'Good job! Complete all words to unlock next level.'
                      : score >= 60 
                      ? 'Good attempt! Try to get 70% to unlock the next level.' 
                      : 'Keep practicing! You need 70% to unlock the next level.'
                    }
                  </div>
                  <div className="text-sm text-gray-500">
                    {matches.filter(match => match.wordId === match.definitionId).length} correct out of {matches.length} attempted
                  </div>
                  {score >= 70 && matches.length === vocabularyWords.length && selectedLevel < 3 && selectedLevel === unlockedLevels[selectedGrade] - 1 && (
                    <div className="mt-3 p-2 bg-green-100 rounded-lg">
                      <span className="text-green-800 text-sm font-medium">🎉 Level {selectedLevel + 1} Unlocked!</span>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  {score >= 70 && matches.length === vocabularyWords.length && selectedLevel < 3 && selectedLevel < unlockedLevels[selectedGrade] && (
                    <button
                      onClick={() => {
                        setSelectedLevel(selectedLevel + 1);
                        setShowResults(false);
                      }}
                      className="flex-1 bg-emerald-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-emerald-600 transition-colors duration-200"
                    >
                      Next Level
                    </button>
                  )}
                  <button
                    onClick={() => navigate(-1)}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-400 transition-colors duration-200"
                  >
                    Exit
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Progress Indicator and Submit */}
        <motion.div 
          className="mt-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="bg-gradient-to-r from-teal-100 to-emerald-100 rounded-lg p-3 shadow-md inline-block mb-4">
            <div className="text-sm text-gray-700 mb-2">
              Grade {selectedGrade} • Level {selectedLevel} • Progress: {matches.length} / {vocabularyWords.length}
            </div>
            <div className="text-xs text-gray-600 mb-2">
              Unlocked levels: {Array.from({ length: unlockedLevels[selectedGrade] ?? 1 }, (_, i) => i + 1).join(', ')}
              {(unlockedLevels[selectedGrade] ?? 1) < (currentGradeSummary?.levels.length ?? 0) && ' • Need 70% with all words to unlock next level'}
            </div>
            <div className="w-48 bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${vocabularyWords.length > 0 ? (matches.length / vocabularyWords.length) * 100 : 0}%` }}
              />
            </div>
          </div>
          
          {!completed && (
            <div>
              <p className="text-xs text-gray-500 mt-2">
                Drag each word to its matching definition. Each match is final!
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default VocabularyMatching;

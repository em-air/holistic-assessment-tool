import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ProgressTracker } from '../utils/progressTracker';
import { logger } from '../utils/logger';

interface VocabularyItem {
  id: string;
  word: string;
  definition: string;
}

interface MatchedPair {
  wordId: string;
  definitionId: string;
}

const VocabularyMatching: React.FC = () => {
  const [selectedGrade, setSelectedGrade] = useState<number>(4);
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [unlockedLevels, setUnlockedLevels] = useState<{[key: number]: number}>({
    4: 1, 5: 1, 6: 1, 7: 1, 8: 1 // Each grade starts with level 1 unlocked
  });
  const [vocabularyWords, setVocabularyWords] = useState<VocabularyItem[]>([]);
  const [shuffledWords, setShuffledWords] = useState<VocabularyItem[]>([]);
  const [shuffledDefinitions, setShuffledDefinitions] = useState<VocabularyItem[]>([]);
  const [matches, setMatches] = useState<MatchedPair[]>([]);
  const [draggedWord, setDraggedWord] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [completed, setCompleted] = useState<boolean>(false);
  const startTimeRef = useRef<number>(Date.now());
  const hasSavedResultRef = useRef(false);

  // Save results to progress tracker when completed
  useEffect(() => {
    if (completed && showResults && !hasSavedResultRef.current) {
      hasSavedResultRef.current = true;
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      const totalWords = vocabularyWords.length || 5;
      const percentage = totalWords > 0 ? Math.round((score / totalWords) * 100) : 0;
      ProgressTracker.saveQuizResult({
        quizId: 'vocabulary-matching',
        quizName: `Vocabulary Matching - Grade ${selectedGrade}`,
        category: 'academic',
        subcategory: 'vocabulary',
        score,
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
  }, [completed, showResults, score, vocabularyWords.length, selectedGrade, selectedLevel]);

  // Vocabulary data for each grade level with 3 levels each containing 5 words
  const vocabularyData: { [key: number]: { [key: number]: VocabularyItem[] } } = {
    4: {
      1: [
        { id: '4-1-1', word: 'Abundant', definition: 'Present in large quantities; plentiful' },
        { id: '4-1-2', word: 'Cautious', definition: 'Careful to avoid danger or mistakes' },
        { id: '4-1-3', word: 'Emerge', definition: 'To come out into view or existence' },
        { id: '4-1-4', word: 'Fragile', definition: 'Easily broken or damaged; delicate' },
        { id: '4-1-5', word: 'Grasp', definition: 'To understand or hold firmly' }
      ],
      2: [
        { id: '4-2-1', word: 'Humble', definition: 'Not proud; modest and respectful' },
        { id: '4-2-2', word: 'Inquire', definition: 'To ask questions; to investigate' },
        { id: '4-2-3', word: 'Loyal', definition: 'Faithful and devoted to someone or something' },
        { id: '4-2-4', word: 'Mighty', definition: 'Very strong or powerful' },
        { id: '4-2-5', word: 'Notice', definition: 'To become aware of or observe' }
      ],
      3: [
        { id: '4-3-1', word: 'Peaceful', definition: 'Free from disturbance; calm and quiet' },
        { id: '4-3-2', word: 'Rapid', definition: 'Happening very quickly; fast' },
        { id: '4-3-3', word: 'Sturdy', definition: 'Strong and well-built; durable' },
        { id: '4-3-4', word: 'Timid', definition: 'Shy and lacking confidence' },
        { id: '4-3-5', word: 'Vivid', definition: 'Very bright and clear; intense' }
      ]
    },
    5: {
      1: [
        { id: '5-1-1', word: 'Analyze', definition: 'To examine in detail to understand better' },
        { id: '5-1-2', word: 'Chronic', definition: 'Continuing for a long time; persistent' },
        { id: '5-1-3', word: 'Diverse', definition: 'Showing variety; different from each other' },
        { id: '5-1-4', word: 'Emphasize', definition: 'To give special importance or attention to' },
        { id: '5-1-5', word: 'Formulate', definition: 'To create or develop systematically' }
      ],
      2: [
        { id: '5-2-1', word: 'Interpret', definition: 'To explain the meaning of something' },
        { id: '5-2-2', word: 'Navigate', definition: 'To find one\'s way through or around' },
        { id: '5-2-3', word: 'Obstacles', definition: 'Things that block progress or movement' },
        { id: '5-2-4', word: 'Preliminary', definition: 'Coming before the main event; introductory' },
        { id: '5-2-5', word: 'Reliable', definition: 'Consistently good; dependable' }
      ],
      3: [
        { id: '5-3-1', word: 'Significant', definition: 'Important; having great meaning or effect' },
        { id: '5-3-2', word: 'Transform', definition: 'To change completely in form or appearance' },
        { id: '5-3-3', word: 'Ultimate', definition: 'Final; most extreme or important' },
        { id: '5-3-4', word: 'Vivacious', definition: 'Full of life and energy; lively' },
        { id: '5-3-5', word: 'Wander', definition: 'To walk aimlessly; to move without purpose' }
      ]
    },
    6: {
      1: [
        { id: '6-1-1', word: 'Comprehend', definition: 'To understand fully; to grasp mentally' },
        { id: '6-1-2', word: 'Distinguish', definition: 'To recognize differences between things' },
        { id: '6-1-3', word: 'Elaborate', definition: 'To explain in more detail; to expand upon' },
        { id: '6-1-4', word: 'Flourish', definition: 'To grow well; to be successful' },
        { id: '6-1-5', word: 'Gradually', definition: 'Happening slowly over time' }
      ],
      2: [
        { id: '6-2-1', word: 'Inevitable', definition: 'Certain to happen; unavoidable' },
        { id: '6-2-2', word: 'Justify', definition: 'To show or prove to be right or reasonable' },
        { id: '6-2-3', word: 'Meticulous', definition: 'Very careful and precise; paying attention to details' },
        { id: '6-2-4', word: 'Precise', definition: 'Exact and accurate in details' },
        { id: '6-2-5', word: 'Scrutinize', definition: 'To examine closely and carefully' }
      ],
      3: [
        { id: '6-3-1', word: 'Spontaneous', definition: 'Done without planning; happening naturally' },
        { id: '6-3-2', word: 'Tangible', definition: 'Real and concrete; able to be touched' },
        { id: '6-3-3', word: 'Versatile', definition: 'Able to adapt to many different uses' },
        { id: '6-3-4', word: 'Wholesome', definition: 'Good for health and well-being' },
        { id: '6-3-5', word: 'Zealous', definition: 'Having great energy and enthusiasm' }
      ]
    },
    7: {
      1: [
        { id: '7-1-1', word: 'Advocate', definition: 'To publicly support or recommend' },
        { id: '7-1-2', word: 'Benevolent', definition: 'Kind and generous; showing goodwill' },
        { id: '7-1-3', word: 'Contemplate', definition: 'To think deeply about something' },
        { id: '7-1-4', word: 'Deteriorate', definition: 'To become worse in quality or condition' },
        { id: '7-1-5', word: 'Eloquent', definition: 'Fluent and persuasive in speaking or writing' }
      ],
      2: [
        { id: '7-2-1', word: 'Hypothesis', definition: 'A proposed explanation for something' },
        { id: '7-2-2', word: 'Innovative', definition: 'Introducing new ideas; creative' },
        { id: '7-2-3', word: 'Perpetual', definition: 'Never ending; continuing forever' },
        { id: '7-2-4', word: 'Resilient', definition: 'Able to recover quickly from difficulties' },
        { id: '7-2-5', word: 'Skeptical', definition: 'Doubtful; questioning the truth of something' }
      ],
      3: [
        { id: '7-3-1', word: 'Tenacious', definition: 'Holding firmly to something; persistent' },
        { id: '7-3-2', word: 'Unanimous', definition: 'Agreed by everyone; with no opposition' },
        { id: '7-3-3', word: 'Vindicate', definition: 'To clear of blame or suspicion' },
        { id: '7-3-4', word: 'Whimsical', definition: 'Playful and unpredictable; fanciful' },
        { id: '7-3-5', word: 'Zephyr', definition: 'A gentle, mild breeze' }
      ]
    },
    8: {
      1: [
        { id: '8-1-1', word: 'Ambiguous', definition: 'Having more than one possible meaning; unclear' },
        { id: '8-1-2', word: 'Collaborate', definition: 'To work together on a project' },
        { id: '8-1-3', word: 'Discern', definition: 'To perceive or recognize clearly' },
        { id: '8-1-4', word: 'Exemplify', definition: 'To be a typical example of something' },
        { id: '8-1-5', word: 'Fluctuate', definition: 'To change irregularly; to vary' }
      ],
      2: [
        { id: '8-2-1', word: 'Imperative', definition: 'Extremely important; essential' },
        { id: '8-2-2', word: 'Juxtapose', definition: 'To place side by side for comparison' },
        { id: '8-2-3', word: 'Lucid', definition: 'Clear and easy to understand' },
        { id: '8-2-4', word: 'Meander', definition: 'To wander aimlessly; to follow a winding path' },
        { id: '8-2-5', word: 'Nuance', definition: 'A subtle difference in meaning or expression' }
      ],
      3: [
        { id: '8-3-1', word: 'Synthesis', definition: 'The combination of parts into a coherent whole' },
        { id: '8-3-2', word: 'Tangential', definition: 'Only slightly related; diverging from the main point' },
        { id: '8-3-3', word: 'Ubiquitous', definition: 'Present everywhere; widespread' },
        { id: '8-3-4', word: 'Validate', definition: 'To confirm the accuracy or worth of something' },
        { id: '8-3-5', word: 'Zenith', definition: 'The highest point; the peak of achievement' }
      ]
    }
  };

  // Initialize vocabulary for selected grade and level
  useEffect(() => {
    const gradeData = vocabularyData[selectedGrade];
    const levelVocab = gradeData ? gradeData[selectedLevel] || [] : [];
    setVocabularyWords(levelVocab);
    setShuffledWords([...levelVocab].sort(() => Math.random() - 0.5));
    setShuffledDefinitions([...levelVocab].sort(() => Math.random() - 0.5));
    setMatches([]);
    setScore(0);
    setShowResults(false);
    setCompleted(false);
    startTimeRef.current = Date.now();
  }, [selectedGrade, selectedLevel]);

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

  const handleDefinitionClick = (definitionId: string) => {
    // Allow dragging back to original position by removing the match
    const matchToRemove = matches.find(match => match.definitionId === definitionId);
    if (matchToRemove) {
      const updatedMatches = matches.filter(match => match.definitionId !== definitionId);
      setMatches(updatedMatches);
      setCompleted(false);
      setShowResults(false);
    }
  };

  const handleSubmit = () => {
    if (matches.length === 0) {
      alert('Please match at least one word before submitting.');
      return;
    }
    
    calculateScore(matches);
    setCompleted(true);
    setShowResults(true);
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
    return level <= unlockedLevels[selectedGrade];
  };

  const resetActivity = () => {
    const gradeData = vocabularyData[selectedGrade];
    const levelVocab = gradeData ? gradeData[selectedLevel] || [] : [];
    setShuffledWords([...levelVocab].sort(() => Math.random() - 0.5));
    setShuffledDefinitions([...levelVocab].sort(() => Math.random() - 0.5));
    setMatches([]);
    setScore(0);
    setShowResults(false);
    setCompleted(false);
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

  return (
    <div className="min-h-screen bg-emerald-50 relative overflow-hidden">

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
                {[4, 5, 6, 7, 8].map(grade => (
                  <button
                    key={grade}
                    onClick={() => setSelectedGrade(grade)}
                    className={`px-3 py-1 text-sm rounded-lg font-medium transition-all duration-200 ${
                      selectedGrade === grade
                        ? 'bg-teal-500 text-white shadow-lg transform scale-105'
                        : 'bg-teal-100 text-gray-700 border border-teal-300 hover:bg-teal-200'
                    }`}
                  >
                    {grade}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Level Selection */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Level:</span>
              <div className="flex space-x-1">
                {[1, 2, 3].map(level => {
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
                        onClick={() => handleDefinitionClick(definition.id)}
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
              className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-card"
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
                  <button
                    onClick={resetActivity}
                    className="flex-1 bg-teal-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-teal-600 transition-colors duration-200"
                  >
                    Try Again
                  </button>
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
                    onClick={() => setShowResults(false)}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-400 transition-colors duration-200"
                  >
                    Review
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
          <div className="bg-teal-100 rounded-lg p-3 shadow-md inline-block mb-4">
            <div className="text-sm text-gray-700 mb-2">
              Grade {selectedGrade} • Level {selectedLevel} • Progress: {matches.length} / {vocabularyWords.length}
            </div>
            <div className="text-xs text-gray-600 mb-2">
              Unlocked levels: {Array.from({length: unlockedLevels[selectedGrade]}, (_, i) => i + 1).join(', ')}
              {unlockedLevels[selectedGrade] < 3 && ' • Need 70% with all words to unlock next level'}
            </div>
            <div className="w-48 bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(matches.length / vocabularyWords.length) * 100}%` }}
              />
            </div>
          </div>
          
          {!completed && (
            <div>
              <button
                onClick={handleSubmit}
                disabled={matches.length === 0}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                  matches.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-teal-500 text-white hover:bg-teal-600 shadow-lg hover:shadow-card transform hover:scale-105'
                }`}
              >
                Submit Answers ({matches.length}/{vocabularyWords.length})
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Click matched words to remove them • You can submit incomplete answers
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default VocabularyMatching;

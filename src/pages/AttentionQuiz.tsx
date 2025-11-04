import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw, Star, Eye, Check, X, Brain, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Tile interface
interface Tile {
  id: string;
  number: number;
  isRevealed: boolean;
  isSelected: boolean;
  isCorrect: boolean;
}

const AttentionQuiz: React.FC = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<'selection' | 'playing' | 'showing' | 'result' | 'complete'>('selection');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [selectedTiles, setSelectedTiles] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [gamePhase, setGamePhase] = useState<'memorize' | 'select'>('memorize');
  const [showingTime, setShowingTime] = useState(3);
  const [isCorrect, setIsCorrect] = useState(false);
  const [quizType, setQuizType] = useState<'attention' | 'memory' | 'sequence' | null>(null);
  const [sequencePhase, setSequencePhase] = useState<'showing' | 'hidden' | 'selecting'>('showing');
  const [sequenceNumbers, setSequenceNumbers] = useState<number[]>([]);
  const [sequenceGuess, setSequenceGuess] = useState<number[]>([]);
  const [sequenceTiles, setSequenceTiles] = useState<{ id: number; number: number; isFlipped: boolean; isCorrect?: boolean; isWrong?: boolean }[]>([]);
  const [showInstructions, setShowInstructions] = useState(true);

  const maxLevel = 6;
  const currentTileCount = Math.min(2 + currentLevel, 6);

  // Generate tiles for current level
  const generateTiles = useCallback(() => {
    const totalPositions = 9; // 3x3 grid
    const positions = Array.from({ length: totalPositions }, (_, i) => i);
    const selectedPositions = positions.sort(() => Math.random() - 0.5).slice(0, currentTileCount);
    
    const newTiles: Tile[] = positions.map(position => {
      const isNumbered = selectedPositions.includes(position);
      const number = isNumbered ? selectedPositions.indexOf(position) + 1 : 0;
      
      return {
        id: `tile-${position}`,
        number,
        isRevealed: true,
        isSelected: false,
        isCorrect: false
      };
    });

    setTiles(newTiles);
    setSelectedTiles([]);
    setGamePhase('memorize');
    setShowingTime(3);
    setGameState('showing');
  }, [currentTileCount]);

  // Generate sequence tiles for memory sequence game
  const generateSequenceTiles = useCallback(() => {
    const tileCount = Math.min(3 + currentLevel, 6); // Start with 4 tiles, max 6
    const numbers = Array.from({ length: tileCount }, (_, i) => i + 1);
    
    // Create shuffled positions for the tiles
    const positions = Array.from({ length: 9 }, (_, i) => i).sort(() => Math.random() - 0.5).slice(0, tileCount);
    
    const tiles = positions.map((pos, index) => ({
      id: pos,
      number: numbers[index],
      isFlipped: false,
      isCorrect: false,
      isWrong: false
    }));

    setSequenceTiles(tiles);
    setSequenceNumbers(numbers);
    setSequenceGuess([]);
    setSequencePhase('showing');
    setGameState('showing');
    setShowInstructions(true);

    // Show tiles for 3 seconds then flip them
    setTimeout(() => {
      setSequenceTiles(prev => prev.map(tile => ({ ...tile, isFlipped: true })));
      setSequencePhase('hidden');
      setShowInstructions(false);
      
      // Wait 1 second then allow selection
      setTimeout(() => {
        setSequencePhase('selecting');
        setGameState('playing');
      }, 1000);
    }, 3000);
  }, [currentLevel]);

  // Handle tile selection
  const handleTileClick = useCallback((tileId: string) => {
    if (gamePhase !== 'select' || gameState !== 'playing') return;

    const tile = tiles.find(t => t.id === tileId);
    if (!tile || tile.number === 0 || tile.isSelected) return;

    const expectedNumber = selectedTiles.length + 1;
    const isCorrectSelection = tile.number === expectedNumber;

    if (isCorrectSelection) {
      setTiles(prev => prev.map(t => 
        t.id === tileId ? { ...t, isSelected: true, isCorrect: true, isRevealed: true } : t
      ));
      setSelectedTiles(prev => [...prev, tile.number]);

      if (selectedTiles.length + 1 === currentTileCount) {
        // Level completed successfully
        setScore(prev => prev + currentLevel * 10);
        setIsCorrect(true);
        setGameState('result');
        
        setTimeout(() => {
          if (currentLevel < maxLevel) {
            setCurrentLevel(prev => prev + 1);
            generateTiles();
          } else {
            setGameState('complete');
          }
        }, 2000);
      }
    } else {
      // Wrong selection
      setTiles(prev => prev.map(t => 
        t.id === tileId ? { ...t, isSelected: true, isCorrect: false, isRevealed: true } : t
      ));
      setIsCorrect(false);
      setGameState('result');
      
      setTimeout(() => {
        generateTiles(); // Restart same level
      }, 2000);
    }
  }, [gamePhase, gameState, tiles, selectedTiles, currentTileCount, currentLevel, maxLevel, generateTiles]);

  // Handle sequence tile selection
  const handleSequenceTileClick = useCallback((tileId: number) => {
    if (sequencePhase !== 'selecting' || gameState !== 'playing') return;

    const tile = sequenceTiles.find(t => t.id === tileId);
    if (!tile) return;

    const expectedNumber = sequenceGuess.length + 1;
    const isCorrect = tile.number === expectedNumber;

    if (isCorrect) {
      setSequenceTiles(prev => prev.map(t => 
        t.id === tileId ? { ...t, isFlipped: false, isCorrect: true } : t
      ));
      setSequenceGuess(prev => [...prev, tile.number]);

      if (sequenceGuess.length + 1 === sequenceNumbers.length) {
        // Level completed successfully
        setScore(prev => prev + currentLevel * 10);
        setIsCorrect(true);
        setGameState('result');
        
        setTimeout(() => {
          if (currentLevel < maxLevel) {
            setCurrentLevel(prev => prev + 1);
            generateSequenceTiles();
          } else {
            setGameState('complete');
          }
        }, 2000);
      }
    } else {
      // Wrong selection
      setSequenceTiles(prev => prev.map(t => 
        t.id === tileId ? { ...t, isFlipped: false, isWrong: true } : t
      ));
      setIsCorrect(false);
      setGameState('result');
      
      setTimeout(() => {
        generateSequenceTiles(); // Restart same level
      }, 2000);
    }
  }, [sequencePhase, gameState, sequenceTiles, sequenceGuess, sequenceNumbers, currentLevel, maxLevel, generateSequenceTiles]);

  // Start game after memorization phase
  useEffect(() => {
    if (gameState === 'showing' && showingTime > 0) {
      const timer = setTimeout(() => {
        setShowingTime(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'showing' && showingTime === 0) {
      setTiles(prev => prev.map(t => ({ ...t, isRevealed: t.number === 0 })));
      setGamePhase('select');
      setGameState('playing');
    }
  }, [gameState, showingTime]);

  const resetGame = () => {
    setCurrentLevel(1);
    setScore(0);
    setGameState('selection');
    setQuizType(null);
  };

  const startQuiz = (type: 'attention' | 'memory' | 'sequence') => {
    if (type === 'attention') {
      // Redirect to Memory Assessment component
      navigate('/memory-assessment');
      return;
    }
    
    setQuizType(type);
    setCurrentLevel(1);
    setScore(0);
    if (type === 'sequence') {
      generateSequenceTiles();
    } else {
      generateTiles();
    }
  };

  // Quiz Selection Screen
  if (gameState === 'selection') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-300 via-emerald-400 to-green-500 py-8">
        <div className="container mx-auto px-4 relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate('/category/mind')}
              className="group flex items-center space-x-2 px-4 py-2 text-stone-600 rounded-lg transition-all duration-300 ease-out hover:text-emerald-700 hover:bg-white/50 hover:shadow-md transform hover:scale-105 hover:-translate-y-0.5"
            >
              <ArrowLeft size={20} className="transform group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="font-medium">Back</span>
            </button>
          </div>

          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent mb-4">
              Choose Your Challenge
            </h1>
            <p className="text-stone-700 text-lg max-w-2xl mx-auto">
              Select between Attention Focus or Memory Training exercises
            </p>
          </div>

          {/* Quiz Selection Cards */}
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Attention Quiz Card */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="group bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl p-8 shadow-xl border border-emerald-300 cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-2xl"
              onClick={() => startQuiz('attention')}
            >
              <div className="text-center text-white">
                <div className="mb-6">
                  <Target className="w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h2 className="text-2xl font-bold mb-2">Correct Identification</h2>
                  <p className="text-emerald-100 text-sm">
                    Test your focus and concentration skills
                  </p>
                </div>
                
                <div className="bg-white/20 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold mb-2">Features:</h3>
                  <ul className="text-sm space-y-1 text-emerald-100">
                    <li>• Focus and attention training</li>
                    <li>• Progressive difficulty levels</li>
                    <li>• Number sequence challenges</li>
                    <li>• Immediate feedback</li>
                  </ul>
                </div>

                <div className="bg-emerald-600 text-white px-6 py-3 rounded-full font-bold group-hover:bg-emerald-700 transition-colors duration-300">
                  Start Correct Identification
                </div>
              </div>
            </motion.div>

            {/* Memory Quiz Card - Now the sequence memory game */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="group bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl p-8 shadow-xl border border-purple-300 cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-2xl"
              onClick={() => startQuiz('sequence')}
            >
              <div className="text-center text-white">
                <div className="mb-6">
                  <Brain className="w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h2 className="text-2xl font-bold mb-2">Memory Quiz</h2>
                  <p className="text-purple-100 text-sm">
                    Remember the order and tap tiles in sequence
                  </p>
                </div>
                
                <div className="bg-white/20 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold mb-2">Features:</h3>
                  <ul className="text-sm space-y-1 text-purple-100">
                    <li>• Number tile sequences</li>
                    <li>• Flip animations & feedback</li>
                    <li>• Progressive difficulty (4-6 tiles)</li>
                    <li>• Tap tiles in ascending order</li>
                  </ul>
                </div>

                <div className="bg-purple-600 text-white px-6 py-3 rounded-full font-bold group-hover:bg-purple-700 transition-colors duration-300">
                  Start Memory Quiz
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-300 via-emerald-400 to-green-500 py-8">
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/category/mind')}
            className="group flex items-center space-x-2 px-4 py-2 text-stone-600 rounded-lg transition-all duration-300 ease-out hover:text-emerald-700 hover:bg-white/50 hover:shadow-md transform hover:scale-105 hover:-translate-y-0.5"
          >
            <ArrowLeft size={20} className="transform group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-medium">Back</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent mb-2">
              {quizType === 'attention' ? 'Attention' : quizType === 'sequence' ? 'Memory' : 'Focus'} Training
            </h1>
            <div className="flex items-center justify-center gap-4 text-stone-700">
              <div className="flex items-center gap-2">
                <Eye size={20} />
                <span>Level {currentLevel}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star size={20} />
                <span>Score: {score}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={resetGame}
            className="group relative px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-stone-100 rounded-full font-medium overflow-hidden transition-all duration-300 ease-out hover:shadow-lg hover:shadow-emerald-500/25 transform hover:scale-105 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative flex items-center gap-2">
              <RotateCcw size={20} />
              Reset
            </span>
          </button>
        </div>

        {/* Sequence Game Instructions */}
        {quizType === 'sequence' && (gameState === 'showing' || gameState === 'playing') && (
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 shadow-xl border border-purple-200 max-w-2xl mx-auto">
              {showInstructions ? (
                <div>
                  <h2 className="text-2xl font-bold text-purple-800 mb-2">Remember the order and tap the tiles!</h2>
                  <p className="text-lg text-purple-600 mb-4">Memorize the sequence of numbers 1 to {Math.min(3 + currentLevel, 6)}</p>
                  <div className="text-3xl font-bold text-purple-600">Get Ready...</div>
                </div>
              ) : sequencePhase === 'hidden' ? (
                <div>
                  <h2 className="text-2xl font-bold text-purple-800 mb-2">Get Ready!</h2>
                  <p className="text-lg text-purple-600">Tiles will be available for selection in a moment...</p>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold text-purple-800 mb-2">Tap tiles in ascending order (1→2→3...)</h2>
                  <p className="text-lg text-purple-600">Next number: {sequenceGuess.length + 1}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Attention Game Instructions */}
        {quizType !== 'sequence' && (gameState === 'showing' || gameState === 'playing') && (
          <div className="text-center mb-8">
            <div className="bg-stone-100 rounded-2xl p-6 shadow-xl border border-stone-200 max-w-2xl mx-auto">
              {gamePhase === 'memorize' ? (
                <div>
                  <h2 className="text-2xl font-bold text-stone-800 mb-2">Remember which tile has which number!</h2>
                  <p className="text-lg text-stone-600 mb-4">Memorize the positions of numbers 1 to {currentTileCount}</p>
                  <div className="text-3xl font-bold text-emerald-600">{showingTime}</div>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold text-stone-800 mb-2">Tap tiles in numerical order (1,2,3...)</h2>
                  <p className="text-lg text-stone-600">Find and select: {selectedTiles.length + 1}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sequence Game Grid */}
        {quizType === 'sequence' && (gameState === 'showing' || gameState === 'playing') && (
          <div className="max-w-md mx-auto mb-8">
            <div className="grid grid-cols-3 gap-3 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl border border-purple-200">
              {Array.from({ length: 9 }, (_, index) => {
                const tile = sequenceTiles.find(t => t.id === index);
                return (
                  <motion.div
                    key={index}
                    className={`
                      w-20 h-20 rounded-xl shadow-lg cursor-pointer
                      flex items-center justify-center text-2xl font-bold
                      transition-all duration-300 transform hover:scale-105
                      ${!tile 
                        ? 'bg-gray-200 cursor-default' 
                        : tile.isFlipped 
                          ? 'bg-gradient-to-br from-purple-400 to-pink-400 text-white shadow-lg hover:shadow-xl'
                          : tile.isCorrect
                            ? 'bg-green-400 text-white border-2 border-green-600'
                            : tile.isWrong
                              ? 'bg-red-400 text-white border-2 border-red-600'
                              : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg'
                      }
                    `}
                    onClick={() => tile && handleSequenceTileClick(tile.id)}
                    whileHover={{ scale: tile && sequencePhase === 'selecting' && tile.isFlipped ? 1.05 : 1 }}
                    whileTap={{ scale: tile && sequencePhase === 'selecting' && tile.isFlipped ? 0.95 : 1 }}
                    animate={{
                      rotateY: tile && tile.isFlipped ? 180 : 0,
                    }}
                    transition={{ duration: 0.6 }}
                    style={{
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    <motion.div
                      animate={{
                        opacity: tile && tile.isFlipped ? 0 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {tile && !tile.isFlipped ? tile.number : ''}
                    </motion.div>
                    {tile && tile.isFlipped && (
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        animate={{
                          opacity: 1,
                        }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                      >
                        ?
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Attention Game Grid */}
        {quizType !== 'sequence' && (gameState === 'showing' || gameState === 'playing') && (
          <div className="max-w-md mx-auto mb-8">
            <div className="grid grid-cols-3 gap-3 p-6 bg-stone-100 rounded-2xl shadow-xl border border-stone-200">
              {tiles.map((tile) => (
                <motion.div
                  key={tile.id}
                  className={`
                    w-20 h-20 rounded-xl shadow-lg cursor-pointer
                    flex items-center justify-center text-2xl font-bold
                    transition-all duration-300 transform hover:scale-105
                    ${tile.isRevealed 
                      ? tile.number > 0 
                        ? tile.isCorrect 
                          ? 'bg-emerald-400 text-white border-2 border-emerald-600' 
                          : tile.isSelected && !tile.isCorrect
                            ? 'bg-red-400 text-white border-2 border-red-600'
                            : 'bg-gradient-to-br from-teal-400 to-emerald-500 text-white shadow-lg hover:shadow-xl'
                        : 'bg-stone-300 cursor-default'
                      : 'bg-stone-200 hover:bg-stone-300 cursor-pointer'
                    }
                  `}
                  onClick={() => handleTileClick(tile.id)}
                  whileHover={{ scale: gamePhase === 'select' && tile.number > 0 && !tile.isSelected ? 1.05 : 1 }}
                  whileTap={{ scale: gamePhase === 'select' && tile.number > 0 && !tile.isSelected ? 0.95 : 1 }}
                >
                  {tile.isRevealed && tile.number > 0 ? tile.number : ''}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Result Feedback */}
        {gameState === 'result' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className={`bg-stone-100 rounded-2xl p-6 shadow-xl border-2 ${
              isCorrect ? 'border-emerald-300' : 'border-red-300'
            } max-w-2xl mx-auto`}>
              {isCorrect ? (
                <div className="text-emerald-600">
                  <Check className="w-12 h-12 mx-auto mb-3" />
                  <h3 className="text-2xl font-bold mb-2">Excellent!</h3>
                  <p className="text-lg">Level {currentLevel} completed! +{currentLevel * 10} points</p>
                </div>
              ) : (
                <div className="text-red-500">
                  <X className="w-12 h-12 mx-auto mb-3" />
                  <h3 className="text-2xl font-bold mb-2">Try Again!</h3>
                  <p className="text-lg">Select tiles in numerical order: 1 → 2 → 3 → 4 → 5 → 6</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Game Complete */}
        {gameState === 'complete' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="bg-stone-100 rounded-2xl p-8 shadow-xl border border-stone-200 max-w-2xl mx-auto">
              <Star className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-stone-800 mb-4">Congratulations!</h2>
              <p className="text-xl text-stone-600 mb-6">
                You've completed all {maxLevel} levels of the {quizType === 'sequence' ? 'Memory' : quizType} quiz!
              </p>
              <p className="text-2xl font-bold text-emerald-600 mb-8">Final Score: {score}</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={resetGame}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full font-bold hover:shadow-lg transition-all duration-300"
                >
                  Play Again
                </button>
                <button
                  onClick={() => navigate('/category/mind')}
                  className="px-8 py-3 bg-gradient-to-r from-stone-500 to-stone-600 text-white rounded-full font-bold hover:shadow-lg transition-all duration-300"
                >
                  Back
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AttentionQuiz;

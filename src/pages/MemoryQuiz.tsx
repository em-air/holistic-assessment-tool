import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw, Star, Brain, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProgressTracker } from '../utils/progressTracker';
import AssessmentProgressBar from '../components/AssessmentProgressBar';
import MindSectionReport from '../components/MindSectionReport';
import { ROUTES } from '../routes';
import FloatingBackground from '../components/FloatingBackground';

// Tile interface
interface Tile {
  id: string;
  number: number;
  isRevealed: boolean;
  isSelected: boolean;
  isCorrect: boolean;
}

const MemoryQuiz: React.FC = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<'playing' | 'showing' | 'result' | 'complete'>('playing');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [selectedTiles, setSelectedTiles] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [gamePhase, setGamePhase] = useState<'memorize' | 'select'>('memorize');
  const [showingTime, setShowingTime] = useState(3);
  const [isCorrect, setIsCorrect] = useState(false);
  const [startTime] = useState<Date>(new Date());
  const [showReport, setShowReport] = useState(false);
  const [attemptsPerLevel, setAttemptsPerLevel] = useState<Record<number, number>>({});
  const [currentLevelAttempts, setCurrentLevelAttempts] = useState(0);

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
    setCurrentLevelAttempts(0); // Reset attempts for new level
  }, [currentTileCount]);

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
        const newScore = score + currentLevel * 10;
        setScore(newScore);
        setIsCorrect(true);
        setGameState('result');

        setTimeout(() => {
          if (currentLevel < maxLevel) {
            setCurrentLevel(prev => prev + 1);
            setCurrentLevelAttempts(0); // Reset attempts for next level
            generateTiles();
          } else {
            // Final level completed - show score screen
            setGameState('complete');
          }
        }, 2000);
      }
    } else {
      // Wrong selection — mark as incorrect and advance to next level
      setTiles(prev => prev.map(t =>
        t.id === tileId ? { ...t, isSelected: true, isCorrect: false, isRevealed: true } : t
      ));
      setIsCorrect(false);
      setGameState('result');

      setAttemptsPerLevel(prev => ({ ...prev, [currentLevel]: (prev[currentLevel] || 0) + 1 }));

      setTimeout(() => {
        if (currentLevel < maxLevel) {
          setCurrentLevel(prev => prev + 1);
          setCurrentLevelAttempts(0);
          generateTiles();
        } else {
          setGameState('complete');
        }
      }, 2000);
    }
  }, [gamePhase, gameState, tiles, selectedTiles, currentTileCount, currentLevel, maxLevel, generateTiles]);

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

  // Initialize first level
  useEffect(() => {
    generateTiles();
  }, [generateTiles]);

  // Handle game completion and progress tracking (save exactly once)
  const hasSavedResultRef = React.useRef(false);
  useEffect(() => {
    if ((gameState === 'complete') && !hasSavedResultRef.current) {
      hasSavedResultRef.current = true;
      // Save progress to tracker when game completes
      const maxPossibleScore = Array.from({ length: maxLevel }, (_, i) => (i + 1) * 10).reduce((a, b) => a + b, 0);

      ProgressTracker.saveQuizResult({
        quizId: 'number-tiles',
        quizName: 'Number Tiles',
        subcategory: 'memory',
        score: score,
        totalQuestions: maxLevel,
        percentage: Math.round((score / maxPossibleScore) * 100),
        timeSpent: Math.round((new Date().getTime() - startTime.getTime()) / 1000),
        completedAt: new Date().toISOString(),
        additionalData: {
          levelsCompleted: maxLevel,
          attemptsPerLevel: attemptsPerLevel,
          endReason: 'finished'
        }
      });
    }
  }, [gameState]);

  const resetGame = () => {
    setCurrentLevel(1);
    setScore(0);
    setAttemptsPerLevel({});
    setCurrentLevelAttempts(0);
    hasSavedResultRef.current = false;
    generateTiles();
  };

  return (
    <div className="min-h-screen bg-indigo-50 relative overflow-hidden py-8">
      <FloatingBackground />
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center space-x-2 px-4 py-2 text-stone-600 rounded-lg transition-all duration-300 ease-out hover:text-purple-700 hover:bg-white/50 hover:shadow-md transform hover:scale-105 hover:-translate-y-0.5"
          >
            <ArrowLeft size={20} className="transform group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-medium">Back to Selection</span>
          </button>

          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text text-transparent mb-2">
              Memory Training
            </h1>
            <div className="flex items-center justify-center gap-4 text-stone-700">
              <div className="flex items-center gap-2">
                <Brain size={20} />
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
            className="group relative px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-stone-100 rounded-full font-medium overflow-hidden transition-all duration-300 ease-out hover:shadow-lg hover:shadow-indigo-500/25 transform hover:scale-105 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative flex items-center gap-2">
              <RotateCcw size={20} />
              Reset
            </span>
          </button>
        </div>

        {/* Mind Section Progress Bar */}
        <div className="mb-6">
          <AssessmentProgressBar
            onShowReport={() => setShowReport(true)}
          />
        </div>

        {/* Game Instructions */}
        {(gameState === 'showing' || gameState === 'playing') && (
          <div className="text-center mb-8">
            <div className="bg-stone-100 rounded-2xl p-6 shadow-xl border border-stone-200 max-w-2xl mx-auto">
              {gamePhase === 'memorize' ? (
                <div>
                  <h2 className="text-2xl font-bold text-stone-800 mb-2">Remember which tile has which number!</h2>
                  <p className="text-lg text-stone-600 mb-4">Memorize the positions of numbers 1 to {currentTileCount}</p>
                  <div className="text-3xl font-bold text-indigo-600">{showingTime}</div>
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

        {/* Game Grid */}
        {(gameState === 'showing' || gameState === 'playing') && (
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
                          ? 'bg-indigo-400 text-white border-2 border-indigo-600'
                          : tile.isSelected && !tile.isCorrect
                            ? 'bg-red-400 text-white border-2 border-red-600'
                            : 'bg-gradient-to-br from-indigo-400 to-purple-500 text-white shadow-lg hover:shadow-xl'
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
            <div className={`bg-stone-100 rounded-2xl p-6 shadow-xl border-2 ${isCorrect ? 'border-indigo-300' : 'border-red-300'
              } max-w-2xl mx-auto`}>
              {isCorrect ? (
                <div className="text-indigo-600">
                  <Check className="w-12 h-12 mx-auto mb-3" />
                  <h3 className="text-2xl font-bold mb-2">Excellent Memory!</h3>
                  <p className="text-lg">Level {currentLevel} completed! +{currentLevel * 10} points</p>
                </div>
              ) : (
                <div className="text-red-500">
                  <X className="w-12 h-12 mx-auto mb-3" />
                  <h3 className="text-2xl font-bold mb-2">Incorrect</h3>
                  <p className="text-lg">Moving to the next level...</p>
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
              <h2 className="text-3xl font-bold text-stone-800 mb-4">Memory Quiz Complete!</h2>
              <p className="text-xl text-stone-600 mb-6">
                You've completed all {maxLevel} levels of the memory challenge!
              </p>

              {/* Score Display */}
              <div className="bg-white rounded-xl p-6 mb-6 shadow-inner">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Your Results</h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-indigo-600">{score}</div>
                    <div className="text-sm text-gray-600">Total Points</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-600">
                      {Math.round((score / (Array.from({ length: maxLevel }, (_, i) => (i + 1) * 10).reduce((a, b) => a + b, 0))) * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-700">
                  <p>🧠 <strong>Memory Skills:</strong> {score >= 150 ? 'Excellent!' : score >= 100 ? 'Good!' : score >= 50 ? 'Developing' : 'Keep Practicing!'}</p>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={resetGame}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-bold hover:shadow-lg transition-all duration-300"
                >
                  Play Again
                </button>
                <button
                  onClick={() => navigate(ROUTES.ATTENTION_QUIZ_FLAT, { replace: true })}
                  className="px-8 py-3 bg-gradient-to-r from-stone-500 to-stone-600 text-white rounded-full font-bold hover:shadow-lg transition-all duration-300"
                >
                  Back to Selection
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Report Modal */}
        {showReport && (
          <MindSectionReport onClose={() => setShowReport(false)} />
        )}
      </div>
    </div>
  );
};

export default MemoryQuiz;

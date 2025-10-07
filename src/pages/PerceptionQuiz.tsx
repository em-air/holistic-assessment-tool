import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw, Star, Eye, Check, Trophy, Timer, Shuffle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';

// Enhanced types for jigsaw puzzle
interface PuzzlePiece {
  id: string;
  originalIndex: number;
  currentIndex: number;
  imageUrl: string;
  isPlaced: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  backgroundPosition: string;
}

interface PuzzleLevel {
  id: number;
  name: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  gridSize: { rows: number; cols: number };
  imageUrl: string;
  description: string;
  timeLimit?: number; // in seconds
}

// Puzzle levels with real, engaging pictures - each with unique images
const puzzleLevels: PuzzleLevel[] = [
  {
    id: 1,
    name: "Cute Puppy",
    difficulty: 1,
    gridSize: { rows: 2, cols: 2 },
    imageUrl: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=400&fit=crop&crop=face",
    description: "Complete this adorable puppy puzzle",
    timeLimit: 120
  },
  {
    id: 2,
    name: "Orange Cat",
    difficulty: 2,
    gridSize: { rows: 3, cols: 3 },
    imageUrl: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop&crop=face",
    description: "Arrange the friendly orange cat",
    timeLimit: 180
  },
  {
    id: 3,
    name: "Red Apple",
    difficulty: 3,
    gridSize: { rows: 3, cols: 4 },
    imageUrl: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400&h=400&fit=crop&crop=center",
    description: "Piece together this fresh red apple",
    timeLimit: 240
  },
  {
    id: 4,
    name: "Yellow Sunflower",
    difficulty: 4,
    gridSize: { rows: 4, cols: 4 },
    imageUrl: "https://images.unsplash.com/photo-1470509037663-253afd7f0f51?w=400&h=400&fit=crop&crop=center",
    description: "Complete the bright sunflower",
    timeLimit: 300
  },
  {
    id: 5,
    name: "Blue Ocean Wave",
    difficulty: 5,
    gridSize: { rows: 4, cols: 5 },
    imageUrl: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=400&fit=crop&crop=center",
    description: "Assemble this ocean wave",
    timeLimit: 360
  }
];

// Draggable puzzle piece component
const DraggablePiece: React.FC<{
  piece: PuzzlePiece;
  className?: string;
  gridCols?: number;
  gridRows?: number;
}> = React.memo(({ piece, className = '', gridCols = 2, gridRows = 2 }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: piece.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  // Calculate the total background size based on grid dimensions
  const backgroundSizeWidth = piece.size.width * gridCols;
  const backgroundSizeHeight = piece.size.height * gridRows;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        relative cursor-grab active:cursor-grabbing border-2 border-stone-300 
        bg-white shadow-lg rounded-lg overflow-hidden
        hover:shadow-xl hover:scale-105 transition-all duration-200
        ${isDragging ? 'opacity-50 z-50' : 'opacity-100'}
        ${piece.isPlaced ? 'border-emerald-400 shadow-emerald-200' : 'border-stone-300'}
        ${className}
      `}
      whileHover={{ scale: isDragging ? 1 : 1.05, rotate: isDragging ? 0 : 1 }}
      whileTap={{ scale: 0.95 }}
    >
      <div
        className="w-full h-full"
        style={{
          backgroundImage: `url(${piece.imageUrl})`,
          backgroundPosition: piece.backgroundPosition,
          backgroundSize: `${backgroundSizeWidth}px ${backgroundSizeHeight}px`,
          backgroundRepeat: 'no-repeat',
        }}
      />
      {!piece.isPlaced && (
        <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center">
          <span className="text-white font-bold text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
            {piece.originalIndex + 1}
          </span>
        </div>
      )}
    </motion.div>
  );
});

DraggablePiece.displayName = 'DraggablePiece';

// Droppable target slot component
const DroppableSlot: React.FC<{
  id: string;
  children?: React.ReactNode;
  className?: string;
}> = React.memo(({ id, children, className = '' }) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        border-2 border-dashed border-white/50 rounded-lg
        flex items-center justify-center relative transition-all duration-200
        ${isOver ? 'border-emerald-400 bg-emerald-400/20 scale-105' : ''}
        ${className}
      `}
      style={{
        aspectRatio: '1',
        minHeight: '80px'
      }}
    >
      {children}
    </div>
  );
});

DroppableSlot.displayName = 'DroppableSlot';

// Puzzle piece component with drag functionality
const PuzzlePiece: React.FC<{
  piece: PuzzlePiece;
  onDragStart: (piece: PuzzlePiece, event: React.MouseEvent | React.TouchEvent) => void;
  isDragging: boolean;
  className?: string;
}> = React.memo(({ piece, onDragStart, isDragging, className = '' }) => {
  return (
    <motion.div
      className={`
        relative cursor-grab active:cursor-grabbing border-2 border-stone-300 
        bg-white shadow-lg rounded-lg overflow-hidden
        hover:shadow-xl hover:scale-105 transition-all duration-200
        ${isDragging ? 'opacity-50 z-50' : 'opacity-100'}
        ${piece.isPlaced ? 'border-emerald-400 shadow-emerald-200' : 'border-stone-300'}
        ${className}
      `}
      style={{
        width: piece.size.width,
        height: piece.size.height,
      }}
      whileHover={{ scale: 1.05, rotate: isDragging ? 0 : 1 }}
      whileTap={{ scale: 0.95 }}
      onMouseDown={(e) => onDragStart(piece, e)}
      onTouchStart={(e) => onDragStart(piece, e)}
    >
      <div
        className="w-full h-full bg-cover bg-center"
        style={{
          backgroundImage: `url(${piece.imageUrl})`,
          backgroundPosition: piece.backgroundPosition,
          backgroundSize: '400% 400%', // Adjust based on grid size
        }}
      />
      {!piece.isPlaced && (
        <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center">
          <span className="text-white font-bold text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
            {piece.originalIndex + 1}
          </span>
        </div>
      )}
    </motion.div>
  );
});

PuzzlePiece.displayName = 'PuzzlePiece';

// Main component
const PerceptionQuiz: React.FC = () => {
  const navigate = useNavigate();
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [puzzlePieces, setPuzzlePieces] = useState<PuzzlePiece[]>([]);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'completed' | 'finished'>('menu');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [draggedPiece, setDraggedPiece] = useState<PuzzlePiece | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const currentLevel = puzzleLevels[currentLevelIndex];
  const totalPieces = currentLevel.gridSize.rows * currentLevel.gridSize.cols;

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const piece = puzzlePieces.find(p => p.id === active.id);
    if (piece) {
      setDraggedPiece(piece);
    }
  }, [puzzlePieces]);

  // Handle drag end
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedPiece(null);
    
    if (!over) return;

    const draggedPieceId = active.id as string;
    const targetSlotId = over.id as string;
    
    // Extract target index from slot ID (format: "slot-0", "slot-1", etc.)
    const targetIndex = parseInt(targetSlotId.replace('slot-', ''));
    
    if (!isNaN(targetIndex)) {
      handlePieceDrop(draggedPieceId, targetIndex);
    }
  }, []);

  // Generate puzzle pieces for current level
  const generatePuzzlePieces = useCallback((level: PuzzleLevel): PuzzlePiece[] => {
    const pieces: PuzzlePiece[] = [];
    const pieceWidth = 400 / level.gridSize.cols;
    const pieceHeight = 400 / level.gridSize.rows;

    for (let row = 0; row < level.gridSize.rows; row++) {
      for (let col = 0; col < level.gridSize.cols; col++) {
        const index = row * level.gridSize.cols + col;
        
        // Calculate background position as percentage for proper image cropping
        const backgroundPosX = (col / (level.gridSize.cols - 1)) * 100;
        const backgroundPosY = (row / (level.gridSize.rows - 1)) * 100;

        pieces.push({
          id: `piece-${index}`,
          originalIndex: index,
          currentIndex: index,
          imageUrl: level.imageUrl,
          isPlaced: false,
          position: { x: 0, y: 0 },
          size: { width: pieceWidth, height: pieceHeight },
          backgroundPosition: level.gridSize.cols === 1 && level.gridSize.rows === 1 
            ? 'center center'
            : `${backgroundPosX}% ${backgroundPosY}%`
        });
      }
    }

    // Shuffle pieces
    return pieces.sort(() => Math.random() - 0.5).map((piece, index) => ({
      ...piece,
      currentIndex: index
    }));
  }, []);

  // Initialize level
  const initializeLevel = useCallback(() => {
    const pieces = generatePuzzlePieces(currentLevel);
    setPuzzlePieces(pieces);
    setTimeRemaining(currentLevel.timeLimit || 300);
    setMoves(0);
    setGameState('playing');
  }, [currentLevel, generatePuzzlePieces]);

  // Check if puzzle is completed
  const checkCompletion = useCallback(() => {
    const isCompleted = puzzlePieces.every(piece => piece.isPlaced);
    if (isCompleted && gameState === 'playing') {
      setGameState('completed');
      setScore(prev => prev + (currentLevel.difficulty * 100));
      setCompletedLevels(prev => [...prev, currentLevel.id]);
      
      // Auto-advance to next level after celebration
      setTimeout(() => {
        if (currentLevelIndex < puzzleLevels.length - 1) {
          setCurrentLevelIndex(prev => prev + 1);
          setGameState('menu');
        } else {
          setGameState('finished');
        }
      }, 3000);
    }
  }, [puzzlePieces, gameState, currentLevel, currentLevelIndex]);

  // Handle piece placement
  const handlePieceDrop = useCallback((pieceId: string, targetIndex: number) => {
    setPuzzlePieces(prev => prev.map(piece => {
      if (piece.id === pieceId) {
        const isCorrectPosition = piece.originalIndex === targetIndex;
        return {
          ...piece,
          currentIndex: targetIndex,
          isPlaced: isCorrectPosition
        };
      }
      return piece;
    }));
    setMoves(prev => prev + 1);
  }, []);

  // Timer effect
  useEffect(() => {
    if (gameState === 'playing' && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && gameState === 'playing') {
      setGameState('menu'); // Return to level select on timeout
    }
  }, [gameState, timeRemaining]);

  // Check completion when pieces change
  useEffect(() => {
    checkCompletion();
  }, [checkCompletion]);

  // Format time display
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Shuffle pieces
  const shufflePieces = useCallback(() => {
    setPuzzlePieces(prev => {
      const shuffled = [...prev].sort(() => Math.random() - 0.5);
      return shuffled.map((piece, index) => ({
        ...piece,
        currentIndex: index,
        isPlaced: false
      }));
    });
    setMoves(0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300 via-indigo-400 to-purple-500 py-8">
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/categories/mind')}
            className="group flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-all duration-300 ease-out hover:bg-white/20 hover:shadow-md transform hover:scale-105"
          >
            <ArrowLeft size={20} className="transform group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-medium">Back to Mind</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2">
              Jigsaw Perception
            </h1>
            <div className="flex items-center justify-center gap-4 text-white/90">
              <div className="flex items-center gap-2">
                <Eye size={20} />
                <span>Level {currentLevelIndex + 1}</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy size={20} />
                <span>Score: {score}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => {
              setCurrentLevelIndex(0);
              setScore(0);
              setGameState('menu');
              setCompletedLevels([]);
            }}
            className="group relative px-6 py-3 bg-white/20 text-white rounded-full font-medium overflow-hidden transition-all duration-300 ease-out hover:bg-white/30 hover:shadow-lg transform hover:scale-105"
          >
            <span className="relative flex items-center gap-2">
              <RotateCcw size={20} />
              Reset
            </span>
          </button>
        </div>

        {/* Level Selection Menu */}
        {gameState === 'menu' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Choose Your Challenge</h2>
              <p className="text-white/80 text-lg">Complete jigsaw puzzles of increasing difficulty</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {puzzleLevels.map((level, index) => (
                <motion.div
                  key={level.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`
                    bg-white rounded-2xl p-6 shadow-xl border-2 cursor-pointer
                    transition-all duration-300 hover:shadow-2xl hover:scale-105
                    ${completedLevels.includes(level.id) 
                      ? 'border-emerald-400 bg-emerald-50' 
                      : 'border-blue-400 hover:border-blue-500'
                    }
                  `}
                  onClick={() => {
                    setCurrentLevelIndex(index);
                    initializeLevel();
                  }}
                >
                  <div className="text-center mb-4">
                    {/* Preview Image */}
                    <div className="mb-4 mx-auto w-32 h-32 rounded-lg overflow-hidden shadow-md">
                      <img
                        src={level.imageUrl}
                        alt={level.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to a colored placeholder if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.style.background = `linear-gradient(45deg, #667eea 0%, #764ba2 100%)`;
                        }}
                      />
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{level.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{level.description}</p>
                    
                    {/* Difficulty stars */}
                    <div className="flex justify-center gap-1 mb-3">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={i < level.difficulty ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                        />
                      ))}
                    </div>

                    {/* Grid info */}
                    <div className="text-sm text-gray-500 mb-2">
                      {level.gridSize.rows} × {level.gridSize.cols} pieces
                    </div>

                    {/* Status */}
                    {completedLevels.includes(level.id) ? (
                      <div className="flex items-center justify-center gap-2 text-emerald-600">
                        <Check size={16} />
                        <span className="text-sm font-medium">Completed!</span>
                      </div>
                    ) : (
                      <div className="text-blue-600 text-sm font-medium">Available</div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Game Playing State */}
        {gameState === 'playing' && (
          <DndContext
            key={`level-${currentLevelIndex}-${currentLevel.imageUrl}`}
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-6xl mx-auto"
            >
              {/* Game Info */}
              <div className="flex justify-center gap-8 mb-6">
                <div className="bg-white/20 rounded-lg px-4 py-2 text-white">
                  <div className="flex items-center gap-2">
                    <Timer size={20} />
                    <span className="font-bold">{formatTime(timeRemaining)}</span>
                  </div>
                </div>
                <div className="bg-white/20 rounded-lg px-4 py-2 text-white">
                  <span>Moves: {moves}</span>
                </div>
                <button
                  onClick={shufflePieces}
                  className="bg-white/20 hover:bg-white/30 rounded-lg px-4 py-2 text-white transition-colors duration-200"
                >
                  <div className="flex items-center gap-2">
                    <Shuffle size={20} />
                    <span>Shuffle</span>
                  </div>
                </button>
              </div>

              {/* Reference Image */}
              <div className="text-center mb-6">
                <div className="bg-white/10 rounded-2xl p-4 inline-block">
                  <h3 className="text-white text-lg font-bold mb-2">Reference Image</h3>
                  <div className="w-32 h-32 mx-auto rounded-lg overflow-hidden shadow-lg">
                    <img
                      src={currentLevel.imageUrl}
                      alt={currentLevel.name}
                      className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity duration-300"
                    />
                  </div>
                  <p className="text-white/80 text-sm mt-2">{currentLevel.name}</p>
                </div>
              </div>

              {/* Puzzle Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Target Grid */}
                <div className="bg-white/10 rounded-2xl p-6">
                  <h3 className="text-white text-xl font-bold mb-4 text-center">Puzzle Board</h3>
                  <div 
                    className="grid gap-1 mx-auto bg-white/20 p-4 rounded-xl"
                    style={{
                      gridTemplateColumns: `repeat(${currentLevel.gridSize.cols}, 1fr)`,
                      width: '400px',
                      aspectRatio: `${currentLevel.gridSize.cols}/${currentLevel.gridSize.rows}`
                    }}
                  >
                    {Array.from({ length: totalPieces }, (_, index) => {
                      const placedPiece = puzzlePieces.find(piece => 
                        piece.originalIndex === index && piece.isPlaced
                      );
                      
                      return (
                        <DroppableSlot key={index} id={`slot-${index}`}>
                          {placedPiece ? (
                            <DraggablePiece
                              piece={placedPiece}
                              className="w-full h-full"
                              gridCols={currentLevel.gridSize.cols}
                              gridRows={currentLevel.gridSize.rows}
                            />
                          ) : (
                            <span className="text-white/50 text-xs">{index + 1}</span>
                          )}
                        </DroppableSlot>
                      );
                    })}
                  </div>
                </div>

                {/* Pieces Pool */}
                <div className="bg-white/10 rounded-2xl p-6">
                  <h3 className="text-white text-xl font-bold mb-4 text-center">Pieces</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {puzzlePieces
                      .filter(piece => !piece.isPlaced)
                      .map(piece => (
                        <DraggablePiece
                          key={piece.id}
                          piece={piece}
                          className="w-full aspect-square"
                          gridCols={currentLevel.gridSize.cols}
                          gridRows={currentLevel.gridSize.rows}
                        />
                      ))}
                  </div>
                </div>
              </div>
            </motion.div>

            <DragOverlay>
              {draggedPiece ? (
                <DraggablePiece
                  piece={draggedPiece}
                  className="w-20 h-20 rotate-12 opacity-90"
                  gridCols={currentLevel.gridSize.cols}
                  gridRows={currentLevel.gridSize.rows}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}

        {/* Level Completed */}
        {gameState === 'completed' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-emerald-400 max-w-2xl mx-auto">
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Level Complete!</h2>
              <p className="text-xl text-gray-600 mb-6">
                Great job completing "{currentLevel.name}" in {moves} moves!
              </p>
              <div className="text-emerald-600 text-lg font-semibold">
                +{currentLevel.difficulty * 100} Points
              </div>
            </div>
          </motion.div>
        )}

        {/* All Levels Finished */}
        {gameState === 'finished' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-gold-400 max-w-2xl mx-auto">
              <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Congratulations!</h2>
              <p className="text-xl text-gray-600 mb-6">
                You've completed all {puzzleLevels.length} puzzle challenges!
              </p>
              <p className="text-2xl font-bold text-emerald-600 mb-8">
                Final Score: {score} points
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    setCurrentLevelIndex(0);
                    setScore(0);
                    setGameState('menu');
                    setCompletedLevels([]);
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-bold hover:shadow-lg transition-all duration-300"
                >
                  Play Again
                </button>
                <button
                  onClick={() => navigate('/categories/mind')}
                  className="px-8 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-full font-bold hover:shadow-lg transition-all duration-300"
                >
                  Back to Mind
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PerceptionQuiz;
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Star, Check, X, Brain, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Game data interfaces
interface GameItem {
  id: string;
  name: string;
  icon: string;
  category: string;
  isOddOneOut: boolean;
}

interface GameLevel {
  id: number;
  items: GameItem[];
  instruction: string;
  explanation: string;
}

const OddOneOutGame: React.FC = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<'selection' | 'playing' | 'result' | 'complete'>('selection');
  const [selectedGrade, setSelectedGrade] = useState<'1-2' | '3-4' | null>(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [wrongSelections, setWrongSelections] = useState<string[]>([]);

  const maxLevels = 10;

  // Game data for different grade levels
  const gameLevels: Record<'1-2' | '3-4', GameLevel[]> = {
    '1-2': [
      {
        id: 1,
        items: [
          { id: '1', name: 'Apple', icon: '🍎', category: 'fruit', isOddOneOut: false },
          { id: '2', name: 'Banana', icon: '🍌', category: 'fruit', isOddOneOut: false },
          { id: '3', name: 'Ball', icon: '⚽', category: 'toy', isOddOneOut: true },
          { id: '4', name: 'Orange', icon: '🍊', category: 'fruit', isOddOneOut: false }
        ],
        instruction: "Tap the one that doesn't belong with the fruits!",
        explanation: "The ball is a toy, while the others are fruits!"
      },
      {
        id: 2,
        items: [
          { id: '1', name: 'Cat', icon: '🐱', category: 'animal', isOddOneOut: false },
          { id: '2', name: 'Dog', icon: '🐶', category: 'animal', isOddOneOut: false },
          { id: '3', name: 'Car', icon: '🚗', category: 'vehicle', isOddOneOut: true },
          { id: '4', name: 'Bird', icon: '🐦', category: 'animal', isOddOneOut: false }
        ],
        instruction: "Which one is not an animal?",
        explanation: "The car is a vehicle, while the others are animals!"
      },
      {
        id: 3,
        items: [
          { id: '1', name: 'Circle', icon: '⭕', category: 'shape', isOddOneOut: false },
          { id: '2', name: 'Square', icon: '⬜', category: 'shape', isOddOneOut: false },
          { id: '3', name: 'Triangle', icon: '🔺', category: 'shape', isOddOneOut: false },
          { id: '4', name: 'House', icon: '🏠', category: 'building', isOddOneOut: true }
        ],
        instruction: "Find the one that's not a shape!",
        explanation: "The house is a building, while the others are shapes!"
      },
      {
        id: 4,
        items: [
          { id: '1', name: 'Red', icon: '🔴', category: 'color', isOddOneOut: false },
          { id: '2', name: 'Blue', icon: '🔵', category: 'color', isOddOneOut: false },
          { id: '3', name: 'Yellow', icon: '🟡', category: 'color', isOddOneOut: false },
          { id: '4', name: 'Book', icon: '📚', category: 'object', isOddOneOut: true }
        ],
        instruction: "Which one is not a color?",
        explanation: "The book is an object, while the others are colors!"
      },
      {
        id: 5,
        items: [
          { id: '1', name: 'Fish', icon: '🐟', category: 'water animal', isOddOneOut: false },
          { id: '2', name: 'Shark', icon: '🦈', category: 'water animal', isOddOneOut: false },
          { id: '3', name: 'Whale', icon: '🐋', category: 'water animal', isOddOneOut: false },
          { id: '4', name: 'Lion', icon: '🦁', category: 'land animal', isOddOneOut: true }
        ],
        instruction: "Find the animal that doesn't live in water!",
        explanation: "The lion lives on land, while the others live in water!"
      },
      {
        id: 6,
        items: [
          { id: '1', name: 'Spoon', icon: '🥄', category: 'utensil', isOddOneOut: false },
          { id: '2', name: 'Fork', icon: '🍴', category: 'utensil', isOddOneOut: false },
          { id: '3', name: 'Knife', icon: '🔪', category: 'utensil', isOddOneOut: false },
          { id: '4', name: 'Flower', icon: '🌸', category: 'plant', isOddOneOut: true }
        ],
        instruction: "Which one is not used for eating?",
        explanation: "The flower is a plant, while the others are eating utensils!"
      },
      {
        id: 7,
        items: [
          { id: '1', name: 'Sun', icon: '☀️', category: 'weather', isOddOneOut: false },
          { id: '2', name: 'Cloud', icon: '☁️', category: 'weather', isOddOneOut: false },
          { id: '3', name: 'Rain', icon: '🌧️', category: 'weather', isOddOneOut: false },
          { id: '4', name: 'Pizza', icon: '🍕', category: 'food', isOddOneOut: true }
        ],
        instruction: "Find the one that's not weather!",
        explanation: "Pizza is food, while the others are weather!"
      },
      {
        id: 8,
        items: [
          { id: '1', name: 'Shirt', icon: '👕', category: 'clothing', isOddOneOut: false },
          { id: '2', name: 'Pants', icon: '👖', category: 'clothing', isOddOneOut: false },
          { id: '3', name: 'Hat', icon: '👒', category: 'clothing', isOddOneOut: false },
          { id: '4', name: 'Tree', icon: '🌳', category: 'plant', isOddOneOut: true }
        ],
        instruction: "Which one is not clothing?",
        explanation: "The tree is a plant, while the others are clothing!"
      },
      {
        id: 9,
        items: [
          { id: '1', name: 'Milk', icon: '🥛', category: 'drink', isOddOneOut: false },
          { id: '2', name: 'Juice', icon: '🧃', category: 'drink', isOddOneOut: false },
          { id: '3', name: 'Water', icon: '💧', category: 'drink', isOddOneOut: false },
          { id: '4', name: 'Cake', icon: '🎂', category: 'food', isOddOneOut: true }
        ],
        instruction: "Find the one that's not a drink!",
        explanation: "Cake is food you eat, while the others are drinks!"
      },
      {
        id: 10,
        items: [
          { id: '1', name: 'Butterfly', icon: '🦋', category: 'insect', isOddOneOut: false },
          { id: '2', name: 'Bee', icon: '🐝', category: 'insect', isOddOneOut: false },
          { id: '3', name: 'Ant', icon: '🐜', category: 'insect', isOddOneOut: false },
          { id: '4', name: 'Elephant', icon: '🐘', category: 'mammal', isOddOneOut: true }
        ],
        instruction: "Which one is not a small insect?",
        explanation: "The elephant is a big mammal, while the others are small insects!"
      }
    ],
    '3-4': [
      {
        id: 1,
        items: [
          { id: '1', name: 'Car', icon: '🚗', category: 'land vehicle', isOddOneOut: false },
          { id: '2', name: 'Bus', icon: '🚌', category: 'land vehicle', isOddOneOut: false },
          { id: '3', name: 'Airplane', icon: '✈️', category: 'air vehicle', isOddOneOut: true },
          { id: '4', name: 'Truck', icon: '🚚', category: 'land vehicle', isOddOneOut: false }
        ],
        instruction: "Find the vehicle that doesn't travel on roads!",
        explanation: "The airplane flies in the sky, while the others drive on roads!"
      },
      {
        id: 2,
        items: [
          { id: '1', name: 'Hammer', icon: '🔨', category: 'tool', isOddOneOut: false },
          { id: '2', name: 'Screwdriver', icon: '🔧', category: 'tool', isOddOneOut: false },
          { id: '3', name: 'Saw', icon: '🪚', category: 'tool', isOddOneOut: false },
          { id: '4', name: 'Cookie', icon: '🍪', category: 'food', isOddOneOut: true }
        ],
        instruction: "Which one is not a construction tool?",
        explanation: "The cookie is food, while the others are tools for building!"
      },
      {
        id: 3,
        items: [
          { id: '1', name: 'Tree', icon: '🌳', category: 'living', isOddOneOut: false },
          { id: '2', name: 'Flower', icon: '🌺', category: 'living', isOddOneOut: false },
          { id: '3', name: 'Cat', icon: '🐱', category: 'living', isOddOneOut: false },
          { id: '4', name: 'Rock', icon: '🪨', category: 'nonliving', isOddOneOut: true }
        ],
        instruction: "Find the one that is not alive!",
        explanation: "The rock is not living, while the others are alive and can grow!"
      },
      {
        id: 4,
        items: [
          { id: '1', name: 'Piano', icon: '🎹', category: 'instrument', isOddOneOut: false },
          { id: '2', name: 'Guitar', icon: '🎸', category: 'instrument', isOddOneOut: false },
          { id: '3', name: 'Drums', icon: '🥁', category: 'instrument', isOddOneOut: false },
          { id: '4', name: 'Telescope', icon: '🔭', category: 'tool', isOddOneOut: true }
        ],
        instruction: "Which one doesn't make music?",
        explanation: "The telescope is for looking at stars, while the others make music!"
      },
      {
        id: 5,
        items: [
          { id: '1', name: 'Ice', icon: '🧊', category: 'cold', isOddOneOut: false },
          { id: '2', name: 'Snow', icon: '❄️', category: 'cold', isOddOneOut: false },
          { id: '3', name: 'Freezer', icon: '🧊', category: 'cold', isOddOneOut: false },
          { id: '4', name: 'Fire', icon: '🔥', category: 'hot', isOddOneOut: true }
        ],
        instruction: "Find the one that is not cold!",
        explanation: "Fire is hot, while the others are cold!"
      },
      {
        id: 6,
        items: [
          { id: '1', name: 'Doctor', icon: '👨‍⚕️', category: 'helper', isOddOneOut: false },
          { id: '2', name: 'Teacher', icon: '👨‍🏫', category: 'helper', isOddOneOut: false },
          { id: '3', name: 'Firefighter', icon: '👨‍🚒', category: 'helper', isOddOneOut: false },
          { id: '4', name: 'Robot', icon: '🤖', category: 'machine', isOddOneOut: true }
        ],
        instruction: "Which one is not a person who helps others?",
        explanation: "The robot is a machine, while the others are people with helping jobs!"
      },
      {
        id: 7,
        items: [
          { id: '1', name: 'Addition', icon: '➕', category: 'math', isOddOneOut: false },
          { id: '2', name: 'Subtraction', icon: '➖', category: 'math', isOddOneOut: false },
          { id: '3', name: 'Multiplication', icon: '✖️', category: 'math', isOddOneOut: false },
          { id: '4', name: 'Rainbow', icon: '🌈', category: 'nature', isOddOneOut: true }
        ],
        instruction: "Find the one that's not a math operation!",
        explanation: "The rainbow is found in nature, while the others are math symbols!"
      },
      {
        id: 8,
        items: [
          { id: '1', name: 'Solid', icon: '🧊', category: 'state', isOddOneOut: false },
          { id: '2', name: 'Liquid', icon: '💧', category: 'state', isOddOneOut: false },
          { id: '3', name: 'Gas', icon: '💨', category: 'state', isOddOneOut: false },
          { id: '4', name: 'Happy', icon: '😊', category: 'emotion', isOddOneOut: true }
        ],
        instruction: "Which one is not a state of matter?",
        explanation: "Happy is a feeling, while the others are states that matter can be in!"
      },
      {
        id: 9,
        items: [
          { id: '1', name: 'North', icon: '⬆️', category: 'direction', isOddOneOut: false },
          { id: '2', name: 'South', icon: '⬇️', category: 'direction', isOddOneOut: false },
          { id: '3', name: 'East', icon: '➡️', category: 'direction', isOddOneOut: false },
          { id: '4', name: 'Yesterday', icon: '📅', category: 'time', isOddOneOut: true }
        ],
        instruction: "Find the one that's not a direction!",
        explanation: "Yesterday is a time word, while the others show directions!"
      },
      {
        id: 10,
        items: [
          { id: '1', name: 'Mercury', icon: '☿️', category: 'planet', isOddOneOut: false },
          { id: '2', name: 'Venus', icon: '♀️', category: 'planet', isOddOneOut: false },
          { id: '3', name: 'Mars', icon: '♂️', category: 'planet', isOddOneOut: false },
          { id: '4', name: 'Comet', icon: '☄️', category: 'space object', isOddOneOut: true }
        ],
        instruction: "Which one is not a planet?",
        explanation: "A comet moves through space, while the others are planets that orbit the sun!"
      }
    ]
  };

  const currentGameLevel = selectedGrade ? gameLevels[selectedGrade][currentLevel - 1] : null;

  const handleItemClick = useCallback((itemId: string) => {
    if (selectedItemId || !currentGameLevel) return;

    setSelectedItemId(itemId);
    const selectedItem = currentGameLevel.items.find(item => item.id === itemId);
    
    if (selectedItem?.isOddOneOut) {
      // Correct answer
      setIsCorrect(true);
      setScore(prev => prev + 10);
      
      setTimeout(() => {
        setShowExplanation(true);
        setTimeout(() => {
          if (currentLevel < maxLevels) {
            setCurrentLevel(prev => prev + 1);
            resetLevel();
          } else {
            setGameState('complete');
          }
        }, 3000);
      }, 1000);
    } else {
      // Wrong answer
      setIsCorrect(false);
      setWrongSelections(prev => [...prev, itemId]);
      
      setTimeout(() => {
        setSelectedItemId(null);
      }, 1000);
    }
  }, [selectedItemId, currentGameLevel, currentLevel, maxLevels]);

  const resetLevel = () => {
    setSelectedItemId(null);
    setIsCorrect(false);
    setShowExplanation(false);
    setWrongSelections([]);
  };

  const resetGame = () => {
    setCurrentLevel(1);
    setScore(0);
    setGameState('selection');
    setSelectedGrade(null);
    resetLevel();
  };

  const startGame = (grade: '1-2' | '3-4') => {
    setSelectedGrade(grade);
    setCurrentLevel(1);
    setScore(0);
    setGameState('playing');
    resetLevel();
  };

  // Grade Selection Screen
  if (gameState === 'selection') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-300 via-indigo-400 to-purple-500 py-8">
        <div className="container mx-auto px-4 relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate('/categories')}
              className="group flex items-center space-x-2 px-4 py-2 text-stone-600 rounded-lg transition-all duration-300 ease-out hover:text-indigo-700 hover:bg-white/50 hover:shadow-md transform hover:scale-105 hover:-translate-y-0.5"
            >
              <ArrowLeft size={20} className="transform group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="font-medium">Back to Categories</span>
            </button>
          </div>

          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text text-transparent mb-4">
              Odd One Out Game
            </h1>
            <p className="text-stone-700 text-lg max-w-2xl mx-auto">
              Choose your grade level to start finding what doesn't belong!
            </p>
          </div>

          {/* Grade Selection Cards */}
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Grades 1-2 Card */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="group bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl p-8 shadow-xl border border-green-300 cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-2xl"
              onClick={() => startGame('1-2')}
            >
              <div className="text-center text-white">
                <div className="mb-6">
                  <Target className="w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h2 className="text-2xl font-bold mb-2">Grades 1-2</h2>
                  <p className="text-green-100 text-sm">
                    Basic categories and simple differences
                  </p>
                </div>
                
                <div className="bg-white/20 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold mb-2">You'll identify:</h3>
                  <ul className="text-sm space-y-1 text-green-100">
                    <li>• Animals vs. objects</li>
                    <li>• Fruits vs. toys</li>
                    <li>• Shapes vs. buildings</li>
                    <li>• Colors vs. objects</li>
                  </ul>
                </div>

                <div className="bg-green-600 text-white px-6 py-3 rounded-full font-bold group-hover:bg-green-700 transition-colors duration-300">
                  Start Easy Level
                </div>
              </div>
            </motion.div>

            {/* Grades 3-4 Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="group bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl p-8 shadow-xl border border-purple-300 cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-2xl"
              onClick={() => startGame('3-4')}
            >
              <div className="text-center text-white">
                <div className="mb-6">
                  <Brain className="w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h2 className="text-2xl font-bold mb-2">Grades 3-4</h2>
                  <p className="text-purple-100 text-sm">
                    Advanced logic and semantic categories
                  </p>
                </div>
                
                <div className="bg-white/20 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold mb-2">You'll identify:</h3>
                  <ul className="text-sm space-y-1 text-purple-100">
                    <li>• Living vs. non-living</li>
                    <li>• Hot vs. cold items</li>
                    <li>• Job categories</li>
                    <li>• States of matter</li>
                  </ul>
                </div>

                <div className="bg-purple-600 text-white px-6 py-3 rounded-full font-bold group-hover:bg-purple-700 transition-colors duration-300">
                  Start Challenge Level
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Game Complete Screen
  if (gameState === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-300 via-indigo-400 to-purple-500 py-8">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-2xl mx-auto"
          >
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-stone-200">
              <Star className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-stone-800 mb-4">Amazing Work!</h2>
              <p className="text-xl text-stone-600 mb-6">
                You've completed all {maxLevels} levels of the Odd One Out game!
              </p>
              <p className="text-2xl font-bold text-indigo-600 mb-8">Final Score: {score}</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={resetGame}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-bold hover:shadow-lg transition-all duration-300"
                >
                  Play Again
                </button>
                <button
                  onClick={() => navigate('/categories')}
                  className="px-8 py-3 bg-gradient-to-r from-stone-500 to-stone-600 text-white rounded-full font-bold hover:shadow-lg transition-all duration-300"
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

  // Main Game Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300 via-indigo-400 to-purple-500 py-8">
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/categories')}
            className="group flex items-center space-x-2 px-4 py-2 text-stone-600 rounded-lg transition-all duration-300 ease-out hover:text-indigo-700 hover:bg-white/50 hover:shadow-md transform hover:scale-105 hover:-translate-y-0.5"
          >
            <ArrowLeft size={20} className="transform group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-medium">Back to Categories</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text text-transparent mb-2">
              Odd One Out - Grades {selectedGrade}
            </h1>
            <div className="flex items-center justify-center gap-4 text-stone-700">
              <div className="flex items-center gap-2">
                <Target size={20} />
                <span>Level {currentLevel}/{maxLevels}</span>
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

        {/* Game Instructions */}
        {currentGameLevel && (
          <div className="text-center mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-stone-200 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-stone-800 mb-2">Tap the one that doesn't belong!</h2>
              <p className="text-lg text-stone-600">{currentGameLevel.instruction}</p>
            </div>
          </div>
        )}

        {/* Game Grid */}
        {currentGameLevel && (
          <div className="max-w-lg mx-auto mb-8">
            <div className="grid grid-cols-2 gap-6 p-6 bg-white rounded-2xl shadow-xl border border-stone-200">
              {currentGameLevel.items.map((item) => (
                <motion.div
                  key={item.id}
                  className={`
                    relative w-full h-32 rounded-xl shadow-lg cursor-pointer
                    flex flex-col items-center justify-center text-4xl font-bold
                    transition-all duration-300 transform hover:scale-105
                    ${selectedItemId === item.id
                      ? isCorrect
                        ? 'bg-green-400 border-4 border-green-600 text-white'
                        : 'bg-red-400 border-4 border-red-600 text-white'
                      : wrongSelections.includes(item.id)
                        ? 'bg-red-200 border-2 border-red-400'
                        : 'bg-gradient-to-br from-indigo-200 to-purple-200 hover:from-indigo-300 hover:to-purple-300 border-2 border-indigo-300'
                    }
                  `}
                  onClick={() => handleItemClick(item.id)}
                  whileHover={!selectedItemId ? { scale: 1.05 } : {}}
                  whileTap={!selectedItemId ? { scale: 0.95 } : {}}
                  animate={
                    wrongSelections.includes(item.id) && selectedItemId !== item.id
                      ? {
                          x: [-5, 5, -5, 5, 0],
                          transition: { duration: 0.5 }
                        }
                      : {}
                  }
                >
                  <div className="text-5xl mb-2">{item.icon}</div>
                  <div className="text-sm font-medium text-stone-700">{item.name}</div>
                  
                  {/* Success/Error Icons */}
                  {selectedItemId === item.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2"
                    >
                      {isCorrect ? (
                        <Check className="w-6 h-6 text-white" />
                      ) : (
                        <X className="w-6 h-6 text-white" />
                      )}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Feedback Messages */}
        <AnimatePresence>
          {selectedItemId && !showExplanation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center mb-8"
            >
              <div className={`bg-white rounded-2xl p-6 shadow-xl border-2 ${
                isCorrect ? 'border-green-300' : 'border-red-300'
              } max-w-2xl mx-auto`}>
                {isCorrect ? (
                  <div className="text-green-600">
                    <Check className="w-12 h-12 mx-auto mb-3" />
                    <h3 className="text-2xl font-bold mb-2">Correct!</h3>
                    <p className="text-lg">Great job finding the odd one out! +10 points</p>
                  </div>
                ) : (
                  <div className="text-red-500">
                    <X className="w-12 h-12 mx-auto mb-3" />
                    <h3 className="text-2xl font-bold mb-2">Try Again!</h3>
                    <p className="text-lg">That one belongs with the group. Look for the different one!</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {showExplanation && currentGameLevel && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-6 shadow-xl border border-blue-200 max-w-2xl mx-auto">
                <Brain className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-purple-800 mb-2">Why was that correct?</h3>
                <p className="text-lg text-purple-700">{currentGameLevel.explanation}</p>
                <div className="mt-4 text-sm text-purple-600">
                  {currentLevel < maxLevels ? 'Moving to next level...' : 'Game complete!'}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OddOneOutGame;
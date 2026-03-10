import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Volume2, VolumeX, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { GameLevelWithScene } from '../types/quiz';
import { supabase } from '../supabase-client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
import SimpleCartoonScene from '../components/SimpleCartoonScene';
import { ROUTES } from '../routes';

// Translations
const translations = {
  en: {
    title: "Spot The Difference",
    subtitle: "Find all the differences between the pictures",
    foundProgress: "Found",
    of: "of",
    differences: "differences",
    allFound: "🎉 All differences found!",
    nextLevel: "Next Level",
    gameComplete: "🎊 Congratulations! You've completed all levels!",
    playAgain: "Play Again",
    backToCategories: "Back to Categories",
    level: "Level",
    clickToFind: "Click on the pictures to find differences",
    soundOn: "Sound On",
    soundOff: "Sound Off"
  },
  ar: {
    title: "اكتشف الاختلاف",
    subtitle: "ابحث عن جميع الاختلافات بين الصور",
    foundProgress: "وُجد",
    of: "من",
    differences: "اختلافات",
    allFound: "🎉 تم العثور على جميع الاختلافات!",
    nextLevel: "المستوى التالي",
    gameComplete: "🎊 تهانينا! لقد أكملت جميع المستويات!",
    playAgain: "العب مرة أخرى",
    backToCategories: "العودة إلى الفئات",
    level: "المستوى",
    clickToFind: "انقر على الصور للعثور على الاختلافات",
    soundOn: "الصوت مفعل",
    soundOff: "الصوت مغلق"
  }
};

export default function SpotTheDifferenceGame() {
  const navigate = useNavigate();
  const [levels, setLevels] = useState<GameLevelWithScene[]>([]);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [foundDifferences, setFoundDifferences] = useState<Set<number>>(new Set());
  const [totalDifferences, setTotalDifferences] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isArabic, setIsArabic] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [allLevelsComplete, setAllLevelsComplete] = useState(false);
  const [showSparkle, setShowSparkle] = useState<{ x: number; y: number } | null>(null);
  const [wrongClick, setWrongClick] = useState<{ x: number; y: number } | null>(null);

  // Fetch levels from backend
  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/quiz-content/spot-the-difference/grade/1`);
        const data = await response.json();
        if (data.success && data.levels) {
          setLevels(data.levels);
          if (data.levels.length > 0 && data.levels[0].totalDifferences) {
            setTotalDifferences(data.levels[0].totalDifferences);
          }
        }
      } catch {
        // Levels will remain empty
      }
    };
    fetchLevels();
  }, []);

  const currentGameLevel: GameLevelWithScene | undefined = levels[currentLevel];
  const t = translations[isArabic ? 'ar' : 'en'];
  const isRTL = isArabic;

  useEffect(() => {
    if (foundDifferences.size === totalDifferences && foundDifferences.size > 0) {
      setShowCelebration(true);
      setGameComplete(true);
    }
  }, [foundDifferences, totalDifferences, soundEnabled]);

  useEffect(() => {
    if (currentLevel >= levels.length - 1 && gameComplete) {
      setAllLevelsComplete(true);
    }
  }, [currentLevel, gameComplete, levels.length]);

  const handleSceneClick = useCallback(async (x: number, y: number, sceneWidth: number, sceneHeight: number) => {
    if (!currentGameLevel) return;
    const relativeX = x / sceneWidth;
    const relativeY = y / sceneHeight;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      const response = await fetch(`${API_BASE_URL}/api/quiz-content/spot-the-difference/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ levelId: currentGameLevel.id, clickX: relativeX, clickY: relativeY }),
      });
      const result = await response.json();
      if (result.found && result.differenceIndex !== undefined) {
        setFoundDifferences(prev => new Set([...prev, result.differenceIndex]));
        setTotalDifferences(result.totalDifferences);
        setShowSparkle({ x, y });
        setTimeout(() => setShowSparkle(null), 1000);
      } else {
        setWrongClick({ x, y });
        setTimeout(() => setWrongClick(null), 500);
      }
      if (result.totalDifferences) {
        setTotalDifferences(result.totalDifferences);
      }
    } catch {
      setWrongClick({ x, y });
      setTimeout(() => setWrongClick(null), 500);
    }
  }, [currentGameLevel, supabase]);

  const handleNextLevel = () => {
    if (currentLevel < levels.length - 1) {
      setCurrentLevel(prev => prev + 1);
      setFoundDifferences(new Set());
      setShowCelebration(false);
      setGameComplete(false);
    }
  };

  const handleRestart = () => {
    setCurrentLevel(0);
    setFoundDifferences(new Set());
    setShowCelebration(false);
    setGameComplete(false);
    setAllLevelsComplete(false);
  };

  const toggleLanguage = () => {
    setIsArabic(prev => !prev);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="bg-white shadow-lg p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(ROUTES.CATEGORIES)}
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">{t.backToCategories}</span>
            </button>
            
            <div className="h-8 w-px bg-gray-300" />
            
            <h1 className="text-2xl font-bold text-gray-800">{t.title}</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              title={soundEnabled ? t.soundOn : t.soundOff}
            >
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-green-600" />
              ) : (
                <VolumeX className="w-5 h-5 text-gray-600" />
              )}
            </button>

            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors"
            >
              <Globe className="w-5 h-5 text-blue-600" />
              <span className="text-blue-600 font-medium">{isArabic ? 'AR' : 'EN'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Game Content */}
      <div className="max-w-6xl mx-auto p-6">
        {/* Level Info */}
        {currentGameLevel ? (
        <>
        <div className="text-center mb-6">
          <div className="bg-white rounded-lg p-4 shadow-md inline-block">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {t.level} {currentLevel + 1}
            </h2>
            <p className="text-gray-600 mb-4">{t.subtitle}</p>
            
            {/* Progress */}
            <div className="flex items-center justify-center gap-2 text-lg">
              <span className="text-green-600 font-bold">{foundDifferences.size}</span>
              <span className="text-gray-500">{t.of}</span>
              <span className="text-blue-600 font-bold">{totalDifferences}</span>
              <span className="text-gray-500">{t.differences}</span>
            </div>
          </div>
        </div>

        {/* Game Images */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Original Scene */}
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <h3 className="text-lg font-semibold text-center mb-4 text-gray-700">
              Original
            </h3>
            <div className="relative">
              <SimpleCartoonScene 
                sceneType={currentGameLevel.sceneConfig?.sceneType || 'toys'}
                differences={currentGameLevel.sceneConfig?.differencesA || []}
                width={500}
                height={400}
              />
            </div>
          </div>

          {/* Scene with Differences */}
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <h3 className="text-lg font-semibold text-center mb-4 text-gray-700">
              Find Differences
            </h3>
            <div 
              className="relative cursor-pointer inline-block"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                handleSceneClick(x, y, rect.width, rect.height);
              }}
            >
              <SimpleCartoonScene 
                sceneType={currentGameLevel.sceneConfig?.sceneType || 'toys'}
                differences={currentGameLevel.sceneConfig?.differencesB || []}
                width={500}
                height={400}
              />
              
              {/* Sparkle Effect */}
              <AnimatePresence>
                {showSparkle && (
                  <motion.div
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute pointer-events-none"
                    style={{
                      left: showSparkle.x - 15,
                      top: showSparkle.y - 15,
                    }}
                  >
                    <div className="w-8 h-8 text-2xl">✨</div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Wrong Click Effect */}
              <AnimatePresence>
                {wrongClick && (
                  <motion.div
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 1.2, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute pointer-events-none"
                    style={{
                      left: wrongClick.x - 10,
                      top: wrongClick.y - 10,
                    }}
                  >
                    <div className="w-6 h-6 text-xl text-red-500">❌</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Instruction */}
        <div className="text-center mb-6">
          <p className="text-gray-600 bg-blue-50 rounded-lg px-4 py-2 inline-block">
            {t.clickToFind}
          </p>
        </div>

        {/* Celebration Modal */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center"
              >
                {allLevelsComplete ? (
                  <>
                    <div className="text-6xl mb-4">🎊</div>
                    <h2 className="text-2xl font-bold text-green-600 mb-4">
                      {t.gameComplete}
                    </h2>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={handleRestart}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        {t.playAgain}
                      </button>
                      <button
                        onClick={() => navigate(ROUTES.CATEGORIES)}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        {t.backToCategories}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-2xl font-bold text-green-600 mb-4">
                      {t.allFound}
                    </h2>
                    <button
                      onClick={handleNextLevel}
                      className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                    >
                      {t.nextLevel}
                    </button>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reset Button */}
        <div className="text-center">
          <button
            onClick={handleRestart}
            className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg font-medium transition-colors mx-auto"
          >
            <RotateCcw className="w-4 h-4" />
            {t.playAgain}
          </button>
        </div>
        </>
        ) : (
          <div className="text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading levels...</p>
          </div>
        )}
      </div>
    </div>
  );
}
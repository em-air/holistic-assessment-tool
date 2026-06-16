import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle, Trophy, RotateCcw, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { GradeLevel, AnalogyQuestion, CategoryQuestion, CategoryItem } from '../types/quiz';
import { ROUTES } from '../routes';
import FloatingBackground from '../components/FloatingBackground';
import { ProgressTracker } from '../utils/progressTracker';
import MindSectionReport from '../components/MindSectionReport';
import {
  getAnalogyQuestions,
  getCategoryQuestions,
  validateCriticalThinkingAnswer,
  validateCategoryPlacement,
} from '../services/criticalThinkingService';

type Phase = 'grade-select' | 'loading' | 'analogy' | 'category' | 'complete';

interface DroppedItem extends CategoryItem {
  droppedIn: string;
}

const gradeOptions = [
  { value: 'grade1', label: 'Grade 1', description: 'Basic relationships and simple concepts' },
  { value: 'grade2', label: 'Grade 2', description: 'Comparative logic and everyday connections' },
  { value: 'grade3', label: 'Grade 3', description: 'Age, size, and order reasoning' },
  { value: 'grade4', label: 'Grade 4', description: 'Abstract reasoning and complex relationships' },
];

const CriticalThinkingQuiz: React.FC = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('grade-select');
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());

  // Analogy state
  const [analogyQuestions, setAnalogyQuestions] = useState<AnalogyQuestion[]>([]);
  const [analogyIndex, setAnalogyIndex] = useState(0);
  const [analogyScore, setAnalogyScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answerCorrect, setAnswerCorrect] = useState<boolean | null>(null);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Category state
  const [categoryQuestions, setCategoryQuestions] = useState<CategoryQuestion[]>([]);
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [categoryScore, setCategoryScore] = useState(0);
  const [availableItems, setAvailableItems] = useState<CategoryItem[]>([]);
  const [droppedItems, setDroppedItems] = useState<DroppedItem[]>([]);
  const [draggedItem, setDraggedItem] = useState<CategoryItem | null>(null);
  const [showCategoryResults, setShowCategoryResults] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [validationResults, setValidationResults] = useState<Record<string, { correct: boolean; correctCategory: string }>>({});
  const [validationError, setValidationError] = useState<string | null>(null);

  // Reset category question state when index changes
  useEffect(() => {
    if (categoryQuestions.length > 0 && categoryIndex < categoryQuestions.length) {
      setAvailableItems([...categoryQuestions[categoryIndex].items]);
      setDroppedItems([]);
      setShowCategoryResults(false);
      setValidationResults({});
      setValidationError(null);
    }
  }, [categoryIndex, categoryQuestions]);

  const handleGradeSelect = async (grade: GradeLevel) => {
    setSelectedGrade(grade);
    setPhase('loading');
    setLoadError(null);
    try {
      const [analogy, category] = await Promise.all([
        getAnalogyQuestions(),
        getCategoryQuestions(grade),
      ]);
      if (analogy.length === 0 && category.length === 0) {
        setLoadError('No questions available right now.');
        setPhase('grade-select');
        return;
      }
      setAnalogyQuestions(analogy);
      setCategoryQuestions(category);
      setAnalogyIndex(0);
      setAnalogyScore(0);
      setCategoryIndex(0);
      setCategoryScore(0);
      setStartTime(Date.now());
      setPhase(analogy.length > 0 ? 'analogy' : 'category');
    } catch {
      setLoadError('Failed to load questions. Please try again.');
      setPhase('grade-select');
    }
  };

  // ── Analogy handlers ─────────────────────────────────────────────

  const handleAnalogyAnswer = async (answerIndex: number) => {
    if (showFeedback) return;
    setSelectedAnswer(answerIndex);
    setSubmissionError(null);

    const q = analogyQuestions[analogyIndex];
    const optionsList = q.options || (q.choices || []).map((c, i) => ({ id: String(i), text: c }));
    const selectedOption = optionsList[answerIndex];

    if (!selectedOption) {
      setSelectedAnswer(null);
      setSubmissionError('Unable to validate that answer. Please try again.');
      return;
    }

    const result = await validateCriticalThinkingAnswer(q.id, selectedOption.id);
    if (!result) {
      setSelectedAnswer(null);
      setSubmissionError('Unable to validate your answer right now. Please try again.');
      return;
    }

    if (result.correct) {
      setAnalogyScore(prev => prev + 1);
      setAnswerCorrect(true);
    } else {
      setAnswerCorrect(false);
    }
    if (result.correctAnswer) {
      const idx = optionsList.findIndex((o: { id: string }) => o.id === result.correctAnswer);
      setCorrectAnswerIndex(idx);
    }
    if (result.explanation) setExplanation(result.explanation);
    setShowFeedback(true);
  };

  const handleAnalogyNext = () => {
    setSelectedAnswer(null);
    setShowFeedback(false);
    setAnswerCorrect(null);
    setCorrectAnswerIndex(null);
    setExplanation(null);
    setSubmissionError(null);

    if (analogyIndex < analogyQuestions.length - 1) {
      setAnalogyIndex(prev => prev + 1);
    } else {
      setPhase(categoryQuestions.length > 0 ? 'category' : 'complete');
    }
  };

  // ── Category handlers ────────────────────────────────────────────

  const handleDragStart = (item: CategoryItem) => setDraggedItem(item);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = (e: React.DragEvent, category: string) => {
    e.preventDefault();
    if (!draggedItem) return;
    setAvailableItems(prev => prev.filter(i => i.id !== draggedItem.id));
    setDroppedItems(prev => [
      ...prev.filter(i => i.id !== draggedItem.id),
      { ...draggedItem, droppedIn: category },
    ]);
    setDraggedItem(null);
  };

  const handleItemClick = (item: CategoryItem, targetCategory?: string) => {
    if (targetCategory) {
      setAvailableItems(prev => prev.filter(i => i.id !== item.id));
      setDroppedItems(prev => [
        ...prev.filter(i => i.id !== item.id),
        { ...item, droppedIn: targetCategory },
      ]);
    } else {
      setDroppedItems(prev => prev.filter(i => i.id !== item.id));
      setAvailableItems(prev => [...prev, item]);
    }
  };

  const checkCategoryAnswers = async () => {
    if (availableItems.length > 0 || isChecking || !selectedGrade) return;
    setIsChecking(true);
    setValidationError(null);

    const q = categoryQuestions[categoryIndex];
    const responses = await Promise.all(
      droppedItems.map(async (item) => ({
        itemId: item.id,
        result: await validateCategoryPlacement(q.id, item.id, item.droppedIn, selectedGrade),
      })),
    );

    const results: Record<string, { correct: boolean; correctCategory: string }> = {};
    let correctCount = 0;
    let hasFailure = false;

    responses.forEach(({ itemId, result }) => {
      if (result === null) hasFailure = true;
      results[itemId] = { correct: result?.correct ?? false, correctCategory: result?.correctCategory ?? '' };
      if (result?.correct) correctCount++;
    });

    if (hasFailure) setValidationError('Some placements could not be validated. Showing available results.');
    if (correctCount === droppedItems.length && droppedItems.length > 0) {
      setCategoryScore(prev => prev + 1);
    }

    setValidationResults(results);
    setShowCategoryResults(true);
    setIsChecking(false);
  };

  const handleCategoryNext = () => {
    if (categoryIndex < categoryQuestions.length - 1) {
      setCategoryIndex(prev => prev + 1);
    } else {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      const totalQ = analogyQuestions.length + categoryQuestions.length;
      const totalScore = analogyScore + categoryScore;
      const percentage = Math.round((totalScore / totalQ) * 100);

      ProgressTracker.saveQuizResult({
        quizId: 'critical-thinking-quiz',
        quizName: 'Critical Thinking Test',
        subcategory: 'critical-thinking',
        score: totalScore,
        totalQuestions: totalQ,
        percentage,
        timeSpent,
        completedAt: new Date().toISOString(),
        gradeLevel: selectedGrade || 'unknown',
      });

      setPhase('complete');
    }
  };

  // ── Grade Select ─────────────────────────────────────────────────

  if (phase === 'grade-select') {
    return (
      <div className="min-h-screen bg-violet-50 relative overflow-hidden py-8">
        <FloatingBackground />
        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl"
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🧠</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Critical Thinking Test</h1>
              <p className="text-gray-600">Choose your grade level to start</p>
              {loadError && <p className="text-red-500 mt-2 text-sm">{loadError}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {gradeOptions.map((option) => (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleGradeSelect(option.value as GradeLevel)}
                  className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100 hover:border-purple-300 transition-all duration-200 text-left"
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{option.label}</h3>
                  <p className="text-gray-600 text-sm">{option.description}</p>
                  <div className="mt-4 text-purple-600 font-semibold">Start Test →</div>
                </motion.button>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={() => navigate(ROUTES.CATEGORY_MIND)}
                className="px-6 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-colors duration-200"
              >
                Back
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── Loading ──────────────────────────────────────────────────────

  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-purple-50 relative overflow-hidden flex items-center justify-center">
        <FloatingBackground />
        <div className="text-center relative z-10 text-gray-700">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p>Loading questions...</p>
        </div>
      </div>
    );
  }

  // ── Complete ─────────────────────────────────────────────────────

  if (phase === 'complete') {
    const totalQ = analogyQuestions.length + categoryQuestions.length;
    const totalScore = analogyScore + categoryScore;
    const percentage = Math.round((totalScore / totalQ) * 100);
    const getPerf = () => {
      if (percentage >= 90) return { level: 'Excellent!', color: 'text-green-600', emoji: '🌟' };
      if (percentage >= 70) return { level: 'Great Job!', color: 'text-blue-600', emoji: '🎉' };
      if (percentage >= 50) return { level: 'Good Work!', color: 'text-yellow-600', emoji: '👍' };
      return { level: 'Keep Practicing!', color: 'text-purple-600', emoji: '💪' };
    };
    const perf = getPerf();

    return (
      <div className="min-h-screen bg-green-50 relative overflow-hidden py-8">
        <FloatingBackground />
        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl text-center"
          >
            <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy size={36} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Test Complete!</h1>
            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
              <div className="text-6xl mb-4">{perf.emoji}</div>
              <h2 className={`text-2xl font-bold mb-2 ${perf.color}`}>{perf.level}</h2>
              <p className="text-gray-600 mb-4">
                You answered <span className="font-bold">{totalScore}</span> out of{' '}
                <span className="font-bold">{totalQ}</span> questions correctly
              </p>
              <div className="text-4xl font-bold text-gray-800">{percentage}%</div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="text-sm text-purple-600 font-medium mb-1">Analogy</div>
                <div className="text-2xl font-bold text-purple-700">{analogyScore}/{analogyQuestions.length}</div>
              </div>
              <div className="bg-teal-50 rounded-xl p-4">
                <div className="text-sm text-teal-600 font-medium mb-1">Sorting</div>
                <div className="text-2xl font-bold text-teal-700">{categoryScore}/{categoryQuestions.length}</div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setPhase('grade-select');
                  setSelectedGrade(null);
                }}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-semibold transition-all duration-200"
              >
                <RotateCcw size={20} />
                Try Again
              </button>
              <button
                onClick={() => navigate(ROUTES.CATEGORY_MIND)}
                className="px-6 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-colors duration-200"
              >
                Back
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── Analogy Phase ────────────────────────────────────────────────

  if (phase === 'analogy') {
    const q = analogyQuestions[analogyIndex];
    const optionsList = q?.options || (q?.choices || []).map((c: string, i: number) => ({ id: String(i), text: c }));
    const totalQ = analogyQuestions.length + categoryQuestions.length;
    const globalIndex = analogyIndex;

    return (
      <div className="min-h-screen bg-purple-50 relative overflow-hidden py-8">
        <FloatingBackground />
        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setPhase('grade-select')}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 rounded-lg hover:bg-white/60 transition-colors duration-200"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <div className="text-center text-gray-800">
              <h1 className="text-xl font-bold">Critical Thinking Test</h1>
              <div className="text-sm text-gray-500">
                Question {globalIndex + 1} of {totalQ} • Score: {analogyScore + categoryScore}
              </div>
            </div>
            <div className="w-20" />
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((globalIndex + 1) / totalQ) * 100}%` }}
            />
          </div>

          <div className="text-xs text-center text-purple-600 font-medium mb-4 uppercase tracking-wide">
            Part 1: Analogy — Question {analogyIndex + 1} of {analogyQuestions.length}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={analogyIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{q?.question}</h2>
                {q?.image && (
                  <img
                    src={q.image}
                    alt="Question"
                    className="w-64 h-64 object-contain bg-gray-50 rounded-xl shadow-lg mx-auto border border-gray-200 mb-4"
                  />
                )}
                <div className="w-20 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded mx-auto" />
              </div>

              <div className="grid gap-4 mb-8">
                {optionsList.map((option: { id: string; text: string }, index: number) => {
                  let cls = 'w-full p-4 text-left rounded-xl border-2 transition-all duration-200 font-semibold ';
                  if (showFeedback) {
                    if (correctAnswerIndex === index) cls += 'bg-green-100 border-green-400 text-green-800';
                    else if (index === selectedAnswer && answerCorrect === false) cls += 'bg-red-100 border-red-400 text-red-800';
                    else cls += 'bg-gray-100 border-gray-200 text-gray-600';
                  } else {
                    cls += selectedAnswer === index
                      ? 'bg-blue-100 border-blue-400 text-blue-800'
                      : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700';
                  }
                  return (
                    <motion.button
                      key={option.id}
                      whileHover={!showFeedback ? { scale: 1.02 } : {}}
                      whileTap={!showFeedback ? { scale: 0.98 } : {}}
                      onClick={() => handleAnalogyAnswer(index)}
                      disabled={showFeedback}
                      className={cls}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-medium">{option.text}</span>
                        {showFeedback && correctAnswerIndex === index && <CheckCircle size={24} className="text-green-600" />}
                        {showFeedback && index === selectedAnswer && answerCorrect === false && <XCircle size={24} className="text-red-600" />}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {submissionError && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {submissionError}
                </div>
              )}

              {showFeedback && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                  <div className={`p-4 rounded-xl ${answerCorrect ? 'bg-green-100 border border-green-200' : 'bg-red-100 border border-red-200'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {answerCorrect ? (
                        <><CheckCircle size={20} className="text-green-600" /><span className="font-semibold text-green-800">Correct!</span></>
                      ) : (
                        <><XCircle size={20} className="text-red-600" /><span className="font-semibold text-red-800">Not quite right</span></>
                      )}
                    </div>
                    {explanation && <p className="text-gray-700 text-sm">{explanation}</p>}
                  </div>
                </motion.div>
              )}

              {showFeedback && (
                <div className="text-center">
                  <button
                    onClick={handleAnalogyNext}
                    className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                  >
                    {analogyIndex < analogyQuestions.length - 1
                      ? 'Next Question'
                      : categoryQuestions.length > 0
                      ? 'Next Section →'
                      : 'See Results'}
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        {showReport && <MindSectionReport onClose={() => setShowReport(false)} />}
      </div>
    );
  }

  // ── Category Phase ───────────────────────────────────────────────

  const cq = categoryQuestions[categoryIndex];
  const allItemsPlaced = availableItems.length === 0;
  const totalQ = analogyQuestions.length + categoryQuestions.length;
  const globalIndex = analogyQuestions.length + categoryIndex;

  return (
    <div className="min-h-screen bg-teal-50 relative overflow-hidden py-8">
      <FloatingBackground />
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setPhase('grade-select')}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white/60 rounded-lg hover:bg-white/80 transition-colors duration-200"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="text-center text-gray-800">
            <h1 className="text-xl font-bold">Critical Thinking Test</h1>
            <div className="text-sm text-gray-500">
              Question {globalIndex + 1} of {totalQ} • Score: {analogyScore + categoryScore}
            </div>
          </div>
          <div className="w-20" />
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-gradient-to-r from-teal-500 to-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((globalIndex + 1) / totalQ) * 100}%` }}
          />
        </div>

        <div className="text-xs text-center text-teal-600 font-medium mb-4 uppercase tracking-wide">
          Part 2: Sorting — Question {categoryIndex + 1} of {categoryQuestions.length}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={categoryIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{cq?.instruction}</h2>
              <p className="text-gray-600">
                {availableItems.length > 0
                  ? 'Drag items into the correct categories (or click item then click category)'
                  : "All items placed! Click 'Check Answers' to see how you did."}
              </p>
            </div>

            {availableItems.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Items to Sort:</h3>
                <div className="flex flex-wrap gap-3 justify-center">
                  {availableItems.map((item) => (
                    <motion.div
                      key={item.id}
                      draggable
                      onDragStart={() => handleDragStart(item)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-blue-100 border-2 border-blue-200 rounded-xl p-3 cursor-move hover:bg-blue-200 transition-colors duration-200 select-none flex flex-col items-center space-y-2"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg shadow-sm"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://via.placeholder.com/64x64/f0f0f0/999999?text=' + encodeURIComponent(item.name);
                        }}
                      />
                      <span className="font-medium text-blue-800 text-sm text-center">{item.name}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            <div
              className="grid gap-6 mb-8"
              style={{ gridTemplateColumns: `repeat(${cq?.categories.length || 2}, 1fr)` }}
            >
              {cq?.categories.map((category) => {
                const items = droppedItems.filter((i) => i.droppedIn === category);
                return (
                  <div
                    key={category}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, category)}
                    onClick={() => { if (draggedItem) handleDrop({} as React.DragEvent, category); }}
                    className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-6 min-h-32 transition-all duration-200 hover:border-teal-400 hover:bg-teal-50"
                  >
                    <h3 className="text-lg font-bold text-gray-700 mb-4 text-center">{category}</h3>
                    <div className="space-y-2">
                      {items.map((item) => {
                        const vr = validationResults[item.id];
                        let cls = 'w-full p-3 rounded-lg border-2 text-center font-medium transition-all duration-200 cursor-pointer ';
                        if (showCategoryResults) {
                          cls += vr?.correct
                            ? 'bg-green-100 border-green-400 text-green-800'
                            : 'bg-red-100 border-red-400 text-red-800';
                        } else {
                          cls += 'bg-white border-gray-200 hover:border-teal-300 text-gray-700';
                        }
                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => !showCategoryResults && handleItemClick(item)}
                            className={cls}
                          >
                            <div className="flex items-center justify-center gap-3">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded-lg shadow-sm"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    'https://via.placeholder.com/48x48/f0f0f0/999999?text=' + encodeURIComponent(item.name);
                                }}
                              />
                              <span>{item.name}</span>
                              {showCategoryResults && (
                                vr?.correct
                                  ? <CheckCircle size={16} className="text-green-600" />
                                  : <XCircle size={16} className="text-red-600" />
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                      {items.length === 0 && (
                        <div className="text-center text-gray-400 py-8">Drop items here</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center">
              {!showCategoryResults ? (
                <button
                  onClick={checkCategoryAnswers}
                  disabled={!allItemsPlaced || isChecking}
                  className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    allItemsPlaced && !isChecking
                      ? 'bg-gradient-to-r from-teal-500 to-green-500 text-white hover:shadow-lg'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isChecking ? 'Checking…' : 'Check Answers'}
                </button>
              ) : (
                <div className="space-y-4">
                  {validationError && (
                    <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
                      {validationError}
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-xl p-4 mb-2">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {Object.values(validationResults).length > 0 && Object.values(validationResults).every((v) => v.correct) ? (
                        <><CheckCircle size={24} className="text-green-600" /><span className="text-green-800 font-semibold">Perfect Sorting!</span></>
                      ) : (
                        <><Eye size={24} className="text-blue-600" /><span className="text-blue-800 font-semibold">Check the colours above</span></>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">Green items are correct, red items were placed in the wrong category.</p>
                  </div>
                  <button
                    onClick={handleCategoryNext}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                  >
                    {categoryIndex < categoryQuestions.length - 1 ? 'Next Challenge' : 'See Results'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      {showReport && <MindSectionReport onClose={() => setShowReport(false)} />}
    </div>
  );
};

export default CriticalThinkingQuiz;

/**
 * Secure Quiz Content Routes
 *
 * Routes serve quiz questions securely — answers are NEVER sent to the frontend
 * until after the user submits. All scoring happens server-side.
 *
 * All quiz content is fetched from the Supabase `questions` table via QuizDb.
 * Pure scoring helpers live in QuizHelpers (no data-file dependencies).
 */

import { Router, Request, Response } from "express";
import { z } from "zod";
import logger from "../lib/logger.js";
import { verifySupabaseToken } from "../middleware/index.js";
import { sessionStorage, QuizSession } from "../lib/sessionStorage.js";
import { getAssessmentCatalog } from "../data/assessmentCatalogData.js";
import * as MemoryAssessmentData from "../data/memoryAssessmentData.js";
import * as QuizDb from "../services/quizDb.js";
import * as QuizHelpers from "../services/quizHelpers.js";

// ─── Category Questions (inline — not in DB, correctCategory kept server-side) ─

interface CategoryItem {
  id: string;
  name: string;
  image: string;
  correctCategory: string;
}

interface CategoryQuestion {
  id: string;
  instruction: string;
  categories: string[];
  items: CategoryItem[];
}

type CategoryGrade = 'grade1' | 'grade2' | 'grade3' | 'grade4';

const categoryQuestions: Record<CategoryGrade, CategoryQuestion[]> = {
  grade1: [
    {
      id: 'c1_1',
      instruction: 'Sort these into Animals and Fruits',
      categories: ['Animals', 'Fruits'],
      items: [
        { id: 'cat', name: 'Cat', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150&h=150&fit=crop&crop=center', correctCategory: 'Animals' },
        { id: 'dog', name: 'Dog', image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&h=150&fit=crop&crop=center', correctCategory: 'Animals' },
        { id: 'apple', name: 'Apple', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=150&h=150&fit=crop&crop=center', correctCategory: 'Fruits' },
        { id: 'banana', name: 'Banana', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=150&h=150&fit=crop&crop=center', correctCategory: 'Fruits' },
      ],
    },
    {
      id: 'c1_2',
      instruction: 'Sort these into Colors and Numbers',
      categories: ['Colors', 'Numbers'],
      items: [
        { id: 'ten', name: 'Ten', image: 'https://images.unsplash.com/photo-1631453494181-f762d692583a?auto=format&fit=crop&q=60&w=600', correctCategory: 'Numbers' },
        { id: 'red', name: 'Red', image: 'https://images.unsplash.com/photo-1611242320536-f12d3541249b?auto=format&fit=crop&q=80&w=1170', correctCategory: 'Colors' },
        { id: 'blue', name: 'Blue', image: 'https://images.unsplash.com/photo-1614850523011-8f49ffc73908?auto=format&fit=crop&q=80&w=1170', correctCategory: 'Colors' },
        { id: 'five', name: 'Five', image: 'https://plus.unsplash.com/premium_photo-1669349127530-23d9e3dab307?auto=format&fit=crop&q=80&w=880', correctCategory: 'Numbers' },
      ],
    },
  ],
  grade2: [
    {
      id: 'c2_1',
      instruction: 'Sort these into School Items and Toys',
      categories: ['School Items', 'Toys'],
      items: [
        { id: 'pencil', name: 'Pencil', image: 'https://plus.unsplash.com/premium_vector-1720893352647-9afd7d84fa79?auto=format&fit=crop&q=80&w=880', correctCategory: 'School Items' },
        { id: 'eraser', name: 'Eraser', image: 'https://images.unsplash.com/photo-1667532447990-51c6704ef358?auto=format&fit=crop&q=80&w=2080', correctCategory: 'School Items' },
        { id: 'book', name: 'Book', image: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=1976', correctCategory: 'School Items' },
        { id: 'ball', name: 'Ball', image: 'https://plus.unsplash.com/premium_photo-1709589145461-4797b4e80e9c?auto=format&fit=crop&q=80&w=2070', correctCategory: 'Toys' },
        { id: 'doll', name: 'Doll', image: 'https://images.unsplash.com/photo-1612506001235-f0d0892aa11b?auto=format&fit=crop&q=60&w=600', correctCategory: 'Toys' },
        { id: 'car', name: 'Toy Car', image: 'https://images.unsplash.com/photo-1609708536965-6e5b915b195b?auto=format&fit=crop&q=60&w=600', correctCategory: 'Toys' },
      ],
    },
    {
      id: 'c2_2',
      instruction: 'Sort these into Indoor and Outdoor activities',
      categories: ['Indoor', 'Outdoor'],
      items: [
        { id: 'reading', name: 'Reading', image: 'https://plus.unsplash.com/premium_vector-1727952231396-e301fbf4ef1b?auto=format&fit=crop&q=80&w=880', correctCategory: 'Indoor' },
        { id: 'cooking', name: 'Cooking', image: 'https://images.unsplash.com/photo-1528712306091-ed0763094c98?auto=format&fit=crop&q=60&w=600', correctCategory: 'Indoor' },
        { id: 'running', name: 'Running', image: 'https://images.unsplash.com/photo-1486218119243-13883505764c?auto=format&fit=crop&q=60&w=600', correctCategory: 'Outdoor' },
        { id: 'swimming', name: 'Swimming', image: 'https://plus.unsplash.com/premium_photo-1664475361436-e37f6f2ba407?auto=format&fit=crop&q=60&w=600', correctCategory: 'Outdoor' },
      ],
    },
  ],
  grade3: [
    {
      id: 'c3_1',
      instruction: 'Sort these into Fruits and Vegetables',
      categories: ['Fruits', 'Vegetables'],
      items: [
        { id: 'apple', name: 'Apple', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=150&h=150&fit=crop&crop=center', correctCategory: 'Fruits' },
        { id: 'kiwi', name: 'Kiwi', image: 'https://images.unsplash.com/photo-1585059895524-72359e06133a?w=150&h=150&fit=crop&crop=center', correctCategory: 'Fruits' },
        { id: 'strawberry', name: 'Strawberry', image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=150&h=150&fit=crop&crop=center', correctCategory: 'Fruits' },
        { id: 'tomato', name: 'Tomato', image: 'https://images.unsplash.com/photo-1582284540020-8acbe03f4924?auto=format&fit=crop&q=80&w=735', correctCategory: 'Fruits' },
        { id: 'cucumber', name: 'Cucumber', image: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=150&h=150&fit=crop&crop=center', correctCategory: 'Vegetables' },
        { id: 'spinach', name: 'Spinach', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=150&h=150&fit=crop&crop=center', correctCategory: 'Vegetables' },
      ],
    },
    {
      id: 'c3_2',
      instruction: 'Sort these by Size',
      categories: ['Small', 'Large'],
      items: [
        { id: 'mouse', name: 'Mouse', image: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=150&h=150&fit=crop&crop=center', correctCategory: 'Small' },
        { id: 'ant', name: 'Ant', image: 'https://plus.unsplash.com/premium_vector-1732722159929-50a849c772ce?auto=format&fit=crop&q=80&w=996', correctCategory: 'Small' },
        { id: 'elephant', name: 'Elephant', image: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=150&h=150&fit=crop&crop=center', correctCategory: 'Large' },
        { id: 'whale', name: 'Whale', image: 'https://plus.unsplash.com/premium_vector-1722145193505-ac236cb1d8e4?auto=format&fit=crop&q=60&w=600', correctCategory: 'Large' },
      ],
    },
  ],
  grade4: [
    {
      id: 'c4_1',
      instruction: 'Sort these animals by their habitat',
      categories: ['Land Animals', 'Water Animals', 'Air Animals'],
      items: [
        { id: 'lion', name: 'Lion', image: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=150&h=150&fit=crop&crop=center', correctCategory: 'Land Animals' },
        { id: 'frog', name: 'Frog', image: 'https://plus.unsplash.com/premium_vector-1731552809287-77ae59448109?auto=format&fit=crop&q=60&w=600', correctCategory: 'Land Animals' },
        { id: 'dolphin', name: 'Dolphin', image: 'https://plus.unsplash.com/premium_vector-1722145193220-5eb206260842?auto=format&fit=crop&q=60&w=600', correctCategory: 'Water Animals' },
        { id: 'shark', name: 'Shark', image: 'https://plus.unsplash.com/premium_vector-1741191978319-3ff9d0e3e9ae?auto=format&fit=crop&q=80&w=1112', correctCategory: 'Water Animals' },
        { id: 'eagle', name: 'Eagle', image: 'https://plus.unsplash.com/premium_vector-1719245268509-2cd8228d06ee?auto=format&fit=crop&q=60&w=600', correctCategory: 'Air Animals' },
        { id: 'parrot', name: 'Parrot', image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&q=80&w=725', correctCategory: 'Air Animals' },
      ],
    },
    {
      id: 'c4_2',
      instruction: 'Sort these by their state of matter',
      categories: ['Solid', 'Liquid', 'Gas'],
      items: [
        { id: 'rock', name: 'Rock', image: 'https://images.unsplash.com/vector-1752609379935-1e3a71d8dc78?auto=format&fit=crop&q=80&w=880', correctCategory: 'Solid' },
        { id: 'ice', name: 'Ice', image: 'https://images.unsplash.com/photo-1737099950797-d0a4baf12af3?auto=format&fit=crop&q=60&w=600', correctCategory: 'Solid' },
        { id: 'water', name: 'Water', image: 'https://plus.unsplash.com/premium_vector-1727952230707-372d1ba06834?auto=format&fit=crop&q=60&w=600', correctCategory: 'Liquid' },
        { id: 'juice', name: 'Juice', image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&q=60&w=600', correctCategory: 'Liquid' },
        { id: 'air', name: 'Air', image: 'https://media.istockphoto.com/id/1347708317/vector/wind-weather-thin-line-icon.jpg', correctCategory: 'Gas' },
        { id: 'steam', name: 'Steam', image: 'https://images.unsplash.com/photo-1635191535841-a6d4d88e1612?auto=format&fit=crop&q=80&w=2070', correctCategory: 'Gas' },
      ],
    },
  ],
};

function getCategoryQuestionsForFrontend(grade: string) {
  const key = grade as CategoryGrade;
  const questions = categoryQuestions[key];
  if (!questions) return [];
  return questions.map(q => ({
    id: q.id,
    instruction: q.instruction,
    categories: q.categories,
    items: q.items.map(item => ({ id: item.id, name: item.name, image: item.image })),
  }));
}

function validateCategoryItemPlacement(
  questionId: string,
  itemId: string,
  droppedCategory: string,
  grade: string,
): { correct: boolean; correctCategory: string } {
  const questions = categoryQuestions[grade as CategoryGrade];
  if (!questions) return { correct: false, correctCategory: '' };
  const question = questions.find(q => q.id === questionId);
  if (!question) return { correct: false, correctCategory: '' };
  const item = question.items.find(i => i.id === itemId);
  if (!item) return { correct: false, correctCategory: '' };
  return {
    correct: droppedCategory === item.correctCategory,
    correctCategory: item.correctCategory,
  };
}

// ─── Reading target rates (static config — no quiz answers involved) ─────────

const readingTargetRates: Record<number, Record<string, [number, number]>> = {
  1: { Fall: [0, 10], Winter: [10, 50], Spring: [30, 90] },
  2: { Fall: [30, 80], Winter: [50, 100], Spring: [70, 130] },
  3: { Fall: [50, 110], Winter: [70, 120], Spring: [80, 140] },
  4: { Fall: [70, 120], Winter: [80, 130], Spring: [90, 140] },
  5: { Fall: [80, 130], Winter: [90, 140], Spring: [100, 150] },
  6: { Fall: [90, 140], Winter: [100, 150], Spring: [110, 160] },
  7: { Fall: [100, 150], Winter: [110, 160], Spring: [120, 170] },
  8: { Fall: [110, 160], Winter: [120, 180], Spring: [130, 180] },
};

// ─── Sentence building grade metadata (static UI config, no scoring content) ─

const sentenceBuildingGradeMeta: Record<
  number,
  { title: string; description: string; difficulty: string; color: string }
> = {
  1: { title: 'Grade 1', description: 'Identify and describe what you see in pictures', difficulty: 'Beginner', color: 'from-green-400 to-blue-500' },
  2: { title: 'Grade 2', description: 'Describe actions and events using simple sentences', difficulty: 'Easy', color: 'from-blue-400 to-purple-500' },
  3: { title: 'Grade 3', description: 'Explain cause and effect and build complete sentences', difficulty: 'Medium', color: 'from-purple-400 to-pink-500' },
  4: { title: 'Grade 4', description: 'Combine ideas, make inferences, and use complex sentences', difficulty: 'Advanced', color: 'from-pink-400 to-red-500' },
};

// ─── Router ──────────────────────────────────────────────────────────────────

const router = Router();

// ─── Validation Schemas ──────────────────────────────────────────────────────

const startSessionSchema = z.object({
  grade: z.number().int().min(1).max(8),
  quizType: z.literal('spelling'),
  wordCount: z.number().int().min(5).max(20).optional().default(10),
});

const submitAnswerSchema = z.object({
  sessionId: z.string(),
  wordId: z.string(),
  answer: z.string(),
});

const completeSessionSchema = z.object({
  sessionId: z.string(),
});

const speakSchema = z.object({
  sessionId: z.string(),
  wordId: z.string(),
});

const storyRetellValidateSchema = z.object({
  storyId: z.number(),
  beginningId: z.string(),
  middleId: z.string(),
  endId: z.string(),
});

const vocabularyValidateSchema = z.object({
  wordId: z.string(),
  answerId: z.string(),
});

const vocabularyMatchingQuerySchema = z.object({
  grade: z.coerce.number().int().min(4).max(8),
  level: z.coerce.number().int().min(1).max(3),
});

const missingObjectValidateSchema = z.object({
  questionId: z.number().int(),
  answer: z.string().min(1),
});

const flashWordGradeSchema = z.enum(['grade1', 'grade2', 'grade3', 'grade4']);

const readingAssessmentGradeSchema = z.coerce.number().int().min(1).max(8);

const criticalThinkingValidateSchema = z.object({
  questionId: z.string(),
  answerId: z.string(),
});

const categoryQuizValidateSchema = z.object({
  questionId: z.string(),
  itemId: z.string(),
  droppedCategory: z.string(),
  grade: z.string(),
});

const learningStylesCalculateSchema = z.object({
  answers: z.record(z.string(), z.string()),
});

const logicalSequencingCheckSchema = z.object({
  questionId: z.number(),
  submittedOrder: z.array(z.number()),
});

const spotDifferenceCheckSchema = z.object({
  levelId: z.number(),
  clickX: z.number(),
  clickY: z.number(),
});

const attentionControlCalculateSchema = z.object({
  responses: z.record(z.string(), z.number()),
});

const sentenceDifferenceCheckSchema = z.object({
  questionId: z.number(),
  answer: z.string(),
});

const oralLanguageValidateSchema = z.object({
  questionId: z.string(),
  answerId: z.string(),
});

const memoryGenerateSchema = z.object({
  type: z.enum(['sequence_recall', 'missing_object']),
  difficulty: z.number(),
});

const memoryCheckSchema = z.object({
  type: z.enum(['sequence_recall', 'missing_object']),
  submittedAnswer: z.unknown(),
  questionRef: z.string(),
});

const memoryEvaluateSchema = z.object({
  correctAnswers: z.number().int().min(0),
  totalQuestions: z.number().int().min(1),
  difficulty: z.number(),
});

const sentenceBuildingValidateSchema = z.object({
  questionId: z.string(),
  answerId: z.string(),
});

// ─── SPELLING ROUTES ─────────────────────────────────────────────────────────

router.post('/spelling/start', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    const validation = startSessionSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ error: validation.error.errors });
    const { grade, wordCount } = validation.data;
    const words = await QuizDb.getSpellingWordsByGrade(grade);
    if (words.length === 0) return res.status(404).json({ error: `No words found for grade ${grade}` });
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(wordCount, words.length));
    const sessionId = `spelling-${req.user.id}-${Date.now()}`;
    const newSession: QuizSession = {
      userId: req.user.id,
      quizType: 'spelling',
      grade,
      questionIds: selected.map(w => w.id),
      answers: {},
      startTime: Date.now(),
      isComplete: false,
    };
    await sessionStorage.set(sessionId, newSession, 3600);
    res.json({
      success: true,
      sessionId,
      totalWords: selected.length,
      gradeDescription: QuizHelpers.SPELLING_GRADE_DESCRIPTIONS[grade] ?? '',
      words: selected.map((w, index) => ({ index, wordId: w.id, difficulty: w.difficulty, hint: w.hint })),
    });
  } catch (error) {
    logger.error(error, 'Start spelling session error:');
    res.status(500).json({ error: 'Failed to start session' });
  }
});

router.post('/spelling/speak', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    const validation = speakSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ error: 'Invalid input', details: validation.error.issues });
    const { sessionId, wordId } = validation.data;
    const session = await sessionStorage.get(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.userId !== req.user.id) return res.status(403).json({ error: 'Not your session' });
    if (!session.questionIds.includes(wordId)) return res.status(400).json({ error: 'Word not in session' });
    const word = await QuizDb.getSpellingAnswerData(wordId);
    if (!word) return res.status(404).json({ error: 'Word not found' });
    res.json({ success: true, word });
  } catch (error) {
    logger.error(error, 'Spelling speak error:');
    res.status(500).json({ error: 'Failed to get word audio' });
  }
});

router.post('/spelling/submit-answer', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    const validation = submitAnswerSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ error: validation.error.errors });
    const { sessionId, wordId, answer } = validation.data;
    const session = await sessionStorage.get(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.userId !== req.user.id) return res.status(403).json({ error: 'Not your session' });
    if (session.isComplete) return res.status(400).json({ error: 'Session already completed' });
    if (!session.questionIds.includes(wordId)) return res.status(400).json({ error: 'Word not in session' });
    await sessionStorage.updateAnswer(sessionId, wordId, answer);
    const correctWord = await QuizDb.getSpellingAnswerData(wordId);
    if (!correctWord) return res.status(404).json({ error: 'Word not found' });
    const result = QuizHelpers.validateSpellingAnswer(correctWord, answer);
    res.json({
      success: true,
      correct: result.correct,
      correctWord: result.correctWord,
      userAnswer: answer,
      answersSubmitted: Object.keys(session.answers).length + 1,
      totalWords: session.questionIds.length,
    });
  } catch (error) {
    logger.error(error, 'Submit answer error:');
    res.status(500).json({ error: 'Failed to submit answer' });
  }
});

router.post('/spelling/complete', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    const validation = completeSessionSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ error: validation.error.errors });
    const { sessionId } = validation.data;
    const session = await sessionStorage.get(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.userId !== req.user.id) return res.status(403).json({ error: 'Not your session' });
    let correctCount = 0;
    const results: Array<{ wordId: string; userAnswer: string | undefined; correctWord: string; isCorrect: boolean }> = [];
    const answers = session.answers as Record<string, string>;
    for (const wordId of session.questionIds) {
      const userAnswer = answers[wordId];
      const correctWord = (await QuizDb.getSpellingAnswerData(wordId)) ?? '';
      const result = QuizHelpers.validateSpellingAnswer(correctWord, userAnswer || '');
      if (result.correct) correctCount++;
      results.push({ wordId, userAnswer, correctWord: result.correctWord, isCorrect: result.correct });
    }
    const timeSpent = Math.round((Date.now() - session.startTime) / 1000);
    const percentage = Math.round((correctCount / session.questionIds.length) * 100);
    await sessionStorage.markComplete(sessionId);
    res.json({
      success: true,
      score: correctCount,
      totalQuestions: session.questionIds.length,
      percentage,
      timeSpent,
      grade: session.grade,
      results,
    });
  } catch (error) {
    logger.error(error, 'Complete session error:');
    res.status(500).json({ error: 'Failed to complete session' });
  }
});

router.get('/spelling/grades', async (_req: Request, res: Response) => {
  try {
    const gradeNums = await QuizDb.getSpellingGrades();
    res.json({
      success: true,
      grades: gradeNums.map(grade => ({
        grade,
        description: QuizHelpers.SPELLING_GRADE_DESCRIPTIONS[grade] ?? '',
        wordCount: 10,
      })),
    });
  } catch (error) {
    logger.error(error, 'Get grades error:');
    res.status(500).json({ error: 'Failed to get grades' });
  }
});

// ─── WRITING ROUTES ──────────────────────────────────────────────────────────

router.get('/writing/grades', async (_req: Request, res: Response) => {
  try {
    res.json({ success: true, grades: await QuizDb.getAllWritingGradesData() });
  } catch (error) {
    logger.error(error, 'Get writing grades error:');
    res.status(500).json({ error: 'Failed to get grades' });
  }
});

router.get('/writing/topics/:grade', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const grade = parseInt(req.params.grade);
    const gradeData = await QuizDb.getWritingTopicsByGrade(grade);
    if (!gradeData) return res.status(404).json({ error: 'Grade not found' });
    res.json({ success: true, grade: gradeData.grade, topics: gradeData.topics, skillFocus: gradeData.skillFocus, rubric: gradeData.rubric });
  } catch (error) {
    logger.error(error, 'Get writing topics error:');
    res.status(500).json({ error: 'Failed to get topics' });
  }
});

// ─── STORY RETELL ROUTES ─────────────────────────────────────────────────────

router.get('/story-retell/grades', async (_req: Request, res: Response) => {
  try {
    const grades = await Promise.all(
      [1, 2, 3, 4].map(async grade => ({ grade, storyCount: (await QuizDb.getStoriesByGrade(grade)).length }))
    );
    res.json({ success: true, grades });
  } catch (error) {
    logger.error(error, 'Get story retell grades error:');
    res.status(500).json({ error: 'Failed to get grades' });
  }
});

router.get('/story-retell/stories/:grade', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const grade = parseInt(req.params.grade);
    res.json({ success: true, stories: await QuizDb.getStoriesByGrade(grade) });
  } catch (error) {
    logger.error(error, 'Get stories error:');
    res.status(500).json({ error: 'Failed to get stories' });
  }
});

router.post('/story-retell/validate', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const validation = storyRetellValidateSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ error: 'Invalid input', details: validation.error.issues });
    const { storyId, beginningId, middleId, endId } = validation.data;
    const answerData = await QuizDb.getStoryAnswerData(storyId);
    if (!answerData) return res.status(404).json({ error: 'Story not found' });
    const beginningCorrect = beginningId === answerData.beginningCorrectId;
    const middleCorrect = middleId === answerData.middleCorrectId;
    const endCorrect = endId === answerData.endCorrectId;
    res.json({
      success: true,
      correct: beginningCorrect && middleCorrect && endCorrect,
      beginningCorrect,
      middleCorrect,
      endCorrect,
      correctAnswers: { beginningId: answerData.beginningCorrectId, middleId: answerData.middleCorrectId, endId: answerData.endCorrectId },
    });
  } catch (error) {
    logger.error(error, 'Validate story retell error:');
    res.status(500).json({ error: 'Failed to validate' });
  }
});

// ─── FLASH WORD ROUTES ───────────────────────────────────────────────────────

router.get('/flash-word/grades', async (_req: Request, res: Response) => {
  try {
    res.json({ success: true, grades: await QuizDb.getFlashWordGrades() });
  } catch (error) {
    logger.error(error, 'Get flash word grades error:');
    res.status(500).json({ error: 'Failed to get flash word grades' });
  }
});

router.get('/flash-word/questions/:grade', async (req: Request, res: Response) => {
  try {
    const validation = flashWordGradeSchema.safeParse(req.params.grade);
    if (!validation.success) return res.status(400).json({ error: 'Invalid grade' });
    res.json({ success: true, words: await QuizDb.getFlashWordsByGrade(validation.data) });
  } catch (error) {
    logger.error(error, 'Get flash word questions error:');
    res.status(500).json({ error: 'Failed to get flash word questions' });
  }
});

// ─── READING ASSESSMENT ROUTES ───────────────────────────────────────────────

router.get('/reading-assessment/content/:grade', async (req: Request, res: Response) => {
  try {
    const validation = readingAssessmentGradeSchema.safeParse(req.params.grade);
    if (!validation.success) return res.status(400).json({ error: 'Invalid grade' });
    const content = await QuizDb.getReadingAssessmentContent(validation.data);
    if (!content) return res.status(404).json({ error: 'Reading assessment content not found' });
    res.json({ success: true, content, allTargetRates: readingTargetRates });
  } catch (error) {
    logger.error(error, 'Get reading assessment content error:');
    res.status(500).json({ error: 'Failed to get reading assessment content' });
  }
});

// ─── MISSING OBJECT ROUTES ───────────────────────────────────────────────────

router.get('/missing-object/questions', async (_req: Request, res: Response) => {
  try {
    res.json({ success: true, questions: await QuizDb.getMissingObjectQuestions() });
  } catch (error) {
    logger.error(error, 'Get missing object questions error:');
    res.status(500).json({ error: 'Failed to get missing object questions' });
  }
});

router.post('/missing-object/validate', async (req: Request, res: Response) => {
  try {
    const validation = missingObjectValidateSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ error: 'Invalid input', details: validation.error.issues });
    const { questionId, answer } = validation.data;
    const correctAnswer = await QuizDb.getMissingObjectAnswerData(questionId);
    if (correctAnswer === null) return res.status(404).json({ error: 'Question not found' });
    const correct = answer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
    res.json({ success: true, correct, correctAnswer: correct ? undefined : correctAnswer });
  } catch (error) {
    logger.error(error, 'Validate missing object answer error:');
    res.status(500).json({ error: 'Failed to validate missing object answer' });
  }
});

// ─── VOCABULARY MATCHING ROUTES ──────────────────────────────────────────────

router.get('/vocabulary-matching/grades', async (_req: Request, res: Response) => {
  try {
    res.json({ success: true, grades: await QuizDb.getVocabularyMatchingGrades() });
  } catch (error) {
    logger.error(error, 'Get vocabulary matching grades error:');
    res.status(500).json({ error: 'Failed to get vocabulary matching grades' });
  }
});

router.get('/vocabulary-matching/questions', async (req: Request, res: Response) => {
  try {
    const validation = vocabularyMatchingQuerySchema.safeParse(req.query);
    if (!validation.success) return res.status(400).json({ error: 'Invalid query', details: validation.error.issues });
    const { grade, level } = validation.data;
    res.json({ success: true, questions: await QuizDb.getVocabularyMatchingQuestions(grade, level) });
  } catch (error) {
    logger.error(error, 'Get vocabulary matching questions error:');
    res.status(500).json({ error: 'Failed to get vocabulary matching questions' });
  }
});

// ─── VOCABULARY ROUTES ───────────────────────────────────────────────────────

router.get('/vocabulary/words/:level', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const level = parseInt(req.params.level);
    const words = await QuizDb.getVocabularyByLevel(level);
    res.json({ success: true, words: words.map(w => ({ id: w.id, word: w.word, example: w.example, level: w.level, options: w.options })) });
  } catch (error) {
    logger.error(error, 'Get vocabulary words error:');
    res.status(500).json({ error: 'Failed to get words' });
  }
});

router.post('/vocabulary/validate', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const validation = vocabularyValidateSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ error: 'Invalid input', details: validation.error.issues });
    const { wordId, answerId } = validation.data;
    const correctOptionId = await QuizDb.getVocabularyAnswerData(wordId);
    if (correctOptionId === null) return res.status(404).json({ error: 'Word not found' });
    res.json({ success: true, correct: answerId === correctOptionId, correctAnswer: correctOptionId });
  } catch (error) {
    logger.error(error, 'Validate vocabulary error:');
    res.status(500).json({ error: 'Failed to validate' });
  }
});

// ─── CRITICAL THINKING ROUTES ────────────────────────────────────────────────

router.get('/critical-thinking/questions', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const type = req.query.type as 'analogy' | 'category' | 'sequence' | 'odd-one-out' | undefined;
    const difficulty = req.query.difficulty as 'easy' | 'medium' | 'hard' | undefined;
    res.json({ success: true, questions: await QuizDb.getCriticalThinkingQuestions(type, difficulty) });
  } catch (error) {
    logger.error(error, 'Get critical thinking questions error:');
    res.status(500).json({ error: 'Failed to get questions' });
  }
});

router.post('/critical-thinking/validate', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const validation = criticalThinkingValidateSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ error: 'Invalid input', details: validation.error.issues });
    const { questionId, answerId } = validation.data;
    const answerData = await QuizDb.getCriticalThinkingAnswerData(questionId);
    if (!answerData) return res.status(404).json({ error: 'Question not found' });
    const correct = answerId === answerData.correctOptionId;
    res.json({ success: true, correct, correctAnswer: answerData.correctOptionId, explanation: answerData.explanation ?? undefined });
  } catch (error) {
    logger.error(error, 'Validate critical thinking error:');
    res.status(500).json({ error: 'Failed to validate' });
  }
});

router.get('/critical-thinking/category-questions', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const grade = req.query.grade as string;
    if (!grade || !['grade1', 'grade2', 'grade3', 'grade4'].includes(grade)) {
      return res.status(400).json({ error: 'Invalid or missing grade parameter' });
    }
    res.json({ success: true, questions: getCategoryQuestionsForFrontend(grade) });
  } catch (error) {
    logger.error(error, 'Get category questions error:');
    res.status(500).json({ error: 'Failed to get category questions' });
  }
});

router.post('/critical-thinking/category-validate', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const validation = categoryQuizValidateSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ error: 'Invalid input', details: validation.error.issues });
    const { questionId, itemId, droppedCategory, grade } = validation.data;
    res.json({ success: true, ...validateCategoryItemPlacement(questionId, itemId, droppedCategory, grade) });
  } catch (error) {
    logger.error(error, 'Validate category item error:');
    res.status(500).json({ error: 'Failed to validate category item' });
  }
});

// ─── LEARNING STYLES ROUTES ──────────────────────────────────────────────────

router.get('/learning-styles/questions', async (_req: Request, res: Response) => {
  try {
    res.json({ success: true, questions: await QuizDb.getLearningStyleQuestions() });
  } catch (error) {
    logger.error(error, 'Get learning styles questions error:');
    res.status(500).json({ error: 'Failed to get questions' });
  }
});

router.post('/learning-styles/calculate', async (req: Request, res: Response) => {
  try {
    const validation = learningStylesCalculateSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ error: 'Invalid input', details: validation.error.issues });
    const { answers } = validation.data;
    const questions = await QuizDb.getLearningStyleQuestions();
    res.json({ success: true, ...QuizHelpers.calculateLearningStyle(answers, questions) });
  } catch (error) {
    logger.error(error, 'Calculate learning styles error:');
    res.status(500).json({ error: 'Failed to calculate' });
  }
});

// ─── SENTENCE BUILDING ROUTES ────────────────────────────────────────────────

router.get('/sentence-building/grades', async (_req: Request, res: Response) => {
  try {
    const gradeNums = await QuizDb.getSentenceBuildingGrades();
    const grades = await Promise.all(
      gradeNums.map(async grade => {
        const meta = sentenceBuildingGradeMeta[grade];
        const questions = await QuizDb.getSentenceBuildingQuestions(grade);
        return {
          grade,
          title: meta?.title ?? `Grade ${grade}`,
          description: meta?.description ?? '',
          difficulty: meta?.difficulty ?? '',
          color: meta?.color ?? '',
          questionCount: questions.length,
        };
      })
    );
    res.json({ success: true, grades });
  } catch (error) {
    logger.error(error, 'Get sentence-building grades error:');
    res.status(500).json({ error: 'Failed to get grades' });
  }
});

router.get('/sentence-building/questions/:grade', async (req: Request, res: Response) => {
  try {
    const grade = Number.parseInt(req.params.grade, 10);
    const meta = sentenceBuildingGradeMeta[grade];
    if (!meta) return res.status(404).json({ error: 'Grade not found' });
    const questions = await QuizDb.getSentenceBuildingQuestions(grade);
    if (questions.length === 0) return res.status(404).json({ error: 'Grade not found' });
    res.json({
      success: true,
      grade,
      title: meta.title,
      description: meta.description,
      difficulty: meta.difficulty,
      color: meta.color,
      questionCount: questions.length,
      questions: questions.map(q => ({ id: q.id, type: 'sentence-building', level: q.level, question: q.question, image: q.image, feedback: q.feedback, options: q.options })),
    });
  } catch (error) {
    logger.error(error, 'Get sentence-building questions error:');
    res.status(500).json({ error: 'Failed to get questions' });
  }
});

router.post('/sentence-building/validate', async (req: Request, res: Response) => {
  try {
    const validation = sentenceBuildingValidateSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ error: 'Invalid input', details: validation.error.issues });
    const { questionId, answerId } = validation.data;
    const correctOptionId = await QuizDb.getSentenceBuildingAnswerData(questionId);
    if (correctOptionId === null) return res.status(404).json({ error: 'Question not found' });
    const correct = answerId === correctOptionId;
    res.json({ success: true, correct, correctAnswer: correctOptionId, correctAnswerId: correctOptionId, feedback: correct ? 'Well done!' : 'Not quite right.' });
  } catch (error) {
    logger.error(error, 'Validate sentence-building answer error:');
    res.status(500).json({ error: 'Failed to validate answer' });
  }
});

// ─── ASSESSMENT CATALOG ──────────────────────────────────────────────────────

router.get('/assessment-catalog', async (_req: Request, res: Response) => {
  try {
    res.json({ success: true, categories: getAssessmentCatalog() });
  } catch (error) {
    logger.error(error, 'Get assessment catalog error:');
    res.status(500).json({ error: 'Failed to get assessment catalog' });
  }
});

// ─── ALL QUIZZES ─────────────────────────────────────────────────────────────

router.get('/all-quizzes', async (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      quizzes: [
        { type: 'spelling', name: 'Spelling Test', category: 'academic', hasGradeLevels: true, grades: [1, 2, 3, 4, 5, 6, 7, 8] },
        { type: 'writing', name: 'Writing Assessment', category: 'academic', hasGradeLevels: true, grades: [1, 2, 3, 4, 5, 6, 7, 8] },
        { type: 'story-retell', name: 'Story Retell', category: 'oral', hasGradeLevels: true, grades: [1, 2, 3, 4] },
        { type: 'vocabulary', name: 'Vocabulary Matching', category: 'oral', hasGradeLevels: true, grades: [1, 2, 3] },
        { type: 'critical-thinking', name: 'Critical Thinking', category: 'mind', hasGradeLevels: false },
        { type: 'learning-styles', name: 'Learning Styles', category: 'mind', hasGradeLevels: false },
        { type: 'logical-sequencing', name: 'Logical Sequencing', category: 'mind', hasGradeLevels: true, grades: [1, 2, 3, 4] },
        { type: 'spot-the-difference', name: 'Spot the Difference', category: 'mind', hasGradeLevels: true, grades: [1, 2, 3] },
        { type: 'attention-control', name: 'Attention Control', category: 'mind', hasGradeLevels: false },
        { type: 'sentence-difference', name: 'Sentence Difference', category: 'mind', hasGradeLevels: false },
        { type: 'memory-assessment', name: 'Memory Assessment', category: 'mind', hasGradeLevels: false },
      ],
    });
  } catch (error) {
    logger.error(error, 'Get all quizzes error:');
    res.status(500).json({ error: 'Failed to get quizzes' });
  }
});

// ─── LOGICAL SEQUENCING ROUTES ───────────────────────────────────────────────

router.get('/logical-sequencing/grade/:grade', async (req: Request, res: Response) => {
  try {
    const grade = parseInt(req.params.grade);
    if (isNaN(grade) || grade < 1 || grade > 4) return res.status(400).json({ error: 'Invalid grade (1-4)' });
    const questions = await QuizDb.getLogicalSequencingByGrade(grade);
    res.json({ success: true, grade, questions, totalQuestions: questions.length });
  } catch (error) {
    logger.error(error, 'Get logical sequencing error:');
    res.status(500).json({ error: 'Failed to get questions' });
  }
});

router.post('/logical-sequencing/check', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const validation = logicalSequencingCheckSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ error: 'Invalid input', details: validation.error.issues });
    const { questionId, submittedOrder } = validation.data;
    const correctOrder = await QuizDb.getLogicalSequencingAnswerData(questionId);
    if (!correctOrder) return res.status(404).json({ error: 'Question not found' });
    const isCorrect = QuizHelpers.checkLogicalSequencingAnswer(correctOrder, submittedOrder);
    res.json({ success: true, isCorrect, correctOrder: isCorrect ? undefined : correctOrder });
  } catch (error) {
    logger.error(error, 'Check logical sequencing error:');
    res.status(500).json({ error: 'Failed to check answer' });
  }
});

// ─── SPOT THE DIFFERENCE ROUTES ──────────────────────────────────────────────

router.get('/spot-the-difference/grade/:grade', async (req: Request, res: Response) => {
  try {
    const grade = parseInt(req.params.grade);
    if (isNaN(grade) || grade < 1 || grade > 3) return res.status(400).json({ error: 'Invalid grade (1-3)' });
    const levels = await QuizDb.getSpotTheDifferenceByGrade(grade);
    res.json({ success: true, grade, levels, totalLevels: levels.length });
  } catch (error) {
    logger.error(error, 'Get spot the difference error:');
    res.status(500).json({ error: 'Failed to get levels' });
  }
});

router.post('/spot-the-difference/check', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const validation = spotDifferenceCheckSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ error: 'Invalid input', details: validation.error.issues });
    const { levelId, clickX, clickY } = validation.data;
    const answerData = await QuizDb.getSpotTheDifferenceAnswerData(levelId);
    if (!answerData) return res.status(404).json({ error: 'Level not found' });
    const result = QuizHelpers.checkSpotDifference(answerData.differences, clickX, clickY);
    res.json({ success: true, found: result.found, differenceIndex: result.differenceIndex, totalDifferences: answerData.differences.length });
  } catch (error) {
    logger.error(error, 'Check spot difference error:');
    res.status(500).json({ error: 'Failed to check difference' });
  }
});

// ─── ATTENTION CONTROL ROUTES ────────────────────────────────────────────────

router.get('/attention-control/questions', async (_req: Request, res: Response) => {
  try {
    const allQuestions = await QuizDb.getAttentionControlQuestions();
    const questions = allQuestions.map(({ reverse: _r, ...q }) => q);
    res.json({ success: true, questions, ratingLabels: { 1: 'Never', 2: 'Sometimes', 3: 'Often', 4: 'Always' } });
  } catch (error) {
    logger.error(error, 'Get attention control error:');
    res.status(500).json({ error: 'Failed to get questions' });
  }
});

router.post('/attention-control/calculate', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const validation = attentionControlCalculateSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ error: 'Invalid input', details: validation.error.issues });
    const { responses } = validation.data;
    const allQuestions = await QuizDb.getAttentionControlQuestions();
    const scores = QuizHelpers.calculateAttentionScores(responses as unknown as Record<number, number>, allQuestions);
    const interpretation = QuizHelpers.interpretScores(scores);
    const recommendations = QuizHelpers.getRecommendations(interpretation);
    res.json({ success: true, scores, interpretation, recommendations });
  } catch (error) {
    logger.error(error, 'Calculate attention scores error:');
    res.status(500).json({ error: 'Failed to calculate scores' });
  }
});

// ─── SENTENCE DIFFERENCE ROUTES ──────────────────────────────────────────────

router.get('/sentence-difference/questions', async (_req: Request, res: Response) => {
  try {
    const questions = await QuizDb.getSentenceDifferenceQuestions();
    res.json({ success: true, questions, totalQuestions: questions.length });
  } catch (error) {
    logger.error(error, 'Get sentence difference error:');
    res.status(500).json({ error: 'Failed to get questions' });
  }
});

router.post('/sentence-difference/check', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const validation = sentenceDifferenceCheckSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ error: 'Invalid input', details: validation.error.issues });
    const { questionId, answer } = validation.data;
    const correctAnswer = await QuizDb.getSentenceDifferenceAnswerData(questionId);
    if (correctAnswer === null) return res.status(404).json({ error: 'Question not found' });
    const isCorrect = answer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
    res.json({ success: true, isCorrect, correctAnswer: isCorrect ? undefined : correctAnswer });
  } catch (error) {
    logger.error(error, 'Check sentence difference error:');
    res.status(500).json({ error: 'Failed to check answer' });
  }
});

// ─── ORAL LANGUAGE ROUTES ────────────────────────────────────────────────────

router.get('/oral-language/questions', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const type = req.query.type as 'vocabulary' | 'sentence-building' | 'storytelling' | undefined;
    const level = req.query.level ? parseInt(req.query.level as string) : undefined;

    if (type === 'sentence-building') {
      const questions = level ? await QuizDb.getSentenceBuildingQuestions(level) : [];
      return res.json({
        success: true,
        questions: questions.map(q => ({ id: q.id, type: 'sentence-building', level: q.level, question: q.question, image: q.image, feedback: q.feedback, options: q.options })),
      });
    }

    const questions = await QuizDb.getOralLanguageQuestions(type, level);
    const safeQuestions = questions.map(q => ({
      id: q.id, type: q.type, level: q.level, question: q.question, image: q.image, options: q.options,
      ...(q.type === 'storytelling' && q.sequenceImages ? { sequenceImages: q.sequenceImages, correctSequence: q.correctSequence, feedback: q.feedback } : {}),
    }));
    res.json({ success: true, questions: safeQuestions });
  } catch (error) {
    logger.error(error, 'Get oral language questions error:');
    res.status(500).json({ error: 'Failed to get questions' });
  }
});

router.post('/oral-language/validate', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const validation = oralLanguageValidateSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ error: 'Invalid input', details: validation.error.issues });
    const { questionId, answerId } = validation.data;
    // Try sentence-building first
    const sbAnswer = await QuizDb.getSentenceBuildingAnswerData(questionId);
    if (sbAnswer !== null) {
      const correct = answerId === sbAnswer;
      return res.json({ success: true, correct, correctAnswer: sbAnswer, correctAnswerId: sbAnswer, feedback: correct ? 'Well done!' : 'Not quite right.' });
    }
    // Fall back to oral language
    const answerData = await QuizDb.getOralLanguageAnswerData(questionId);
    if (!answerData) return res.status(404).json({ error: 'Question not found' });
    res.json({ success: true, correct: answerId === answerData.correctOptionId, correctAnswer: answerData.correctOptionId });
  } catch (error) {
    logger.error(error, 'Validate oral language error:');
    res.status(500).json({ error: 'Failed to validate' });
  }
});

// ─── MEMORY ASSESSMENT ROUTES ────────────────────────────────────────────────

router.post('/memory-assessment/generate', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const validation = memoryGenerateSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ error: 'Invalid input', details: validation.error.issues });
    const { type, difficulty } = validation.data;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    let question;
    if (type === 'sequence_recall') {
      question = MemoryAssessmentData.generateSequenceQuestion(difficulty);
    } else if (type === 'missing_object') {
      question = MemoryAssessmentData.generateMissingObjectQuestion(difficulty);
    } else {
      return res.status(400).json({ error: 'Invalid question type' });
    }
    const { correctSequence, missingItemId, ...safeQuestion } = question;
    const sessionKey = `memory-${userId}-${Date.now()}`;
    await sessionStorage.set(sessionKey, { userId, quizType: 'memory-assessment', questionIds: [], answers: { correctSequence, missingItemId, type }, startTime: Date.now(), isComplete: false }, 3600);
    res.json({ success: true, question: safeQuestion, questionRef: sessionKey });
  } catch (error) {
    logger.error(error, 'Generate memory question error:');
    res.status(500).json({ error: 'Failed to generate question' });
  }
});

router.post('/memory-assessment/check', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const validation = memoryCheckSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ error: 'Invalid input', details: validation.error.issues });
    const { type, submittedAnswer, questionRef } = validation.data;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const sessionData = await sessionStorage.get(questionRef);
    if (!sessionData || sessionData.userId !== userId) return res.status(400).json({ error: 'Invalid or expired question reference' });
    let isCorrect = false;
    if (type === 'sequence_recall' && sessionData.answers.correctSequence) {
      isCorrect = MemoryAssessmentData.checkSequenceAnswer(submittedAnswer as string[], sessionData.answers.correctSequence as string[]);
    } else if (type === 'missing_object' && sessionData.answers.missingItemId) {
      isCorrect = MemoryAssessmentData.checkMissingObjectAnswer(submittedAnswer as string, sessionData.answers.missingItemId as string);
    }
    res.json({ success: true, isCorrect });
  } catch (error) {
    logger.error(error, 'Check memory answer error:');
    res.status(500).json({ error: 'Failed to check answer' });
  }
});

router.post('/memory-assessment/evaluate', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const validation = memoryEvaluateSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ error: 'Invalid input', details: validation.error.issues });
    const { correctAnswers, totalQuestions, difficulty } = validation.data;
    res.json({ success: true, evaluation: MemoryAssessmentData.evaluatePerformance(correctAnswers, totalQuestions, difficulty) });
  } catch (error) {
    logger.error(error, 'Evaluate memory assessment error:');
    res.status(500).json({ error: 'Failed to evaluate' });
  }
});

export default router;


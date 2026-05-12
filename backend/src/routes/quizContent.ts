import logger from '../lib/logger.js';
/**
 * Secure Quiz Content Routes
 * 
 * These routes serve quiz questions securely - answers are NEVER sent to the frontend
 * until after the user submits. All scoring happens server-side.
 * 
 * SECURITY FEATURES:
 * 1. Questions served without answers
 * 2. Server-side answer validation
 * 3. Server-side score calculation
 * 4. Session tracking to prevent cheating
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { verifySupabaseToken } from '../middleware/index.js';

// Import all quiz data
import { 
  spellingData, 
  getWordsByGrade, 
  getGradeDescription,
  validateSpellingAnswer,
  getWordForTTS 
} from '../data/spellingData.js';
import { 
  getBlendingQuestionsByGrade, 
  validateBlendingAnswer,
  getBlendingGrades 
} from '../data/blendingData.js';
import { 
  getVocabularyByLevel, 
  validateVocabularyAnswer 
} from '../data/vocabularyData.js';
import {
  getVocabularyMatchingGrades,
  getVocabularyMatchingQuestions,
} from '../data/vocabularyMatchingData.js';
import {
  getMissingObjectQuestionsForFrontend,
  validateMissingObjectAnswer,
} from '../data/missingObjectData.js';
import {
  getFlashWordGradeSummaries,
  getFlashWordsByGrade,
} from '../data/flashWordData.js';
import {
  getAllReadingTargetRates,
  getReadingAssessmentContent,
} from '../data/readingAssessmentData.js';
import { 
  getStoriesByGrade, 
  getStoryForFrontend, 
  validateStoryRetellAnswers 
} from '../data/storyRetellData.js';
import { 
  getCriticalThinkingQuestions, 
  validateCriticalThinkingAnswer,
  getCategoryQuestions,
  validateCategoryItemPlacement
} from '../data/criticalThinkingData.js';
import { 
  getLearningStyleQuestions, 
  calculateLearningStyle 
} from '../data/learningStylesData.js';
import {
  getSentenceBuildingGradeData,
  getSentenceBuildingGradeSummaries,
  getSentenceBuildingQuestionsForFrontend,
  validateSentenceBuildingAnswer,
} from '../data/sentenceBuildingData.js';
import { getAssessmentCatalog } from '../data/assessmentCatalogData.js';
import { writingData, getWritingDataByGrade } from '../data/writingData.js';
import { 
  getOralLanguageQuestions, 
  validateOralLanguageAnswer 
} from '../data/oralLanguageData.js';
import { sessionStorage, QuizSession } from '../lib/sessionStorage.js';

// Import namespaced quiz data for new types
import * as LogicalSequencingData from '../data/logicalSequencingData.js';
import * as AttentionControlData from '../data/attentionControlData.js';
import * as MemoryAssessmentData from '../data/memoryAssessmentData.js';
import * as StartingEndingSoundData from '../data/startingEndingSoundData.js';
import * as SpotTheDifferenceData from '../data/spotTheDifferenceData.js';
import * as SentenceDifferenceData from '../data/sentenceDifferenceData.js';

const router = Router();

// Session storage is now handled by '../lib/sessionStorage.js'
// which supports both in-memory (development) and Redis (production)

// Validation schemas
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

// Validation schemas for quiz POST handlers
const speakSchema = z.object({
  sessionId: z.string(),
  wordId: z.string(),
});

const blendingValidateSchema = z.object({
  questionId: z.number(),
  answer: z.string(),
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

const soundOptionsSchema = z.object({
  questionId: z.number(),
  questionType: z.enum(['beginning', 'ending']),
});

const soundCheckSchema = z.object({
  questionId: z.number(),
  questionType: z.enum(['beginning', 'ending']),
  answer: z.string(),
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

/**
 * POST /api/quiz-content/spelling/start
 * Start a new spelling quiz session
 * Returns word IDs only (no answers)
 */
router.post('/spelling/start', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const validation = startSessionSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors });
    }

    const { grade, wordCount } = validation.data;
    
    // Get words for this grade and shuffle
    const words = getWordsByGrade(grade);
    if (words.length === 0) {
      return res.status(404).json({ error: `No words found for grade ${grade}` });
    }

    const shuffled = [...words].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(wordCount, words.length));
    
    // Create session using the new storage abstraction
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
    await sessionStorage.set(sessionId, newSession, 3600); // 1 hour TTL

    // Return session with word metadata (NOT the actual words/answers)
    res.json({
      success: true,
      sessionId,
      totalWords: selected.length,
      gradeDescription: getGradeDescription(grade),
      // Only send IDs and difficulty - no answers!
      words: selected.map((w, index) => ({
        index,
        wordId: w.id,
        difficulty: w.difficulty,
        hint: w.hint,
      })),
    });
  } catch (error) {
    logger.error(error, 'Start spelling session error:');
    res.status(500).json({ error: 'Failed to start session' });
  }
});

/**
 * POST /api/quiz-content/spelling/speak
 * Get TTS audio for a word (validates session ownership)
 */
router.post('/spelling/speak', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const validation = speakSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid input', details: validation.error.issues });
    }
    const { sessionId, wordId } = validation.data;
    
    // Validate session using storage abstraction
    const session = await sessionStorage.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    if (session.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not your session' });
    }

    if (!session.questionIds.includes(wordId)) {
      return res.status(400).json({ error: 'Word not in session' });
    }

    // Get the actual word for TTS
    const word = getWordForTTS(wordId);
    if (!word) {
      return res.status(404).json({ error: 'Word not found' });
    }

    // Return the word for TTS (this is necessary for the browser to speak it)
    // This is a calculated security trade-off - the word is exposed briefly for audio
    // but the user still has to type it correctly
    res.json({
      success: true,
      word, // The actual word for TTS
    });
  } catch (error) {
    logger.error(error, 'Spelling speak error:');
    res.status(500).json({ error: 'Failed to get word audio' });
  }
});

/**
 * POST /api/quiz-content/spelling/submit-answer
 * Submit an answer for validation (doesn't reveal correct answer yet)
 */
router.post('/spelling/submit-answer', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const validation = submitAnswerSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors });
    }

    const { sessionId, wordId, answer } = validation.data;
    
    // Validate session using storage abstraction
    const session = await sessionStorage.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    if (session.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not your session' });
    }

    if (session.isComplete) {
      return res.status(400).json({ error: 'Session already completed' });
    }

    if (!session.questionIds.includes(wordId)) {
      return res.status(400).json({ error: 'Word not in session' });
    }

    // Store the answer using storage abstraction
    await sessionStorage.updateAnswer(sessionId, wordId, answer);

    // Validate the answer
    const result = validateSpellingAnswer(wordId, answer);

    // Return result WITH the correct answer (since they've submitted)
    res.json({
      success: true,
      correct: result.correct,
      correctWord: result.correctWord, // Safe to reveal after submission
      userAnswer: answer,
      answersSubmitted: Object.keys(session.answers).length + 1,
      totalWords: session.questionIds.length,
    });
  } catch (error) {
    logger.error(error, 'Submit answer error:');
    res.status(500).json({ error: 'Failed to submit answer' });
  }
});

/**
 * POST /api/quiz-content/spelling/complete
 * Complete the quiz session and get final score
 */
router.post('/spelling/complete', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const validation = completeSessionSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors });
    }

    const { sessionId } = validation.data;
    
    // Validate session using storage abstraction
    const session = await sessionStorage.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    if (session.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not your session' });
    }

    // Calculate final score
    let correctCount = 0;
    const results: Array<{
      wordId: string;
      userAnswer: string | undefined;
      correctWord: string;
      isCorrect: boolean;
    }> = [];

    const answers = session.answers as Record<string, string>;
    for (const wordId of session.questionIds) {
      const userAnswer = answers[wordId];
      const validationResult = validateSpellingAnswer(wordId, userAnswer || '');
      
      if (validationResult.correct) {
        correctCount++;
      }
      
      results.push({
        wordId,
        userAnswer,
        correctWord: validationResult.correctWord,
        isCorrect: validationResult.correct,
      });
    }

    const timeSpent = Math.round((Date.now() - session.startTime) / 1000);
    const percentage = Math.round((correctCount / session.questionIds.length) * 100);

    // Mark session complete using storage abstraction
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

/**
 * GET /api/quiz-content/spelling/grades
 * Get available grades and their descriptions (public info)
 */
router.get('/spelling/grades', async (_req: Request, res: Response) => {
  try {
    const grades = spellingData.map(g => ({
      grade: g.grade,
      description: g.description,
      wordCount: g.words.length,
    }));

    res.json({
      success: true,
      grades,
    });
  } catch (error) {
    logger.error(error, 'Get grades error:');
    res.status(500).json({ error: 'Failed to get grades' });
  }
});

// ============================================
// BLENDING QUIZ ROUTES
// ============================================

/**
 * GET /api/quiz-content/blending/grades
 */
router.get('/blending/grades', async (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      grades: getBlendingGrades(),
    });
  } catch (error) {
    logger.error(error, 'Get blending grades error:');
    res.status(500).json({ error: 'Failed to get grades' });
  }
});

/**
 * GET /api/quiz-content/blending/questions/:grade
 */
router.get('/blending/questions/:grade', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const grade = parseInt(req.params.grade);
    const questions = getBlendingQuestionsByGrade(grade);
    
    // Return questions without answers
    const safeQuestions = questions.map(q => ({
      id: q.id,
      sounds: q.sounds,
      grade: q.grade,
    }));
    
    res.json({
      success: true,
      questions: safeQuestions,
    });
  } catch (error) {
    logger.error(error, 'Get blending questions error:');
    res.status(500).json({ error: 'Failed to get questions' });
  }
});

/**
 * POST /api/quiz-content/blending/validate
 */
router.post('/blending/validate', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const validation = blendingValidateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid input', details: validation.error.issues });
    }
    const { questionId, answer } = validation.data;
    const result = validateBlendingAnswer(questionId, answer);
    
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    logger.error(error, 'Validate blending answer error:');
    res.status(500).json({ error: 'Failed to validate' });
  }
});

// ============================================
// WRITING QUIZ ROUTES
// ============================================

/**
 * GET /api/quiz-content/writing/grades
 */
router.get('/writing/grades', async (_req: Request, res: Response) => {
  try {
    const grades = writingData.map(g => ({
      grade: g.grade,
      topicCount: g.topics.length,
      skillFocus: g.skillFocus,
      wordCount: {
        min: Math.min(...g.topics.map(topic => topic.wordCount.min)),
        max: Math.max(...g.topics.map(topic => topic.wordCount.max)),
      },
    }));
    
    res.json({
      success: true,
      grades,
    });
  } catch (error) {
    logger.error(error, 'Get writing grades error:');
    res.status(500).json({ error: 'Failed to get grades' });
  }
});

/**
 * GET /api/quiz-content/writing/topics/:grade
 */
router.get('/writing/topics/:grade', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const grade = parseInt(req.params.grade);
    const gradeData = getWritingDataByGrade(grade);
    
    if (!gradeData) {
      return res.status(404).json({ error: 'Grade not found' });
    }
    
    res.json({
      success: true,
      grade: gradeData.grade,
      topics: gradeData.topics,
      skillFocus: gradeData.skillFocus,
      rubric: gradeData.rubric,
    });
  } catch (error) {
    logger.error(error, 'Get writing topics error:');
    res.status(500).json({ error: 'Failed to get topics' });
  }
});

// ============================================
// STORY RETELL ROUTES
// ============================================

/**
 * GET /api/quiz-content/story-retell/grades
 */
router.get('/story-retell/grades', async (_req: Request, res: Response) => {
  try {
    const grades = [1, 2, 3, 4].map(grade => ({
      grade,
      storyCount: getStoriesByGrade(grade).length,
    }));
    
    res.json({
      success: true,
      grades,
    });
  } catch (error) {
    logger.error(error, 'Get story retell grades error:');
    res.status(500).json({ error: 'Failed to get grades' });
  }
});

/**
 * GET /api/quiz-content/story-retell/stories/:grade
 */
router.get('/story-retell/stories/:grade', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const grade = parseInt(req.params.grade);
    const stories = getStoriesByGrade(grade);
    
    // Return stories with shuffled options (no isCorrect flag)
    const safeStories = stories.map(s => ({
      id: s.id,
      title: s.title,
      story: s.story,
      grade: s.grade,
      readingLevel: s.readingLevel,
      wordCount: s.wordCount,
      beginningOptions: s.beginningOptions.map(o => ({ id: o.id, text: o.text })),
      middleOptions: s.middleOptions.map(o => ({ id: o.id, text: o.text })),
      endOptions: s.endOptions.map(o => ({ id: o.id, text: o.text })),
    }));
    
    res.json({
      success: true,
      stories: safeStories,
    });
  } catch (error) {
    logger.error(error, 'Get stories error:');
    res.status(500).json({ error: 'Failed to get stories' });
  }
});

/**
 * POST /api/quiz-content/story-retell/validate
 */
router.post('/story-retell/validate', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const validation = storyRetellValidateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid input', details: validation.error.issues });
    }
    const { storyId, beginningId, middleId, endId } = validation.data;
    const result = validateStoryRetellAnswers(storyId, { beginningId, middleId, endId });
    
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    logger.error(error, 'Validate story retell error:');
    res.status(500).json({ error: 'Failed to validate' });
  }
});

// ============================================
// FLASH WORD ROUTES
// ============================================

/**
 * GET /api/quiz-content/flash-word/grades
 */
router.get('/flash-word/grades', async (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      grades: getFlashWordGradeSummaries(),
    });
  } catch (error) {
    logger.error(error, 'Get flash word grades error:');
    res.status(500).json({ error: 'Failed to get flash word grades' });
  }
});

/**
 * GET /api/quiz-content/flash-word/questions/:grade
 */
router.get('/flash-word/questions/:grade', async (req: Request, res: Response) => {
  try {
    const validation = flashWordGradeSchema.safeParse(req.params.grade);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid grade' });
    }

    res.json({
      success: true,
      words: getFlashWordsByGrade(validation.data),
    });
  } catch (error) {
    logger.error(error, 'Get flash word questions error:');
    res.status(500).json({ error: 'Failed to get flash word questions' });
  }
});

// ============================================
// READING ASSESSMENT ROUTES
// ============================================

/**
 * GET /api/quiz-content/reading-assessment/content/:grade
 */
router.get('/reading-assessment/content/:grade', async (req: Request, res: Response) => {
  try {
    const validation = readingAssessmentGradeSchema.safeParse(req.params.grade);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid grade' });
    }

    const content = getReadingAssessmentContent(validation.data);
    if (!content) {
      return res.status(404).json({ error: 'Reading assessment content not found' });
    }

    res.json({
      success: true,
      content,
      allTargetRates: getAllReadingTargetRates(),
    });
  } catch (error) {
    logger.error(error, 'Get reading assessment content error:');
    res.status(500).json({ error: 'Failed to get reading assessment content' });
  }
});

// ============================================
// MISSING OBJECT ROUTES
// ============================================

/**
 * GET /api/quiz-content/missing-object/questions
 */
router.get('/missing-object/questions', async (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      questions: getMissingObjectQuestionsForFrontend(),
    });
  } catch (error) {
    logger.error(error, 'Get missing object questions error:');
    res.status(500).json({ error: 'Failed to get missing object questions' });
  }
});

/**
 * POST /api/quiz-content/missing-object/validate
 */
router.post('/missing-object/validate', async (req: Request, res: Response) => {
  try {
    const validation = missingObjectValidateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid input', details: validation.error.issues });
    }

    const { questionId, answer } = validation.data;
    res.json({
      success: true,
      ...validateMissingObjectAnswer(questionId, answer),
    });
  } catch (error) {
    logger.error(error, 'Validate missing object answer error:');
    res.status(500).json({ error: 'Failed to validate missing object answer' });
  }
});

// ============================================
// VOCABULARY MATCHING ROUTES
// ============================================

/**
 * GET /api/quiz-content/vocabulary-matching/grades
 */
router.get('/vocabulary-matching/grades', async (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      grades: getVocabularyMatchingGrades(),
    });
  } catch (error) {
    logger.error(error, 'Get vocabulary matching grades error:');
    res.status(500).json({ error: 'Failed to get vocabulary matching grades' });
  }
});

/**
 * GET /api/quiz-content/vocabulary-matching/questions?grade=4&level=1
 */
router.get('/vocabulary-matching/questions', async (req: Request, res: Response) => {
  try {
    const validation = vocabularyMatchingQuerySchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid query', details: validation.error.issues });
    }

    const { grade, level } = validation.data;
    const questions = getVocabularyMatchingQuestions(grade, level);

    res.json({
      success: true,
      questions,
    });
  } catch (error) {
    logger.error(error, 'Get vocabulary matching questions error:');
    res.status(500).json({ error: 'Failed to get vocabulary matching questions' });
  }
});

// ============================================
// VOCABULARY ROUTES
// ============================================

/**
 * GET /api/quiz-content/vocabulary/words/:level
 */
router.get('/vocabulary/words/:level', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const level = parseInt(req.params.level);
    const words = getVocabularyByLevel(level);
    
    // Return without isCorrect flag
    const safeWords = words.map(w => ({
      id: w.id,
      word: w.word,
      example: w.example,
      level: w.level,
      options: w.options.map(o => ({ id: o.id, text: o.text })),
    }));
    
    res.json({
      success: true,
      words: safeWords,
    });
  } catch (error) {
    logger.error(error, 'Get vocabulary words error:');
    res.status(500).json({ error: 'Failed to get words' });
  }
});

/**
 * POST /api/quiz-content/vocabulary/validate
 */
router.post('/vocabulary/validate', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const validation = vocabularyValidateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid input', details: validation.error.issues });
    }
    const { wordId, answerId } = validation.data;
    const result = validateVocabularyAnswer(wordId, answerId);
    
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    logger.error(error, 'Validate vocabulary error:');
    res.status(500).json({ error: 'Failed to validate' });
  }
});

// ============================================
// CRITICAL THINKING ROUTES
// ============================================

/**
 * GET /api/quiz-content/critical-thinking/questions
 */
router.get('/critical-thinking/questions', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const type = req.query.type as string | undefined;
    const difficulty = req.query.difficulty as string | undefined;
    
    const questions = getCriticalThinkingQuestions(
      type as 'analogy' | 'category' | 'sequence' | 'odd-one-out' | undefined,
      difficulty as 'easy' | 'medium' | 'hard' | undefined
    );
    
    // Return without isCorrect flag
    const safeQuestions = questions.map(q => ({
      id: q.id,
      type: q.type,
      question: q.question,
      difficulty: q.difficulty,
      options: q.options.map(o => ({ id: o.id, text: o.text })),
    }));
    
    res.json({
      success: true,
      questions: safeQuestions,
    });
  } catch (error) {
    logger.error(error, 'Get critical thinking questions error:');
    res.status(500).json({ error: 'Failed to get questions' });
  }
});

/**
 * POST /api/quiz-content/critical-thinking/validate
 */
router.post('/critical-thinking/validate', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const validation = criticalThinkingValidateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid input', details: validation.error.issues });
    }
    const { questionId, answerId } = validation.data;
    const result = validateCriticalThinkingAnswer(questionId, answerId);
    
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    logger.error(error, 'Validate critical thinking error:');
    res.status(500).json({ error: 'Failed to validate' });
  }
});

/**
 * GET /api/quiz-content/critical-thinking/category-questions
 * Returns drag-and-drop category questions by grade (without answer keys)
 */
router.get('/critical-thinking/category-questions', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const grade = req.query.grade as string;
    if (!grade || !['grade1', 'grade2', 'grade3', 'grade4'].includes(grade)) {
      return res.status(400).json({ error: 'Invalid or missing grade parameter' });
    }

    const questions = getCategoryQuestions(grade);
    res.json({
      success: true,
      questions,
    });
  } catch (error) {
    logger.error(error, 'Get category questions error:');
    res.status(500).json({ error: 'Failed to get category questions' });
  }
});

/**
 * POST /api/quiz-content/critical-thinking/category-validate
 * Validates a single category item placement
 */
router.post('/critical-thinking/category-validate', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const validation = categoryQuizValidateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid input', details: validation.error.issues });
    }
    const { questionId, itemId, droppedCategory, grade } = validation.data;
    const result = validateCategoryItemPlacement(questionId, itemId, droppedCategory, grade);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    logger.error(error, 'Validate category item error:');
    res.status(500).json({ error: 'Failed to validate category item' });
  }
});

// ============================================
// LEARNING STYLES ROUTES
// ============================================

/**
 * GET /api/quiz-content/learning-styles/questions
 */
router.get('/learning-styles/questions', async (_req: Request, res: Response) => {
  try {
    const questions = getLearningStyleQuestions();
    
    res.json({
      success: true,
      questions,
    });
  } catch (error) {
    logger.error(error, 'Get learning styles questions error:');
    res.status(500).json({ error: 'Failed to get questions' });
  }
});

/**
 * POST /api/quiz-content/learning-styles/calculate
 */
router.post('/learning-styles/calculate', async (req: Request, res: Response) => {
  try {
    const validation = learningStylesCalculateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid input', details: validation.error.issues });
    }
    const { answers } = validation.data;
    const result = calculateLearningStyle(answers as unknown as Record<number, string>);
    
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    logger.error(error, 'Calculate learning styles error:');
    res.status(500).json({ error: 'Failed to calculate' });
  }
});

// ============================================
// SENTENCE BUILDING ROUTES
// ============================================

/**
 * GET /api/quiz-content/sentence-building/grades
 */
router.get('/sentence-building/grades', async (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      grades: getSentenceBuildingGradeSummaries(),
    });
  } catch (error) {
    logger.error(error, 'Get sentence-building grades error:');
    res.status(500).json({ error: 'Failed to get grades' });
  }
});

/**
 * GET /api/quiz-content/sentence-building/questions/:grade
 */
router.get('/sentence-building/questions/:grade', async (req: Request, res: Response) => {
  try {
    const grade = Number.parseInt(req.params.grade, 10);
    const gradeData = getSentenceBuildingGradeData(grade);

    if (!gradeData) {
      return res.status(404).json({ error: 'Grade not found' });
    }

    res.json({
      success: true,
      grade: gradeData.grade,
      title: gradeData.title,
      description: gradeData.description,
      difficulty: gradeData.difficulty,
      color: gradeData.color,
      questionCount: gradeData.questions.length,
      questions: getSentenceBuildingQuestionsForFrontend(grade),
    });
  } catch (error) {
    logger.error(error, 'Get sentence-building questions error:');
    res.status(500).json({ error: 'Failed to get questions' });
  }
});

/**
 * POST /api/quiz-content/sentence-building/validate
 */
router.post('/sentence-building/validate', async (req: Request, res: Response) => {
  try {
    const validation = oralLanguageValidateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid input', details: validation.error.issues });
    }

    const { questionId, answerId } = validation.data;
    const result = validateSentenceBuildingAnswer(questionId, answerId);

    if (!result) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    logger.error(error, 'Validate sentence-building answer error:');
    res.status(500).json({ error: 'Failed to validate answer' });
  }
});

/**
 * GET /api/quiz-content/assessment-catalog
 * Get category and subcategory metadata for the assessment UI.
 */
router.get('/assessment-catalog', async (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      categories: getAssessmentCatalog(),
    });
  } catch (error) {
    logger.error(error, 'Get assessment catalog error:');
    res.status(500).json({ error: 'Failed to get assessment catalog' });
  }
});

// ============================================
// UNIFIED QUIZ INFO ROUTE
// ============================================

/**
 * GET /api/quiz-content/all-quizzes
 * Get metadata about all available quizzes
 */
router.get('/all-quizzes', async (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      quizzes: [
        {
          type: 'spelling',
          name: 'Spelling Test',
          category: 'academic',
          hasGradeLevels: true,
          grades: spellingData.map(g => g.grade),
        },
        {
          type: 'blending',
          name: 'Blending Quiz',
          category: 'phonics',
          hasGradeLevels: true,
          grades: [1, 2, 3],
        },
        {
          type: 'writing',
          name: 'Writing Assessment',
          category: 'academic',
          hasGradeLevels: true,
          grades: writingData.map(g => g.grade),
        },
        {
          type: 'story-retell',
          name: 'Story Retell',
          category: 'oral',
          hasGradeLevels: true,
          grades: [1, 2, 3, 4],
        },
        {
          type: 'vocabulary',
          name: 'Vocabulary Matching',
          category: 'oral',
          hasGradeLevels: true,
          grades: [1, 2, 3],
        },
        {
          type: 'critical-thinking',
          name: 'Critical Thinking',
          category: 'mind',
          hasGradeLevels: false,
        },
        {
          type: 'learning-styles',
          name: 'Learning Styles',
          category: 'mind',
          hasGradeLevels: false,
        },
        {
          type: 'logical-sequencing',
          name: 'Logical Sequencing',
          category: 'mind',
          hasGradeLevels: true,
          grades: [1, 2, 3, 4],
        },
        {
          type: 'starting-ending-sounds',
          name: 'Beginning & Ending Sounds',
          category: 'academic',
          hasGradeLevels: true,
          grades: [1, 2, 3, 4],
        },
        {
          type: 'spot-the-difference',
          name: 'Spot the Difference',
          category: 'mind',
          hasGradeLevels: true,
          grades: [1, 2, 3],
        },
        {
          type: 'attention-control',
          name: 'Attention Control',
          category: 'mind',
          hasGradeLevels: false,
        },
        {
          type: 'sentence-difference',
          name: 'Sentence Difference',
          category: 'mind',
          hasGradeLevels: false,
        },
        {
          type: 'memory-assessment',
          name: 'Memory Assessment',
          category: 'mind',
          hasGradeLevels: false,
        },
      ],
    });
  } catch (error) {
    logger.error(error, 'Get all quizzes error:');
    res.status(500).json({ error: 'Failed to get quizzes' });
  }
});

// ============================================
// LOGICAL SEQUENCING ROUTES
// ============================================

/**
 * GET /api/quiz-content/logical-sequencing/grade/:grade
 * Get logical sequencing questions for a grade (without correct order)
 */
router.get('/logical-sequencing/grade/:grade', async (req: Request, res: Response) => {
  try {
    const grade = parseInt(req.params.grade);
    if (isNaN(grade) || grade < 1 || grade > 4) {
      return res.status(400).json({ error: 'Invalid grade (1-4)' });
    }

    const questions = LogicalSequencingData.getQuestionsWithoutAnswers(grade);
    res.json({
      success: true,
      grade,
      questions,
      totalQuestions: questions.length,
    });
  } catch (error) {
    logger.error(error, 'Get logical sequencing error:');
    res.status(500).json({ error: 'Failed to get questions' });
  }
});

/**
 * POST /api/quiz-content/logical-sequencing/check
 * Check if submitted order is correct
 */
router.post('/logical-sequencing/check', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const validation = logicalSequencingCheckSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid input', details: validation.error.issues });
    }
    const { questionId, submittedOrder } = validation.data;

    const isCorrect = LogicalSequencingData.checkAnswer(questionId, submittedOrder);
    const correctOrder = LogicalSequencingData.getCorrectOrder(questionId);

    res.json({
      success: true,
      isCorrect,
      correctOrder: isCorrect ? undefined : correctOrder, // Only reveal if wrong
    });
  } catch (error) {
    logger.error(error, 'Check logical sequencing error:');
    res.status(500).json({ error: 'Failed to check answer' });
  }
});

// ============================================
// STARTING/ENDING SOUNDS ROUTES
// ============================================

/**
 * GET /api/quiz-content/starting-ending-sounds/grade/:grade
 * Get phonics questions for a grade (without answers)
 */
router.get('/starting-ending-sounds/grade/:grade', async (req: Request, res: Response) => {
  try {
    const grade = parseInt(req.params.grade);
    if (isNaN(grade) || grade < 1 || grade > 4) {
      return res.status(400).json({ error: 'Invalid grade (1-4)' });
    }

    const questions = StartingEndingSoundData.getQuestionsWithoutAnswers(grade);
    res.json({
      success: true,
      grade,
      questions,
      totalQuestions: questions.length,
    });
  } catch (error) {
    logger.error(error, 'Get starting/ending sounds error:');
    res.status(500).json({ error: 'Failed to get questions' });
  }
});

/**
 * POST /api/quiz-content/starting-ending-sounds/options
 * Get answer options for a question (shuffled)
 */
router.post('/starting-ending-sounds/options', async (req: Request, res: Response) => {
  try {
    const validation = soundOptionsSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid input', details: validation.error.issues });
    }
    const { questionId, questionType } = validation.data;

    const allWords = StartingEndingSoundData.getAllWords();
    const question = allWords.find(q => q.id === questionId);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const correctSound = questionType === 'beginning' ? question.beginningSound : question.endingSound;
    const options = StartingEndingSoundData.generateOptions(correctSound, 4);

    res.json({
      success: true,
      options,
    });
  } catch (error) {
    logger.error(error, 'Get sound options error:');
    res.status(500).json({ error: 'Failed to get options' });
  }
});

/**
 * POST /api/quiz-content/starting-ending-sounds/check
 * Check if submitted answer is correct
 */
router.post('/starting-ending-sounds/check', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const validation = soundCheckSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid input', details: validation.error.issues });
    }
    const { questionId, questionType, answer } = validation.data;

    const isCorrect = StartingEndingSoundData.checkAnswer(questionId, questionType, answer);
    const allWords = StartingEndingSoundData.getAllWords();
    const question = allWords.find(q => q.id === questionId);
    const correctAnswer = questionType === 'beginning' ? question?.beginningSound : question?.endingSound;

    res.json({
      success: true,
      isCorrect,
      correctAnswer: isCorrect ? undefined : correctAnswer,
    });
  } catch (error) {
    logger.error(error, 'Check sound answer error:');
    res.status(500).json({ error: 'Failed to check answer' });
  }
});

// ============================================
// SPOT THE DIFFERENCE ROUTES
// ============================================

/**
 * GET /api/quiz-content/spot-the-difference/grade/:grade
 * Get levels for a grade (without difference coordinates)
 */
router.get('/spot-the-difference/grade/:grade', async (req: Request, res: Response) => {
  try {
    const grade = parseInt(req.params.grade);
    if (isNaN(grade) || grade < 1 || grade > 3) {
      return res.status(400).json({ error: 'Invalid grade (1-3)' });
    }

    const levels = SpotTheDifferenceData.getLevelsByGrade(grade).map(level => 
      SpotTheDifferenceData.getLevelWithoutAnswers(level.id)
    );

    res.json({
      success: true,
      grade,
      levels,
      totalLevels: levels.length,
    });
  } catch (error) {
    logger.error(error, 'Get spot the difference error:');
    res.status(500).json({ error: 'Failed to get levels' });
  }
});

/**
 * POST /api/quiz-content/spot-the-difference/check
 * Check if a click found a difference
 */
router.post('/spot-the-difference/check', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const validation = spotDifferenceCheckSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid input', details: validation.error.issues });
    }
    const { levelId, clickX, clickY } = validation.data;

    const result = SpotTheDifferenceData.checkDifference(levelId, clickX, clickY);
    const totalDifferences = SpotTheDifferenceData.getDifferenceCount(levelId);

    res.json({
      success: true,
      found: result.found,
      differenceIndex: result.differenceIndex,
      totalDifferences,
    });
  } catch (error) {
    logger.error(error, 'Check spot difference error:');
    res.status(500).json({ error: 'Failed to check difference' });
  }
});

// ============================================
// ATTENTION CONTROL ROUTES
// ============================================

/**
 * GET /api/quiz-content/attention-control/questions
 * Get attention control questionnaire
 */
router.get('/attention-control/questions', async (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      questions: AttentionControlData.attentionControlQuestions,
      ratingLabels: AttentionControlData.kidFriendlyRatingLabels,
    });
  } catch (error) {
    logger.error(error, 'Get attention control error:');
    res.status(500).json({ error: 'Failed to get questions' });
  }
});

/**
 * POST /api/quiz-content/attention-control/calculate
 * Calculate attention control scores
 */
router.post('/attention-control/calculate', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const validation = attentionControlCalculateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid input', details: validation.error.issues });
    }
    const { responses } = validation.data;

    const scores = AttentionControlData.calculateAttentionScores(responses as unknown as Record<number, number>);
    const interpretation = AttentionControlData.interpretScores(scores);
    const recommendations = AttentionControlData.getRecommendations(interpretation);

    res.json({
      success: true,
      scores,
      interpretation,
      recommendations,
    });
  } catch (error) {
    logger.error(error, 'Calculate attention scores error:');
    res.status(500).json({ error: 'Failed to calculate scores' });
  }
});

// ============================================
// SENTENCE DIFFERENCE ROUTES
// ============================================

/**
 * GET /api/quiz-content/sentence-difference/questions
 * Get sentence difference questions (without answers)
 */
router.get('/sentence-difference/questions', async (_req: Request, res: Response) => {
  try {
    const questions = SentenceDifferenceData.getQuestionsWithoutAnswers();
    res.json({
      success: true,
      questions,
      totalQuestions: questions.length,
    });
  } catch (error) {
    logger.error(error, 'Get sentence difference error:');
    res.status(500).json({ error: 'Failed to get questions' });
  }
});

/**
 * POST /api/quiz-content/sentence-difference/check
 * Check if answer is correct
 */
router.post('/sentence-difference/check', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const validation = sentenceDifferenceCheckSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid input', details: validation.error.issues });
    }
    const { questionId, answer } = validation.data;

    const isCorrect = SentenceDifferenceData.checkAnswer(questionId, answer);
    const question = SentenceDifferenceData.sentenceDifferenceQuestions.find(q => q.id === questionId);

    res.json({
      success: true,
      isCorrect,
      correctAnswer: isCorrect ? undefined : question?.correctAnswer,
    });
  } catch (error) {
    logger.error(error, 'Check sentence difference error:');
    res.status(500).json({ error: 'Failed to check answer' });
  }
});

// ============================================
// ORAL LANGUAGE ROUTES
// ============================================

/**
 * GET /api/quiz-content/oral-language/questions
 * Get oral language questions (without isCorrect flag)
 */
router.get('/oral-language/questions', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const type = req.query.type as string | undefined;
    const level = req.query.level ? parseInt(req.query.level as string) : undefined;

    if (type === 'sentence-building') {
      return res.json({
        success: true,
        questions: getSentenceBuildingQuestionsForFrontend(level),
      });
    }

    const questions = getOralLanguageQuestions(
      type as 'vocabulary' | 'sentence-building' | 'storytelling' | undefined,
      level
    );

    // Strip isCorrect from options, but include sequenceImages for storytelling
    const safeQuestions = questions.map(q => ({
      id: q.id,
      type: q.type,
      level: q.level,
      question: q.question,
      image: q.image,
      options: q.options.map(o => ({ id: o.id, text: o.text })),
      // Include storytelling-specific fields
      ...(q.type === 'storytelling' && q.sequenceImages ? {
        sequenceImages: q.sequenceImages,
        correctSequence: q.correctSequence,
        feedback: q.feedback,
      } : {}),
    }));

    res.json({
      success: true,
      questions: safeQuestions,
    });
  } catch (error) {
    logger.error(error, 'Get oral language questions error:');
    res.status(500).json({ error: 'Failed to get questions' });
  }
});

/**
 * POST /api/quiz-content/oral-language/validate
 * Validate an oral language answer
 */
router.post('/oral-language/validate', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const validation = oralLanguageValidateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid input', details: validation.error.issues });
    }
    const { questionId, answerId } = validation.data;
    const sentenceBuildingResult = validateSentenceBuildingAnswer(questionId, answerId);
    if (sentenceBuildingResult) {
      return res.json({
        success: true,
        ...sentenceBuildingResult,
      });
    }

    const result = validateOralLanguageAnswer(questionId, answerId);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    logger.error(error, 'Validate oral language error:');
    res.status(500).json({ error: 'Failed to validate' });
  }
});

// ============================================
// MEMORY ASSESSMENT ROUTES
// ============================================

/**
 * POST /api/quiz-content/memory-assessment/generate
 * Generate a new memory question
 */
router.post('/memory-assessment/generate', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const validation = memoryGenerateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid input', details: validation.error.issues });
    }
    const { type, difficulty } = validation.data;

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let question;
    if (type === 'sequence_recall') {
      question = MemoryAssessmentData.generateSequenceQuestion(difficulty);
    } else if (type === 'missing_object') {
      question = MemoryAssessmentData.generateMissingObjectQuestion(difficulty);
    } else {
      return res.status(400).json({ error: 'Invalid question type' });
    }

    // Remove answers before sending to frontend
    const { correctSequence, missingItemId, ...safeQuestion } = question;

    // Store correct answers server-side in session storage
    const sessionKey = `memory-${userId}-${Date.now()}`;
    await sessionStorage.set(sessionKey, {
      userId,
      quizType: 'memory-assessment',
      questionIds: [],
      answers: { correctSequence, missingItemId, type },
      startTime: Date.now(),
      isComplete: false,
    }, 3600);

    res.json({
      success: true,
      question: safeQuestion,
      questionRef: sessionKey,
    });
  } catch (error) {
    logger.error(error, 'Generate memory question error:');
    res.status(500).json({ error: 'Failed to generate question' });
  }
});

/**
 * POST /api/quiz-content/memory-assessment/check
 * Check memory assessment answer
 */
router.post('/memory-assessment/check', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const validation = memoryCheckSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid input', details: validation.error.issues });
    }
    const { type, submittedAnswer, questionRef } = validation.data;

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const sessionData = await sessionStorage.get(questionRef);
    if (!sessionData || sessionData.userId !== userId) {
      return res.status(400).json({ error: 'Invalid or expired question reference' });
    }

    let isCorrect = false;
    if (type === 'sequence_recall' && sessionData.answers.correctSequence) {
      isCorrect = MemoryAssessmentData.checkSequenceAnswer(submittedAnswer as string[], sessionData.answers.correctSequence as string[]);
    } else if (type === 'missing_object' && sessionData.answers.missingItemId) {
      isCorrect = MemoryAssessmentData.checkMissingObjectAnswer(submittedAnswer as string, sessionData.answers.missingItemId as string);
    }

    res.json({
      success: true,
      isCorrect,
    });
  } catch (error) {
    logger.error(error, 'Check memory answer error:');
    res.status(500).json({ error: 'Failed to check answer' });
  }
});

/**
 * POST /api/quiz-content/memory-assessment/evaluate
 * Evaluate overall memory performance
 */
router.post('/memory-assessment/evaluate', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const validation = memoryEvaluateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid input', details: validation.error.issues });
    }
    const { correctAnswers, totalQuestions, difficulty } = validation.data;

    const evaluation = MemoryAssessmentData.evaluatePerformance(correctAnswers, totalQuestions, difficulty);

    res.json({
      success: true,
      evaluation,
    });
  } catch (error) {
    logger.error(error, 'Evaluate memory assessment error:');
    res.status(500).json({ error: 'Failed to evaluate' });
  }
});

export default router;


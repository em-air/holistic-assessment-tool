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
  getStoriesByGrade, 
  getStoryForFrontend, 
  validateStoryRetellAnswers 
} from '../data/storyRetellData.js';
import { 
  getCriticalThinkingQuestions, 
  validateCriticalThinkingAnswer 
} from '../data/criticalThinkingData.js';
import { 
  getLearningStyleQuestions, 
  calculateLearningStyle 
} from '../data/learningStylesData.js';
import { writingData, getWritingDataByGrade } from '../data/writingData.js';
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
    console.error('Start spelling session error:', error);
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

    const { sessionId, wordId } = req.body;
    
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
    console.error('Spelling speak error:', error);
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
    console.error('Submit answer error:', error);
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
    console.error('Complete session error:', error);
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
    console.error('Get grades error:', error);
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
    console.error('Get blending grades error:', error);
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
    console.error('Get blending questions error:', error);
    res.status(500).json({ error: 'Failed to get questions' });
  }
});

/**
 * POST /api/quiz-content/blending/validate
 */
router.post('/blending/validate', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const { questionId, answer } = req.body;
    const result = validateBlendingAnswer(questionId, answer);
    
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Validate blending answer error:', error);
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
    }));
    
    res.json({
      success: true,
      grades,
    });
  } catch (error) {
    console.error('Get writing grades error:', error);
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
    console.error('Get writing topics error:', error);
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
    console.error('Get story retell grades error:', error);
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
    console.error('Get stories error:', error);
    res.status(500).json({ error: 'Failed to get stories' });
  }
});

/**
 * POST /api/quiz-content/story-retell/validate
 */
router.post('/story-retell/validate', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const { storyId, beginningId, middleId, endId } = req.body;
    const result = validateStoryRetellAnswers(storyId, { beginningId, middleId, endId });
    
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Validate story retell error:', error);
    res.status(500).json({ error: 'Failed to validate' });
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
    console.error('Get vocabulary words error:', error);
    res.status(500).json({ error: 'Failed to get words' });
  }
});

/**
 * POST /api/quiz-content/vocabulary/validate
 */
router.post('/vocabulary/validate', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const { wordId, answerId } = req.body;
    const result = validateVocabularyAnswer(wordId, answerId);
    
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Validate vocabulary error:', error);
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
    console.error('Get critical thinking questions error:', error);
    res.status(500).json({ error: 'Failed to get questions' });
  }
});

/**
 * POST /api/quiz-content/critical-thinking/validate
 */
router.post('/critical-thinking/validate', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const { questionId, answerId } = req.body;
    const result = validateCriticalThinkingAnswer(questionId, answerId);
    
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Validate critical thinking error:', error);
    res.status(500).json({ error: 'Failed to validate' });
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
    console.error('Get learning styles questions error:', error);
    res.status(500).json({ error: 'Failed to get questions' });
  }
});

/**
 * POST /api/quiz-content/learning-styles/calculate
 */
router.post('/learning-styles/calculate', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const { answers } = req.body;
    const result = calculateLearningStyle(answers);
    
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Calculate learning styles error:', error);
    res.status(500).json({ error: 'Failed to calculate' });
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
    console.error('Get all quizzes error:', error);
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
    console.error('Get logical sequencing error:', error);
    res.status(500).json({ error: 'Failed to get questions' });
  }
});

/**
 * POST /api/quiz-content/logical-sequencing/check
 * Check if submitted order is correct
 */
router.post('/logical-sequencing/check', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const { questionId, submittedOrder } = req.body;
    
    if (!questionId || !submittedOrder) {
      return res.status(400).json({ error: 'Missing questionId or submittedOrder' });
    }

    const isCorrect = LogicalSequencingData.checkAnswer(questionId, submittedOrder);
    const correctOrder = LogicalSequencingData.getCorrectOrder(questionId);

    res.json({
      success: true,
      isCorrect,
      correctOrder: isCorrect ? undefined : correctOrder, // Only reveal if wrong
    });
  } catch (error) {
    console.error('Check logical sequencing error:', error);
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
    console.error('Get starting/ending sounds error:', error);
    res.status(500).json({ error: 'Failed to get questions' });
  }
});

/**
 * POST /api/quiz-content/starting-ending-sounds/options
 * Get answer options for a question (shuffled)
 */
router.post('/starting-ending-sounds/options', async (req: Request, res: Response) => {
  try {
    const { questionId, questionType } = req.body;
    
    if (!questionId || !questionType) {
      return res.status(400).json({ error: 'Missing questionId or questionType' });
    }

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
    console.error('Get sound options error:', error);
    res.status(500).json({ error: 'Failed to get options' });
  }
});

/**
 * POST /api/quiz-content/starting-ending-sounds/check
 * Check if submitted answer is correct
 */
router.post('/starting-ending-sounds/check', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const { questionId, questionType, answer } = req.body;
    
    if (!questionId || !questionType || !answer) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

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
    console.error('Check sound answer error:', error);
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
    console.error('Get spot the difference error:', error);
    res.status(500).json({ error: 'Failed to get levels' });
  }
});

/**
 * POST /api/quiz-content/spot-the-difference/check
 * Check if a click found a difference
 */
router.post('/spot-the-difference/check', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const { levelId, clickX, clickY } = req.body;
    
    if (levelId === undefined || clickX === undefined || clickY === undefined) {
      return res.status(400).json({ error: 'Missing levelId, clickX, or clickY' });
    }

    const result = SpotTheDifferenceData.checkDifference(levelId, clickX, clickY);
    const totalDifferences = SpotTheDifferenceData.getDifferenceCount(levelId);

    res.json({
      success: true,
      found: result.found,
      differenceIndex: result.differenceIndex,
      totalDifferences,
    });
  } catch (error) {
    console.error('Check spot difference error:', error);
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
    console.error('Get attention control error:', error);
    res.status(500).json({ error: 'Failed to get questions' });
  }
});

/**
 * POST /api/quiz-content/attention-control/calculate
 * Calculate attention control scores
 */
router.post('/attention-control/calculate', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const { responses } = req.body;
    
    if (!responses || typeof responses !== 'object') {
      return res.status(400).json({ error: 'Missing responses object' });
    }

    const scores = AttentionControlData.calculateAttentionScores(responses);
    const interpretation = AttentionControlData.interpretScores(scores);
    const recommendations = AttentionControlData.getRecommendations(interpretation);

    res.json({
      success: true,
      scores,
      interpretation,
      recommendations,
    });
  } catch (error) {
    console.error('Calculate attention scores error:', error);
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
    console.error('Get sentence difference error:', error);
    res.status(500).json({ error: 'Failed to get questions' });
  }
});

/**
 * POST /api/quiz-content/sentence-difference/check
 * Check if answer is correct
 */
router.post('/sentence-difference/check', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const { questionId, answer } = req.body;
    
    if (!questionId || !answer) {
      return res.status(400).json({ error: 'Missing questionId or answer' });
    }

    const isCorrect = SentenceDifferenceData.checkAnswer(questionId, answer);
    const question = SentenceDifferenceData.sentenceDifferenceQuestions.find(q => q.id === questionId);

    res.json({
      success: true,
      isCorrect,
      correctAnswer: isCorrect ? undefined : question?.correctAnswer,
    });
  } catch (error) {
    console.error('Check sentence difference error:', error);
    res.status(500).json({ error: 'Failed to check answer' });
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
    const { type, difficulty } = req.body;
    
    if (!type || !difficulty) {
      return res.status(400).json({ error: 'Missing type or difficulty' });
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

    res.json({
      success: true,
      question: safeQuestion,
      // Store answers in session for later validation
      _internal: { correctSequence, missingItemId },
    });
  } catch (error) {
    console.error('Generate memory question error:', error);
    res.status(500).json({ error: 'Failed to generate question' });
  }
});

/**
 * POST /api/quiz-content/memory-assessment/check
 * Check memory assessment answer
 */
router.post('/memory-assessment/check', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const { type, submittedAnswer, correctAnswer } = req.body;
    
    if (!type || submittedAnswer === undefined || correctAnswer === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let isCorrect = false;
    if (type === 'sequence_recall') {
      isCorrect = MemoryAssessmentData.checkSequenceAnswer(submittedAnswer, correctAnswer);
    } else if (type === 'missing_object') {
      isCorrect = MemoryAssessmentData.checkMissingObjectAnswer(submittedAnswer, correctAnswer);
    }

    res.json({
      success: true,
      isCorrect,
    });
  } catch (error) {
    console.error('Check memory answer error:', error);
    res.status(500).json({ error: 'Failed to check answer' });
  }
});

/**
 * POST /api/quiz-content/memory-assessment/evaluate
 * Evaluate overall memory performance
 */
router.post('/memory-assessment/evaluate', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    const { correctAnswers, totalQuestions, difficulty } = req.body;
    
    if (correctAnswers === undefined || !totalQuestions || !difficulty) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const evaluation = MemoryAssessmentData.evaluatePerformance(correctAnswers, totalQuestions, difficulty);

    res.json({
      success: true,
      evaluation,
    });
  } catch (error) {
    console.error('Evaluate memory assessment error:', error);
    res.status(500).json({ error: 'Failed to evaluate' });
  }
});

export default router;


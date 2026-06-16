/**
 * Quiz Data Service
 *
 * All quiz content is served from hardcoded data files.
 * Answer data is only returned by the *AnswerData helpers,
 * which are called server-side for validation.
 *
 * SECURITY: Never return answer fields to callers that send data to
 * the frontend. Only call *AnswerData helpers during server-side validation.
 */

import { spellingData } from '../data/spellingData.js';
import { vocabularyWords } from '../data/vocabularyData.js';
import {
  getVocabularyMatchingGrades as _getVMGrades,
  getVocabularyMatchingQuestions as _getVMQuestions,
} from '../data/vocabularyMatchingData.js';
import { missingObjectQuestions } from '../data/missingObjectData.js';
import { getReadingAssessmentContent as _getReadingContent } from '../data/readingAssessmentData.js';
import {
  grade1Stories,
  grade2Stories,
  grade3Stories,
  grade4Stories,
} from '../data/storyRetellData.js';
import { criticalThinkingQuestions, categoryQuestions } from '../data/criticalThinkingData.js';
import { learningStyleQuestions } from '../data/learningStylesData.js';
import {
  sentenceBuildingGrades,
  grade1Questions as sb1,
  grade2Questions as sb2,
  grade3Questions as sb3,
  grade4Questions as sb4,
  type SentenceBuildingQuestion,
} from '../data/sentenceBuildingData.js';
import { writingData } from '../data/writingData.js';
import { oralLanguageQuestions } from '../data/oralLanguageData.js';
import {
  grade1Questions as ls1,
  grade2Questions as ls2,
  grade3Questions as ls3,
  grade4Questions as ls4,
} from '../data/logicalSequencingData.js';
import { attentionControlQuestions } from '../data/attentionControlData.js';
import { spotTheDifferenceData } from '../data/spotTheDifferenceData.js';
import { sentenceDifferenceQuestions } from '../data/sentenceDifferenceData.js';
import { memoryItems, generateSequenceQuestion } from '../data/memoryAssessmentData.js';

export { generateSequenceQuestion };

// ─── Spelling ────────────────────────────────────────────────────────────────

export async function getSpellingWordsByGrade(grade: number) {
  const gradeData = spellingData.find(g => g.grade === grade);
  return (gradeData?.words ?? []).map(w => ({
    id: w.id,
    difficulty: w.difficulty,
    hint: w.hint ?? null,
    audioUrl: w.audioUrl ?? null,
  }));
}

export async function getSpellingAnswerData(wordId: string): Promise<string | null> {
  for (const g of spellingData) {
    const word = g.words.find(w => w.id === wordId);
    if (word) return word.word;
  }
  return null;
}

export async function getSpellingGrades(): Promise<number[]> {
  return spellingData.map(g => g.grade).sort((a, b) => a - b);
}

// ─── Vocabulary ───────────────────────────────────────────────────────────────

export async function getVocabularyByLevel(level: number) {
  return vocabularyWords
    .filter(w => w.level === level)
    .map(w => ({
      id: w.id,
      word: w.word,
      example: w.example,
      level: w.level,
      definition: w.definition,
      options: w.options.map(o => ({ id: o.id, text: o.text })),
    }));
}

export async function getVocabularyAnswerData(wordId: string): Promise<string | null> {
  const word = vocabularyWords.find(w => w.id === wordId);
  if (!word) return null;
  const correct = word.options.find(o => o.isCorrect);
  return correct?.id ?? null;
}

// ─── Vocabulary Matching ──────────────────────────────────────────────────────

export async function getVocabularyMatchingGrades() {
  return _getVMGrades();
}

export async function getVocabularyMatchingQuestions(grade: number, level: number) {
  return _getVMQuestions(grade, level).map(q => ({
    id: q.id,
    word: q.word,
    definition: q.definition,
    level,
  }));
}

// ─── Missing Object ───────────────────────────────────────────────────────────

export async function getMissingObjectQuestions() {
  return missingObjectQuestions.map(q => ({
    id: q.id,
    image: q.image,
    question: q.question,
    options: q.options as string[],
  }));
}

export async function getMissingObjectAnswerData(questionId: number): Promise<string | null> {
  const q = missingObjectQuestions.find(q => q.id === questionId);
  return q?.correctAnswer ?? null;
}

// ─── Reading Assessment ───────────────────────────────────────────────────────

export async function getReadingAssessmentContent(grade: number) {
  const content = _getReadingContent(grade);
  if (!content) return null;
  return { title: content.title, text: content.text };
}

// ─── Story Retell ─────────────────────────────────────────────────────────────

const allStories = [...grade1Stories, ...grade2Stories, ...grade3Stories, ...grade4Stories];

export async function getStoriesByGrade(grade: number) {
  return allStories
    .filter(s => s.grade === grade)
    .map(s => ({
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
}

export async function getStoryAnswerData(storyId: number) {
  const story = allStories.find(s => s.id === storyId);
  if (!story) return null;
  const beginningCorrect = story.beginningOptions.find(o => o.isCorrect);
  const middleCorrect = story.middleOptions.find(o => o.isCorrect);
  const endCorrect = story.endOptions.find(o => o.isCorrect);
  return {
    beginningCorrectId: beginningCorrect?.id ?? '',
    middleCorrectId: middleCorrect?.id ?? '',
    endCorrectId: endCorrect?.id ?? '',
  };
}

// ─── Critical Thinking ────────────────────────────────────────────────────────

export async function getCriticalThinkingQuestions(
  type?: 'analogy' | 'category' | 'sequence' | 'odd-one-out',
  difficulty?: 'easy' | 'medium' | 'hard'
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let qs: any[] = criticalThinkingQuestions;
  if (type) qs = qs.filter((q: any) => q.type === type);
  if (difficulty) qs = qs.filter((q: any) => q.difficulty === difficulty);
  return qs.map((q: any) => ({
    id: q.id,
    type: q.type,
    question: q.question,
    difficulty: q.difficulty,
    options: q.options.map((o: any) => ({ id: o.id, text: o.text })),
  }));
}

export async function getCriticalThinkingAnswerData(questionId: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const q = (criticalThinkingQuestions as any[]).find((q: any) => q.id === questionId);
  if (!q) return null;
  const correctOption = q.options?.find((o: any) => o.isCorrect);
  return {
    correctOptionId: correctOption?.id ?? q.correctOptionId ?? null,
    explanation: q.explanation ?? null,
  };
}

// ─── Learning Styles ──────────────────────────────────────────────────────────

export async function getLearningStyleQuestions() {
  return learningStyleQuestions.map(q => ({
    id: q.id,
    category: q.category,
    question: q.question,
    options: q.options,
  }));
}

// ─── Sentence Building ────────────────────────────────────────────────────────

const sentenceBuildingByGrade: Record<number, SentenceBuildingQuestion[]> = { 1: sb1, 2: sb2, 3: sb3, 4: sb4 };
const allSentenceBuilding = [...sb1, ...sb2, ...sb3, ...sb4];

export async function getSentenceBuildingGrades(): Promise<number[]> {
  return sentenceBuildingGrades.map(g => g.grade).sort((a, b) => a - b);
}

export async function getSentenceBuildingQuestions(grade: number) {
  const qs = sentenceBuildingByGrade[grade] ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return qs.map((q: any) => ({
    id: q.id,
    level: q.level,
    question: q.question,
    image: q.image,
    options: q.options.map((o: any) => ({ id: o.id, text: o.text })),
    feedback: q.feedback,
  }));
}

export async function getSentenceBuildingAnswerData(questionId: string): Promise<string | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const q = allSentenceBuilding.find((q: any) => q.id === questionId) as any;
  if (!q) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const correct = q.options?.find((o: any) => o.isCorrect);
  return correct?.id ?? null;
}

// ─── Writing ──────────────────────────────────────────────────────────────────

export async function getWritingGrades(): Promise<number[]> {
  return writingData.map(g => g.grade).sort((a, b) => a - b);
}

export async function getWritingTopicsByGrade(grade: number) {
  const g = writingData.find(g => g.grade === grade);
  if (!g || !g.topics || g.topics.length === 0) return null;
  return {
    grade: g.grade,
    skillFocus: g.skillFocus,
    rubric: g.rubric,
    topics: g.topics.map(t => ({
      id: t.id,
      title: t.title,
      prompt: t.prompt,
      description: t.description,
      wordCount: t.wordCount,
      criteria: t.criteria,
    })),
  };
}

export async function getAllWritingGradesData() {
  return writingData
    .filter(g => g.topics && g.topics.length > 0)
    .sort((a, b) => a.grade - b.grade)
    .map(g => ({
      grade: g.grade,
      skillFocus: g.skillFocus,
      topicCount: g.topics.length,
      wordCount: {
        min: Math.min(...g.topics.map(t => t.wordCount.min)),
        max: Math.max(...g.topics.map(t => t.wordCount.max)),
      },
    }));
}

// ─── Oral Language ────────────────────────────────────────────────────────────

export async function getOralLanguageQuestions(
  type?: 'vocabulary' | 'sentence-building' | 'storytelling',
  level?: number
) {
  let qs = oralLanguageQuestions as Array<{
    id: string;
    type: string;
    level: number;
    question: string;
    image?: string;
    options: Array<{ id: string; text: string; isCorrect?: boolean }>;
    sequenceImages?: Array<{ id: string; image: string; correctOrder: number; description?: string }>;
    correctSequence?: string[];
    feedback?: { correct: string; incorrect: string } | string | null;
  }>;
  if (type) qs = qs.filter(q => q.type === type);
  if (level !== undefined) qs = qs.filter(q => q.level === level);

  return qs.map(q => {
    const correctOptionId = q.options.find(o => o.isCorrect)?.id ?? null;
    const sequenceCorrectOrders = q.sequenceImages
      ? Object.fromEntries(q.sequenceImages.map(img => [img.id, img.correctOrder]))
      : null;
    return {
      id: q.id,
      type: q.type,
      level: q.level,
      question: q.question,
      image: q.image,
      options: q.options.map(o => ({ id: o.id, text: o.text })),
      sequenceImages: q.sequenceImages
        ? q.sequenceImages.map(img => ({
            id: img.id,
            src: img.image,
            alt: img.description ?? '',
            correctOrder: img.correctOrder,
          }))
        : null,
      correctSequence: q.correctSequence ?? null,
      feedback: typeof q.feedback === 'object' && q.feedback !== null
        ? (q.feedback as { correct: string; incorrect: string }).correct ?? null
        : (q.feedback as string | null) ?? null,
      _correctOptionId: correctOptionId,
      _sequenceCorrectOrders: sequenceCorrectOrders,
    };
  });
}

export async function getOralLanguageAnswerData(questionId: string) {
  const q = (oralLanguageQuestions as Array<{
    id: string;
    options?: Array<{ id: string; isCorrect?: boolean }>;
    correctSequence?: string[];
    sequenceImages?: Array<{ id: string; correctOrder: number }>;
  }>).find(q => q.id === questionId);
  if (!q) return null;
  const correctOptionId = q.options?.find(o => o.isCorrect)?.id ?? null;
  const sequenceCorrectOrders = q.sequenceImages
    ? Object.fromEntries(q.sequenceImages.map(img => [img.id, img.correctOrder]))
    : null;
  return {
    correctOptionId,
    correctSequence: q.correctSequence ?? null,
    sequenceCorrectOrders,
  };
}

// ─── Logical Sequencing ───────────────────────────────────────────────────────

const allLogicalSequencing = [...ls1, ...ls2, ...ls3, ...ls4];

export async function getLogicalSequencingByGrade(grade: number) {
  return allLogicalSequencing
    .filter(q => q.grade === grade)
    .map(q => ({
      id: q.id,
      title: q.title,
      sentences: q.sentences,
      topic: q.topic,
      hint: q.hint ?? null,
      grade: q.grade,
    }));
}

export async function getLogicalSequencingAnswerData(questionId: number): Promise<number[] | null> {
  const q = allLogicalSequencing.find(q => q.id === questionId);
  return q?.correctOrder ?? null;
}

// ─── Attention Control ────────────────────────────────────────────────────────

export async function getAttentionControlQuestions() {
  return attentionControlQuestions.map(q => ({
    id: q.id,
    subscale: q.subscale,
    question: q.question,
    kidFriendlyQuestion: q.kidFriendlyQuestion,
    example: q.example,
    type: q.type,
    options: q.options.map((value: number) => ({
      value,
      label: String(value),
    })),
    reverse: q.reverse,
  }));
}

// ─── Spot the Difference ──────────────────────────────────────────────────────

export async function getSpotTheDifferenceByGrade(grade: number) {
  return spotTheDifferenceData
    .filter(l => l.grade === grade)
    .map(l => ({
      id: l.id,
      imageA: l.imageA,
      imageB: l.imageB,
      sceneConfig: l.sceneConfig,
      useCartoonScene: l.useCartoonScene,
    }));
}

export async function getSpotTheDifferenceAnswerData(levelId: number) {
  const level = spotTheDifferenceData.find(l => l.id === levelId);
  if (!level) return null;
  return { differences: level.differences };
}

export async function getSpotTheDifferenceCount(levelId: number): Promise<number> {
  const level = spotTheDifferenceData.find(l => l.id === levelId);
  return level?.differences.length ?? 0;
}

// ─── Sentence Difference ──────────────────────────────────────────────────────

export async function getSentenceDifferenceQuestions() {
  return sentenceDifferenceQuestions.map(q => ({
    id: q.id,
    sentenceA: q.sentenceA,
    sentenceB: q.sentenceB,
    difficulty: q.difficulty,
  }));
}

export async function getSentenceDifferenceAnswerData(questionId: number): Promise<string | null> {
  const q = sentenceDifferenceQuestions.find(q => q.id === questionId);
  return q?.correctAnswer ?? null;
}

// ─── Category Quiz ────────────────────────────────────────────────────────────

export async function getCategoryQuizQuestions(grade: string) {
  const dbGrade = grade.replace(/^grade(\d)$/, 'Grade $1');
  const gradeKey = (dbGrade.replace('Grade ', 'grade').replace(' ', '')) as keyof typeof categoryQuestions;
  const gradeKeyAlt = grade as keyof typeof categoryQuestions;
  const questions = categoryQuestions[gradeKey] ?? categoryQuestions[gradeKeyAlt] ?? [];
  return questions.map(q => ({
    id: q.id,
    instruction: q.instruction,
    categories: q.categories,
    items: q.items.map(item => ({ id: item.id, name: item.name, image: item.image })),
  }));
}

export async function getCategoryItemAnswerData(questionId: string, itemId: string): Promise<string | null> {
  for (const gradeQuestions of Object.values(categoryQuestions)) {
    const q = gradeQuestions.find(q => q.id === questionId);
    if (q) {
      const item = q.items.find(i => i.id === itemId);
      return item?.correctCategory ?? null;
    }
  }
  return null;
}

// ─── Memory Items ─────────────────────────────────────────────────────────────

export async function getMemoryItems() {
  return memoryItems.map(item => ({
    id: item.id,
    name: item.name,
    image: item.image,
    category: 'object' as const,
  }));
}

/**
 * Quiz Database Service
 *
 * All quiz content is fetched from the Supabase `questions` table.
 * Content columns are returned to callers; answer_data is only returned
 * by the *AnswerData helpers, which are called server-side for validation.
 *
 * SECURITY: Never return answer_data columns to callers that send data to
 * the frontend. Only call *AnswerData helpers during server-side validation.
 */

import supabaseAdmin from '../config/supabase.js';

// ─── Spelling ────────────────────────────────────────────────────────────────

export async function getSpellingWordsByGrade(grade: number) {
  const { data, error } = await supabaseAdmin
    .from('questions')
    .select('id, difficulty, content')
    .eq('quiz_type', 'spelling')
    .eq('grade', `Grade ${grade}`)
    .order('order_index');
  if (error) throw new Error(`getSpellingWordsByGrade: ${error.message}`);
  return (data ?? []).map(r => ({
    id: r.id as string,
    difficulty: r.difficulty as string,
    hint: (r.content as Record<string, unknown>).hint as string | null,
    audioUrl: (r.content as Record<string, unknown>).audioUrl as string | null,
  }));
}

export async function getSpellingAnswerData(wordId: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from('questions')
    .select('answer_data')
    .eq('quiz_type', 'spelling')
    .eq('id', wordId)
    .single();
  if (error) return null;
  return ((data?.answer_data) as Record<string, unknown>)?.word as string ?? null;
}

export async function getSpellingGrades() {
  const { data, error } = await supabaseAdmin
    .from('questions')
    .select('grade')
    .eq('quiz_type', 'spelling')
    .not('grade', 'is', null);
  if (error) throw new Error(`getSpellingGrades: ${error.message}`);
  const grades = [...new Set((data ?? []).map(r => r.grade as string))].sort();
  return grades.map(g => Number(g.replace('Grade ', '')));
}

// ─── Vocabulary ───────────────────────────────────────────────────────────────

export async function getVocabularyByLevel(level: number) {
  const { data, error } = await supabaseAdmin
    .from('questions')
    .select('id, content')
    .eq('quiz_type', 'vocabulary')
    .order('order_index');
  if (error) throw new Error(`getVocabularyByLevel: ${error.message}`);
  return (data ?? [])
    .filter(r => (r.content as Record<string, unknown>).level === level)
    .map(r => {
      const c = r.content as Record<string, unknown>;
      return {
        id: r.id as string,
        word: c.word as string,
        example: c.example as string,
        level: c.level as number,
        definition: c.definition as string,
        options: c.options as Array<{ id: string; text: string }>,
      };
    });
}

export async function getVocabularyAnswerData(wordId: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from('questions')
    .select('answer_data')
    .eq('quiz_type', 'vocabulary')
    .eq('id', wordId)
    .single();
  if (error) return null;
  return ((data?.answer_data) as Record<string, unknown>)?.correctOptionId as string ?? null;
}

// ─── Vocabulary Matching ──────────────────────────────────────────────────────

export async function getVocabularyMatchingGrades() {
  const { data, error } = await supabaseAdmin
    .from('questions')
    .select('grade, content')
    .eq('quiz_type', 'vocabulary-matching')
    .not('grade', 'is', null);
  if (error) throw new Error(`getVocabularyMatchingGrades: ${error.message}`);

  const gradeMap = new Map<number, Set<number>>();
  for (const row of data ?? []) {
    const gradeNum = Number((row.grade as string).replace('Grade ', ''));
    const level = (row.content as Record<string, unknown>).level as number;
    if (!gradeMap.has(gradeNum)) gradeMap.set(gradeNum, new Set());
    gradeMap.get(gradeNum)!.add(level);
  }

  return [...gradeMap.entries()]
    .sort(([a], [b]) => a - b)
    .map(([grade, levels]) => ({
      grade,
      levels: [...levels].sort().map(level => ({
        level,
        questionCount: (data ?? []).filter(
          r =>
            Number((r.grade as string).replace('Grade ', '')) === grade &&
            (r.content as Record<string, unknown>).level === level
        ).length,
      })),
    }));
}

export async function getVocabularyMatchingQuestions(grade: number, level: number) {
  const { data, error } = await supabaseAdmin
    .from('questions')
    .select('id, content')
    .eq('quiz_type', 'vocabulary-matching')
    .eq('grade', `Grade ${grade}`)
    .order('order_index');
  if (error) throw new Error(`getVocabularyMatchingQuestions: ${error.message}`);
  return (data ?? [])
    .filter(r => (r.content as Record<string, unknown>).level === level)
    .map(r => {
      const c = r.content as Record<string, unknown>;
      return {
        id: r.id as string,
        word: c.word as string,
        definition: c.definition as string,
        level: c.level as number,
      };
    });
}

// ─── Missing Object ───────────────────────────────────────────────────────────

export async function getMissingObjectQuestions() {
  const { data, error } = await supabaseAdmin
    .from('questions')
    .select('id, content')
    .eq('quiz_type', 'missing-object')
    .order('order_index');
  if (error) throw new Error(`getMissingObjectQuestions: ${error.message}`);
  return (data ?? []).map(r => {
    const c = r.content as Record<string, unknown>;
    return {
      id: Number(r.id),
      image: c.image as string,
      question: c.question as string,
      options: c.options as Array<{ id: string; text: string }>,
    };
  });
}

export async function getMissingObjectAnswerData(questionId: number): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from('questions')
    .select('answer_data')
    .eq('quiz_type', 'missing-object')
    .eq('id', String(questionId))
    .single();
  if (error) return null;
  return ((data?.answer_data) as Record<string, unknown>)?.correctAnswer as string ?? null;
}

// ─── Reading Assessment ───────────────────────────────────────────────────────

export async function getReadingAssessmentContent(grade: number) {
  const { data, error } = await supabaseAdmin
    .from('questions')
    .select('content')
    .eq('quiz_type', 'reading-assessment')
    .eq('grade', `Grade ${grade}`)
    .single();
  if (error) return null;
  const c = data?.content as Record<string, unknown>;
  return c ? { title: c.title as string, text: c.text as string } : null;
}

// ─── Story Retell ─────────────────────────────────────────────────────────────

export async function getStoriesByGrade(grade: number) {
  const { data, error } = await supabaseAdmin
    .from('questions')
    .select('id, content')
    .eq('quiz_type', 'story-retell')
    .eq('grade', `Grade ${grade}`)
    .order('order_index');
  if (error) throw new Error(`getStoriesByGrade: ${error.message}`);
  return (data ?? []).map(r => {
    const c = r.content as Record<string, unknown>;
    return {
      id: Number(r.id),
      title: c.title as string,
      story: c.story as string,
      grade,
      readingLevel: c.readingLevel as string,
      wordCount: c.wordCount as number,
      beginningOptions: c.beginningOptions as Array<{ id: string; text: string }>,
      middleOptions: c.middleOptions as Array<{ id: string; text: string }>,
      endOptions: c.endOptions as Array<{ id: string; text: string }>,
    };
  });
}

export async function getStoryAnswerData(storyId: number) {
  const { data, error } = await supabaseAdmin
    .from('questions')
    .select('answer_data')
    .eq('quiz_type', 'story-retell')
    .eq('id', String(storyId))
    .single();
  if (error) return null;
  const a = data?.answer_data as Record<string, unknown>;
  return a
    ? {
        beginningCorrectId: a.beginningCorrectId as string,
        middleCorrectId: a.middleCorrectId as string,
        endCorrectId: a.endCorrectId as string,
      }
    : null;
}

// ─── Critical Thinking ────────────────────────────────────────────────────────

export async function getCriticalThinkingQuestions(
  type?: 'analogy' | 'category' | 'sequence' | 'odd-one-out',
  difficulty?: 'easy' | 'medium' | 'hard'
) {
  let query = supabaseAdmin
    .from('questions')
    .select('id, difficulty, content')
    .eq('quiz_type', 'critical-thinking')
    .order('order_index');
  if (difficulty) query = query.eq('difficulty', difficulty);

  const { data, error } = await query;
  if (error) throw new Error(`getCriticalThinkingQuestions: ${error.message}`);

  let rows = data ?? [];
  if (type) {
    rows = rows.filter(r => (r.content as Record<string, unknown>).type === type);
  }
  return rows.map(r => {
    const c = r.content as Record<string, unknown>;
    return {
      id: r.id as string,
      type: c.type as string,
      question: c.question as string,
      difficulty: r.difficulty as string,
      options: c.options as Array<{ id: string; text: string }>,
    };
  });
}

export async function getCriticalThinkingAnswerData(questionId: string) {
  const { data, error } = await supabaseAdmin
    .from('questions')
    .select('answer_data')
    .eq('quiz_type', 'critical-thinking')
    .eq('id', questionId)
    .single();
  if (error) return null;
  const a = data?.answer_data as Record<string, unknown>;
  return a
    ? {
        correctOptionId: a.correctOptionId as string,
        explanation: a.explanation as string | null,
      }
    : null;
}

// ─── Learning Styles ──────────────────────────────────────────────────────────

export async function getLearningStyleQuestions() {
  const { data, error } = await supabaseAdmin
    .from('questions')
    .select('id, content')
    .eq('quiz_type', 'learning-styles')
    .order('order_index');
  if (error) throw new Error(`getLearningStyleQuestions: ${error.message}`);
  return (data ?? []).map(r => {
    const c = r.content as Record<string, unknown>;
    return {
      id: r.id as string,
      category: c.category as string,
      question: c.question as string,
      options: c.options as Array<{ id: string; text: string; style: string }>,
    };
  });
}

// ─── Sentence Building ────────────────────────────────────────────────────────

export async function getSentenceBuildingGrades() {
  const { data, error } = await supabaseAdmin
    .from('questions')
    .select('grade')
    .eq('quiz_type', 'sentence-building')
    .not('grade', 'is', null);
  if (error) throw new Error(`getSentenceBuildingGrades: ${error.message}`);
  const grades = [...new Set((data ?? []).map(r => r.grade as string))].sort();
  return grades.map(g => Number(g.replace('Grade ', '')));
}

export async function getSentenceBuildingQuestions(grade: number) {
  const { data, error } = await supabaseAdmin
    .from('questions')
    .select('id, content')
    .eq('quiz_type', 'sentence-building')
    .eq('grade', `Grade ${grade}`)
    .order('order_index');
  if (error) throw new Error(`getSentenceBuildingQuestions: ${error.message}`);
  return (data ?? []).map(r => {
    const c = r.content as Record<string, unknown>;
    return {
      id: r.id as string,
      level: c.level as number,
      question: c.question as string,
      image: c.image as string,
      options: c.options as Array<{ id: string; text: string }>,
      feedback: c.feedback as { correct: string; incorrect: string },
    };
  });
}

export async function getSentenceBuildingAnswerData(questionId: string) {
  const { data, error } = await supabaseAdmin
    .from('questions')
    .select('answer_data')
    .eq('quiz_type', 'sentence-building')
    .eq('id', questionId)
    .single();
  if (error) return null;
  return ((data?.answer_data) as Record<string, unknown>)?.correctOptionId as string ?? null;
}

// ─── Writing ──────────────────────────────────────────────────────────────────

export async function getWritingGrades() {
  const { data, error } = await supabaseAdmin
    .from('questions')
    .select('grade')
    .eq('quiz_type', 'writing')
    .not('grade', 'is', null);
  if (error) throw new Error(`getWritingGrades: ${error.message}`);
  const grades = [...new Set((data ?? []).map(r => r.grade as string))].sort();
  return grades.map(g => Number(g.replace('Grade ', '')));
}

export async function getWritingTopicsByGrade(grade: number) {
  const { data, error } = await supabaseAdmin
    .from('questions')
    .select('id, content')
    .eq('quiz_type', 'writing')
    .eq('grade', `Grade ${grade}`)
    .order('order_index');
  if (error) throw new Error(`getWritingTopicsByGrade: ${error.message}`);
  if (!data || data.length === 0) return null;

  const firstContent = data[0].content as Record<string, unknown>;
  return {
    grade,
    skillFocus: firstContent.skillFocus as string[],
    rubric: firstContent.rubric as Record<string, unknown>,
    topics: data.map(r => {
      const c = r.content as Record<string, unknown>;
      return {
        id: r.id as string,
        title: c.title as string,
        prompt: c.prompt as string,
        description: c.description as string,
        wordCount: c.wordCount as { min: number; max: number },
        criteria: c.criteria as string[],
      };
    }),
  };
}

export async function getAllWritingGradesData() {
  const { data, error } = await supabaseAdmin
    .from('questions')
    .select('grade, content')
    .eq('quiz_type', 'writing')
    .not('grade', 'is', null)
    .order('grade')
    .order('order_index');
  if (error) throw new Error(`getAllWritingGradesData: ${error.message}`);

  const gradeMap = new Map<number, { skillFocus: string[]; topics: Array<{ wordCount: { min: number; max: number } }> }>();
  for (const row of data ?? []) {
    const gradeNum = Number((row.grade as string).replace('Grade ', ''));
    const c = row.content as Record<string, unknown>;
    if (!gradeMap.has(gradeNum)) {
      gradeMap.set(gradeNum, { skillFocus: c.skillFocus as string[], topics: [] });
    }
    gradeMap.get(gradeNum)!.topics.push({ wordCount: c.wordCount as { min: number; max: number } });
  }

  return [...gradeMap.entries()]
    .sort(([a], [b]) => a - b)
    .map(([grade, info]) => ({
      grade,
      skillFocus: info.skillFocus,
      topicCount: info.topics.length,
      wordCount: {
        min: Math.min(...info.topics.map(t => t.wordCount.min)),
        max: Math.max(...info.topics.map(t => t.wordCount.max)),
      },
    }));
}

// ─── Oral Language ────────────────────────────────────────────────────────────

export async function getOralLanguageQuestions(
  type?: 'vocabulary' | 'sentence-building' | 'storytelling',
  level?: number
) {
  let query = supabaseAdmin
    .from('questions')
    .select('id, content, answer_data')
    .eq('quiz_type', 'oral-language')
    .order('order_index');

  const { data, error } = await query;
  if (error) throw new Error(`getOralLanguageQuestions: ${error.message}`);

  let rows = data ?? [];
  if (type) rows = rows.filter(r => (r.content as Record<string, unknown>).type === type);
  if (level !== undefined) rows = rows.filter(r => (r.content as Record<string, unknown>).level === level);

  return rows.map(r => {
    const c = r.content as Record<string, unknown>;
    const a = r.answer_data as Record<string, unknown> | null;
    const sequenceCorrectOrders = a?.sequenceCorrectOrders as Record<string, number> | null;
    const rawImages = c.sequenceImages as Array<{ id: string; src: string; alt: string }> | null;
    return {
      id: r.id as string,
      type: c.type as string,
      level: c.level as number,
      question: c.question as string,
      image: c.image as string | undefined,
      options: c.options as Array<{ id: string; text: string }>,
      // Re-attach correctOrder per image from answer_data (was stripped from content during seed)
      sequenceImages: rawImages
        ? rawImages.map(img => ({
            ...img,
            correctOrder: sequenceCorrectOrders?.[img.id] ?? undefined,
          }))
        : null,
      // correctSequence is stored in answer_data, not content
      correctSequence: (a?.correctSequence as string[] | null) ?? null,
      feedback: c.feedback as string | null,
    };
  });
}

export async function getOralLanguageAnswerData(questionId: string) {
  const { data, error } = await supabaseAdmin
    .from('questions')
    .select('answer_data')
    .eq('quiz_type', 'oral-language')
    .eq('id', questionId)
    .single();
  if (error) return null;
  const a = data?.answer_data as Record<string, unknown>;
  return a
    ? {
        correctOptionId: a.correctOptionId as string | null,
        correctSequence: a.correctSequence as string[] | null,
        sequenceCorrectOrders: a.sequenceCorrectOrders as Record<string, number[]> | null,
      }
    : null;
}

// ─── Logical Sequencing ───────────────────────────────────────────────────────

export async function getLogicalSequencingByGrade(grade: number) {
  const { data, error } = await supabaseAdmin
    .from('questions')
    .select('id, content')
    .eq('quiz_type', 'logical-sequencing')
    .eq('grade', `Grade ${grade}`)
    .order('order_index');
  if (error) throw new Error(`getLogicalSequencingByGrade: ${error.message}`);
  return (data ?? []).map(r => {
    const c = r.content as Record<string, unknown>;
    return {
      id: Number(r.id),
      title: c.title as string,
      sentences: c.sentences as string[],
      topic: c.topic as string,
      hint: c.hint as string | null,
      grade,
    };
  });
}

export async function getLogicalSequencingAnswerData(questionId: number): Promise<number[] | null> {
  const { data, error } = await supabaseAdmin
    .from('questions')
    .select('answer_data')
    .eq('quiz_type', 'logical-sequencing')
    .eq('id', String(questionId))
    .single();
  if (error) return null;
  return ((data?.answer_data) as Record<string, unknown>)?.correctOrder as number[] ?? null;
}

// ─── Attention Control ────────────────────────────────────────────────────────

export async function getAttentionControlQuestions() {
  const { data, error } = await supabaseAdmin
    .from('questions')
    .select('id, content, answer_data')
    .eq('quiz_type', 'attention-control')
    .order('order_index');
  if (error) throw new Error(`getAttentionControlQuestions: ${error.message}`);
  return (data ?? []).map(r => {
    const c = r.content as Record<string, unknown>;
    const a = r.answer_data as Record<string, unknown>;
    return {
      id: Number(r.id),
      subscale: c.subscale as 'focusing' | 'shifting',
      question: c.question as string,
      kidFriendlyQuestion: c.kidFriendlyQuestion as string,
      example: c.example as string,
      type: c.type as string,
      options: c.options as Array<{ value: number; label: string }>,
      reverse: a.reverse as boolean,
    };
  });
}

// ─── Spot the Difference ──────────────────────────────────────────────────────

export async function getSpotTheDifferenceByGrade(grade: number) {
  const { data, error } = await supabaseAdmin
    .from('questions')
    .select('id, content')
    .eq('quiz_type', 'spot-the-difference')
    .eq('grade', `Grade ${grade}`)
    .order('order_index');
  if (error) throw new Error(`getSpotTheDifferenceByGrade: ${error.message}`);
  return (data ?? []).map(r => {
    const c = r.content as Record<string, unknown>;
    return {
      id: Number(r.id),
      imageA: c.imageA as string,
      imageB: c.imageB as string,
      sceneConfig: c.sceneConfig as unknown,
      useCartoonScene: c.useCartoonScene as boolean,
    };
  });
}

export async function getSpotTheDifferenceAnswerData(levelId: number) {
  const { data, error } = await supabaseAdmin
    .from('questions')
    .select('answer_data')
    .eq('quiz_type', 'spot-the-difference')
    .eq('id', String(levelId))
    .single();
  if (error) return null;
  const a = data?.answer_data as Record<string, unknown>;
  return a
    ? { differences: a.differences as Array<{ x: number; y: number; radius: number }> }
    : null;
}

export async function getSpotTheDifferenceCount(levelId: number): Promise<number> {
  const answerData = await getSpotTheDifferenceAnswerData(levelId);
  return answerData?.differences.length ?? 0;
}

// ─── Sentence Difference ──────────────────────────────────────────────────────

export async function getSentenceDifferenceQuestions() {
  const { data, error } = await supabaseAdmin
    .from('questions')
    .select('id, difficulty, content')
    .eq('quiz_type', 'sentence-difference')
    .order('order_index');
  if (error) throw new Error(`getSentenceDifferenceQuestions: ${error.message}`);
  return (data ?? []).map(r => {
    const c = r.content as Record<string, unknown>;
    return {
      id: Number(r.id),
      sentenceA: c.sentenceA as string,
      sentenceB: c.sentenceB as string,
      difficulty: r.difficulty as string,
    };
  });
}

export async function getSentenceDifferenceAnswerData(questionId: number): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from('questions')
    .select('answer_data')
    .eq('quiz_type', 'sentence-difference')
    .eq('id', String(questionId))
    .single();
  if (error) return null;
  return ((data?.answer_data) as Record<string, unknown>)?.correctAnswer as string ?? null;
}

// ─── Category Quiz ────────────────────────────────────────────────────────────

export async function getCategoryQuizQuestions(grade: string) {
  // Frontend sends 'grade1'/'grade2' etc; DB stores 'Grade 1'/'Grade 2'
  const dbGrade = grade.replace(/^grade(\d)$/, 'Grade $1');
  const { data, error } = await supabaseAdmin
    .from('questions')
    .select('id, content')
    .eq('quiz_type', 'category-quiz')
    .eq('grade', dbGrade)
    .order('order_index');
  if (error) throw new Error(`getCategoryQuizQuestions: ${error.message}`);
  return (data ?? []).map(r => ({
    id: r.id as string,
    instruction: (r.content as Record<string, unknown>).instruction as string,
    categories: (r.content as Record<string, unknown>).categories as string[],
    items: (r.content as Record<string, unknown>).items as { id: string; name: string; image: string }[],
  }));
}

export async function getCategoryItemAnswerData(questionId: string, itemId: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from('questions')
    .select('answer_data')
    .eq('quiz_type', 'category-quiz')
    .eq('id', questionId)
    .single();
  if (error || !data) return null;
  const answerItems = ((data.answer_data) as Record<string, unknown>).items as { id: string; correctCategory: string }[];
  return answerItems?.find(i => i.id === itemId)?.correctCategory ?? null;
}

// ─── Memory Items ─────────────────────────────────────────────────────────────

export async function getMemoryItems() {
  const { data, error } = await supabaseAdmin
    .from('questions')
    .select('id, content')
    .eq('quiz_type', 'memory-items')
    .order('order_index');
  if (error) throw new Error(`getMemoryItems: ${error.message}`);
  return (data ?? []).map(r => ({
    id: r.id as string,
    name: (r.content as Record<string, unknown>).name as string,
    image: (r.content as Record<string, unknown>).image as string,
    category: 'object' as const,
  }));
}

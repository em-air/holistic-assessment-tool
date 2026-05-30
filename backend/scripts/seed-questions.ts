/**
 * Seed Script: Questions Table
 *
 * Migrates all hardcoded quiz question data from backend/src/data/*.ts
 * into the Supabase `questions` table.
 *
 * Idempotent: uses upsert (ON CONFLICT DO UPDATE) so it can be safely
 * re-run without creating duplicates.
 *
 * Run:  cd backend && npx tsx scripts/seed-questions.ts
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load .env from the backend directory
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ─── Row shape ────────────────────────────────────────────────────────────────

interface QuestionRow {
  id: string;
  quiz_type: string;
  grade: string | null;
  difficulty: string | null;
  order_index: number;
  content: Record<string, unknown>;
  answer_data: Record<string, unknown>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function gradeLabel(n: number): string {
  return `Grade ${n}`;
}

/** Strip isCorrect from an options array for the content column */
function stripIsCorrect<T extends { isCorrect?: boolean }>(
  options: T[]
): Omit<T, 'isCorrect'>[] {
  return options.map(({ isCorrect: _removed, ...rest }) => rest);
}

async function upsert(rows: QuestionRow[], label: string): Promise<void> {
  const { error } = await supabase
    .from('questions')
    .upsert(rows, { onConflict: 'quiz_type,id' });
  if (error) {
    console.error(`  ❌ ${label}: ${error.message}`);
  } else {
    console.log(`  ✅ ${label}: ${rows.length} rows`);
  }
}

// ─── Seeders ──────────────────────────────────────────────────────────────────

async function seedSpelling(): Promise<void> {
  const { spellingData } = await import('../src/data/spellingData.js');
  const rows: QuestionRow[] = spellingData.flatMap((gradeData) =>
    gradeData.words.map((w, i) => ({
      id: w.id,
      quiz_type: 'spelling',
      grade: gradeLabel(gradeData.grade),
      difficulty: w.difficulty,
      order_index: i,
      content: { hint: w.hint ?? null, audioUrl: w.audioUrl ?? null },
      answer_data: { word: w.word },
    }))
  );
  await upsert(rows, 'spelling');
}

async function seedVocabulary(): Promise<void> {
  const { vocabularyWords } = await import('../src/data/vocabularyData.js');
  const rows: QuestionRow[] = vocabularyWords.map((v, i) => ({
    id: v.id,
    quiz_type: 'vocabulary',
    grade: null,
    difficulty: null,
    order_index: i,
    content: {
      word: v.word,
      definition: v.definition,
      example: v.example,
      level: v.level,
      options: stripIsCorrect(v.options),
    },
    answer_data: {
      correctOptionId: v.options.find((o) => o.isCorrect)?.id ?? null,
    },
  }));
  await upsert(rows, 'vocabulary');
}

async function seedVocabularyMatching(): Promise<void> {
  const { getVocabularyMatchingGrades, getVocabularyMatchingQuestions } = await import('../src/data/vocabularyMatchingData.js');
  const rows: QuestionRow[] = [];
  let idx = 0;
  for (const gradeSummary of getVocabularyMatchingGrades()) {
    for (const levelSummary of gradeSummary.levels) {
      for (const q of getVocabularyMatchingQuestions(gradeSummary.grade, levelSummary.level)) {
        rows.push({
          id: q.id,
          quiz_type: 'vocabulary-matching',
          grade: gradeLabel(gradeSummary.grade),
          difficulty: null,
          order_index: idx++,
          content: { word: q.word, definition: q.definition, level: levelSummary.level },
          answer_data: {},
        });
      }
    }
  }
  await upsert(rows, 'vocabulary-matching');
}

async function seedMissingObject(): Promise<void> {
  const { missingObjectQuestions } = await import('../src/data/missingObjectData.js');
  const rows: QuestionRow[] = missingObjectQuestions.map((q, i) => ({
    id: String(q.id),
    quiz_type: 'missing-object',
    grade: null,
    difficulty: null,
    order_index: i,
    content: { image: q.image, question: q.question, options: q.options },
    answer_data: { correctAnswer: q.correctAnswer },
  }));
  await upsert(rows, 'missing-object');
}

async function seedFlashWords(): Promise<void> {
  const { getFlashWordsByGrade, getFlashWordGradeSummaries } = await import('../src/data/flashWordData.js');
  const rows: QuestionRow[] = [];
  for (const summary of getFlashWordGradeSummaries()) {
    const items = getFlashWordsByGrade(summary.grade);
    const gradeNum = Number(summary.grade.replace('grade', ''));
    items.forEach((item, i) => {
      rows.push({
        id: `${summary.grade}-${item.id}`,
        quiz_type: 'flash-words',
        grade: gradeLabel(gradeNum),
        difficulty: null,
        order_index: i,
        content: { image: item.image, word: item.word },
        answer_data: {},
      });
    });
  }
  await upsert(rows, 'flash-words');
}

async function seedReadingAssessment(): Promise<void> {
  const { getReadingAssessmentContent } = await import('../src/data/readingAssessmentData.js');
  const rows: QuestionRow[] = [];
  for (let grade = 1; grade <= 8; grade += 1) {
    const data = getReadingAssessmentContent(grade);
    if (!data) continue;
    rows.push({
      id: `reading-g${grade}`,
      quiz_type: 'reading-assessment',
      grade: gradeLabel(grade),
      difficulty: null,
      order_index: grade - 1,
      content: { title: data.title, text: data.text },
      answer_data: {},
    });
  }
  await upsert(rows, 'reading-assessment');
}

async function seedStoryRetell(): Promise<void> {
  const { grade1Stories, grade2Stories, grade3Stories, grade4Stories } =
    await import('../src/data/storyRetellData.js');

  const allStories = [
    ...grade1Stories,
    ...grade2Stories,
    ...grade3Stories,
    ...grade4Stories,
  ];

  const rows: QuestionRow[] = allStories.map((s, i) => ({
    id: String(s.id),
    quiz_type: 'story-retell',
    grade: gradeLabel(s.grade),
    difficulty: null,
    order_index: i,
    content: {
      title: s.title,
      story: s.story,
      readingLevel: s.readingLevel,
      wordCount: s.wordCount,
      beginningOptions: stripIsCorrect(s.beginningOptions),
      middleOptions: stripIsCorrect(s.middleOptions),
      endOptions: stripIsCorrect(s.endOptions),
    },
    answer_data: {
      beginningCorrectId: s.beginningOptions.find((o) => o.isCorrect)?.id ?? null,
      middleCorrectId: s.middleOptions.find((o) => o.isCorrect)?.id ?? null,
      endCorrectId: s.endOptions.find((o) => o.isCorrect)?.id ?? null,
    },
  }));
  await upsert(rows, 'story-retell');
}

async function seedCriticalThinking(): Promise<void> {
  const { criticalThinkingQuestions } = await import('../src/data/criticalThinkingData.js');
  const rows: QuestionRow[] = criticalThinkingQuestions.map((q, i) => ({
    id: q.id,
    quiz_type: 'critical-thinking',
    grade: null,
    difficulty: q.difficulty,
    order_index: i,
    content: {
      type: q.type,
      question: q.question,
      options: stripIsCorrect(q.options),
    },
    answer_data: {
      correctOptionId: q.options.find((o) => o.isCorrect)?.id ?? null,
      explanation: q.explanation ?? null,
    },
  }));
  await upsert(rows, 'critical-thinking');
}

async function seedLearningStyles(): Promise<void> {
  // Authoritative question bank – each question has exactly one option per style
  // (visual / auditory / reading-writing) so every style can score 0-9 fairly.
  //
  // Option positions are REBALANCED so each style appears exactly 3× as option A,
  // 3× as option B, and 3× as option C across all 9 questions (phase 6).
  type LsOption = { id: string; text: { en: string; ar: string }; style: string };
  type LsQuestion = {
    id: string;
    category: string;
    question: { en: string; ar: string };
    options: LsOption[];
  };

  const learningStyleQuestions: LsQuestion[] = [
    // Q1 – A=visual, B=auditory, C=reading-writing
    {
      id: 'visual-q1',
      category: 'visual',
      question: {
        en: 'When your teacher explains something new, you understand it best when...',
        ar: 'عندما يشرح لك المعلم شيئاً جديداً، تفهمه بشكل أفضل عندما...',
      },
      options: [
        { id: 'visual-q1-a', text: { en: 'You see pictures or charts', ar: 'ترى الصور أو المخططات' }, style: 'visual' },
        { id: 'visual-q1-b', text: { en: 'You listen to the explanation', ar: 'تستمع إلى الشرح' }, style: 'auditory' },
        { id: 'visual-q1-c', text: { en: 'You read a handout or copy down notes', ar: 'تقرأ ورقة عمل أو تنسخ الملاحظات' }, style: 'reading-writing' },
      ],
    },
    // Q2 – A=reading-writing, B=visual, C=auditory
    {
      id: 'visual-q2',
      category: 'visual',
      question: {
        en: 'If you have to remember a list of things, what helps you most?',
        ar: 'إذا كان عليك تذكر قائمة من الأشياء، ما الذي يساعدك أكثر؟',
      },
      options: [
        { id: 'visual-q2-a', text: { en: 'Writing the list in your notebook', ar: 'كتابة القائمة في كراسة ملاحظاتك' }, style: 'reading-writing' },
        { id: 'visual-q2-b', text: { en: 'Drawing or looking at a mind map', ar: 'الرسم أو النظر إلى خريطة ذهنية' }, style: 'visual' },
        { id: 'visual-q2-c', text: { en: 'Saying the list out loud', ar: 'قول القائمة بصوت عالٍ' }, style: 'auditory' },
      ],
    },
    // Q3 – A=auditory, B=reading-writing, C=visual
    {
      id: 'auditory-q1',
      category: 'auditory',
      question: {
        en: 'You are learning a song for a school event. What do you enjoy most?',
        ar: 'تتعلم أغنية لحدث مدرسي. ما الذي تستمتع به أكثر؟',
      },
      options: [
        { id: 'auditory-q1-a', text: { en: 'Listening to the tune many times', ar: 'الاستماع إلى اللحن مرات عديدة' }, style: 'auditory' },
        { id: 'auditory-q1-b', text: { en: 'Reading the lyrics silently', ar: 'قراءة كلمات الأغنية بصمت' }, style: 'reading-writing' },
        { id: 'auditory-q1-c', text: { en: 'Watching a video or performance of the song', ar: 'مشاهدة فيديو أو عرض للأغنية' }, style: 'visual' },
      ],
    },
    // Q4 – A=visual, B=reading-writing, C=auditory
    {
      id: 'auditory-q2',
      category: 'auditory',
      question: {
        en: 'When you are confused about homework, what do you prefer?',
        ar: 'عندما تشعر بالحيرة حول الواجب المنزلي، ماذا تفضل؟',
      },
      options: [
        { id: 'auditory-q2-a', text: { en: 'Look at pictures or a diagram that explains it', ar: 'النظر إلى صور أو مخطط يوضح ذلك' }, style: 'visual' },
        { id: 'auditory-q2-b', text: { en: 'Read the written steps again', ar: 'أقرأ الخطوات المكتوبة' }, style: 'reading-writing' },
        { id: 'auditory-q2-c', text: { en: 'Ask someone to explain it aloud', ar: 'أطلب من أحد أن يشرحه بصوت عالٍ' }, style: 'auditory' },
      ],
    },
    // Q5 – A=auditory, B=visual, C=reading-writing
    {
      id: 'reading-q2',
      category: 'reading-writing',
      question: {
        en: 'You need to remember a science fact. What works best?',
        ar: 'تحتاج لتذكر حقيقة علمية. ما الذي يعمل بشكل أفضل؟',
      },
      options: [
        { id: 'reading-q2-a', text: { en: 'Say it aloud', ar: 'أقولها بصوت عالٍ' }, style: 'auditory' },
        { id: 'reading-q2-b', text: { en: 'Draw a picture of it', ar: 'أرسم صورة عنها' }, style: 'visual' },
        { id: 'reading-q2-c', text: { en: 'Write it down a few times', ar: 'أكتبها عدة مرات' }, style: 'reading-writing' },
      ],
    },
    // Q6 – A=reading-writing, B=auditory, C=visual
    {
      id: 'science-q1',
      category: 'science',
      question: {
        en: 'Your class is studying how plants grow. Which would help you learn best?',
        ar: 'يدرس صفك كيف تنمو النباتات. أيٌّ من هذه الطرق يساعدك على التعلم بشكل أفضل؟',
      },
      options: [
        { id: 'science-q1-a', text: { en: 'Reading about it in a book and writing down the key facts', ar: 'القراءة عنها في كتاب وكتابة الحقائق الرئيسية' }, style: 'reading-writing' },
        { id: 'science-q1-b', text: { en: 'Listening to your teacher explain the life cycle aloud', ar: 'الاستماع إلى المعلم وهو يشرح دورة الحياة بصوت عالٍ' }, style: 'auditory' },
        { id: 'science-q1-c', text: { en: 'Looking at diagrams and photos showing the stages of plant growth', ar: 'النظر إلى مخططات وصور توضح مراحل نمو النبات' }, style: 'visual' },
      ],
    },
    // Q7 – A=visual, B=auditory, C=reading-writing
    {
      id: 'study-q1',
      category: 'study-habits',
      question: {
        en: 'When preparing for a test, what do you find most helpful?',
        ar: 'عند التحضير لاختبار، ما الذي تجده الأكثر فائدة؟',
      },
      options: [
        { id: 'study-q1-a', text: { en: 'Making a colourful mind map or chart of the topic', ar: 'إنشاء خريطة ذهنية ملوّنة أو مخطط للموضوع' }, style: 'visual' },
        { id: 'study-q1-b', text: { en: 'Saying the facts out loud or explaining them to a friend', ar: 'قول الحقائق بصوت عالٍ أو شرحها لصديق' }, style: 'auditory' },
        { id: 'study-q1-c', text: { en: 'Writing out your notes and making a list of key points', ar: 'كتابة ملاحظاتك وعمل قائمة بالنقاط الرئيسية' }, style: 'reading-writing' },
      ],
    },
    // Q8 – A=auditory, B=reading-writing, C=visual
    {
      id: 'classroom-q1',
      category: 'classroom',
      question: {
        en: 'During a lesson, when do you feel you learn the most?',
        ar: 'خلال الدرس، متى تشعر أنك تتعلم أكثر؟',
      },
      options: [
        { id: 'classroom-q1-a', text: { en: 'When the class discusses the topic and you can share ideas aloud', ar: 'عندما يناقش الصف الموضوع وتستطيع مشاركة الأفكار بصوت عالٍ' }, style: 'auditory' },
        { id: 'classroom-q1-b', text: { en: 'When you have a textbook or worksheet to read and take notes from', ar: 'عندما يكون لديك كتاب مدرسي أو ورقة عمل للقراءة وتدوين الملاحظات' }, style: 'reading-writing' },
        { id: 'classroom-q1-c', text: { en: 'When the teacher draws or shows pictures on the board', ar: 'عندما يرسم المعلم أو يعرض صوراً على السبورة' }, style: 'visual' },
      ],
    },
    // Q9 – A=reading-writing, B=visual, C=auditory
    {
      id: 'arts-q1',
      category: 'arts',
      question: {
        en: 'Your teacher asks you to share a story with the class. You prefer to...',
        ar: 'يطلب منك معلمك مشاركة قصة مع الصف. تفضل أن...',
      },
      options: [
        { id: 'arts-q1-a', text: { en: 'Write a short summary with the key details', ar: 'تكتب ملخصاً قصيراً بالتفاصيل الرئيسية' }, style: 'reading-writing' },
        { id: 'arts-q1-b', text: { en: 'Draw pictures of the main scenes to show the class', ar: 'ترسم صوراً للمشاهد الرئيسية لتريها للصف' }, style: 'visual' },
        { id: 'arts-q1-c', text: { en: 'Read it aloud using different voices for each character', ar: 'تقرأها بصوت عالٍ مستخدماً أصواتاً مختلفة لكل شخصية' }, style: 'auditory' },
      ],
    },
  ];

  const rows: QuestionRow[] = learningStyleQuestions.map((q, i) => ({
    id: q.id,
    quiz_type: 'learning-styles',
    grade: null,
    difficulty: null,
    order_index: i,
    // style is kept in content: it drives scoring but isn't a "secret" answer
    content: {
      category: q.category,
      question: q.question,
      options: q.options,
    },
    answer_data: {},
  }));
  await upsert(rows, 'learning-styles');
}

async function seedSentenceBuilding(): Promise<void> {
  const {
    grade1Questions,
    grade2Questions,
    grade3Questions,
    grade4Questions,
  } = await import('../src/data/sentenceBuildingData.js');

  const allGradeData = [
    { grade: 1, questions: grade1Questions },
    { grade: 2, questions: grade2Questions },
    { grade: 3, questions: grade3Questions },
    { grade: 4, questions: grade4Questions },
  ];

  const rows: QuestionRow[] = allGradeData.flatMap((gradeData) =>
    gradeData.questions.map((q: { id: string; level: number; question: string; image: string; options: Array<{id:string; text:string; isCorrect:boolean}>; feedback: {correct:string; incorrect:string} }, i: number) => ({
      id: q.id,
      quiz_type: 'sentence-building',
      grade: gradeLabel(gradeData.grade),
      difficulty: null,
      order_index: i,
      content: {
        level: q.level,
        question: q.question,
        image: q.image,
        options: stripIsCorrect(q.options),
        feedback: q.feedback,
      },
      answer_data: {
        correctOptionId: q.options.find((o) => o.isCorrect)?.id ?? null,
      },
    }))
  );
  await upsert(rows, 'sentence-building');
}

async function seedWriting(): Promise<void> {
  const { writingData } = await import('../src/data/writingData.js');
  const rows: QuestionRow[] = writingData.flatMap((gradeData) =>
    gradeData.topics.map((t: { id: string; title: string; prompt: string; description: string; wordCount: {min:number;max:number}; criteria: string[] }, i: number) => ({
      id: t.id,
      quiz_type: 'writing',
      grade: gradeLabel(gradeData.grade),
      difficulty: null,
      order_index: i,
      content: {
        title: t.title,
        prompt: t.prompt,
        description: t.description,
        wordCount: t.wordCount,
        criteria: t.criteria,
        skillFocus: gradeData.skillFocus,
        rubric: gradeData.rubric,
      },
      answer_data: {},
    }))
  );
  await upsert(rows, 'writing');
}

async function seedOralLanguage(): Promise<void> {
  const { oralLanguageQuestions } = await import('../src/data/oralLanguageData.js');
  const rows: QuestionRow[] = oralLanguageQuestions.map((q, i) => ({
    id: q.id,
    quiz_type: 'oral-language',
    grade: null,
    difficulty: null,
    order_index: i,
    content: {
      type: q.type,
      level: q.level,
      question: q.question,
      image: q.image,
      options: q.options ? stripIsCorrect(q.options) : [],
      sequenceImages: q.sequenceImages
        ? q.sequenceImages.map(({ correctOrder: _r, ...rest }) => rest)
        : null,
      feedback: q.feedback ?? null,
    },
    answer_data: {
      correctOptionId: q.options?.find((o) => o.isCorrect)?.id ?? null,
      correctSequence: q.correctSequence ?? null,
      sequenceCorrectOrders: q.sequenceImages
        ? Object.fromEntries(q.sequenceImages.map((si) => [si.id, si.correctOrder]))
        : null,
    },
  }));
  await upsert(rows, 'oral-language');
}

async function seedLogicalSequencing(): Promise<void> {
  const { LogicalSequencingData } = await import('../src/data/index.js');
  const { grade1Questions, grade2Questions, grade3Questions, grade4Questions } = LogicalSequencingData;
  const all = [...grade1Questions, ...grade2Questions, ...grade3Questions, ...grade4Questions];
  const rows: QuestionRow[] = all.map((q, i) => ({
    id: String(q.id),
    quiz_type: 'logical-sequencing',
    grade: gradeLabel(q.grade),
    difficulty: q.difficulty,
    order_index: i,
    content: {
      title: q.title,
      sentences: q.sentences,
      topic: q.topic,
      hint: q.hint ?? null,
    },
    answer_data: { correctOrder: q.correctOrder },
  }));
  await upsert(rows, 'logical-sequencing');
}

async function seedAttentionControl(): Promise<void> {
  const { AttentionControlData } = await import('../src/data/index.js');
  const { attentionControlQuestions } = AttentionControlData;
  const rows: QuestionRow[] = attentionControlQuestions.map((q, i) => ({
    id: String(q.id),
    quiz_type: 'attention-control',
    grade: null,
    difficulty: null,
    order_index: i,
    content: {
      subscale: q.subscale,
      question: q.question,
      kidFriendlyQuestion: q.kidFriendlyQuestion,
      example: q.example,
      type: q.type,
      options: q.options,
    },
    answer_data: { reverse: q.reverse },
  }));
  await upsert(rows, 'attention-control');
}

async function seedSpotTheDifference(): Promise<void> {
  const { spotTheDifferenceData } = await import('../src/data/spotTheDifferenceData.js');
  const rows: QuestionRow[] = spotTheDifferenceData.map((level, i) => ({
    id: String(level.id),
    quiz_type: 'spot-the-difference',
    grade: gradeLabel(level.grade),
    difficulty: null,
    order_index: i,
    content: {
      imageA: level.imageA,
      imageB: level.imageB,
      sceneConfig: level.sceneConfig,
      useCartoonScene: level.useCartoonScene,
    },
    answer_data: { differences: level.differences },
  }));
  await upsert(rows, 'spot-the-difference');
}

async function seedSentenceDifference(): Promise<void> {
  const { sentenceDifferenceQuestions } = await import('../src/data/sentenceDifferenceData.js');
  const rows: QuestionRow[] = sentenceDifferenceQuestions.map((q, i) => ({
    id: String(q.id),
    quiz_type: 'sentence-difference',
    grade: null,
    difficulty: q.difficulty,
    order_index: i,
    content: { sentenceA: q.sentenceA, sentenceB: q.sentenceB },
    answer_data: { correctAnswer: q.correctAnswer },
  }));
  await upsert(rows, 'sentence-difference');
}

// memory-assessment algorithm is dynamically generated at runtime,
// but the item pool is static content that belongs in the database.

async function seedMemoryItems(): Promise<void> {
  const items = [
    { id: 'apple',   name: 'Apple',   image: 'https://cdn.pixabay.com/photo/2018/04/12/11/37/apple-3313209_640.jpg' },
    { id: 'dog',     name: 'Dog',     image: 'https://cdn.pixabay.com/photo/2019/08/19/07/45/corgi-4415649_640.jpg' },
    { id: 'ball',    name: 'Ball',    image: 'https://cdn.pixabay.com/photo/2018/07/28/14/30/soccer-3568168_1280.jpg' },
    { id: 'car',     name: 'Car',     image: 'https://cdn.pixabay.com/photo/2012/05/29/00/43/car-49278_640.jpg' },
    { id: 'house',   name: 'House',   image: 'https://cdn.pixabay.com/photo/2014/07/10/17/18/large-home-389271_1280.jpg' },
    { id: 'tree',    name: 'Tree',    image: 'https://cdn.pixabay.com/photo/2014/12/22/00/07/tree-576847_1280.png' },
    { id: 'book',    name: 'Book',    image: 'https://cdn.pixabay.com/photo/2015/11/19/21/10/glasses-1052010_640.jpg' },
    { id: 'chair',   name: 'Chair',   image: 'https://cdn.pixabay.com/photo/2022/08/06/20/46/coffee-shop-7369404_1280.jpg' },
    { id: 'cat',     name: 'Cat',     image: 'https://cdn.pixabay.com/photo/2014/11/30/14/11/cat-551554_640.jpg' },
    { id: 'flower',  name: 'Flower',  image: 'https://cdn.pixabay.com/photo/2015/04/19/08/32/marguerite-729510_640.jpg' },
    { id: 'bicycle', name: 'Bicycle', image: 'https://cdn.pixabay.com/photo/2016/11/18/12/49/bicycle-1834265_1280.jpg' },
    { id: 'cup',     name: 'Cup',     image: 'https://cdn.pixabay.com/photo/2017/05/12/08/29/coffee-2306471_640.jpg' },
  ];
  const rows: QuestionRow[] = items.map((item, i) => ({
    id: item.id,
    quiz_type: 'memory-items',
    grade: null,
    difficulty: null,
    order_index: i,
    content: { name: item.name, image: item.image, category: 'object' },
    answer_data: {},
  }));
  await upsert(rows, 'memory-items');
}

async function seedCategoryQuiz(): Promise<void> {
  type CatItem = { id: string; name: string; image: string; correctCategory: string };
  type CatQuestion = { id: string; grade: string; instruction: string; categories: string[]; items: CatItem[] };

  const questions: CatQuestion[] = [
    { id: 'c1_1', grade: 'Grade 1',
      instruction: 'Sort these into Animals and Fruits',
      categories: ['Animals', 'Fruits'],
      items: [
        { id: 'cat',    name: 'Cat',    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150&h=150&fit=crop&crop=center', correctCategory: 'Animals' },
        { id: 'dog',    name: 'Dog',    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&h=150&fit=crop&crop=center', correctCategory: 'Animals' },
        { id: 'apple',  name: 'Apple',  image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=150&h=150&fit=crop&crop=center', correctCategory: 'Fruits' },
        { id: 'banana', name: 'Banana', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=150&h=150&fit=crop&crop=center', correctCategory: 'Fruits' },
      ],
    },
    { id: 'c1_2', grade: 'Grade 1',
      instruction: 'Sort these into Colors and Numbers',
      categories: ['Colors', 'Numbers'],
      items: [
        { id: 'ten',  name: 'Ten',  image: 'https://images.unsplash.com/photo-1631453494181-f762d692583a?auto=format&fit=crop&q=60&w=600',  correctCategory: 'Numbers' },
        { id: 'red',  name: 'Red',  image: 'https://images.unsplash.com/photo-1611242320536-f12d3541249b?auto=format&fit=crop&q=80&w=1170', correctCategory: 'Colors' },
        { id: 'blue', name: 'Blue', image: 'https://images.unsplash.com/photo-1614850523011-8f49ffc73908?auto=format&fit=crop&q=80&w=1170', correctCategory: 'Colors' },
        { id: 'five', name: 'Five', image: 'https://plus.unsplash.com/premium_photo-1669349127530-23d9e3dab307?auto=format&fit=crop&q=80&w=880', correctCategory: 'Numbers' },
      ],
    },
    { id: 'c2_1', grade: 'Grade 2',
      instruction: 'Sort these into School Items and Toys',
      categories: ['School Items', 'Toys'],
      items: [
        { id: 'pencil', name: 'Pencil',  image: 'https://plus.unsplash.com/premium_vector-1720893352647-9afd7d84fa79?auto=format&fit=crop&q=80&w=880',  correctCategory: 'School Items' },
        { id: 'eraser', name: 'Eraser',  image: 'https://images.unsplash.com/photo-1667532447990-51c6704ef358?auto=format&fit=crop&q=80&w=2080',        correctCategory: 'School Items' },
        { id: 'book',   name: 'Book',    image: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=1976',        correctCategory: 'School Items' },
        { id: 'ball',   name: 'Ball',    image: 'https://plus.unsplash.com/premium_photo-1709589145461-4797b4e80e9c?auto=format&fit=crop&q=80&w=2070',  correctCategory: 'Toys' },
        { id: 'doll',   name: 'Doll',    image: 'https://images.unsplash.com/photo-1612506001235-f0d0892aa11b?auto=format&fit=crop&q=60&w=600',         correctCategory: 'Toys' },
        { id: 'toycar', name: 'Toy Car', image: 'https://images.unsplash.com/photo-1609708536965-6e5b915b195b?auto=format&fit=crop&q=60&w=600',         correctCategory: 'Toys' },
      ],
    },
    { id: 'c2_2', grade: 'Grade 2',
      instruction: 'Sort these into Indoor and Outdoor activities',
      categories: ['Indoor', 'Outdoor'],
      items: [
        { id: 'reading',  name: 'Reading',  image: 'https://plus.unsplash.com/premium_vector-1727952231396-e301fbf4ef1b?auto=format&fit=crop&q=80&w=880', correctCategory: 'Indoor' },
        { id: 'cooking',  name: 'Cooking',  image: 'https://images.unsplash.com/photo-1528712306091-ed0763094c98?auto=format&fit=crop&q=60&w=600',         correctCategory: 'Indoor' },
        { id: 'running',  name: 'Running',  image: 'https://images.unsplash.com/photo-1486218119243-13883505764c?auto=format&fit=crop&q=60&w=600',         correctCategory: 'Outdoor' },
        { id: 'swimming', name: 'Swimming', image: 'https://plus.unsplash.com/premium_photo-1664475361436-e37f6f2ba407?auto=format&fit=crop&q=60&w=600',  correctCategory: 'Outdoor' },
      ],
    },
    { id: 'c3_1', grade: 'Grade 3',
      instruction: 'Sort these into Fruits and Vegetables',
      categories: ['Fruits', 'Vegetables'],
      items: [
        { id: 'apple',      name: 'Apple',      image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=150&h=150&fit=crop&crop=center',    correctCategory: 'Fruits' },
        { id: 'kiwi',       name: 'Kiwi',       image: 'https://images.unsplash.com/photo-1585059895524-72359e06133a?w=150&h=150&fit=crop&crop=center', correctCategory: 'Fruits' },
        { id: 'strawberry', name: 'Strawberry', image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=150&h=150&fit=crop&crop=center', correctCategory: 'Fruits' },
        { id: 'tomato',     name: 'Tomato',     image: 'https://images.unsplash.com/photo-1582284540020-8acbe03f4924?auto=format&fit=crop&q=80&w=735',  correctCategory: 'Fruits' },
        { id: 'cucumber',   name: 'Cucumber',   image: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=150&h=150&fit=crop&crop=center', correctCategory: 'Vegetables' },
        { id: 'spinach',    name: 'Spinach',    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=150&h=150&fit=crop&crop=center', correctCategory: 'Vegetables' },
      ],
    },
    { id: 'c3_2', grade: 'Grade 3',
      instruction: 'Sort these by Size',
      categories: ['Small', 'Large'],
      items: [
        { id: 'mouse',    name: 'Mouse',    image: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=150&h=150&fit=crop&crop=center',       correctCategory: 'Small' },
        { id: 'ant',      name: 'Ant',      image: 'https://plus.unsplash.com/premium_vector-1732722159929-50a849c772ce?auto=format&fit=crop&q=80&w=996', correctCategory: 'Small' },
        { id: 'elephant', name: 'Elephant', image: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=150&h=150&fit=crop&crop=center',       correctCategory: 'Large' },
        { id: 'whale',    name: 'Whale',    image: 'https://plus.unsplash.com/premium_vector-1722145193505-ac236cb1d8e4?auto=format&fit=crop&q=60&w=600', correctCategory: 'Large' },
      ],
    },
    { id: 'c4_1', grade: 'Grade 4',
      instruction: 'Sort these animals by their habitat',
      categories: ['Land Animals', 'Water Animals', 'Air Animals'],
      items: [
        { id: 'lion',    name: 'Lion',    image: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=150&h=150&fit=crop&crop=center',           correctCategory: 'Land Animals' },
        { id: 'frog',    name: 'Frog',    image: 'https://plus.unsplash.com/premium_vector-1731552809287-77ae59448109?auto=format&fit=crop&q=60&w=600',  correctCategory: 'Land Animals' },
        { id: 'dolphin', name: 'Dolphin', image: 'https://plus.unsplash.com/premium_vector-1722145193220-5eb206260842?auto=format&fit=crop&q=60&w=600',  correctCategory: 'Water Animals' },
        { id: 'shark',   name: 'Shark',   image: 'https://plus.unsplash.com/premium_vector-1741191978319-3ff9d0e3e9ae?auto=format&fit=crop&q=80&w=1112', correctCategory: 'Water Animals' },
        { id: 'eagle',   name: 'Eagle',   image: 'https://plus.unsplash.com/premium_vector-1719245268509-2cd8228d06ee?auto=format&fit=crop&q=60&w=600',  correctCategory: 'Air Animals' },
        { id: 'parrot',  name: 'Parrot',  image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&q=80&w=725',            correctCategory: 'Air Animals' },
      ],
    },
    { id: 'c4_2', grade: 'Grade 4',
      instruction: 'Sort these by their state of matter',
      categories: ['Solid', 'Liquid', 'Gas'],
      items: [
        { id: 'rock',  name: 'Rock',  image: 'https://images.unsplash.com/vector-1752609379935-1e3a71d8dc78?auto=format&fit=crop&q=80&w=880',      correctCategory: 'Solid' },
        { id: 'ice',   name: 'Ice',   image: 'https://images.unsplash.com/photo-1737099950797-d0a4baf12af3?auto=format&fit=crop&q=60&w=600',       correctCategory: 'Solid' },
        { id: 'water', name: 'Water', image: 'https://plus.unsplash.com/premium_vector-1727952230707-372d1ba06834?auto=format&fit=crop&q=60&w=600', correctCategory: 'Liquid' },
        { id: 'juice', name: 'Juice', image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&q=60&w=600',       correctCategory: 'Liquid' },
        { id: 'air',   name: 'Air',   image: 'https://media.istockphoto.com/id/1347708317/vector/wind-weather-thin-line-icon.jpg',                  correctCategory: 'Gas' },
        { id: 'steam', name: 'Steam', image: 'https://images.unsplash.com/photo-1635191535841-a6d4d88e1612?auto=format&fit=crop&q=80&w=2070',      correctCategory: 'Gas' },
      ],
    },
  ];

  const rows: QuestionRow[] = questions.map((q, i) => ({
    id: q.id,
    quiz_type: 'category-quiz',
    grade: q.grade,
    difficulty: null,
    order_index: i,
    content: {
      instruction: q.instruction,
      categories: q.categories,
      items: q.items.map(({ correctCategory: _c, ...item }) => item),
    },
    answer_data: {
      items: q.items.map(({ id, correctCategory }) => ({ id, correctCategory })),
    },
  }));
  await upsert(rows, 'category-quiz');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('🌱 Seeding questions table...\n');

  const legacy = [
    { name: 'spelling',            fn: seedSpelling },
    { name: 'vocabulary',          fn: seedVocabulary },
    { name: 'vocabulary-matching', fn: seedVocabularyMatching },
    { name: 'missing-object',      fn: seedMissingObject },
    { name: 'flash-words',         fn: seedFlashWords },
    { name: 'reading-assessment',  fn: seedReadingAssessment },
    { name: 'story-retell',        fn: seedStoryRetell },
    { name: 'critical-thinking',   fn: seedCriticalThinking },
    { name: 'learning-styles',     fn: seedLearningStyles },
    { name: 'sentence-building',   fn: seedSentenceBuilding },
    { name: 'writing',             fn: seedWriting },
    { name: 'oral-language',       fn: seedOralLanguage },
    { name: 'logical-sequencing',  fn: seedLogicalSequencing },
    { name: 'attention-control',   fn: seedAttentionControl },
    { name: 'spot-the-difference', fn: seedSpotTheDifference },
    { name: 'sentence-difference', fn: seedSentenceDifference },
  ];

  for (const { name, fn } of legacy) {
    try {
      await fn();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      // Source data files have been deleted or their exports removed after the
      // initial seed run. Skip gracefully — data is already in the database.
      console.log(`  ⏭️  ${name}: skipping (${msg.split('\n')[0]})`);
    }
  }

  await seedMemoryItems();
  await seedCategoryQuiz();

  console.log('\n✅ Done.');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

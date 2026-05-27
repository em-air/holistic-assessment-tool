/**
 * One-time migration for the learning-styles quiz:
 *  - Remove reading-q1 ("learning a new game" – was Q5 in displayed order)
 *  - Fix style/text mismatches in existing questions
 *  - Update order_index for reading-q2 (5 → 4)
 *  - Insert 4 new questions: science-q1, study-q1, classroom-q1, arts-q1
 *
 * Result: 9 questions, 3 per style (visual/auditory/reading-writing), covering
 *  diverse school contexts with accurate style-to-option mappings.
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
);

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function run() {
  // 1. Remove reading-q1 ──────────────────────────────────────────────────────
  {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', 'reading-q1');
    if (error) throw new Error(`Delete reading-q1: ${error.message}`);
    console.log('✓ Deleted reading-q1');
  }

  // 2. Fix visual-q1 option c (kinesthetic text → reading-writing text) ───────
  //    old: "You do the activity yourself" (reading-writing) – describes kinesthetic
  //    new: "You read a handout or copy down notes" (reading-writing) – accurate
  {
    const { data, error } = await supabase
      .from('questions')
      .select('content')
      .eq('id', 'visual-q1')
      .single();
    if (error) throw new Error(`Fetch visual-q1: ${error.message}`);
    const content = data!.content as Record<string, unknown>;
    const options = content.options as Array<Record<string, unknown>>;
    options[2] = {
      id: 'visual-q1-c',
      text: {
        en: 'You read a handout or copy down notes',
        ar: 'تقرأ ورقة عمل أو تنسخ الملاحظات',
      },
      style: 'reading-writing',
    };
    const { error: ue } = await supabase
      .from('questions')
      .update({ content })
      .eq('id', 'visual-q1');
    if (ue) throw new Error(`Update visual-q1: ${ue.message}`);
    console.log('✓ Fixed visual-q1 option C');
  }

  // 3. Fix visual-q2 option c (kinesthetic text → reading-writing text) ───────
  //    old: "Acting out the steps" (reading-writing) – describes kinesthetic
  //    new: "Writing the list in your notebook" (reading-writing) – accurate
  {
    const { data, error } = await supabase
      .from('questions')
      .select('content')
      .eq('id', 'visual-q2')
      .single();
    if (error) throw new Error(`Fetch visual-q2: ${error.message}`);
    const content = data!.content as Record<string, unknown>;
    const options = content.options as Array<Record<string, unknown>>;
    options[2] = {
      id: 'visual-q2-c',
      text: {
        en: 'Writing the list in your notebook',
        ar: 'كتابة القائمة في كراسة ملاحظاتك',
      },
      style: 'reading-writing',
    };
    const { error: ue } = await supabase
      .from('questions')
      .update({ content })
      .eq('id', 'visual-q2');
    if (ue) throw new Error(`Update visual-q2: ${ue.message}`);
    console.log('✓ Fixed visual-q2 option C');
  }

  // 4. Fix auditory-q1 option c (kinesthetic text → visual text) ──────────────
  //    old: "Dancing or clapping to the beat" (visual) – describes kinesthetic
  //    new: "Watching a video or performance of the song" (visual) – accurate
  {
    const { data, error } = await supabase
      .from('questions')
      .select('content')
      .eq('id', 'auditory-q1')
      .single();
    if (error) throw new Error(`Fetch auditory-q1: ${error.message}`);
    const content = data!.content as Record<string, unknown>;
    const options = content.options as Array<Record<string, unknown>>;
    options[2] = {
      id: 'auditory-q1-c',
      text: {
        en: 'Watching a video or performance of the song',
        ar: 'مشاهدة فيديو أو عرض للأغنية',
      },
      style: 'visual',
    };
    const { error: ue } = await supabase
      .from('questions')
      .update({ content })
      .eq('id', 'auditory-q1');
    if (ue) throw new Error(`Update auditory-q1: ${ue.message}`);
    console.log('✓ Fixed auditory-q1 option C');
  }

  // 5. Fix auditory-q2 option b (duplicate auditory → visual) ─────────────────
  //    old: "Look for a video with sound" (auditory) – DUPLICATE auditory option
  //    new: "Look at pictures or a diagram that explains it" (visual) – accurate
  {
    const { data, error } = await supabase
      .from('questions')
      .select('content')
      .eq('id', 'auditory-q2')
      .single();
    if (error) throw new Error(`Fetch auditory-q2: ${error.message}`);
    const content = data!.content as Record<string, unknown>;
    const options = content.options as Array<Record<string, unknown>>;
    options[1] = {
      id: 'auditory-q2-b',
      text: {
        en: 'Look at pictures or a diagram that explains it',
        ar: 'النظر إلى صور أو مخطط يوضح ذلك',
      },
      style: 'visual',
    };
    const { error: ue } = await supabase
      .from('questions')
      .update({ content })
      .eq('id', 'auditory-q2');
    if (ue) throw new Error(`Update auditory-q2: ${ue.message}`);
    console.log('✓ Fixed auditory-q2 option B (was duplicate auditory → now visual)');
  }

  // 6. Update reading-q2 order_index: 5 → 4 (gap left by removing reading-q1) ─
  {
    const { error } = await supabase
      .from('questions')
      .update({ order_index: 4 })
      .eq('id', 'reading-q2');
    if (error) throw new Error(`Update reading-q2 order: ${error.message}`);
    console.log('✓ Updated reading-q2 order_index to 4');
  }

  // 7. Insert 4 new questions ──────────────────────────────────────────────────

  const newQuestions = [
    {
      id: 'science-q1',
      quiz_type: 'learning-styles',
      grade: null,
      difficulty: null,
      order_index: 5,
      content: {
        category: 'science',
        question: {
          en: 'Your class is studying how plants grow. Which would help you learn best?',
          ar: 'يدرس صفك كيف تنمو النباتات. أيٌّ من هذه الطرق يساعدك على التعلم بشكل أفضل؟',
        },
        options: [
          {
            id: 'science-q1-a',
            text: {
              en: 'Looking at diagrams and photos showing the stages of plant growth',
              ar: 'النظر إلى مخططات وصور توضح مراحل نمو النبات',
            },
            style: 'visual',
          },
          {
            id: 'science-q1-b',
            text: {
              en: 'Listening to your teacher explain the life cycle aloud',
              ar: 'الاستماع إلى المعلم وهو يشرح دورة الحياة بصوت عالٍ',
            },
            style: 'auditory',
          },
          {
            id: 'science-q1-c',
            text: {
              en: 'Reading about it in a book and writing down the key facts',
              ar: 'القراءة عنها في كتاب وكتابة الحقائق الرئيسية',
            },
            style: 'reading-writing',
          },
        ],
      },
      answer_data: {},
    },
    {
      id: 'study-q1',
      quiz_type: 'learning-styles',
      grade: null,
      difficulty: null,
      order_index: 6,
      content: {
        category: 'study-habits',
        question: {
          en: 'When preparing for a test, what do you find most helpful?',
          ar: 'عند التحضير لاختبار، ما الذي تجده الأكثر فائدة؟',
        },
        options: [
          {
            id: 'study-q1-a',
            text: {
              en: 'Making a colourful mind map or chart of the topic',
              ar: 'إنشاء خريطة ذهنية ملوّنة أو مخطط للموضوع',
            },
            style: 'visual',
          },
          {
            id: 'study-q1-b',
            text: {
              en: 'Saying the facts out loud or explaining them to a friend',
              ar: 'قول الحقائق بصوت عالٍ أو شرحها لصديق',
            },
            style: 'auditory',
          },
          {
            id: 'study-q1-c',
            text: {
              en: 'Writing out your notes and making a list of key points',
              ar: 'كتابة ملاحظاتك وعمل قائمة بالنقاط الرئيسية',
            },
            style: 'reading-writing',
          },
        ],
      },
      answer_data: {},
    },
    {
      id: 'classroom-q1',
      quiz_type: 'learning-styles',
      grade: null,
      difficulty: null,
      order_index: 7,
      content: {
        category: 'classroom',
        question: {
          en: 'During a lesson, when do you feel you learn the most?',
          ar: 'خلال الدرس، متى تشعر أنك تتعلم أكثر؟',
        },
        options: [
          {
            id: 'classroom-q1-a',
            text: {
              en: 'When the teacher draws or shows pictures on the board',
              ar: 'عندما يرسم المعلم أو يعرض صوراً على السبورة',
            },
            style: 'visual',
          },
          {
            id: 'classroom-q1-b',
            text: {
              en: 'When the class discusses the topic and you can share ideas aloud',
              ar: 'عندما يناقش الصف الموضوع وتستطيع مشاركة الأفكار بصوت عالٍ',
            },
            style: 'auditory',
          },
          {
            id: 'classroom-q1-c',
            text: {
              en: 'When you have a textbook or worksheet to read and take notes from',
              ar: 'عندما يكون لديك كتاب مدرسي أو ورقة عمل للقراءة وتدوين الملاحظات',
            },
            style: 'reading-writing',
          },
        ],
      },
      answer_data: {},
    },
    {
      id: 'arts-q1',
      quiz_type: 'learning-styles',
      grade: null,
      difficulty: null,
      order_index: 8,
      content: {
        category: 'arts',
        question: {
          en: 'Your teacher asks you to share a story with the class. You prefer to...',
          ar: 'يطلب منك معلمك مشاركة قصة مع الصف. تفضل أن...',
        },
        options: [
          {
            id: 'arts-q1-a',
            text: {
              en: 'Draw pictures of the main scenes to show the class',
              ar: 'ترسم صوراً للمشاهد الرئيسية لتريها للصف',
            },
            style: 'visual',
          },
          {
            id: 'arts-q1-b',
            text: {
              en: 'Read it aloud using different voices for each character',
              ar: 'تقرأها بصوت عالٍ مستخدماً أصواتاً مختلفة لكل شخصية',
            },
            style: 'auditory',
          },
          {
            id: 'arts-q1-c',
            text: {
              en: 'Write a short summary with the key details',
              ar: 'تكتب ملخصاً قصيراً بالتفاصيل الرئيسية',
            },
            style: 'reading-writing',
          },
        ],
      },
      answer_data: {},
    },
  ];

  for (const q of newQuestions) {
    const { error } = await supabase
      .from('questions')
      .upsert(q, { onConflict: 'id' });
    if (error) throw new Error(`Upsert ${q.id}: ${error.message}`);
    console.log(`✓ Inserted/updated ${q.id}`);
  }

  console.log('\n✅ Migration complete. Final question set:');
  const { data, error } = await supabase
    .from('questions')
    .select('id, order_index, content')
    .eq('quiz_type', 'learning-styles')
    .order('order_index');
  if (error) throw error;
  for (const q of data ?? []) {
    const c = q.content as Record<string, unknown>;
    const question = c.question as Record<string, string>;
    const options = c.options as Array<{ id: string; style: string }>;
    const styles = options.map(o => o.style).join(', ');
    console.log(`  [${q.order_index}] ${q.id}: ${question.en}`);
    console.log(`       styles: ${styles}`);
  }
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});

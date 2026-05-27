import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env file');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Types
type GradeLevel = 
  | 'Grade 1' | 'Grade 2' | 'Grade 3' | 'Grade 4'
  | 'Grade 5' | 'Grade 6' | 'Grade 7' | 'Grade 8';

type AssessmentCategory = 'mind' | 'oral' | 'academic';

interface QuizMetadataInsert {
  quiz_id: string;
  quiz_name: string;
  category: AssessmentCategory;
  subcategory: string;
  allowed_grades: GradeLevel[];
  is_active?: boolean;
}

// All quiz definitions with grade restrictions
const quizzes: QuizMetadataInsert[] = [
  // ============= MIND - Attention/Memory =============
  {
    quiz_id: 'attention-assessment',
    quiz_name: 'Attention Questionnaire',
    category: 'mind',
    subcategory: 'attention',
    allowed_grades: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'],
  },
  {
    quiz_id: 'picture-sequence',
    quiz_name: 'Picture Sequence',
    category: 'mind',
    subcategory: 'memory',
    allowed_grades: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'],
  },
  {
    quiz_id: 'flash-word-quiz',
    quiz_name: 'Flash Word Quiz',
    category: 'mind',
    subcategory: 'memory',
    allowed_grades: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'],
  },

  // ============= MIND - Learning Style =============
  {
    quiz_id: 'learning-styles',
    quiz_name: 'Learning Style Quiz',
    category: 'mind',
    subcategory: 'learning-style',
    allowed_grades: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'],
  },

  // ============= MIND - Critical Thinking (grade-specific) =============
  {
    quiz_id: 'analogy-quiz',
    quiz_name: 'Analogy Quiz',
    category: 'mind',
    subcategory: 'critical-thinking',
    allowed_grades: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4'],
  },
  {
    quiz_id: 'category-quiz',
    quiz_name: 'Category Quiz',
    category: 'mind',
    subcategory: 'critical-thinking',
    allowed_grades: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4'],
  },

  // ============= MIND - Perception =============
  {
    quiz_id: 'missing-object-quiz',
    quiz_name: 'Missing Object',
    category: 'mind',
    subcategory: 'perception',
    allowed_grades: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'],
  },
  {
    quiz_id: 'sentence-difference-quiz',
    quiz_name: 'Sentence Differences',
    category: 'mind',
    subcategory: 'perception',
    allowed_grades: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'],
  },
  {
    quiz_id: 'logical-sequencing-quiz',
    quiz_name: 'Logical Sequencing',
    category: 'mind',
    subcategory: 'perception',
    allowed_grades: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4'],
  },

  // ============= ORAL - Oral Language =============
  {
    quiz_id: 'oral-language',
    quiz_name: 'Oral Language Assessment',
    category: 'oral',
    subcategory: 'oral-language',
    allowed_grades: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'],
  },
  {
    quiz_id: 'story-retell',
    quiz_name: 'Story Retell',
    category: 'oral',
    subcategory: 'oral-language',
    allowed_grades: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4'],
  },

  // ============= ORAL - Reading =============
  {
    quiz_id: 'reading-assessment',
    quiz_name: 'Reading Assessment',
    category: 'oral',
    subcategory: 'reading',
    allowed_grades: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'],
  },

  // ============= ORAL - Phonics =============
  {
    quiz_id: 'phonics-quiz',
    quiz_name: 'Phonics Quiz',
    category: 'oral',
    subcategory: 'phonics',
    allowed_grades: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'],
  },

  // ============= ACADEMIC - Writing =============
  {
    quiz_id: 'writing-test',
    quiz_name: 'Writing Test',
    category: 'academic',
    subcategory: 'writing',
    allowed_grades: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'],
  },

  // ============= ACADEMIC - Vocabulary =============
  {
    quiz_id: 'vocabulary-matching',
    quiz_name: 'Vocabulary Matching',
    category: 'academic',
    subcategory: 'vocabulary',
    allowed_grades: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'],
  },

  // ============= ACADEMIC - Spelling =============
  {
    quiz_id: 'spelling-test',
    quiz_name: 'Spelling Test',
    category: 'academic',
    subcategory: 'spelling',
    allowed_grades: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'],
  },
];

async function seedQuizzes() {
  console.log('🌱 Seeding quiz metadata...\n');

  try {
    // Clear existing data (optional - comment out if you want to preserve existing)
    console.log('Clearing existing quiz metadata...');
    await supabaseAdmin.from('quiz_metadata').delete().neq('quiz_id', '');

    // Insert all quizzes
    const { data, error } = await supabaseAdmin
      .from('quiz_metadata')
      .insert(quizzes)
      .select();

    if (error) {
      throw error;
    }

    console.log(`✅ Successfully seeded ${data.length} quizzes\n`);

    // Print summary
    const categories = ['mind', 'oral', 'academic'];
    for (const cat of categories) {
      const catQuizzes = quizzes.filter(q => q.category === cat);
      console.log(`📂 ${cat.toUpperCase()}: ${catQuizzes.length} quizzes`);
      
      const subcategories = [...new Set(catQuizzes.map(q => q.subcategory))];
      for (const sub of subcategories) {
        const subQuizzes = catQuizzes.filter(q => q.subcategory === sub);
        console.log(`   └─ ${sub}: ${subQuizzes.length} quizzes`);
      }
    }

    console.log('\n✨ Seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

// Run the seed
seedQuizzes();

/**
 * Seed Student Accounts Script
 * Creates sample student accounts in the database for testing purposes
 * 
 * Run with: npx tsx scripts/seed-students.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Student accounts to create
const studentAccounts = [
  {
    email: 'student1@test.com',
    password: 'student1',
    name: 'Student 1',
    grade: 'Grade 1',
    age: 6,
  },
  {
    email: 'student2@test.com',
    password: 'student2',
    name: 'Student 2',
    grade: 'Grade 2',
    age: 7,
  },
  {
    email: 'student3@test.com',
    password: 'student3',
    name: 'Student 3',
    grade: 'Grade 3',
    age: 8,
  },
  {
    email: 'student4@test.com',
    password: 'student4',
    name: 'Student 4',
    grade: 'Grade 4',
    age: 9,
  },
];

async function seedStudents() {
  console.log('🚀 Starting student accounts seed...\n');

  for (const student of studentAccounts) {
    console.log(`Creating student: ${student.email}...`);

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: student.email,
        password: student.password,
        email_confirm: true, // Auto-confirm email
      });

      if (authError) {
        // Check if user already exists
        if (authError.message.includes('already been registered')) {
          console.log(`  ⚠️  User ${student.email} already exists, updating profile...`);
          
          // Get user by email
          const { data: users } = await supabase.auth.admin.listUsers();
          const existingUser = users?.users?.find(u => u.email === student.email);
          
          if (existingUser) {
            // Update profile to student role
            const { error: updateError } = await supabase
              .from('profiles')
              .upsert({
                id: existingUser.id,
                student_name: student.name,
                age: student.age,
                grade: student.grade,
                role: 'student',
                updated_at: new Date().toISOString(),
              });

            if (updateError) {
              console.log(`  ❌ Failed to update profile: ${updateError.message}`);
            } else {
              console.log(`  ✅ Profile updated`);
            }
          }
          continue;
        }
        
        console.log(`  ❌ Auth error: ${authError.message}`);
        continue;
      }

      if (!authData.user) {
        console.log(`  ❌ No user returned from auth`);
        continue;
      }

      // Create profile with student role
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          student_name: student.name,
          age: student.age,
          grade: student.grade,
          role: 'student',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.log(`  ❌ Profile error: ${profileError.message}`);
        continue;
      }

      console.log(`  ✅ Created successfully!`);
      console.log(`     Email: ${student.email}`);
      console.log(`     Password: ${student.password}`);
    } catch (error: any) {
      console.log(`  ❌ Error: ${error.message}`);
    }
  }

  console.log('\n✨ Student seed complete!\n');
  console.log('='.repeat(50));
  console.log('STUDENT LOGIN CREDENTIALS:');
  console.log('='.repeat(50));
  studentAccounts.forEach((student) => {
    console.log(`\n📧 ${student.email}`);
    console.log(`🔑 ${student.password}`);
    console.log(`📚 ${student.grade} | Age: ${student.age}`);
  });
  console.log('\n' + '='.repeat(50));
}

seedStudents()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

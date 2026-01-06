/**
 * Seed Admin Accounts Script
 * Creates 3 pre-made admin accounts in the database
 * 
 * Run with: npx tsx scripts/seed-admins.ts
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

// Admin accounts to create
const adminAccounts = [
  {
    email: 'admin@holisticassessment.com',
    password: 'Admin@123456',
    name: 'Primary Admin',
  },
  {
    email: 'supervisor@holisticassessment.com',
    password: 'Supervisor@123456',
    name: 'Supervisor',
  },
  {
    email: 'manager@holisticassessment.com',
    password: 'Manager@123456',
    name: 'Manager',
  },
];

async function seedAdmins() {
  console.log('🚀 Starting admin accounts seed...\n');

  for (const admin of adminAccounts) {
    console.log(`Creating admin: ${admin.email}...`);

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: admin.email,
        password: admin.password,
        email_confirm: true, // Auto-confirm email
      });

      if (authError) {
        // Check if user already exists
        if (authError.message.includes('already been registered')) {
          console.log(`  ⚠️  User ${admin.email} already exists, updating profile...`);
          
          // Get user by email
          const { data: users } = await supabase.auth.admin.listUsers();
          const existingUser = users?.users?.find(u => u.email === admin.email);
          
          if (existingUser) {
            // Update profile to admin role
            const { error: updateError } = await supabase
              .from('profiles')
              .upsert({
                id: existingUser.id,
                student_name: admin.name,
                role: 'admin',
                updated_at: new Date().toISOString(),
              });

            if (updateError) {
              console.log(`  ❌ Failed to update profile: ${updateError.message}`);
            } else {
              console.log(`  ✅ Profile updated to admin role`);
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

      // Create profile with admin role
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          student_name: admin.name,
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.log(`  ❌ Profile error: ${profileError.message}`);
        continue;
      }

      console.log(`  ✅ Created successfully!`);
      console.log(`     Email: ${admin.email}`);
      console.log(`     Password: ${admin.password}`);
    } catch (error: any) {
      console.log(`  ❌ Error: ${error.message}`);
    }
  }

  console.log('\n✨ Admin seed complete!\n');
  console.log('='.repeat(50));
  console.log('ADMIN LOGIN CREDENTIALS:');
  console.log('='.repeat(50));
  adminAccounts.forEach((admin) => {
    console.log(`\n📧 ${admin.email}`);
    console.log(`🔑 ${admin.password}`);
  });
  console.log('\n' + '='.repeat(50));
}

seedAdmins()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

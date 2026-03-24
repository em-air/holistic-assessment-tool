-- Migration: Add student_email column to profiles table
-- Run this in Supabase SQL Editor

-- 1. Add the student_email column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS student_email TEXT;

-- 2. Update the trigger function to include student_email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, student_name, age, grade, parent_email, student_email, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'studentName',
    (NEW.raw_user_meta_data->>'age')::INTEGER,
    NEW.raw_user_meta_data->>'grade',
    COALESCE(NEW.raw_user_meta_data->>'parentEmail', NEW.email),
    NEW.raw_user_meta_data->>'studentEmail',
    'student'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Backfill student_email for existing users from auth.users metadata
UPDATE public.profiles p
SET student_email = u.raw_user_meta_data->>'studentEmail'
FROM auth.users u
WHERE p.id = u.id
AND p.student_email IS NULL
AND u.raw_user_meta_data->>'studentEmail' IS NOT NULL;

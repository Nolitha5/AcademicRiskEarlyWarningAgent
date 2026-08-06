-- Migration 13: Add email column to students table for auth profile linking
-- Allows a logged-in Supabase auth user to be matched to their student record

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

-- Populate emails for the 15 seeded students using student_number@tut.ac.za format.
-- In production, admins would set these; for development we derive them from student_number.
UPDATE students SET email = LOWER(student_number) || '@tut.ac.za'
WHERE email IS NULL AND student_number IS NOT NULL;

-- Index for fast lookup by email (used by StudentDashboard on every login)
CREATE INDEX IF NOT EXISTS idx_students_email ON students (email);

-- Optionally store the linked Supabase auth user ID once a student logs in
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;

COMMENT ON COLUMN students.email IS 'Institutional email used to link Supabase auth user to student record';
COMMENT ON COLUMN students.auth_user_id IS 'Supabase auth.users UUID, set on first login matching by email';

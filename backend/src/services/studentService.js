import { supabase } from '../config/supabase.js'

/** Fetch all active students with summary stats from views */
export async function getAllStudents() {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('is_active', true)
    .order('full_name')
  if (error) throw error
  return data
}

/** Fetch a single student by UUID */
export async function getStudentById(id) {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

/**
 * Find a student by their institutional email address.
 * Used to link a logged-in Supabase auth user to their student record.
 * On first match, stores the auth_user_id so future lookups can use it.
 */
export async function getStudentByEmail(email, authUserId = null) {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('email', email.toLowerCase())
    .eq('is_active', true)
    .maybeSingle()
  if (error) throw error

  // Opportunistically link the auth user ID on first successful lookup
  if (data && authUserId && !data.auth_user_id) {
    await supabase
      .from('students')
      .update({ auth_user_id: authUserId })
      .eq('id', data.id)
  }

  return data
}

/** Fetch a student's full academic profile (all related data for AI analysis) */
export async function getStudentProfile(id) {
  const [student, marks, attendance, lms, submissions, tutor, engagement] = await Promise.all([
    supabase.from('students').select('*').eq('id', id).single(),
    supabase.from('student_marks').select('*, modules(module_code, module_name)').eq('student_id', id),
    supabase.from('attendance').select('*, modules(module_code)').eq('student_id', id),
    supabase.from('lms_activity').select('*').eq('student_id', id).order('activity_date'),
    supabase.from('assessment_submissions').select('*, modules(module_code)').eq('student_id', id),
    supabase.from('tutor_support').select('*, modules(module_code)').eq('student_id', id),
    supabase.from('student_engagement').select('*').eq('student_id', id),
  ])

  for (const res of [student, marks, attendance, lms, submissions, tutor, engagement]) {
    if (res.error) throw res.error
  }

  return {
    student:                student.data,
    marks:                  marks.data,
    attendance:             attendance.data,
    lms_activity:           lms.data,
    assessment_submissions: submissions.data,
    tutor_sessions:         tutor.data,
    engagement:             engagement.data,
  }
}

/** Search students by name or student number */
export async function searchStudents(query) {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .or(`full_name.ilike.%${query}%,student_number.ilike.%${query}%`)
    .eq('is_active', true)
    .limit(20)
  if (error) throw error
  return data
}

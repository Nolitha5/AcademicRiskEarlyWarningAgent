import { supabase } from '../config/supabase.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import * as studentService from '../services/studentService.js'

/**
 * POST /api/student-auth/verify   (PUBLIC — no JWT required)
 *
 * Validates that a student record exists with the given student number,
 * that the submitted email matches the record, and that the account has not
 * already been activated. Called from the Register page before creating
 * a Supabase Auth account.
 */
export const verifyStudent = asyncHandler(async (req, res) => {
  const { student_number, email } = req.body

  if (!student_number || !email) {
    return res.status(400).json({ error: 'Student number and email are required.' })
  }

  const student = await studentService.getStudentByNumber(student_number.trim())

  if (!student) {
    return res.status(404).json({
      error: 'Student record not found. Please contact your administrator.',
    })
  }

  if (student.email?.toLowerCase() !== email.toLowerCase().trim()) {
    return res.status(400).json({
      error: 'The email address does not match the record for this student number.',
    })
  }

  if (student.auth_user_id) {
    return res.status(409).json({
      error: 'This student account has already been activated. Please sign in.',
    })
  }

  res.json({ success: true, message: 'Student record verified.' })
})

/**
 * POST /api/student-auth/activate   (PROTECTED — JWT required at route level)
 *
 * Links the authenticated Supabase Auth user to the matching student record
 * by writing auth_user_id = req.user.id into the students table.
 * Called immediately after signUp when a session is available
 * (i.e. when Supabase email confirmation is disabled).
 * If email confirmation is enabled, the linking is handled automatically by
 * getStudentByEmail() on the student's first dashboard load.
 */
export const activateStudent = asyncHandler(async (req, res) => {
  const { student_number } = req.body
  const authUserId = req.user.id
  const authEmail  = req.user.email?.toLowerCase()

  if (!student_number) {
    return res.status(400).json({ error: 'student_number is required.' })
  }

  const student = await studentService.getStudentByNumber(student_number.trim())

  if (!student) {
    return res.status(404).json({ error: 'Student record not found.' })
  }

  if (student.email?.toLowerCase() !== authEmail) {
    return res.status(403).json({ error: 'Email mismatch — cannot activate this account.' })
  }

  // If already linked to a different user, reject
  if (student.auth_user_id && student.auth_user_id !== authUserId) {
    return res.status(409).json({
      error: 'This student account has already been activated by a different user.',
    })
  }

  const { error } = await supabase
    .from('students')
    .update({ auth_user_id: authUserId })
    .eq('id', student.id)

  if (error) throw error

  res.json({ success: true, message: 'Account activated and linked successfully.' })
})

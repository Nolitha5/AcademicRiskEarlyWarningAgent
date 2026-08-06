import { asyncHandler } from '../utils/asyncHandler.js'
import { supabase } from '../config/supabase.js'

export const getStudentAttendance = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('attendance')
    .select('*, modules(module_code, module_name)')
    .eq('student_id', req.params.studentId)
    .order('session_date', { ascending: false })
  if (error) throw error
  res.json({ success: true, count: data.length, data })
})

export const getAttendanceSummary = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('v_student_attendance_summary')
    .select('*')
    .eq('student_id', req.params.studentId)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  res.json({ success: true, data: data ?? { attendance_pct: 0, total_sessions: 0, attended_sessions: 0 } })
})

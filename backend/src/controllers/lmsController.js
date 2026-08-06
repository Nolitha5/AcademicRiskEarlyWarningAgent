import { asyncHandler } from '../utils/asyncHandler.js'
import { supabase } from '../config/supabase.js'

export const getStudentLms = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('lms_activity')
    .select('*, modules(module_code, module_name)')
    .eq('student_id', req.params.studentId)
    .order('activity_date', { ascending: false })
  if (error) throw error
  res.json({ success: true, count: data.length, data })
})

export const getLmsSummary = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('v_student_lms_summary')
    .select('*')
    .eq('student_id', req.params.studentId)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  res.json({ success: true, data: data ?? { avg_logins_per_week: 0, total_logins: 0 } })
})

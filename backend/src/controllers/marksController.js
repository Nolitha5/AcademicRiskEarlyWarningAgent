import { asyncHandler } from '../utils/asyncHandler.js'
import { supabase } from '../config/supabase.js'

export const getStudentMarks = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('student_marks')
    .select('*, modules(module_code, module_name)')
    .eq('student_id', req.params.studentId)
    .order('assessment_date', { ascending: false })
  if (error) throw error
  res.json({ success: true, count: data.length, data })
})

export const getMarksSummary = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('v_student_mark_summary')
    .select('*')
    .eq('student_id', req.params.studentId)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  res.json({ success: true, data: data ?? { average_mark_pct: 0, total_assessments: 0, failed_assessments: 0 } })
})

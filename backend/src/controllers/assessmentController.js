import { asyncHandler } from '../utils/asyncHandler.js'
import { supabase } from '../config/supabase.js'

export const getStudentSubmissions = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('assessment_submissions')
    .select('*, modules(module_code, module_name)')
    .eq('student_id', req.params.studentId)
    .order('due_date', { ascending: false })
  if (error) throw error
  res.json({ success: true, count: data.length, data })
})

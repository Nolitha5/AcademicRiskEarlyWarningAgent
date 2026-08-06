import { asyncHandler } from '../utils/asyncHandler.js'
import { supabase } from '../config/supabase.js'

export const getStudentEngagement = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('student_engagement')
    .select('*')
    .eq('student_id', req.params.studentId)
    .order('activity_date', { ascending: false })
  if (error) throw error
  res.json({ success: true, count: data.length, data })
})

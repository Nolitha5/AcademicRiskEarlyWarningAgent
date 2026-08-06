import { asyncHandler } from '../utils/asyncHandler.js'
import { supabase } from '../config/supabase.js'

export const listModules = asyncHandler(async (_req, res) => {
  const { data, error } = await supabase
    .from('modules')
    .select('*')
    .eq('is_active', true)
    .order('module_code')
  if (error) throw error
  res.json({ success: true, count: data.length, data })
})

export const getModuleMarks = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('student_marks')
    .select('*, students(full_name, student_number)')
    .eq('module_id', req.params.moduleId)
    .order('assessment_date', { ascending: false })
  if (error) throw error
  res.json({ success: true, count: data.length, data })
})

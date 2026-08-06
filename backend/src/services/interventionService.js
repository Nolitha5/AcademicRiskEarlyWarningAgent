import { supabase } from '../config/supabase.js'

export async function getInterventionsByStudent(studentId) {
  const { data, error } = await supabase
    .from('interventions')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createIntervention(payload) {
  const { data, error } = await supabase
    .from('interventions')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateIntervention(id, updates) {
  const { data, error } = await supabase
    .from('interventions')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getAllInterventions(status) {
  let query = supabase
    .from('interventions')
    .select('*, students(full_name, student_number, programme)')
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) throw error
  return data
}

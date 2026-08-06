import { supabase } from '../config/supabase.js'
import { getStudentProfile } from './studentService.js'
import { analyseStudentRisk } from './aiService.js'

/**
 * Shape raw Supabase data into the StudentAcademicData payload
 * expected by the Python AI service (matches the Pydantic model).
 */
function shapeForAiService(profile) {
  const { student, marks, attendance, lms_activity, assessment_submissions, tutor_sessions, engagement } = profile

  // Group attendance by module for per-module counts
  const attendanceByModule = {}
  for (const a of attendance) {
    const code = a.modules?.module_code ?? 'UNKNOWN'
    if (!attendanceByModule[code]) attendanceByModule[code] = { attended: 0, total: 0 }
    attendanceByModule[code].total++
    if (a.attended) attendanceByModule[code].attended++
  }

  // Group LMS activity by week
  const lmsByWeek = {}
  for (const l of lms_activity) {
    const week = new Date(l.activity_date).toISOString().slice(0, 10)
    const weekStart = getWeekStart(week)
    if (!lmsByWeek[weekStart]) lmsByWeek[weekStart] = 0
    lmsByWeek[weekStart]++
  }

  return {
    student_id:     student.id,
    student_name:   student.full_name,
    student_number: student.student_number,
    programme:      student.programme,
    year_of_study:  student.year_of_study,

    marks: marks.map(m => ({
      module_code:     m.modules?.module_code ?? 'UNKNOWN',
      module_name:     m.modules?.module_name ?? 'Unknown Module',
      mark:            parseFloat(m.mark),
      max_mark:        parseFloat(m.max_mark),
      assessment_type: m.assessment_type,
    })),

    attendance: Object.entries(attendanceByModule).map(([code, vals]) => ({
      module_code:       code,
      sessions_attended: vals.attended,
      sessions_total:    vals.total,
    })),

    lms_activity: Object.entries(lmsByWeek).map(([week, count]) => ({
      week,
      login_count: count,
    })),

    assessment_submissions: assessment_submissions.map(sub => ({
      assessment_name: sub.assessment_name,
      submitted:       sub.submitted,
      due_date:        sub.due_date,
    })),

    tutor_sessions: tutor_sessions.map(t => ({
      session_date: t.session_date,
      attended:     t.attended,
      module_code:  t.modules?.module_code ?? 'UNKNOWN',
    })),

    engagement: engagement.map(e => ({
      activity_type: e.activity_type,
      count:         1,
      period:        e.activity_date,
    })),
  }
}

function getWeekStart(dateStr) {
  const d = new Date(dateStr)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().slice(0, 10)
}

/**
 * Run a full risk analysis for a student:
 * 1. Fetch profile from Supabase
 * 2. Shape data for AI service
 * 3. Call Python AI service
 * 4. Persist result in risk_reports
 * 5. Return the report
 */
export async function runRiskAnalysis(studentId) {
  const profile   = await getStudentProfile(studentId)
  const payload   = shapeForAiService(profile)
  const aiReport  = await analyseStudentRisk(payload)

  // Determine current semester (basic heuristic)
  const month    = new Date().getMonth() + 1
  const semester = month <= 6 ? 1 : 2
  const year     = new Date().getFullYear().toString()

  const reportRow = {
    student_id:            studentId,
    risk_level:            aiReport.risk_level,
    risk_score:            aiReport.risk_score,
    reasons:               aiReport.reasons,
    recommendations:       aiReport.recommendations,
    average_mark:          aiReport.average_mark,
    attendance_pct:        aiReport.attendance_pct,
    lms_logins_per_week:   aiReport.lms_logins_per_week,
    missed_assessments:    aiReport.missed_assessments,
    missed_tutor_sessions: aiReport.missed_tutor_sessions,
    analysed_at:           aiReport.analysed_at,
    academic_year:         year,
    semester,
  }

  const { data, error } = await supabase
    .from('risk_reports')
    .insert(reportRow)
    .select()
    .single()

  if (error) throw error

  return { ...aiReport, id: data.id, persisted: true }
}

/** Fetch the latest risk report for a student */
export async function getLatestRiskReport(studentId) {
  const { data, error } = await supabase
    .from('risk_reports')
    .select('*')
    .eq('student_id', studentId)
    .order('analysed_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code === 'PGRST116') return null // no report yet
  if (error) throw error
  return data
}

/** Fetch all risk reports for a student (history) */
export async function getRiskHistory(studentId) {
  const { data, error } = await supabase
    .from('risk_reports')
    .select('*')
    .eq('student_id', studentId)
    .order('analysed_at', { ascending: false })
  if (error) throw error
  return data
}

/** Fetch all latest risk reports (admin dashboard) */
export async function getAllRiskReports() {
  const { data, error } = await supabase
    .from('v_risk_dashboard')
    .select('*')
    .order('risk_score', { ascending: false })
  if (error) throw error
  return data
}

/** Fetch counts by risk level */
export async function getRiskSummary() {
  const { data, error } = await supabase
    .from('v_risk_dashboard')
    .select('risk_level')
  if (error) throw error

  const summary = { HIGH: 0, MEDIUM: 0, LOW: 0, NONE: 0, total: data.length }
  for (const r of data) summary[r.risk_level] = (summary[r.risk_level] ?? 0) + 1
  return summary
}

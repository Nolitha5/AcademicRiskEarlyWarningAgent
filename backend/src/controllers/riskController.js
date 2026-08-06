import { asyncHandler } from '../utils/asyncHandler.js'
import * as riskService    from '../services/riskService.js'
import * as studentService from '../services/studentService.js'
import { checkAiServiceHealth } from '../services/aiService.js'

/** GET /api/risk – all latest reports (admin dashboard) */
export const listAllRisk = asyncHandler(async (_req, res) => {
  const data = await riskService.getAllRiskReports()
  res.json({ success: true, count: data.length, data })
})

/** GET /api/risk/summary – count by risk level */
export const getRiskSummary = asyncHandler(async (_req, res) => {
  const data = await riskService.getRiskSummary()
  res.json({ success: true, data })
})

/**
 * GET /api/risk/my-report
 *
 * Securely returns the latest risk report for the currently authenticated student.
 * The student identity is derived entirely from the verified Supabase JWT — the
 * client never supplies a student ID, so cross-student access is impossible.
 *
 * Lookup chain:
 *   JWT → auth_user_id → students.id → risk_reports.student_id
 */
export const getMyRiskReport = asyncHandler(async (req, res) => {
  const authUserId = req.user.id
  const authEmail  = req.user.email

  // Resolve student securely from the authenticated user
  let student = await studentService.getStudentByAuthUserId(authUserId)
  if (!student && authEmail) {
    student = await studentService.getStudentByEmail(authEmail, authUserId)
  }
  if (!student) {
    return res.status(404).json({
      error: 'No student profile found for your account. Please contact your administrator.',
    })
  }

  const report = await riskService.getLatestRiskReport(student.id)
  if (!report) {
    return res.status(404).json({
      error: 'No risk report found. Please ask your administrator to run an analysis.',
    })
  }

  res.json({ success: true, data: report })
})

/** GET /api/risk/:studentId – latest report for a student (admin use) */
export const getStudentRisk = asyncHandler(async (req, res) => {
  const data = await riskService.getLatestRiskReport(req.params.studentId)
  if (!data) return res.status(404).json({ error: 'No risk report found. Run analysis first.' })
  res.json({ success: true, data })
})

/** GET /api/risk/:studentId/history – all reports for a student */
export const getRiskHistory = asyncHandler(async (req, res) => {
  const data = await riskService.getRiskHistory(req.params.studentId)
  res.json({ success: true, count: data.length, data })
})

/** POST /api/risk/:studentId/analyse – trigger AI analysis */
export const analyseRisk = asyncHandler(async (req, res) => {
  // Check AI service is up first
  const health = await checkAiServiceHealth()
  if (!health.healthy) {
    return res.status(503).json({ error: 'AI service is unavailable. Ensure Python service is running on port 8000.' })
  }
  const data = await riskService.runRiskAnalysis(req.params.studentId)
  res.status(201).json({ success: true, data })
})

/** POST /api/risk/analyse/all – trigger analysis for all active students */
export const analyseAllRisk = asyncHandler(async (req, res) => {
  const health = await checkAiServiceHealth()
  if (!health.healthy) {
    return res.status(503).json({ error: 'AI service is unavailable.' })
  }

  const { supabase } = await import('../config/supabase.js')
  const { data: students, error } = await supabase
    .from('students')
    .select('id')
    .eq('is_active', true)
  if (error) throw error

  const results = []
  for (const s of students) {
    try {
      const report = await riskService.runRiskAnalysis(s.id)
      results.push({ student_id: s.id, status: 'success', risk_level: report.risk_level })
    } catch (err) {
      results.push({ student_id: s.id, status: 'error', message: err.message })
    }
  }

  res.json({ success: true, analysed: results.length, results })
})

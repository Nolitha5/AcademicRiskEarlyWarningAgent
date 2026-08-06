import { Router } from 'express'
import {
  listAllRisk,
  getRiskSummary,
  getMyRiskReport,
  getStudentRisk,
  getRiskHistory,
  analyseRisk,
  analyseAllRisk,
} from '../controllers/riskController.js'

const router = Router()

// GET  /api/risk                     – all latest reports (admin dashboard)
router.get('/',                        listAllRisk)

// GET  /api/risk/summary             – counts by risk level
router.get('/summary',                 getRiskSummary)

// GET  /api/risk/my-report           – student's own report (secured via JWT)
// MUST be before /:studentId to avoid 'my-report' matching as a UUID param
router.get('/my-report',               getMyRiskReport)

// POST /api/risk/analyse/all         – batch analyse all students
router.post('/analyse/all',            analyseAllRisk)

// GET  /api/risk/:studentId          – latest report for student (admin)
router.get('/:studentId',             getStudentRisk)

// GET  /api/risk/:studentId/history  – all reports for student
router.get('/:studentId/history',     getRiskHistory)

// POST /api/risk/:studentId/analyse  – trigger analysis for student
router.post('/:studentId/analyse',    analyseRisk)

export default router

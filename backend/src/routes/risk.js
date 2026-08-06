import { Router } from 'express'
import {
  listAllRisk,
  getRiskSummary,
  getStudentRisk,
  getRiskHistory,
  analyseRisk,
  analyseAllRisk,
} from '../controllers/riskController.js'

const router = Router()

// GET  /api/risk                       – all latest reports
router.get('/',                         listAllRisk)
// GET  /api/risk/summary               – counts by risk level
router.get('/summary',                  getRiskSummary)
// POST /api/risk/analyse/all           – batch analyse all students
router.post('/analyse/all',             analyseAllRisk)
// GET  /api/risk/:studentId            – latest report for student
router.get('/:studentId',              getStudentRisk)
// GET  /api/risk/:studentId/history    – all reports for student
router.get('/:studentId/history',      getRiskHistory)
// POST /api/risk/:studentId/analyse   – trigger analysis for student
router.post('/:studentId/analyse',     analyseRisk)

export default router

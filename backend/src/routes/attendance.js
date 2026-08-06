import { Router } from 'express'
import { getStudentAttendance, getAttendanceSummary } from '../controllers/attendanceController.js'

const router = Router()

router.get('/:studentId',         getStudentAttendance)
router.get('/:studentId/summary', getAttendanceSummary)

export default router

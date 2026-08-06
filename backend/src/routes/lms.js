import { Router } from 'express'
import { getStudentLms, getLmsSummary } from '../controllers/lmsController.js'

const router = Router()

router.get('/:studentId',         getStudentLms)
router.get('/:studentId/summary', getLmsSummary)

export default router

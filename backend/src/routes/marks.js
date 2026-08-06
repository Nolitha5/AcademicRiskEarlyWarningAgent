import { Router } from 'express'
import { getStudentMarks, getMarksSummary } from '../controllers/marksController.js'

const router = Router()

router.get('/:studentId',         getStudentMarks)
router.get('/:studentId/summary', getMarksSummary)

export default router

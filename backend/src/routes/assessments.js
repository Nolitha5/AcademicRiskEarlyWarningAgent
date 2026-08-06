import { Router } from 'express'
import { getStudentSubmissions } from '../controllers/assessmentController.js'

const router = Router()

router.get('/:studentId', getStudentSubmissions)

export default router

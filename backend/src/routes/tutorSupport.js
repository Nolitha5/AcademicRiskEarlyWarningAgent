import { Router } from 'express'
import { getStudentTutorSessions } from '../controllers/tutorController.js'

const router = Router()

router.get('/:studentId', getStudentTutorSessions)

export default router

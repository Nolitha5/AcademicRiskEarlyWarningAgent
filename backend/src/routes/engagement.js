import { Router } from 'express'
import { getStudentEngagement } from '../controllers/engagementController.js'

const router = Router()

router.get('/:studentId', getStudentEngagement)

export default router

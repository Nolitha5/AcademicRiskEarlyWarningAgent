import { Router } from 'express'
import { listStudents, getStudent, getStudentProfile } from '../controllers/studentController.js'

const router = Router()

// GET /api/students?q=search
router.get('/', listStudents)

// GET /api/students/:id
router.get('/:id', getStudent)

// GET /api/students/:id/profile
router.get('/:id/profile', getStudentProfile)

export default router

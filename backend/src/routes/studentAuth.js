import { Router } from 'express'
import { verifyStudent, activateStudent } from '../controllers/studentAuthController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

// Public — no JWT required (called before creating Supabase Auth account)
router.post('/verify', verifyStudent)

// Protected — JWT applied at route level (called after signUp when session exists)
router.post('/activate', authMiddleware, activateStudent)

export default router

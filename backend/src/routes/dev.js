import { Router } from 'express'
import { getTestToken, listDevStudents, devTestLogin } from '../controllers/devController.js'

const router = Router()

// GET  /dev/test-token  – generate a 5-digit one-time code (5 min TTL)
router.get('/test-token', getTestToken)

// GET  /dev/students    – list active students for the selector
router.get('/students',   listDevStudents)

// POST /dev/test-login  – validate code + student, return magic-link hashed_token
router.post('/test-login', devTestLogin)

export default router

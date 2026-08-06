import express    from 'express'
import cors       from 'cors'
import helmet     from 'helmet'
import morgan     from 'morgan'
import rateLimit  from 'express-rate-limit'
import { errorHandler }  from './middleware/errorHandler.js'
import { authMiddleware } from './middleware/auth.js'

// Routes
import studentAuthRoutes  from './routes/studentAuth.js'   // public — must be before authMiddleware
import studentRoutes      from './routes/students.js'
import moduleRoutes       from './routes/modules.js'
import attendanceRoutes   from './routes/attendance.js'
import marksRoutes        from './routes/marks.js'
import lmsRoutes          from './routes/lms.js'
import assessmentRoutes   from './routes/assessments.js'
import tutorRoutes        from './routes/tutorSupport.js'
import engagementRoutes   from './routes/engagement.js'
import interventionRoutes from './routes/interventions.js'
import riskRoutes         from './routes/risk.js'

const app = express()

// ── Global middleware ─────────────────────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  credentials: true,
}))
app.use(morgan('dev'))
app.use(express.json())
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500, standardHeaders: true }))

// ── Health check (public) ────────────────────────────────────────────────────
app.get('/health', (_req, res) =>
  res.json({ status: 'ok', service: 'TUT REW API', timestamp: new Date().toISOString() })
)

// ── Student auth (public — verify + activate, BEFORE JWT middleware) ─────────
// POST /api/student-auth/verify   – validate student record before signUp
// POST /api/student-auth/activate – link auth_user_id after signUp (needs its own JWT check)
app.use('/api/student-auth', studentAuthRoutes)

// ── All other API routes are JWT-protected ────────────────────────────────────
app.use('/api', authMiddleware)

app.use('/api/students',       studentRoutes)
app.use('/api/modules',        moduleRoutes)
app.use('/api/attendance',     attendanceRoutes)
app.use('/api/marks',          marksRoutes)
app.use('/api/lms',            lmsRoutes)
app.use('/api/assessments',    assessmentRoutes)
app.use('/api/tutor-support',  tutorRoutes)
app.use('/api/engagement',     engagementRoutes)
app.use('/api/interventions',  interventionRoutes)
app.use('/api/risk',           riskRoutes)

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }))

// ── Centralised error handler ─────────────────────────────────────────────────
app.use(errorHandler)

export default app

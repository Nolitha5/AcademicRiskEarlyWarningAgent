import { asyncHandler } from '../utils/asyncHandler.js'
import { supabase }      from '../config/supabase.js'

// ── In-memory code store (single-process dev server) ─────────────────────────
// { code: string → { expiresAt: number } }
const pendingCodes = new Map()

function generateCode() {
  return String(Math.floor(10000 + Math.random() * 90000))
}

function purgeExpired() {
  const now = Date.now()
  for (const [code, entry] of pendingCodes) {
    if (entry.expiresAt < now) pendingCodes.delete(code)
  }
}

// ── GET /dev/test-token ───────────────────────────────────────────────────────
// Generates a 5-digit code valid for 5 minutes.
export const getTestToken = asyncHandler(async (_req, res) => {
  purgeExpired()
  const code = generateCode()
  pendingCodes.set(code, { expiresAt: Date.now() + 5 * 60 * 1000 })
  res.json({ success: true, code })
})

// ── GET /dev/students ─────────────────────────────────────────────────────────
// Returns active students (student_number + full_name) for the selector UI.
export const listDevStudents = asyncHandler(async (_req, res) => {
  const { data, error } = await supabase
    .from('students')
    .select('id, student_number, full_name, email')
    .eq('is_active', true)
    .order('full_name')
  if (error) throw error
  res.json({ success: true, data })
})

// ── POST /dev/test-login ──────────────────────────────────────────────────────
// Body: { student_number, code }
// Validates the code, generates a magic-link token via Supabase Admin,
// returns hashed_token so the frontend can exchange it for a real session.
export const devTestLogin = asyncHandler(async (req, res) => {
  const { student_number, code } = req.body ?? {}

  if (!student_number || !code) {
    return res.status(400).json({ error: 'student_number and code are required.' })
  }

  // Validate code
  purgeExpired()
  const entry = pendingCodes.get(String(code))
  if (!entry) {
    return res.status(401).json({ error: 'Invalid or expired code. Request a new one.' })
  }
  // Consume it — one-time use
  pendingCodes.delete(String(code))

  // Look up the student
  const { data: student, error: stuErr } = await supabase
    .from('students')
    .select('id, email, full_name, auth_user_id')
    .eq('student_number', student_number.trim())
    .eq('is_active', true)
    .maybeSingle()

  if (stuErr) throw stuErr
  if (!student) {
    return res.status(404).json({ error: `No active student found with number "${student_number}".` })
  }
  if (!student.email) {
    return res.status(422).json({ error: 'Student has no email address on record.' })
  }

  // If the student doesn't have a Supabase Auth account yet, create one now.
  // We use a random secure password they will never need to know.
  if (!student.auth_user_id) {
    const tempPassword = crypto.randomUUID() + crypto.randomUUID()
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email:    student.email,
      password: tempPassword,
      email_confirm: true,
    })
    if (createErr && createErr.message !== 'User already registered') throw createErr

    if (created?.user) {
      // Link auth_user_id to the student row
      await supabase.from('students')
        .update({ auth_user_id: created.user.id })
        .eq('id', student.id)
    }
  }

  // Generate a magic-link token — this produces a real Supabase session
  const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
    type:  'magiclink',
    email: student.email,
  })
  if (linkErr) throw linkErr

  // The hashed_token is what the frontend exchanges via verifyOtp
  const hashed_token = linkData?.properties?.hashed_token
  if (!hashed_token) {
    return res.status(500).json({ error: 'Failed to generate login token.' })
  }

  res.json({
    success:      true,
    hashed_token,
    student_name: student.full_name,
    email:        student.email,
  })
})

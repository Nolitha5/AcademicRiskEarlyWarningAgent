import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { supabase } from '../lib/supabase'
import api from '../lib/api'

/**
 * Student Registration page
 *
 * Flow:
 * 1. Collect: student number, email, password, confirm password
 * 2. POST /api/student-auth/verify  (public) — confirms the student record
 *    exists, the email matches, and the account isn't already activated
 * 3. supabase.auth.signUp(email, password)
 * 4. If Supabase returns a session immediately (email confirmation disabled):
 *    POST /api/student-auth/activate — writes auth_user_id to the student row
 * 5. If no immediate session (email confirmation enabled):
 *    auth_user_id is linked automatically on the student's first dashboard load
 *    via the getStudentByEmail fallback in /api/students/me
 * 6. Redirect to /student-login
 *
 * No new row is ever inserted into the students table.
 */
export default function RegisterPage() {
  const navigate = useNavigate()

  const [studentNumber, setStudentNumber] = useState('')
  const [email,         setEmail]         = useState('')
  const [password,      setPassword]      = useState('')
  const [confirm,       setConfirm]       = useState('')
  const [error,         setError]         = useState('')
  const [status,        setStatus]        = useState('')   // progress feedback
  const [loading,       setLoading]       = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setStatus('')

    // ── Local validation ───────────────────────────────────────────────────
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      // ── Step 1: Verify student record ──────────────────────────────────
      setStatus('Verifying student record…')
      try {
        await api.post('/student-auth/verify', {
          student_number: studentNumber.trim(),
          email: email.trim(),
        })
      } catch (err: any) {
        const msg = err.response?.data?.error ?? 'Could not verify student record. Please try again.'
        setError(msg)
        return
      }

      // ── Step 2: Create Supabase Auth account ──────────────────────────
      setStatus('Creating account…')
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      // ── Step 3: Link auth_user_id immediately if session is available ──
      // (happens when Supabase email confirmation is disabled)
      if (signUpData.session) {
        setStatus('Linking account…')
        try {
          await api.post('/student-auth/activate', {
            student_number: studentNumber.trim(),
          })
        } catch {
          // Non-fatal: the fallback email-based link in /students/me will handle
          // this on the student's first dashboard load
        }
      }

      // ── Step 4: Redirect to student login ─────────────────────────────
      setStatus('')
      navigate('/student-login', {
        state: {
          message: signUpData.session
            ? 'Account activated! You can now sign in.'
            : 'Account created. Please check your email to confirm, then sign in.',
        },
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          {/* Logo — no TUT text */}
          <div className="flex items-center gap-2 mb-6">
            <ShieldAlert size={22} className="text-blue-400" />
            <span className="font-bold text-white text-lg">REW</span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">Student Registration</h1>
          <p className="text-sm text-slate-400 mb-6">
            Register using your existing student number. No new record will be created — your existing academic data will be linked to this account.
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-500/20 border border-red-500/40 text-red-300 text-sm rounded-lg">
              {error}
            </div>
          )}

          {status && !error && (
            <div className="mb-4 px-4 py-3 bg-blue-500/20 border border-blue-500/40 text-blue-300 text-sm rounded-lg flex items-center gap-2">
              <span className="animate-spin inline-block h-3 w-3 border-2 border-blue-400 border-t-transparent rounded-full" />
              {status}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Student Number
              </label>
              <input
                type="text"
                required
                value={studentNumber}
                onChange={e => setStudentNumber(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 21312345"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your institutional email"
              />
              <p className="mt-1 text-xs text-slate-500">
                Must match the email on your student record.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Min. 6 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Repeat password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold rounded-lg text-sm transition-colors"
            >
              {loading ? 'Registering…' : 'Register'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/student-login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>

          <p className="mt-3 text-center text-sm">
            <Link to="/" className="text-slate-500 hover:text-white transition-colors">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

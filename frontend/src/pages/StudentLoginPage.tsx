import { FormEvent, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { ShieldAlert, ChevronDown, ChevronUp, FlaskConical, RefreshCw } from 'lucide-react'

const DEV_API = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') ?? 'http://localhost:3001'
const IS_DEV  = import.meta.env.DEV

interface DevStudent {
  id:             string
  student_number: string
  full_name:      string
  email:          string
}

export default function StudentLoginPage() {
  const { login } = useAuth()
  const navigate   = useNavigate()
  const location   = useLocation()
  const flashMsg   = (location.state as any)?.message ?? ''

  // ── Normal login state ────────────────────────────────────────────────────
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  // ── Dev login state ───────────────────────────────────────────────────────
  const [devOpen,      setDevOpen]      = useState(false)
  const [devStudents,  setDevStudents]  = useState<DevStudent[]>([])
  const [devStudent,   setDevStudent]   = useState('')   // student_number
  const [devCode,      setDevCode]      = useState('')   // server-generated code
  const [devInput,     setDevInput]     = useState('')   // user-typed code
  const [devError,     setDevError]     = useState('')
  const [devLoading,   setDevLoading]   = useState(false)
  const [codeReady,    setCodeReady]    = useState(false)

  // Load student list when dev panel opens
  useEffect(() => {
    if (!devOpen || devStudents.length > 0) return
    fetch(`${DEV_API}/dev/students`)
      .then(r => r.json())
      .then(j => setDevStudents(j.data ?? []))
      .catch(() => setDevError('Could not load student list.'))
  }, [devOpen])

  // ── Normal login ──────────────────────────────────────────────────────────
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message ?? 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  // ── Dev: request a one-time code from the server ──────────────────────────
  async function requestCode() {
    setDevError('')
    setCodeReady(false)
    setDevInput('')
    setDevLoading(true)
    try {
      const res  = await fetch(`${DEV_API}/dev/test-token`)
      const json = await res.json()
      if (!json.success) throw new Error(json.error ?? 'Failed to get code')
      setDevCode(json.code)
      setCodeReady(true)
    } catch (err: any) {
      setDevError(err.message)
    } finally {
      setDevLoading(false)
    }
  }

  // ── Dev: exchange code + student for a real session ───────────────────────
  async function handleDevLogin(e: FormEvent) {
    e.preventDefault()
    setDevError('')
    if (!devStudent) { setDevError('Select a student first.'); return }
    if (devInput.trim() !== devCode) { setDevError('Code does not match. Request a new one.'); return }

    setDevLoading(true)
    try {
      const res  = await fetch(`${DEV_API}/dev/test-login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ student_number: devStudent, code: devInput.trim() }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Dev login failed')

      // Exchange the hashed_token for a real Supabase session
      const { error: otpErr } = await supabase.auth.verifyOtp({
        token_hash: json.hashed_token,
        type:       'magiclink',
      })
      if (otpErr) throw new Error(otpErr.message)

      navigate('/dashboard')
    } catch (err: any) {
      setDevError(err.message)
      setCodeReady(false)
      setDevCode('')
    } finally {
      setDevLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-6">
            <ShieldAlert size={22} className="text-blue-400" />
            <span className="font-bold text-white text-lg">REW</span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">Student Login</h1>
          <p className="text-sm text-slate-400 mb-6">Enter your credentials to access your student dashboard.</p>

          {/* Flash message after registration */}
          {flashMsg && (
            <div className="mb-4 px-4 py-3 bg-green-500/20 border border-green-500/40 text-green-300 text-sm rounded-lg">
              {flashMsg}
            </div>
          )}

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-500/20 border border-red-500/40 text-red-300 text-sm rounded-lg">
              {error}
            </div>
          )}

          {/* Normal login form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="student@tut.ac.za"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold rounded-lg text-sm transition-colors"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Register link */}
          <div className="mt-5 pt-5 border-t border-white/10 text-center">
            <p className="text-sm text-slate-400">Don't have an account?</p>
            <Link
              to="/register"
              className="inline-block mt-2 px-5 py-2 rounded-lg border border-blue-500 text-blue-400 hover:bg-blue-600 hover:text-white text-sm font-medium transition-colors"
            >
              Register here
            </Link>
          </div>

          {/* ── Developer Testing Login (dev builds only) ───────────────── */}
          {IS_DEV && (
            <div className="mt-5 pt-5 border-t border-white/10">
              <button
                type="button"
                onClick={() => setDevOpen(o => !o)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-medium hover:bg-amber-500/20 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <FlaskConical size={15} />
                  Developer Testing Login
                </span>
                {devOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>

              {devOpen && (
                <div className="mt-3 px-4 py-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-4">
                  <p className="text-xs text-amber-300/70 leading-relaxed">
                    Dev-only. Generates a real Supabase session for any student without their password.
                    Disabled in production.
                  </p>

                  {devError && (
                    <div className="px-3 py-2 bg-red-500/20 border border-red-500/40 text-red-300 text-xs rounded-lg">
                      {devError}
                    </div>
                  )}

                  <form onSubmit={handleDevLogin} className="space-y-3">
                    {/* Student selector */}
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Student</label>
                      <select
                        value={devStudent}
                        onChange={e => { setDevStudent(e.target.value); setCodeReady(false); setDevCode(''); setDevInput('') }}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="" className="bg-slate-800">— Select student —</option>
                        {devStudents.map(s => (
                          <option key={s.id} value={s.student_number} className="bg-slate-800">
                            {s.full_name} ({s.student_number})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Step 1: Request code */}
                    {!codeReady ? (
                      <button
                        type="button"
                        onClick={requestCode}
                        disabled={devLoading || !devStudent}
                        className="w-full flex items-center justify-center gap-2 py-2 bg-amber-600/70 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
                      >
                        <RefreshCw size={13} className={devLoading ? 'animate-spin' : ''} />
                        {devLoading ? 'Generating…' : 'Generate Code'}
                      </button>
                    ) : (
                      <>
                        {/* Show the generated code */}
                        <div className="text-center">
                          <p className="text-xs text-slate-400 mb-1">Your one-time testing code (valid 5 min):</p>
                          <p className="text-3xl font-mono font-bold tracking-[0.25em] text-amber-300">
                            {devCode}
                          </p>
                        </div>

                        {/* Step 2: Type code back to confirm */}
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            Type the code above to confirm
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={5}
                            value={devInput}
                            onChange={e => setDevInput(e.target.value.replace(/\D/g, ''))}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white text-center tracking-widest font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            placeholder="_ _ _ _ _"
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={devLoading || devInput.length !== 5}
                            className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
                          >
                            {devLoading ? 'Logging in…' : 'Log In as Student'}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setCodeReady(false); setDevCode(''); setDevInput('') }}
                            className="px-3 py-2 border border-white/20 text-slate-400 hover:text-white text-sm rounded-lg transition-colors"
                          >
                            Reset
                          </button>
                        </div>
                      </>
                    )}
                  </form>
                </div>
              )}
            </div>
          )}

          <p className="mt-5 text-center text-sm">
            <Link to="/" className="text-slate-500 hover:text-white transition-colors">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

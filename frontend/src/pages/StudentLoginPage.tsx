import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ShieldAlert } from 'lucide-react'

export default function StudentLoginPage() {
  const { login } = useAuth()
  const navigate   = useNavigate()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          {/* Logo — no TUT text */}
          <div className="flex items-center gap-2 mb-6">
            <ShieldAlert size={22} className="text-blue-400" />
            <span className="font-bold text-white text-lg">REW</span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">Student Login</h1>
          <p className="text-sm text-slate-400 mb-6">Enter your credentials to access your student dashboard.</p>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-500/20 border border-red-500/40 text-red-300 text-sm rounded-lg">
              {error}
            </div>
          )}

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
            <p className="text-sm text-slate-400">
              Don't have an account?
            </p>
            <Link
              to="/register"
              className="inline-block mt-2 px-5 py-2 rounded-lg border border-blue-500 text-blue-400 hover:bg-blue-600 hover:text-white text-sm font-medium transition-colors"
            >
              Register here
            </Link>
          </div>

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

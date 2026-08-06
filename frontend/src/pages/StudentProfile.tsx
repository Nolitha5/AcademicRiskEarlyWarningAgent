import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Layout from '../components/common/Layout'
import RiskBadge from '../components/common/RiskBadge'
import api from '../lib/api'
import { ArrowLeft, User, ChevronRight } from 'lucide-react'

interface StudentDetail {
  id:             string
  student_number: string
  full_name:      string
  email:          string
  programme:      string
  year_of_study:  number
  faculty:        string
  is_active:      boolean
  created_at:     string
}

interface LatestRisk {
  risk_level: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE'
  risk_score: number
  analysed_at: string
}

export default function StudentProfile() {
  const { id }   = useParams<{ id: string }>()
  const [student, setStudent] = useState<StudentDetail | null>(null)
  const [risk,    setRisk]    = useState<LatestRisk | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const [studRes, riskRes] = await Promise.allSettled([
          api.get(`/students/${id}`),
          api.get(`/risk/${id}`),
        ])
        if (studRes.status === 'fulfilled') setStudent(studRes.value.data.data)
        else setError('Could not load student profile.')
        if (riskRes.status === 'fulfilled') setRisk(riskRes.value.data.data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const Field = ({ label, value }: { label: string; value?: string | number | boolean }) => (
    <div className="py-3 border-b border-slate-100 last:border-0 flex flex-col sm:flex-row sm:items-center gap-1">
      <span className="text-sm text-slate-500 sm:w-48 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-slate-800">{String(value ?? '—')}</span>
    </div>
  )

  return (
    <Layout>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin" className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-sm transition-colors">
          <ArrowLeft size={16} /> Back
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-sm text-slate-600">Student Profile</span>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : student ? (
        <div className="grid sm:grid-cols-3 gap-6">
          {/* Left panel */}
          <div className="sm:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <User size={22} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">{student.full_name}</h1>
                <p className="text-sm text-slate-400">{student.student_number}</p>
              </div>
            </div>
            <Field label="Email"           value={student.email} />
            <Field label="Programme"       value={student.programme} />
            <Field label="Faculty"         value={student.faculty} />
            <Field label="Year of Study"   value={student.year_of_study} />
            <Field label="Status"          value={student.is_active ? 'Active' : 'Inactive'} />
            <Field label="Registered"      value={new Date(student.created_at).toLocaleDateString()} />
          </div>

          {/* Right panel */}
          <div className="flex flex-col gap-4">
            {/* Risk summary */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-3">Latest Risk</h2>
              {risk ? (
                <>
                  <div className="flex items-center gap-3 mb-1">
                    <RiskBadge level={risk.risk_level} />
                    <span className="text-2xl font-bold text-slate-800">{risk.risk_score?.toFixed(0)}</span>
                  </div>
                  <p className="text-xs text-slate-400">{new Date(risk.analysed_at).toLocaleString()}</p>
                </>
              ) : (
                <p className="text-sm text-slate-400">No analysis yet</p>
              )}
              <Link
                to={`/students/${id}/risk`}
                className="mt-4 flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View full report <ChevronRight size={14} />
              </Link>
            </div>

            {/* Quick links */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-3">Actions</h2>
              <div className="space-y-2">
                <Link
                  to={`/students/${id}/risk`}
                  className="flex items-center justify-between text-sm text-slate-700 hover:text-blue-600 py-1.5 border-b border-slate-100"
                >
                  Risk Report <ChevronRight size={14} />
                </Link>
                <Link
                  to={`/students/${id}/interventions`}
                  className="flex items-center justify-between text-sm text-slate-700 hover:text-blue-600 py-1.5"
                >
                  Intervention History <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </Layout>
  )
}

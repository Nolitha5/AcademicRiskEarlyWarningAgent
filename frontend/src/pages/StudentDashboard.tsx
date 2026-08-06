import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/common/Layout'
import RiskBadge from '../components/common/RiskBadge'
import StatCard from '../components/common/StatCard'
import api from '../lib/api'
import { supabase } from '../lib/supabase'
import { BookOpen, Activity, Monitor, AlertTriangle, ChevronRight } from 'lucide-react'

interface RiskReport {
  risk_level:   'HIGH' | 'MEDIUM' | 'LOW' | 'NONE'
  risk_score:   number
  average_mark: number
  attendance_pct: number
  lms_logins_per_week: number
  missed_assessments: number
  reasons: { code: string; description: string; severity: string }[]
  recommendations: { type: string; description: string; priority: string }[]
  analysed_at: string
}

interface Student {
  id: string
  full_name: string
  student_number: string
  programme: string
  year_of_study: number
}

export default function StudentDashboard() {
  const [student,  setStudent]  = useState<Student | null>(null)
  const [report,   setReport]   = useState<RiskReport | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [running,  setRunning]  = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Find the student record linked to this user's email
        const studRes = await api.get(`/students?email=${encodeURIComponent(user.email ?? '')}`)
        const students = studRes.data.data ?? []
        if (!students.length) {
          setError('No student profile found for your account. Please contact your administrator.')
          return
        }
        const s = students[0]
        setStudent(s)

        // Load their latest risk report
        try {
          const riskRes = await api.get(`/risk/${s.id}`)
          setReport(riskRes.data.data)
        } catch {
          // No report yet — that's fine
        }
      } catch (err: any) {
        setError(err.response?.data?.error ?? err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function runAnalysis() {
    if (!student) return
    setRunning(true)
    try {
      const res = await api.post(`/risk/${student.id}/analyse`)
      setReport(res.data.data)
    } catch (err: any) {
      setError(err.response?.data?.error ?? err.message)
    } finally {
      setRunning(false)
    }
  }

  const priorityColor: Record<string, string> = {
    URGENT: 'bg-red-50 border-red-200 text-red-800',
    HIGH:   'bg-amber-50 border-amber-200 text-amber-800',
    MEDIUM: 'bg-blue-50 border-blue-200 text-blue-800',
    LOW:    'bg-slate-50 border-slate-200 text-slate-700',
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Student header */}
      {student && (
        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{student.full_name}</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {student.student_number} · {student.programme} · Year {student.year_of_study}
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link
              to={`/students/${student.id}/profile`}
              className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              My Profile
            </Link>
            <button
              onClick={runAnalysis}
              disabled={running}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              <Activity size={15} className={running ? 'animate-pulse' : ''} />
              {running ? 'Analysing…' : 'Run Analysis'}
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      {report && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Average Mark"
              value={`${report.average_mark?.toFixed(1)}%`}
              icon={<BookOpen size={18} />}
              color={report.average_mark >= 50 ? 'green' : 'red'}
            />
            <StatCard
              label="Attendance"
              value={`${report.attendance_pct?.toFixed(1)}%`}
              icon={<Activity size={18} />}
              color={report.attendance_pct >= 80 ? 'green' : report.attendance_pct >= 60 ? 'amber' : 'red'}
            />
            <StatCard
              label="LMS Logins/Week"
              value={report.lms_logins_per_week?.toFixed(1)}
              icon={<Monitor size={18} />}
              color="blue"
            />
            <StatCard
              label="Missed Assessments"
              value={report.missed_assessments}
              icon={<AlertTriangle size={18} />}
              color={report.missed_assessments === 0 ? 'green' : 'red'}
            />
          </div>

          {/* Risk card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-slate-500 mb-1">Current Risk Level</p>
              <div className="flex items-center gap-3">
                <RiskBadge level={report.risk_level} />
                <span className="text-3xl font-bold text-slate-800">{report.risk_score?.toFixed(0)}<span className="text-lg text-slate-400">/100</span></span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Last analysed: {new Date(report.analysed_at).toLocaleString()}
              </p>
            </div>
            <Link
              to={`/students/${student?.id}/risk`}
              className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Full report <ChevronRight size={16} />
            </Link>
          </div>

          {/* Reasons */}
          {report.reasons?.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
              <h2 className="text-base font-semibold text-slate-800 mb-3">Risk Factors</h2>
              <ul className="space-y-2">
                {report.reasons.map(r => (
                  <li key={r.code} className="flex items-start gap-2 text-sm">
                    <span className={`mt-0.5 inline-flex px-1.5 py-0.5 rounded text-xs font-semibold ${
                      r.severity === 'HIGH' ? 'bg-red-100 text-red-700' :
                      r.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                    }`}>{r.severity}</span>
                    <span className="text-slate-700">{r.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {report.recommendations?.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-base font-semibold text-slate-800 mb-3">Recommended Actions</h2>
              <div className="space-y-2">
                {report.recommendations.map(rec => (
                  <div key={rec.type} className={`border rounded-lg px-4 py-3 text-sm ${priorityColor[rec.priority] ?? 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                    <span className="font-semibold uppercase text-xs tracking-wide">{rec.priority}</span>
                    <p className="mt-0.5">{rec.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {!report && !loading && student && (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <p className="text-slate-500 text-sm mb-3">No risk analysis has been run yet for your account.</p>
          <button
            onClick={runAnalysis}
            disabled={running}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {running ? 'Analysing…' : 'Run My Analysis'}
          </button>
        </div>
      )}
    </Layout>
  )
}

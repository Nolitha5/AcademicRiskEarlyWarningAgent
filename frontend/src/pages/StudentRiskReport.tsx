import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import Layout from '../components/common/Layout'
import RiskBadge from '../components/common/RiskBadge'
import StatCard from '../components/common/StatCard'
import api from '../lib/api'
import { ArrowLeft, BookOpen, Activity, Monitor, AlertTriangle, RefreshCw } from 'lucide-react'

interface RiskReport {
  id:                    string
  student_id:            string
  student_name:          string
  risk_level:            'HIGH' | 'MEDIUM' | 'LOW' | 'NONE'
  risk_score:            number
  average_mark:          number
  attendance_pct:        number
  lms_logins_per_week:   number
  missed_assessments:    number
  missed_tutor_sessions: number
  failed_modules:        number
  reasons:               { code: string; description: string; severity: string }[]
  recommendations:       { type: string; description: string; priority: string }[]
  module_marks:          { module_code: string; module_name: string; mark: number; max_mark: number }[]
  analysed_at:           string
}

const gaugeColor = (score: number) =>
  score >= 70 ? '#ef4444' : score >= 40 ? '#f59e0b' : score >= 1 ? '#22c55e' : '#94a3b8'

export default function StudentRiskReport() {
  const { id }  = useParams<{ id: string }>()
  const [report,   setReport]   = useState<RiskReport | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [running,  setRunning]  = useState(false)
  const [error,    setError]    = useState('')

  async function loadReport() {
    setLoading(true)
    setError('')
    try {
      const res = await api.get(`/risk/${id}`)
      setReport(res.data.data)
    } catch (err: any) {
      if (err.response?.status === 404) setError('No risk report found. Run analysis first.')
      else setError(err.response?.data?.error ?? err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadReport() }, [id])

  async function reanalyse() {
    setRunning(true)
    try {
      const res = await api.post(`/risk/${id}/analyse`)
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

  // Build chart data from module_marks
  const chartData = report?.module_marks?.map(m => ({
    name: m.module_code,
    pct:  m.max_mark ? Math.round((m.mark / m.max_mark) * 100) : 0,
  })) ?? []

  return (
    <Layout>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin" className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-sm transition-colors">
          <ArrowLeft size={16} /> Back
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-sm text-slate-600">Risk Report</span>
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
      ) : report ? (
        <>
          {/* Header */}
          <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{report.student_name}</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Last analysed: {new Date(report.analysed_at).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to={`/students/${id}/interventions`}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
              >
                Interventions
              </Link>
              <button
                onClick={reanalyse}
                disabled={running}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                <RefreshCw size={15} className={running ? 'animate-spin' : ''} />
                {running ? 'Running…' : 'Re-analyse'}
              </button>
            </div>
          </div>

          {/* Risk score hero */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6 flex flex-col sm:flex-row items-center gap-6">
            {/* Score gauge (simple circle) */}
            <div className="relative flex-shrink-0" style={{ width: 120, height: 120 }}>
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                <circle
                  cx="60" cy="60" r="50" fill="none"
                  stroke={gaugeColor(report.risk_score)}
                  strokeWidth="12"
                  strokeDasharray={`${(report.risk_score / 100) * 314} 314`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-slate-800">{report.risk_score?.toFixed(0)}</span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <RiskBadge level={report.risk_level} />
                <span className="text-slate-400 text-sm">Risk Level</span>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-3">
                <div>
                  <p className="text-xs text-slate-400">Missed assessments</p>
                  <p className="text-lg font-bold text-slate-800">{report.missed_assessments}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Missed tutor sessions</p>
                  <p className="text-lg font-bold text-slate-800">{report.missed_tutor_sessions}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Failed modules</p>
                  <p className="text-lg font-bold text-slate-800">{report.failed_modules}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <StatCard label="Average Mark"     value={`${report.average_mark?.toFixed(1)}%`}         icon={<BookOpen size={18}/>}     color={report.average_mark >= 50 ? 'green' : 'red'} />
            <StatCard label="Attendance"        value={`${report.attendance_pct?.toFixed(1)}%`}        icon={<Activity size={18}/>}     color={report.attendance_pct >= 80 ? 'green' : 'amber'} />
            <StatCard label="LMS Logins / wk"  value={report.lms_logins_per_week?.toFixed(1)}          icon={<Monitor size={18}/>}      color="blue" />
            <StatCard label="Missed Submissions" value={report.missed_assessments}                       icon={<AlertTriangle size={18}/>} color={report.missed_assessments === 0 ? 'green' : 'red'} />
          </div>

          {/* Module marks chart */}
          {chartData.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
              <h2 className="text-base font-semibold text-slate-800 mb-4">Module Performance</h2>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" />
                  <Tooltip formatter={(v: number) => [`${v}%`, 'Mark']} />
                  <ReferenceLine y={50} stroke="#ef4444" strokeDasharray="4 2" label={{ value: 'Pass 50%', fontSize: 11, fill: '#ef4444' }} />
                  <Bar dataKey="pct" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Reasons */}
          {report.reasons?.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
              <h2 className="text-base font-semibold text-slate-800 mb-3">Risk Factors</h2>
              <div className="space-y-2">
                {report.reasons.map(r => (
                  <div key={r.code} className="flex items-start gap-3 text-sm py-2 border-b border-slate-100 last:border-0">
                    <span className={`mt-0.5 flex-shrink-0 inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                      r.severity === 'HIGH' ? 'bg-red-100 text-red-700' :
                      r.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                    }`}>{r.severity}</span>
                    <div>
                      <span className="font-mono text-xs text-slate-400 mr-2">{r.code}</span>
                      <span className="text-slate-700">{r.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {report.recommendations?.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-base font-semibold text-slate-800 mb-3">Recommended Interventions</h2>
              <div className="space-y-2">
                {report.recommendations.map(rec => (
                  <div key={rec.type} className={`border rounded-lg px-4 py-3 text-sm ${priorityColor[rec.priority] ?? 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-xs tracking-widest uppercase">{rec.priority}</span>
                      <span className="text-xs opacity-60">· {rec.type}</span>
                    </div>
                    <p>{rec.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <p className="text-slate-500 text-sm mb-3">No risk report found for this student.</p>
          <button
            onClick={reanalyse}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Run Analysis
          </button>
        </div>
      )}
    </Layout>
  )
}

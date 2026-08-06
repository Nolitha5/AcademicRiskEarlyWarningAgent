import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/common/Layout'
import RiskBadge from '../components/common/RiskBadge'
import StatCard from '../components/common/StatCard'
import api from '../lib/api'
import { AlertTriangle, Users, TrendingUp, CheckCircle, RefreshCw, ChevronRight } from 'lucide-react'

interface RiskRow {
  student_id:   string
  student_name: string
  student_number: string
  programme:    string
  risk_level:   'HIGH' | 'MEDIUM' | 'LOW' | 'NONE'
  risk_score:   number
  average_mark: number
  attendance_pct: number
  analysed_at:  string
}

interface Summary {
  HIGH:   number
  MEDIUM: number
  LOW:    number
  NONE:   number
  total:  number
}

export default function AdminDashboard() {
  const [rows,     setRows]     = useState<RiskRow[]>([])
  const [summary,  setSummary]  = useState<Summary | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [running,  setRunning]  = useState(false)
  const [error,    setError]    = useState('')
  const [filter,   setFilter]   = useState<string>('ALL')
  const [search,   setSearch]   = useState('')

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [riskRes, sumRes] = await Promise.all([
        api.get('/risk'),
        api.get('/risk/summary'),
      ])
      setRows(riskRes.data.data ?? [])
      setSummary(sumRes.data.data)
    } catch (err: any) {
      setError(err.response?.data?.error ?? err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  async function analyseAll() {
    setRunning(true)
    try {
      await api.post('/risk/analyse/all')
      await loadData()
    } catch (err: any) {
      setError(err.response?.data?.error ?? err.message)
    } finally {
      setRunning(false)
    }
  }

  const displayed = rows.filter(r => {
    const levelOk  = filter === 'ALL' || r.risk_level === filter
    const searchOk = !search || r.student_name.toLowerCase().includes(search.toLowerCase()) || r.student_number?.includes(search)
    return levelOk && searchOk
  })

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Risk overview for all active students</p>
        </div>
        <button
          onClick={analyseAll}
          disabled={running}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
        >
          <RefreshCw size={16} className={running ? 'animate-spin' : ''} />
          {running ? 'Analysing…' : 'Analyse All'}
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatCard label="High Risk"   value={summary.HIGH}   color="red"   icon={<AlertTriangle size={18} />} />
          <StatCard label="Medium Risk" value={summary.MEDIUM} color="amber" icon={<TrendingUp size={18} />} />
          <StatCard label="Low Risk"    value={summary.LOW}    color="green" icon={<CheckCircle size={18} />} />
          <StatCard label="Total"       value={summary.total}  color="blue"  icon={<Users size={18} />} />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or student number…"
          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-1">
          {['ALL','HIGH','MEDIUM','LOW','NONE'].map(lvl => (
            <button
              key={lvl}
              onClick={() => setFilter(lvl)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                filter === lvl
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50">
              <tr>
                {['Student','Number','Programme','Risk','Score','Avg Mark','Attendance',''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayed.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    No students match your filter. Click <strong>Analyse All</strong> to generate reports.
                  </td>
                </tr>
              )}
              {displayed.map(row => (
                <tr key={row.student_id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{row.student_name}</td>
                  <td className="px-4 py-3 text-slate-500">{row.student_number}</td>
                  <td className="px-4 py-3 text-slate-500 max-w-[180px] truncate">{row.programme}</td>
                  <td className="px-4 py-3"><RiskBadge level={row.risk_level} /></td>
                  <td className="px-4 py-3 font-mono text-slate-700">{row.risk_score?.toFixed(0)}</td>
                  <td className="px-4 py-3 text-slate-700">{row.average_mark?.toFixed(1)}%</td>
                  <td className="px-4 py-3 text-slate-700">{row.attendance_pct?.toFixed(1)}%</td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/students/${row.student_id}/risk`}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-xs"
                    >
                      View <ChevronRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  )
}

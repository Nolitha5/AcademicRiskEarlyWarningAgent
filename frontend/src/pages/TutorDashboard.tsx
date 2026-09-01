import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/common/Layout'
import StatCard from '../components/common/StatCard'
import RiskBadge from '../components/common/RiskBadge'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import api from '../lib/api'
import { supabase } from '../lib/supabase'
import { Users, AlertTriangle, CalendarCheck, Clock, CheckCircle, XCircle } from 'lucide-react'

interface TutorSession {
  id: string
  student_id: string
  student_name: string
  student_number: string
  session_date: string
  session_type: string
  attended: boolean
  notes: string | null
}

interface AtRiskStudent {
  id: string
  full_name: string
  student_number: string
  risk_level: string
  risk_score: number
  last_session: string | null
}

type Tab = 'at-risk' | 'sessions' | 'upcoming'

export default function TutorDashboard() {
  const [sessions, setSessions] = useState<TutorSession[]>([])
  const [atRisk, setAtRisk] = useState<AtRiskStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('at-risk')
  const [noteModal, setNoteModal] = useState<{ sessionId: string; text: string } | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const [studRes, riskRes] = await Promise.all([
          api.get('/students'),
          api.get('/risk'),
        ])

        const students: any[] = studRes.data?.data ?? []
        const risks: any[] = riskRes.data?.data ?? []

        const riskMap = Object.fromEntries(risks.map((r: any) => [r.student_id, r]))
        const atRiskStudents: AtRiskStudent[] = students
          .map((s) => {
            const r = riskMap[s.id]
            return {
              id: s.id,
              full_name: s.full_name,
              student_number: s.student_number,
              risk_level: r?.risk_level ?? 'NONE',
              risk_score: r?.risk_score ?? 0,
              last_session: null,
            }
          })
          .filter((s) => s.risk_level === 'HIGH' || s.risk_level === 'MEDIUM')
          .sort((a, b) => b.risk_score - a.risk_score)

        const { data: sessionData, error: sessErr } = await supabase
          .from('tutor_support')
          .select(`
            id,
            student_id,
            session_date,
            session_type,
            attended,
            notes,
            students ( full_name, student_number )
          `)
          .order('session_date', { ascending: false })
          .limit(50)

        if (sessErr) throw sessErr

        const sessRows: TutorSession[] = (sessionData ?? []).map((row: any) => ({
          id: row.id,
          student_id: row.student_id,
          student_name: row.students?.full_name ?? 'Unknown',
          student_number: row.students?.student_number ?? '',
          session_date: row.session_date,
          session_type: row.session_type,
          attended: row.attended,
          notes: row.notes,
        }))

        const lastSessionByStudent = Object.fromEntries(
          sessRows.map((s) => [s.student_id, s.session_date])
        )
        const enrichedAtRisk = atRiskStudents.map((s) => ({
          ...s,
          last_session: lastSessionByStudent[s.id] ?? null,
        }))

        setSessions(sessRows)
        setAtRisk(enrichedAtRisk)
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load tutor data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function saveNote() {
    if (!noteModal) return
    setSaving(true)
    try {
      await supabase
        .from('tutor_support')
        .update({ notes: noteModal.text })
        .eq('id', noteModal.sessionId)
      setSessions((prev) =>
        prev.map((s) =>
          s.id === noteModal.sessionId ? { ...s, notes: noteModal.text } : s
        )
      )
      setNoteModal(null)
    } finally {
      setSaving(false)
    }
  }

  async function toggleAttended(sessionId: string, current: boolean) {
    await supabase
      .from('tutor_support')
      .update({ attended: !current })
      .eq('id', sessionId)
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, attended: !current } : s))
    )
  }

  const totalSessions = sessions.length
  const attended = sessions.filter((s) => s.attended).length
  const missed = totalSessions - attended
  const attendanceRate = totalSessions > 0 ? Math.round((attended / totalSessions) * 100) : 0

  const today = new Date().toISOString().split('T')[0]
  const upcoming = sessions.filter((s) => s.session_date >= today)
  const past = sessions.filter((s) => s.session_date < today)

  const typeLabel: Record<string, string> = {
    individual: 'Individual',
    group: 'Group',
    online: 'Online',
    walkIn: 'Walk-in',
  }

  if (loading) return <Layout><LoadingSpinner /></Layout>
  if (error) return <Layout><ErrorMessage message={error} /></Layout>

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tutor Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Track student support sessions and monitor at-risk students
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <StatCard label="At-Risk Students" value={atRisk.length}    icon={<AlertTriangle className="w-5 h-5" />}  color="red" />
          <StatCard label="Total Sessions"   value={totalSessions}    icon={<CalendarCheck className="w-5 h-5" />}  color="blue" />
          <StatCard label="Attended"         value={attended}          icon={<CheckCircle className="w-5 h-5" />}    color="green" />
          <StatCard label="Missed"           value={missed}            icon={<XCircle className="w-5 h-5" />}        color="red" />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Session Attendance Rate</span>
            <span className="text-sm font-bold text-blue-700">{attendanceRate}%</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all ${
                attendanceRate >= 75 ? 'bg-green-500' : attendanceRate >= 50 ? 'bg-amber-400' : 'bg-red-500'
              }`}
              style={{ width: `${attendanceRate}%` }}
            />
          </div>
        </div>

        <div className="flex gap-1 border-b border-gray-200">
          {([
            { key: 'at-risk',  label: `At-Risk Students (${atRisk.length})` },
            { key: 'upcoming', label: `Upcoming Sessions (${upcoming.length})` },
            { key: 'sessions', label: `Session History (${past.length})` },
          ] as { key: Tab; label: string }[]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-700 text-blue-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'at-risk' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Student</th>
                  <th className="px-4 py-3 text-center">Risk Level</th>
                  <th className="px-4 py-3 text-center">Risk Score</th>
                  <th className="px-4 py-3 text-center">Last Session</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {atRisk.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                      <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      No at-risk students found
                    </td>
                  </tr>
                ) : (
                  atRisk.map((s) => (
                    <tr key={s.id} className={`hover:bg-gray-50 ${s.risk_level === 'HIGH' ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-amber-400'}`}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{s.full_name}</div>
                        <div className="text-xs text-gray-400 font-mono">{s.student_number}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <RiskBadge level={s.risk_level as 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE'} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-bold ${s.risk_score >= 70 ? 'text-red-600' : 'text-amber-600'}`}>
                          {s.risk_score}
                        </span>
                        <span className="text-gray-400 text-xs">/100</span>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-500 text-xs">
                        {s.last_session
                          ? new Date(s.last_session).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' })
                          : <span className="text-red-400">No sessions yet</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <Link to={`/students/${s.id}/profile`} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-700 hover:text-white transition-colors">Profile</Link>
                          <Link to={`/students/${s.id}/risk`}    className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded hover:bg-red-600 hover:text-white transition-colors">Risk</Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'upcoming' && (
          <div className="space-y-3">
            {upcoming.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
                <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
                No upcoming sessions scheduled
              </div>
            ) : (
              upcoming.map((s) => (
                <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs text-blue-700 font-bold">
                      {new Date(s.session_date).toLocaleDateString('en-ZA', { month: 'short' })}
                    </span>
                    <span className="text-lg font-black text-blue-700 leading-none">
                      {new Date(s.session_date).getDate()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{s.student_name}</span>
                      <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                        {typeLabel[s.session_type] ?? s.session_type}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{s.student_number}</div>
                    {s.notes && <p className="text-sm text-gray-600 mt-1">{s.notes}</p>}
                  </div>
                  <button
                    onClick={() => setNoteModal({ sessionId: s.id, text: s.notes ?? '' })}
                    className="text-xs px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 text-gray-600"
                  >
                    Notes
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Student</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-center">Attended</th>
                  <th className="px-4 py-3 text-left">Notes</th>
                  <th className="px-4 py-3 text-center">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {past.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-gray-400">No past sessions found</td>
                  </tr>
                ) : (
                  past.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{s.student_name}</div>
                        <div className="text-xs text-gray-400 font-mono">{s.student_number}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(s.session_date).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{typeLabel[s.session_type] ?? s.session_type}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => toggleAttended(s.id, s.attended)}
                          className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto transition-colors ${
                            s.attended
                              ? 'bg-green-100 text-green-600 hover:bg-green-200'
                              : 'bg-red-100 text-red-500 hover:bg-red-200'
                          }`}
                        >
                          {s.attended ? '✓' : '✗'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">
                        {s.notes ?? <span className="italic text-gray-300">No notes</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setNoteModal({ sessionId: s.id, text: s.notes ?? '' })}
                          className="text-xs px-2 py-1 border border-gray-200 rounded hover:bg-gray-50 text-gray-600"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {noteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-blue-700 mb-4">Session Notes</h3>
            <textarea
              className="w-full h-32 border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
              value={noteModal.text}
              onChange={(e) => setNoteModal({ ...noteModal, text: e.target.value })}
              placeholder="Enter session notes…"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setNoteModal(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={saveNote} disabled={saving} className="px-4 py-2 text-sm bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

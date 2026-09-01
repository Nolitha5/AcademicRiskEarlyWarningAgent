import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/common/Layout'
import StatCard from '../components/common/StatCard'
import RiskBadge from '../components/common/RiskBadge'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import api from '../lib/api'
import { BookOpen, Users, AlertTriangle, TrendingUp, Search } from 'lucide-react'

interface Module {
  id: string
  code: string
  name: string
  credits: number
}

interface StudentRow {
  id: string
  student_number: string
  full_name: string
  email: string
  year_of_study: number
  mark?: number
  risk_level?: string
  risk_score?: number
}

interface ModuleWithStudents extends Module {
  students: StudentRow[]
  avgMark: number
  highRisk: number
  mediumRisk: number
}

export default function LecturerDashboard() {
  const [modules, setModules] = useState<ModuleWithStudents[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedModule, setSelectedModule] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)

        const [modRes, studRes, riskRes] = await Promise.all([
          api.get('/modules'),
          api.get('/students'),
          api.get('/risk'),
        ])

        const mods: Module[] = modRes.data?.data ?? []
        const studs: any[] = studRes.data?.data ?? []
        const risks: any[] = riskRes.data?.data ?? []

        const riskByStudent = Object.fromEntries(
          risks.map((r: any) => [r.student_id, r])
        )

        const enriched: ModuleWithStudents[] = mods.map((mod) => {
          const year = parseInt(mod.code.replace(/\D/g, '').charAt(0)) || 1
          const modStudents: StudentRow[] = studs
            .filter((s) => s.year_of_study === year)
            .map((s) => {
              const risk = riskByStudent[s.id]
              return {
                id: s.id,
                student_number: s.student_number,
                full_name: s.full_name,
                email: s.email,
                year_of_study: s.year_of_study,
                risk_level: risk?.risk_level ?? 'NONE',
                risk_score: risk?.risk_score ?? 0,
              }
            })

          const highRisk = modStudents.filter((s) => s.risk_level === 'HIGH').length
          const mediumRisk = modStudents.filter((s) => s.risk_level === 'MEDIUM').length
          const avgMark = modStudents.length
            ? Math.round(
                modStudents.reduce((acc, s) => acc + (s.risk_score ?? 0), 0) /
                  modStudents.length
              )
            : 0

          return { ...mod, students: modStudents, avgMark, highRisk, mediumRisk }
        })

        setModules(enriched)
        if (enriched.length > 0) setSelectedModule(enriched[0].id)
      } catch (e: any) {
        setError(e?.response?.data?.message ?? 'Failed to load lecturer data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const activeModule = modules.find((m) => m.id === selectedModule)

  const filteredStudents = (activeModule?.students ?? []).filter(
    (s) =>
      search === '' ||
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.student_number.includes(search)
  )

  const totalStudents = activeModule?.students.length ?? 0
  const highRiskTotal = activeModule?.highRisk ?? 0
  const mediumRiskTotal = activeModule?.mediumRisk ?? 0
  const atRisk = highRiskTotal + mediumRiskTotal

  const riskColor = (level?: string) => {
    if (level === 'HIGH') return 'bg-red-50 border-l-4 border-l-red-500'
    if (level === 'MEDIUM') return 'bg-amber-50 border-l-4 border-l-amber-400'
    return ''
  }

  if (loading) return <Layout><LoadingSpinner /></Layout>
  if (error) return <Layout><ErrorMessage message={error} /></Layout>

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Lecturer Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Monitor student performance and risk levels across your modules
          </p>
        </div>

        <div className="flex gap-6">
          {/* Module sidebar */}
          <div className="w-64 shrink-0 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              My Modules
            </p>
            {modules.map((mod) => (
              <button
                key={mod.id}
                onClick={() => { setSelectedModule(mod.id); setSearch('') }}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedModule === mod.id
                    ? 'bg-blue-700 text-white border-blue-700 shadow'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-blue-500 hover:shadow-sm'
                }`}
              >
                <div className="font-semibold text-sm">{mod.code}</div>
                <div className={`text-xs mt-0.5 truncate ${selectedModule === mod.id ? 'text-blue-200' : 'text-gray-500'}`}>
                  {mod.name}
                </div>
                {mod.highRisk > 0 && (
                  <div className={`text-xs mt-1 font-medium ${selectedModule === mod.id ? 'text-red-200' : 'text-red-600'}`}>
                    ⚠ {mod.highRisk} HIGH risk
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Main content */}
          <div className="flex-1 space-y-6">
            {activeModule && (
              <>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-blue-700" />
                    </div>
                    <div>
                      <h2 className="font-bold text-blue-700 text-lg">
                        {activeModule.code} — {activeModule.name}
                      </h2>
                      <p className="text-sm text-gray-500">{activeModule.credits} Credits</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <StatCard label="Enrolled"     value={totalStudents}  icon={<Users className="w-5 h-5" />}         color="blue" />
                  <StatCard label="At Risk"       value={atRisk}         icon={<AlertTriangle className="w-5 h-5" />} color="red" />
                  <StatCard label="HIGH Risk"     value={highRiskTotal}  icon={<AlertTriangle className="w-5 h-5" />} color="red" />
                  <StatCard label="MEDIUM Risk"   value={mediumRiskTotal} icon={<TrendingUp className="w-5 h-5" />}  color="amber" />
                </div>

                <div className="bg-white rounded-xl border border-gray-200">
                  <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                    <div className="relative flex-1 max-w-xs">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search students…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <span className="text-sm text-gray-500">{filteredStudents.length} students</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                          <th className="px-4 py-3 text-left">Student</th>
                          <th className="px-4 py-3 text-left">Number</th>
                          <th className="px-4 py-3 text-left">Year</th>
                          <th className="px-4 py-3 text-center">Risk Level</th>
                          <th className="px-4 py-3 text-center">Risk Score</th>
                          <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredStudents.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                              No students found
                            </td>
                          </tr>
                        ) : (
                          filteredStudents
                            .sort((a, b) => (b.risk_score ?? 0) - (a.risk_score ?? 0))
                            .map((student) => (
                              <tr key={student.id} className={`hover:bg-gray-50 transition-colors ${riskColor(student.risk_level)}`}>
                                <td className="px-4 py-3">
                                  <div className="font-medium text-gray-900">{student.full_name}</div>
                                  <div className="text-xs text-gray-400">{student.email}</div>
                                </td>
                                <td className="px-4 py-3 text-gray-600 font-mono text-xs">{student.student_number}</td>
                                <td className="px-4 py-3 text-gray-600">Year {student.year_of_study}</td>
                                <td className="px-4 py-3 text-center">
                                  <RiskBadge level={(student.risk_level ?? 'NONE') as 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE'} />
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`font-bold text-sm ${
                                    (student.risk_score ?? 0) >= 70 ? 'text-red-600' :
                                    (student.risk_score ?? 0) >= 35 ? 'text-amber-600' :
                                    'text-green-600'
                                  }`}>
                                    {student.risk_score ?? 0}
                                  </span>
                                  <span className="text-gray-400 text-xs">/100</span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <div className="flex justify-center gap-2">
                                    <Link to={`/students/${student.id}/profile`} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-700 hover:text-white transition-colors">Profile</Link>
                                    <Link to={`/students/${student.id}/risk`}    className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded hover:bg-red-600 hover:text-white transition-colors">Risk</Link>
                                  </div>
                                </td>
                              </tr>
                            ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Layout from '../components/common/Layout'
import api from '../lib/api'
import { ArrowLeft, CheckCircle, Clock, AlertCircle } from 'lucide-react'

interface Intervention {
  id:              string
  student_id:      string
  intervention_type: string
  description:     string
  status:          'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  priority:        string
  notes:           string | null
  scheduled_date:  string | null
  completed_date:  string | null
  created_at:      string
}

const statusIcon = (s: string) => {
  if (s === 'COMPLETED') return <CheckCircle size={16} className="text-green-500" />
  if (s === 'IN_PROGRESS') return <Clock size={16} className="text-blue-500" />
  if (s === 'CANCELLED') return <AlertCircle size={16} className="text-slate-400" />
  return <Clock size={16} className="text-amber-500" />
}

const statusClass: Record<string, string> = {
  COMPLETED:   'bg-green-50 text-green-700 border-green-200',
  IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200',
  PENDING:     'bg-amber-50 text-amber-700 border-amber-200',
  CANCELLED:   'bg-slate-50 text-slate-500 border-slate-200',
}

const priorityClass: Record<string, string> = {
  URGENT: 'text-red-600 font-bold',
  HIGH:   'text-amber-600 font-semibold',
  MEDIUM: 'text-blue-600',
  LOW:    'text-slate-400',
}

export default function InterventionHistory() {
  const { id }  = useParams<{ id: string }>()
  const [items,    setItems]    = useState<Intervention[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [student,  setStudent]  = useState<{ full_name: string } | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const [studRes, intRes] = await Promise.allSettled([
          api.get(`/students/${id}`),
          api.get(`/interventions?student_id=${id}`),
        ])
        if (studRes.status === 'fulfilled') setStudent(studRes.value.data.data)
        if (intRes.status === 'fulfilled')  setItems(intRes.value.data.data ?? [])
        else setError('Could not load interventions.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  return (
    <Layout>
      <div className="flex items-center gap-3 mb-6">
        <Link to={`/students/${id}/profile`} className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-sm transition-colors">
          <ArrowLeft size={16} /> Profile
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-sm text-slate-600">Intervention History</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Intervention History</h1>
          {student && <p className="text-sm text-slate-500 mt-0.5">{student.full_name}</p>}
        </div>
        <Link
          to={`/students/${id}/risk`}
          className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
        >
          Risk Report
        </Link>
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
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <p className="text-slate-400 text-sm">No interventions recorded for this student yet.</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200" />

          <div className="space-y-4">
            {items.map(item => (
              <div key={item.id} className="relative pl-12">
                {/* Dot */}
                <div className="absolute left-3.5 top-4 -translate-x-1/2 bg-white border-2 border-slate-300 rounded-full w-4 h-4 flex items-center justify-center">
                  {statusIcon(item.status)}
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-800 text-sm">{item.intervention_type}</span>
                        <span className={`text-xs ${priorityClass[item.priority] ?? 'text-slate-400'}`}>
                          {item.priority}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{item.description}</p>
                      {item.notes && (
                        <p className="text-xs text-slate-400 mt-1 italic">Note: {item.notes}</p>
                      )}
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusClass[item.status] ?? ''}`}>
                      {statusIcon(item.status)} {item.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
                    <span>Created: {new Date(item.created_at).toLocaleDateString()}</span>
                    {item.scheduled_date && (
                      <span>Scheduled: {new Date(item.scheduled_date).toLocaleDateString()}</span>
                    )}
                    {item.completed_date && (
                      <span className="text-green-600">Completed: {new Date(item.completed_date).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  )
}

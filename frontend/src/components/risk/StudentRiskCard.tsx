import { useNavigate } from 'react-router-dom'
import RiskBadge from '../common/RiskBadge'
import { User, ChevronRight } from 'lucide-react'

interface Props {
  student_id:    string
  student_number: string
  full_name:     string
  programme:     string
  risk_level:    string
  risk_score:    number
  average_mark:  number | null
  attendance_pct: number | null
}

export function StudentRiskCard(p: Props) {
  const navigate = useNavigate()

  return (
    <div
      className="card hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => navigate(`/students/${p.student_id}/risk`)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-tut-light flex items-center justify-center">
            <User size={18} className="text-tut-blue" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{p.full_name}</p>
            <p className="text-xs text-gray-500">{p.student_number} · {p.programme}</p>
          </div>
        </div>
        <ChevronRight size={18} className="text-gray-400" />
      </div>

      <div className="mt-4 flex items-center gap-4 flex-wrap">
        <RiskBadge level={p.risk_level as 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE'} />
        <span className="text-xs text-gray-500">Score: <b>{p.risk_score?.toFixed(0)}%</b></span>
        {p.average_mark != null && (
          <span className="text-xs text-gray-500">Avg Mark: <b>{p.average_mark?.toFixed(1)}%</b></span>
        )}
        {p.attendance_pct != null && (
          <span className="text-xs text-gray-500">Attendance: <b>{p.attendance_pct?.toFixed(0)}%</b></span>
        )}
      </div>
    </div>
  )
}

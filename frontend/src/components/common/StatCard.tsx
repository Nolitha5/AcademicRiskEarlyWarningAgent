import { ReactNode } from 'react'
import clsx from 'clsx'

interface StatCardProps {
  label:     string
  value:     string | number
  icon?:     ReactNode
  color?:    'blue' | 'red' | 'amber' | 'green' | 'slate'
  subtitle?: string
}

const colorMap = {
  blue:  'bg-blue-50 text-blue-700',
  red:   'bg-red-50 text-red-700',
  amber: 'bg-amber-50 text-amber-700',
  green: 'bg-green-50 text-green-700',
  slate: 'bg-slate-50 text-slate-700',
}

export default function StatCard({ label, value, icon, color = 'blue', subtitle }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex gap-4 items-start shadow-sm">
      {icon && (
        <div className={clsx('rounded-lg p-2.5', colorMap[color])}>
          {icon}
        </div>
      )}
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-800 mt-0.5">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}

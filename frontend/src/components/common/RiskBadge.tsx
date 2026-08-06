import clsx from 'clsx'

type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE'

const MAP: Record<RiskLevel, string> = {
  HIGH:   'bg-red-100 text-red-700 border border-red-300',
  MEDIUM: 'bg-amber-100 text-amber-700 border border-amber-300',
  LOW:    'bg-green-100 text-green-700 border border-green-300',
  NONE:   'bg-slate-100 text-slate-500 border border-slate-200',
}

export default function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', MAP[level])}>
      {level}
    </span>
  )
}

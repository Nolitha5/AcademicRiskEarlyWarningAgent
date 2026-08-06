interface Props { score: number; level: string }

const levelColor: Record<string, string> = {
  HIGH: '#DC2626', MEDIUM: '#D97706', LOW: '#16A34A', NONE: '#6B7280',
}

export function RiskScoreGauge({ score, level }: Props) {
  const color = levelColor[level] ?? '#6B7280'
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="140" className="-rotate-90">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="12" />
        <circle
          cx="70" cy="70" r={radius} fill="none"
          stroke={color} strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="-mt-[86px] flex flex-col items-center">
        <span className="text-3xl font-bold" style={{ color }}>{score.toFixed(0)}%</span>
        <span className="text-xs text-gray-500 mt-0.5">Risk Score</span>
      </div>
    </div>
  )
}

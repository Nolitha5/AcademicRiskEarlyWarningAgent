import clsx from 'clsx'

interface Reason { code: string; description: string; severity: string }

const sev: Record<string, string> = {
  HIGH:   'bg-red-100 text-red-700 border-red-200',
  MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  LOW:    'bg-green-100 text-green-700 border-green-200',
}
const dot: Record<string, string> = {
  HIGH: 'bg-red-500', MEDIUM: 'bg-yellow-500', LOW: 'bg-green-500',
}

export function RiskReasonList({ reasons }: { reasons: Reason[] }) {
  if (!reasons.length) return <p className="text-sm text-gray-400 italic">No risk factors identified.</p>

  return (
    <ul className="space-y-2">
      {reasons.map(r => (
        <li key={r.code} className={clsx('flex items-start gap-3 rounded-lg border px-3 py-2.5 text-sm', sev[r.severity] ?? sev.LOW)}>
          <span className={clsx('mt-1.5 h-2 w-2 rounded-full shrink-0', dot[r.severity] ?? dot.LOW)} />
          <div>
            <span className="font-semibold uppercase text-xs tracking-wide mr-2 opacity-70">{r.severity}</span>
            {r.description}
          </div>
        </li>
      ))}
    </ul>
  )
}

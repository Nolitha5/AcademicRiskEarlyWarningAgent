import clsx from 'clsx'

interface Intervention { type: string; description: string; priority: string }

const pri: Record<string, string> = {
  URGENT: 'bg-red-600 text-white',
  HIGH:   'bg-orange-500 text-white',
  MEDIUM: 'bg-yellow-500 text-white',
  LOW:    'bg-gray-400 text-white',
}

export function InterventionList({ interventions }: { interventions: Intervention[] }) {
  if (!interventions.length) return <p className="text-sm text-gray-400 italic">No recommendations at this time.</p>

  return (
    <ul className="space-y-3">
      {interventions.map((iv, i) => (
        <li key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <span className={clsx('shrink-0 mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded', pri[iv.priority] ?? pri.LOW)}>
            {iv.priority}
          </span>
          <div>
            <p className="text-sm font-semibold text-gray-800">{iv.type}</p>
            <p className="text-sm text-gray-600 mt-0.5">{iv.description}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

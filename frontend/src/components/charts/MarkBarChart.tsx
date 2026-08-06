import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Cell,
} from 'recharts'

interface ModuleMark {
  module_code: string
  average_pct: number
  status:      string
}

export function MarkBarChart({ data }: { data: ModuleMark[] }) {
  const getColor = (status: string) =>
    status === 'FAIL' ? '#DC2626' : status === 'AT_RISK' ? '#D97706' : '#16A34A'

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="module_code" tick={{ fontSize: 11 }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
        <Tooltip
          formatter={(v: number) => [`${v.toFixed(1)}%`, 'Average Mark']}
          contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
        />
        <ReferenceLine y={50} stroke="#DC2626" strokeDasharray="4 4" label={{ value: 'Pass 50%', position: 'right', fontSize: 10, fill: '#DC2626' }} />
        <ReferenceLine y={75} stroke="#16A34A" strokeDasharray="4 4" label={{ value: '75%', position: 'right', fontSize: 10, fill: '#16A34A' }} />
        <Bar dataKey="average_pct" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={getColor(entry.status)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

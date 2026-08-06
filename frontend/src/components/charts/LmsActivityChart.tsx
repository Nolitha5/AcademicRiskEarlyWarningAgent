import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

interface LmsRecord { week: string; login_count: number }

export function LmsActivityChart({ data }: { data: LmsRecord[] }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="week" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip contentStyle={{ borderRadius: 8 }} formatter={(v: number) => [v, 'Logins']} />
        <ReferenceLine y={2} stroke="#D97706" strokeDasharray="4 4" label={{ value: 'Min 2/wk', position: 'right', fontSize: 10, fill: '#D97706' }} />
        <Line type="monotone" dataKey="login_count" stroke="#003580" strokeWidth={2} dot={{ r: 4, fill: '#003580' }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

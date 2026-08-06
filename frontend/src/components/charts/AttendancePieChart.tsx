import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface Props { attended: number; missed: number }

export function AttendancePieChart({ attended, missed }: Props) {
  const data = [
    { name: 'Attended', value: attended },
    { name: 'Missed',   value: missed   },
  ]
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} dataKey="value" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
          <Cell fill="#003580" />
          <Cell fill="#FCA5A5" />
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 8 }} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

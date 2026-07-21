import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export function ResultsChart({ wins, draws, losses }: { wins: number; draws: number; losses: number }) {
  const data = [
    { name: 'Vitórias', value: wins, color: '#3ecf8e' },
    { name: 'Empates', value: draws, color: '#f2c94c' },
    { name: 'Derrotas', value: losses, color: '#f0645c' }
  ]

  const hasData = wins + draws + losses > 0

  if (!hasData) {
    return <p className="flex h-[240px] items-center justify-center text-sm text-muted">Sem jogos registrados ainda</p>
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
          {data.map((d) => (
            <Cell key={d.name} fill={d.color} stroke="none" />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: '#131316',
            border: '1px solid #242429',
            borderRadius: 12,
            color: '#f2f2f3'
          }}
        />
        <Legend wrapperStyle={{ fontSize: 13, color: '#8b8b93' }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

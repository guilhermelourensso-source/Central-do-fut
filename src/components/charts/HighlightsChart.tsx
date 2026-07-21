import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import type { PlayerAgg } from '@/hooks/useStats'

export function HighlightsChart({ data }: { data: PlayerAgg[] }) {
  const chartData = data.slice(0, 8).map((d) => ({ name: d.player.name, value: d.highlights }))

  if (chartData.length === 0) {
    return <p className="flex h-[260px] items-center justify-center text-sm text-muted">Sem destaques registrados ainda</p>
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#242429" horizontal={false} />
        <XAxis type="number" stroke="#8b8b93" fontSize={12} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="name"
          stroke="#8b8b93"
          fontSize={12}
          width={110}
          tick={{ fill: '#f2f2f3' }}
        />
        <Tooltip
          formatter={(value: number) => [value, 'Destaques']}
          contentStyle={{ background: '#131316', border: '1px solid #242429', borderRadius: 12, color: '#f2f2f3' }}
        />
        <Bar dataKey="value" fill="#3ecf8e" radius={[0, 8, 8, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

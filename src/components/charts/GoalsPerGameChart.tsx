import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { formatDate } from '@/lib/utils'
import type { MatchWithDetails } from '@/types/database'

export function GoalsPerGameChart({ matches }: { matches: MatchWithDetails[] }) {
  if (matches.length === 0) {
    return <p className="flex h-[260px] items-center justify-center text-sm text-muted">Sem jogos registrados ainda</p>
  }

  const data = matches.map((m) => ({
    name: formatDate(m.match_date),
    marcados: m.goals_for,
    sofridos: m.goals_against
  }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ left: -12, right: 16, top: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#242429" />
        <XAxis dataKey="name" stroke="#8b8b93" fontSize={11} />
        <YAxis stroke="#8b8b93" fontSize={12} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: '#131316', border: '1px solid #242429', borderRadius: 12, color: '#f2f2f3' }}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: '#8b8b93' }} />
        <Line type="monotone" dataKey="marcados" name="Gols marcados" stroke="#3ecf8e" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="sofridos" name="Gols sofridos" stroke="#f0645c" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

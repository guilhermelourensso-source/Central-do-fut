import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { formatDate } from '@/lib/utils'
import type { MatchWithDetails } from '@/types/database'

export function GoalDiffChart({ matches }: { matches: MatchWithDetails[] }) {
  if (matches.length === 0) {
    return <p className="flex h-[240px] items-center justify-center text-sm text-muted">Sem jogos registrados ainda</p>
  }

  let acumulado = 0
  const data = matches.map((m) => {
    acumulado += m.goals_for - m.goals_against
    return {
      name: formatDate(m.match_date),
      saldo: acumulado
    }
  })

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ left: -12, right: 16, top: 8 }}>
        <defs>
          <linearGradient id="saldoGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f2c94c" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#f2c94c" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#242429" />
        <XAxis dataKey="name" stroke="#8b8b93" fontSize={11} />
        <YAxis stroke="#8b8b93" fontSize={12} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: '#131316', border: '1px solid #242429', borderRadius: 12, color: '#f2f2f3' }}
        />
        <Area type="monotone" dataKey="saldo" stroke="#f2c94c" fill="url(#saldoGradient)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

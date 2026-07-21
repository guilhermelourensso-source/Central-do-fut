import {
  Swords,
  Trophy,
  Handshake,
  ThumbsDown,
  Target,
  ShieldAlert,
  Scale,
  Percent,
  Flame,
  ShieldCheck
} from 'lucide-react'
import { useSeason } from '@/contexts/SeasonContext'
import { useSeasonStats } from '@/hooks/useStats'
import { StatCard } from '@/components/shared/StatCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loading } from '@/components/shared/EmptyState'
import { EmptyState } from '@/components/shared/EmptyState'
import { ResultsChart } from '@/components/charts/ResultsChart'
import { GoalDiffChart } from '@/components/charts/GoalDiffChart'
import { formatDate } from '@/lib/utils'

const resultBadge = { V: 'success', E: 'warning', D: 'danger' } as const
const resultLabel = { V: 'Vitória', E: 'Empate', D: 'Derrota' } as const

export default function Dashboard() {
  const { selectedSeasonId, selectedSeason, seasons, loading: seasonLoading } = useSeason()
  const stats = useSeasonStats(selectedSeasonId)

  if (seasonLoading) return <Loading />

  if (seasons.length === 0) {
    return (
      <EmptyState
        icon={Swords}
        title="Nenhuma temporada criada ainda"
        description="Crie sua primeira temporada para começar a registrar jogos e ver as estatísticas do seu time."
      />
    )
  }

  if (stats.loading) return <Loading label="Calculando estatísticas..." />

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted">Resumo da temporada {selectedSeason?.name}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Jogos" value={stats.games} icon={Swords} />
        <StatCard label="Vitórias" value={stats.wins} icon={Trophy} accent />
        <StatCard label="Empates" value={stats.draws} icon={Handshake} />
        <StatCard label="Derrotas" value={stats.losses} icon={ThumbsDown} />
        <StatCard label="Gols marcados" value={stats.goalsFor} icon={Target} />
        <StatCard label="Gols sofridos" value={stats.goalsAgainst} icon={ShieldAlert} />
        <StatCard label="Saldo de gols" value={stats.saldo > 0 ? `+${stats.saldo}` : stats.saldo} icon={Scale} />
        <StatCard label="Aproveitamento" value={stats.winRate.toFixed(0)} suffix="%" icon={Percent} />
        <StatCard label="Média de gols marcados" value={stats.avgGoalsFor.toFixed(1)} icon={Target} />
        <StatCard label="Média de gols sofridos" value={stats.avgGoalsAgainst.toFixed(1)} icon={ShieldAlert} />
        <StatCard label="Maior sequência de vitórias" value={stats.longestWinStreak} icon={Flame} accent />
        <StatCard label="Maior sequência invicta" value={stats.longestUnbeatenStreak} icon={ShieldCheck} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Vitórias x Empates x Derrotas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResultsChart wins={stats.wins} draws={stats.draws} losses={stats.losses} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saldo de gols acumulado</CardTitle>
          </CardHeader>
          <CardContent>
            <GoalDiffChart matches={stats.matches} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimos 5 resultados</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.last5.length === 0 ? (
            <p className="text-sm text-muted">Nenhum jogo registrado ainda.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {stats.last5.map((r, i) => (
                <Badge key={i} variant={resultBadge[r]} className="px-3 py-1.5 text-sm">
                  {resultLabel[r]}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumo da temporada</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.matches.length === 0 ? (
            <p className="text-sm text-muted">Nenhum jogo registrado nesta temporada ainda.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <SummaryItem label="Artilheiro" value={stats.scorers[0] ? `${stats.scorers[0].player.name} (${stats.scorers[0].goals})` : '—'} />
              <SummaryItem label="Garçom (assistências)" value={stats.assisters[0] ? `${stats.assisters[0].player.name} (${stats.assisters[0].assists})` : '—'} />
              <SummaryItem label="Mais destaques" value={stats.highlighters[0] ? `${stats.highlighters[0].player.name} (${stats.highlighters[0].highlights})` : '—'} />
              <SummaryItem label="Melhor goleiro" value={stats.bestGoalkeeper ? stats.bestGoalkeeper.goalkeeper.name : '—'} />
              <SummaryItem label="Primeiro jogo" value={formatDate(stats.matches[0].match_date)} />
              <SummaryItem label="Último jogo" value={formatDate(stats.matches[stats.matches.length - 1].match_date)} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 truncate font-medium text-foreground">{value}</p>
    </div>
  )
}

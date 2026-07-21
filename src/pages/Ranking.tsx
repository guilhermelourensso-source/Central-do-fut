import { Trophy } from 'lucide-react'
import { useSeason } from '@/contexts/SeasonContext'
import { useSeasonStats, type PlayerAgg } from '@/hooks/useStats'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Loading, EmptyState } from '@/components/shared/EmptyState'
import { cn } from '@/lib/utils'

export default function Ranking() {
  const { selectedSeasonId, selectedSeason, seasons, loading: seasonLoading } = useSeason()
  const stats = useSeasonStats(selectedSeasonId)

  if (seasonLoading) return <Loading />
  if (seasons.length === 0) {
    return <EmptyState icon={Trophy} title="Nenhuma temporada criada" description="Crie uma temporada para ver os rankings." />
  }
  if (stats.loading) return <Loading />

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-semibold">Ranking</h1>
        <p className="text-sm text-muted">Temporada {selectedSeason?.name}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RankingCard title="Artilharia" metricLabel="Gols" data={stats.scorers} metric={(p) => p.goals} />
        <RankingCard title="Assistências" metricLabel="Assistências" data={stats.assisters} metric={(p) => p.assists} />
        <RankingCard title="Destaques" metricLabel="Destaques" data={stats.highlighters} metric={(p) => p.highlights} />
        <RankingCard title="MVP" metricLabel="Pontos" data={stats.mvps} metric={(p) => p.mvpScore} />
      </div>
    </div>
  )
}

function RankingCard({
  title,
  metricLabel,
  data,
  metric
}: {
  title: string
  metricLabel: string
  data: PlayerAgg[]
  metric: (p: PlayerAgg) => number
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted">Nenhum dado registrado ainda.</p>
        ) : (
          <ol className="space-y-1">
            {data.slice(0, 10).map((p, i) => (
              <li
                key={p.player.id}
                className={cn(
                  'flex items-center justify-between rounded-lg px-3 py-2 text-sm',
                  i === 0 ? 'bg-accent/10' : ''
                )}
              >
                <span className="flex items-center gap-3 truncate">
                  <span className={cn('w-5 shrink-0 text-center font-display font-semibold', i === 0 ? 'text-accent' : 'text-muted')}>
                    {i + 1}
                  </span>
                  <span className="truncate">{p.player.name}</span>
                </span>
                <span className="shrink-0 font-medium">{metric(p)}</span>
              </li>
            ))}
          </ol>
        )}
        <p className="mt-3 text-xs text-muted">{metricLabel} por jogador</p>
      </CardContent>
    </Card>
  )
}

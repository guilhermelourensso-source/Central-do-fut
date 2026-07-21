import { Star, Target, Sparkles, ShieldCheck, Flame } from 'lucide-react'
import { useSeason } from '@/contexts/SeasonContext'
import { useSeasonStats } from '@/hooks/useStats'
import { Card } from '@/components/ui/card'
import { Loading, EmptyState } from '@/components/shared/EmptyState'
import { initials } from '@/lib/utils'

export default function HallDaFama() {
  const { selectedSeasonId, selectedSeason, seasons, loading: seasonLoading } = useSeason()
  const stats = useSeasonStats(selectedSeasonId)

  if (seasonLoading) return <Loading />
  if (seasons.length === 0) {
    return <EmptyState icon={Star} title="Nenhuma temporada criada" description="Crie uma temporada para ver o Hall da Fama." />
  }
  if (stats.loading) return <Loading />

  const topScorer = stats.scorers[0]
  const topHighlighter = stats.highlighters[0]

  const entries = [
    {
      icon: Target,
      title: 'Maior artilheiro',
      name: topScorer?.player.name ?? '—',
      detail: topScorer ? `${topScorer.goals} gols` : 'Sem gols registrados ainda'
    },
    {
      icon: Sparkles,
      title: 'Mais destaques',
      name: topHighlighter?.player.name ?? '—',
      detail: topHighlighter ? `${topHighlighter.highlights} destaques` : 'Sem destaques registrados ainda'
    },
    {
      icon: ShieldCheck,
      title: 'Melhor goleiro',
      name: stats.bestGoalkeeper?.goalkeeper.name ?? '—',
      detail: stats.bestGoalkeeper
        ? `${stats.bestGoalkeeper.avgConceded.toFixed(2)} gols sofridos/jogo`
        : 'Sem jogos registrados ainda'
    },
    {
      icon: Flame,
      title: 'Maior sequência de vitórias',
      name: stats.longestWinStreak > 0 ? `${stats.longestWinStreak} jogos seguidos` : '—',
      detail: 'Vitórias consecutivas na temporada'
    }
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-semibold">Hall da Fama</h1>
        <p className="text-sm text-muted">Destaques da temporada {selectedSeason?.name}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {entries.map((e) => (
          <Card key={e.title} className="flex items-center gap-4 p-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-accent">
              <e.icon className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted">{e.title}</p>
              <p className="truncate font-display text-lg font-semibold">{e.name}</p>
              <p className="text-xs text-muted">{e.detail}</p>
            </div>
            {e.name !== '—' && e.title !== 'Maior sequência de vitórias' && (
              <div className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 text-xs font-semibold text-muted">
                {initials(e.name)}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

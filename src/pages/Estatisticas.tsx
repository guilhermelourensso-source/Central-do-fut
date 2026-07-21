import { BarChart3 } from 'lucide-react'
import { useSeason } from '@/contexts/SeasonContext'
import { useSeasonStats } from '@/hooks/useStats'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Loading, EmptyState } from '@/components/shared/EmptyState'
import { TopScorersChart } from '@/components/charts/TopScorersChart'
import { GoalsPerGameChart } from '@/components/charts/GoalsPerGameChart'
import { GoalDiffChart } from '@/components/charts/GoalDiffChart'
import { HighlightsChart } from '@/components/charts/HighlightsChart'

export default function Estatisticas() {
  const { selectedSeasonId, selectedSeason, seasons, loading: seasonLoading } = useSeason()
  const stats = useSeasonStats(selectedSeasonId)

  if (seasonLoading) return <Loading />
  if (seasons.length === 0) {
    return <EmptyState icon={BarChart3} title="Nenhuma temporada criada" description="Crie uma temporada para ver as estatísticas." />
  }
  if (stats.loading) return <Loading />

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-semibold">Estatísticas</h1>
        <p className="text-sm text-muted">Análise completa da temporada {selectedSeason?.name}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatBlock label="Gols marcados" value={stats.goalsFor} />
        <StatBlock label="Gols sofridos" value={stats.goalsAgainst} />
        <StatBlock label="Vitórias" value={stats.wins} />
        <StatBlock label="Empates" value={stats.draws} />
        <StatBlock label="Derrotas" value={stats.losses} />
        <StatBlock label="Saldo de gols" value={stats.saldo > 0 ? `+${stats.saldo}` : stats.saldo} />
        <StatBlock label="Aproveitamento" value={`${stats.winRate.toFixed(0)}%`} />
        <StatBlock label="Maior sequência de vitórias" value={stats.longestWinStreak} />
        <StatBlock label="Maior sequência invicta" value={stats.longestUnbeatenStreak} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Gols por jogo (marcados x sofridos)</CardTitle>
          </CardHeader>
          <CardContent>
            <GoalsPerGameChart matches={stats.matches} />
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

        <Card>
          <CardHeader>
            <CardTitle>Artilheiros</CardTitle>
          </CardHeader>
          <CardContent>
            <TopScorersChart data={stats.scorers} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Destaques da partida</CardTitle>
          </CardHeader>
          <CardContent>
            <HighlightsChart data={stats.highlighters} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Comparação de goleiros</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.goalkeepers.length === 0 ? (
            <p className="text-sm text-muted">Nenhum goleiro com jogos registrados ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase text-muted">
                    <th className="pb-2 font-medium">Goleiro</th>
                    <th className="pb-2 font-medium">Jogos</th>
                    <th className="pb-2 font-medium">Gols sofridos</th>
                    <th className="pb-2 font-medium">Média por jogo</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.goalkeepers.map((g) => (
                    <tr key={g.goalkeeper.id} className="border-t border-border">
                      <td className="py-2">{g.goalkeeper.name}</td>
                      <td className="py-2">{g.games}</td>
                      <td className="py-2">{g.goalsConceded}</td>
                      <td className="py-2">{g.avgConceded.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatBlock({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold">{value}</p>
    </Card>
  )
}

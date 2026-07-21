import { useState } from 'react'
import { Swords, ChevronDown, Trash2, MapPin, Trophy } from 'lucide-react'
import { useSeason } from '@/contexts/SeasonContext'
import { useSeasonStats } from '@/hooks/useStats'
import { useMatches } from '@/hooks/useMatches'
import { useToast } from '@/contexts/ToastContext'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogTitle } from '@/components/ui/dialog'
import { Loading, EmptyState } from '@/components/shared/EmptyState'
import { formatDate, cn } from '@/lib/utils'
import type { MatchWithDetails } from '@/types/database'

const resultVariant = { V: 'success', E: 'warning', D: 'danger' } as const

function resultOf(m: MatchWithDetails) {
  if (m.goals_for > m.goals_against) return 'V'
  if (m.goals_for < m.goals_against) return 'D'
  return 'E'
}

export default function Jogos() {
  const { selectedSeasonId, selectedSeason, seasons, loading: seasonLoading } = useSeason()
  const stats = useSeasonStats(selectedSeasonId)
  const { deleteMatch } = useMatches()
  const { showSuccess, showError } = useToast()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<MatchWithDetails | null>(null)

  async function handleDelete() {
    if (!deleting) return
    const { error } = await deleteMatch(deleting.id)
    if (error) {
      showError(error)
    } else {
      showSuccess('Jogo excluído.')
      await stats.refresh()
    }
    setDeleting(null)
  }

  if (seasonLoading) return <Loading />

  if (seasons.length === 0) {
    return (
      <EmptyState
        icon={Swords}
        title="Nenhuma temporada criada"
        description="Crie uma temporada para começar a registrar jogos."
      />
    )
  }

  if (stats.loading) return <Loading />

  const ordered = [...stats.matches].reverse()

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-semibold">Jogos</h1>
        <p className="text-sm text-muted">Partidas da temporada {selectedSeason?.name}</p>
      </div>

      {ordered.length === 0 ? (
        <EmptyState icon={Swords} title="Nenhum jogo registrado" description="Cadastre o primeiro jogo desta temporada." />
      ) : (
        <div className="space-y-3">
          {ordered.map((m) => {
            const r = resultOf(m)
            const isOpen = expanded === m.id
            return (
              <Card key={m.id} className="overflow-hidden">
                <button
                  className="flex w-full items-center justify-between gap-3 p-4 text-left"
                  onClick={() => setExpanded(isOpen ? null : m.id)}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Badge variant={resultVariant[r]} className="shrink-0 px-2.5 py-1">
                      {r}
                    </Badge>
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        Time {m.goals_for} x {m.goals_against} {m.opponent}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {formatDate(m.match_date)}
                        {m.competition ? ` · ${m.competition}` : ''}
                      </p>
                    </div>
                  </div>
                  <ChevronDown className={cn('h-4 w-4 shrink-0 text-muted transition-transform', isOpen && 'rotate-180')} />
                </button>

                {isOpen && (
                  <div className="border-t border-border p-4 pt-3 text-sm">
                    <div className="mb-3 grid gap-2 sm:grid-cols-2">
                      {m.location && (
                        <p className="flex items-center gap-2 text-muted">
                          <MapPin className="h-3.5 w-3.5" /> {m.location}
                        </p>
                      )}
                      {m.goalkeeper && (
                        <p className="text-muted">Goleiro: <span className="text-foreground">{m.goalkeeper.name}</span></p>
                      )}
                      {m.highlight_player && (
                        <p className="flex items-center gap-2 text-muted">
                          <Trophy className="h-3.5 w-3.5" /> Destaque: <span className="text-foreground">{m.highlight_player.name}</span>
                        </p>
                      )}
                    </div>

                    {m.match_goals.length > 0 && (
                      <div className="mb-2">
                        <p className="mb-1 text-xs font-medium uppercase text-muted">Gols</p>
                        <div className="flex flex-wrap gap-1.5">
                          {m.match_goals.map((g) => (
                            <Badge key={g.id} variant="muted">
                              {g.players.name} ({g.goals})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {m.match_assists.length > 0 && (
                      <div className="mb-2">
                        <p className="mb-1 text-xs font-medium uppercase text-muted">Assistências</p>
                        <div className="flex flex-wrap gap-1.5">
                          {m.match_assists.map((a) => (
                            <Badge key={a.id} variant="muted">
                              {a.players.name} ({a.assists})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {m.notes && <p className="mt-2 text-muted">{m.notes}</p>}

                    <div className="mt-3 flex justify-end">
                      <Button variant="danger" size="sm" onClick={() => setDeleting(m)}>
                        <Trash2 className="h-4 w-4" />
                        Excluir jogo
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogTitle>Excluir jogo</DialogTitle>
        <p className="text-sm text-muted">
          Tem certeza que deseja excluir o jogo contra{' '}
          <strong className="text-foreground">{deleting?.opponent}</strong>? Essa ação não pode ser desfeita.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleting(null)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Excluir
          </Button>
        </div>
      </Dialog>
    </div>
  )
}

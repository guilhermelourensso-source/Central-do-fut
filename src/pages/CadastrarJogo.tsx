import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Minus, Plus, Save } from 'lucide-react'
import { useSeason } from '@/contexts/SeasonContext'
import { usePlayers } from '@/hooks/usePlayers'
import { useGoalkeepers } from '@/hooks/useGoalkeepers'
import { useMatches } from '@/hooks/useMatches'
import { useToast } from '@/contexts/ToastContext'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { PlayerCounterList, type CounterMap } from '@/components/shared/PlayerCounterList'
import { Loading, EmptyState } from '@/components/shared/EmptyState'
import { PlusSquare } from 'lucide-react'

export default function CadastrarJogo() {
  const { selectedSeasonId, seasons, loading: seasonLoading } = useSeason()
  const { players, loading: playersLoading } = usePlayers()
  const { goalkeepers, loading: goalkeepersLoading } = useGoalkeepers()
  const { createMatch } = useMatches()
  const { showSuccess, showError } = useToast()
  const navigate = useNavigate()

  const [matchDate, setMatchDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [location, setLocation] = useState('')
  const [competition, setCompetition] = useState('')
  const [opponent, setOpponent] = useState('')
  const [goalsFor, setGoalsFor] = useState(0)
  const [goalsAgainst, setGoalsAgainst] = useState(0)
  const [goalkeeperId, setGoalkeeperId] = useState('')
  const [highlightPlayerId, setHighlightPlayerId] = useState('')
  const [notes, setNotes] = useState('')
  const [goals, setGoals] = useState<CounterMap>({})
  const [assists, setAssists] = useState<CounterMap>({})
  const [saving, setSaving] = useState(false)

  const loading = seasonLoading || playersLoading || goalkeepersLoading

  if (loading) return <Loading />

  if (seasons.length === 0) {
    return (
      <EmptyState
        icon={PlusSquare}
        title="Crie uma temporada primeiro"
        description="Você precisa de uma temporada ativa antes de cadastrar jogos."
      />
    )
  }

  function updateCounter(setter: typeof setGoals, playerId: string, delta: number) {
    setter((prev) => {
      const next = Math.max(0, (prev[playerId] ?? 0) + delta)
      return { ...prev, [playerId]: next }
    })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!selectedSeasonId) return
    if (!opponent.trim()) {
      showError('Informe o adversário.')
      return
    }

    setSaving(true)
    const { error } = await createMatch({
      season_id: selectedSeasonId,
      match_date: matchDate,
      location: location.trim() || null,
      competition: competition.trim() || null,
      opponent: opponent.trim(),
      goals_for: goalsFor,
      goals_against: goalsAgainst,
      goalkeeper_id: goalkeeperId || null,
      highlight_player_id: highlightPlayerId || null,
      notes: notes.trim() || null,
      goals,
      assists
    })
    setSaving(false)

    if (error) {
      showError(error)
      return
    }

    showSuccess('Jogo registrado com sucesso.')
    navigate('/jogos')
  }

  const highlightablePlayers = players.filter((p) => !p.is_guest)

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-semibold">Cadastrar jogo</h1>
        <p className="text-sm text-muted">Registre o placar, os gols e as assistências da partida</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Dados da partida</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="date">Data</Label>
                <Input id="date" type="date" required value={matchDate} onChange={(e) => setMatchDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="location">Local</Label>
                <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Estádio / Quadra" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="competition">Competição</Label>
                <Input id="competition" value={competition} onChange={(e) => setCompetition(e.target.value)} placeholder="Campeonato" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="opponent">Adversário</Label>
                <Input id="opponent" required value={opponent} onChange={(e) => setOpponent(e.target.value)} placeholder="Nome do time adversário" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Gols do time</Label>
                <ScoreStepper value={goalsFor} onChange={setGoalsFor} />
              </div>
              <div className="space-y-1.5">
                <Label>Gols adversário</Label>
                <ScoreStepper value={goalsAgainst} onChange={setGoalsAgainst} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="goalkeeper">Goleiro</Label>
                <Select id="goalkeeper" value={goalkeeperId} onChange={(e) => setGoalkeeperId(e.target.value)}>
                  <option value="">Selecionar goleiro</option>
                  {goalkeepers.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="highlight">Destaque da partida</Label>
                <Select id="highlight" value={highlightPlayerId} onChange={(e) => setHighlightPlayerId(e.target.value)}>
                  <option value="">Selecionar jogador</option>
                  {highlightablePlayers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">Observações</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observações sobre a partida (opcional)" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gols por jogador</CardTitle>
          </CardHeader>
          <CardContent>
            <PlayerCounterList players={players} values={goals} onChange={(id, delta) => updateCounter(setGoals, id, delta)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assistências por jogador</CardTitle>
          </CardHeader>
          <CardContent>
            <PlayerCounterList players={players} values={assists} onChange={(id, delta) => updateCounter(setAssists, id, delta)} />
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full" disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? 'Salvando...' : 'Salvar jogo'}
        </Button>
      </form>
    </div>
  )
}

function ScoreStepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Button type="button" variant="outline" size="icon" onClick={() => onChange(Math.max(0, value - 1))}>
        <Minus className="h-4 w-4" />
      </Button>
      <span className="w-10 text-center font-display text-xl font-semibold">{value}</span>
      <Button type="button" variant="outline" size="icon" onClick={() => onChange(value + 1)}>
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}

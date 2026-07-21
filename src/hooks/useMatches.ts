import { supabase } from '@/lib/supabase'
import { useTeam } from '@/contexts/TeamContext'
import type { CounterMap } from '@/components/shared/PlayerCounterList'

export type NewMatchInput = {
  season_id: string
  match_date: string
  location: string | null
  competition: string | null
  opponent: string
  goals_for: number
  goals_against: number
  goalkeeper_id: string | null
  highlight_player_id: string | null
  notes: string | null
  goals: CounterMap
  assists: CounterMap
}

export function useMatches() {
  const { team } = useTeam()

  async function createMatch(input: NewMatchInput) {
    if (!team) return { error: 'Time não carregado', matchId: null }

    const { data: match, error } = await supabase
      .from('matches')
      .insert({
        team_id: team.id,
        season_id: input.season_id,
        match_date: input.match_date,
        location: input.location,
        competition: input.competition,
        opponent: input.opponent,
        goals_for: input.goals_for,
        goals_against: input.goals_against,
        goalkeeper_id: input.goalkeeper_id,
        highlight_player_id: input.highlight_player_id,
        notes: input.notes
      })
      .select()
      .single()

    if (error || !match) return { error: error?.message ?? 'Erro ao criar jogo', matchId: null }

    const goalRows = Object.entries(input.goals)
      .filter(([, v]) => v > 0)
      .map(([player_id, goals]) => ({ match_id: match.id, player_id, goals }))

    const assistRows = Object.entries(input.assists)
      .filter(([, v]) => v > 0)
      .map(([player_id, assists]) => ({ match_id: match.id, player_id, assists }))

    if (goalRows.length > 0) {
      const { error: goalsError } = await supabase.from('match_goals').insert(goalRows)
      if (goalsError) return { error: goalsError.message, matchId: match.id }
    }
    if (assistRows.length > 0) {
      const { error: assistsError } = await supabase.from('match_assists').insert(assistRows)
      if (assistsError) return { error: assistsError.message, matchId: match.id }
    }

    return { error: null, matchId: match.id as string }
  }

  async function deleteMatch(id: string) {
    const { error } = await supabase.from('matches').delete().eq('id', id)
    return { error: error?.message ?? null }
  }

  return { createMatch, deleteMatch }
}

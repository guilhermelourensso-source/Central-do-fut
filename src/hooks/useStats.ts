import { useEffect, useState, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import type { MatchWithDetails, Player, Goalkeeper } from '@/types/database'

export type ResultKind = 'V' | 'E' | 'D'

export type PlayerAgg = {
  player: Player
  goals: number
  assists: number
  highlights: number
  games: number
  mvpScore: number
}

export type GoalkeeperAgg = {
  goalkeeper: Goalkeeper
  games: number
  goalsConceded: number
  avgConceded: number
}

export type SeasonStats = {
  loading: boolean
  matches: MatchWithDetails[]
  games: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  saldo: number
  winRate: number
  avgGoalsFor: number
  avgGoalsAgainst: number
  longestWinStreak: number
  longestUnbeatenStreak: number
  last5: ResultKind[]
  scorers: PlayerAgg[]
  assisters: PlayerAgg[]
  highlighters: PlayerAgg[]
  mvps: PlayerAgg[]
  goalkeepers: GoalkeeperAgg[]
  bestGoalkeeper: GoalkeeperAgg | null
  refresh: () => Promise<void>
}

function resultOf(m: { goals_for: number; goals_against: number }): ResultKind {
  if (m.goals_for > m.goals_against) return 'V'
  if (m.goals_for < m.goals_against) return 'D'
  return 'E'
}

export function useSeasonStats(seasonId: string | null): SeasonStats {
  const [matches, setMatches] = useState<MatchWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!seasonId) {
      setMatches([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('matches')
      .select(
        `*,
        match_goals ( id, match_id, player_id, goals, players ( id, name, is_guest ) ),
        match_assists ( id, match_id, player_id, assists, players ( id, name, is_guest ) ),
        goalkeeper:goalkeepers!matches_goalkeeper_id_fkey ( id, name ),
        highlight_player:players!matches_highlight_player_id_fkey ( id, name )
      `
      )
      .eq('season_id', seasonId)
      .order('match_date', { ascending: true })

    setMatches((data as unknown as MatchWithDetails[]) ?? [])
    setLoading(false)
  }, [seasonId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const stats = useMemo(() => {
    const games = matches.length
    let wins = 0
    let draws = 0
    let losses = 0
    let goalsFor = 0
    let goalsAgainst = 0

    const results: ResultKind[] = matches.map((m) => {
      goalsFor += m.goals_for
      goalsAgainst += m.goals_against
      const r = resultOf(m)
      if (r === 'V') wins++
      else if (r === 'E') draws++
      else losses++
      return r
    })

    let longestWinStreak = 0
    let currentWinStreak = 0
    let longestUnbeatenStreak = 0
    let currentUnbeatenStreak = 0
    for (const r of results) {
      currentWinStreak = r === 'V' ? currentWinStreak + 1 : 0
      longestWinStreak = Math.max(longestWinStreak, currentWinStreak)
      currentUnbeatenStreak = r !== 'D' ? currentUnbeatenStreak + 1 : 0
      longestUnbeatenStreak = Math.max(longestUnbeatenStreak, currentUnbeatenStreak)
    }

    const last5 = results.slice(-5).reverse()

    const playerMap = new Map<string, PlayerAgg>()
    function ensurePlayer(p: Player) {
      if (!playerMap.has(p.id)) {
        playerMap.set(p.id, { player: p, goals: 0, assists: 0, highlights: 0, games: 0, mvpScore: 0 })
      }
      return playerMap.get(p.id)!
    }

    for (const m of matches) {
      const playersInMatch = new Set<string>()
      for (const g of m.match_goals ?? []) {
        if (g.players?.is_guest) continue
        const agg = ensurePlayer(g.players as Player)
        agg.goals += g.goals
        playersInMatch.add(agg.player.id)
      }
      for (const a of m.match_assists ?? []) {
        if (a.players?.is_guest) continue
        const agg = ensurePlayer(a.players as Player)
        agg.assists += a.assists
        playersInMatch.add(agg.player.id)
      }
      if (m.highlight_player && !(m.highlight_player as unknown as Player).is_guest) {
        const agg = ensurePlayer(m.highlight_player as Player)
        agg.highlights += 1
        playersInMatch.add(agg.player.id)
      }
      for (const id of playersInMatch) {
        const agg = playerMap.get(id)
        if (agg) agg.games += 1
      }
    }

    for (const agg of playerMap.values()) {
      agg.mvpScore = agg.goals * 3 + agg.assists * 2 + agg.highlights * 5
    }

    const all = Array.from(playerMap.values())
    const scorers = [...all].filter((a) => a.goals > 0).sort((a, b) => b.goals - a.goals)
    const assisters = [...all].filter((a) => a.assists > 0).sort((a, b) => b.assists - a.assists)
    const highlighters = [...all].filter((a) => a.highlights > 0).sort((a, b) => b.highlights - a.highlights)
    const mvps = [...all].filter((a) => a.mvpScore > 0).sort((a, b) => b.mvpScore - a.mvpScore)

    const gkMap = new Map<string, GoalkeeperAgg>()
    for (const m of matches) {
      const gk = m.goalkeeper as unknown as Goalkeeper | null
      if (!gk) continue
      if (!gkMap.has(gk.id)) gkMap.set(gk.id, { goalkeeper: gk, games: 0, goalsConceded: 0, avgConceded: 0 })
      const agg = gkMap.get(gk.id)!
      agg.games += 1
      agg.goalsConceded += m.goals_against
    }
    const goalkeepers = Array.from(gkMap.values())
      .filter((a) => !('is_guest' in a.goalkeeper) || !(a.goalkeeper as Goalkeeper).is_guest)
      .map((a) => ({ ...a, avgConceded: a.games > 0 ? a.goalsConceded / a.games : 0 }))
      .sort((a, b) => a.avgConceded - b.avgConceded)

    const bestGoalkeeper = goalkeepers.length > 0 ? goalkeepers[0] : null

    return {
      games,
      wins,
      draws,
      losses,
      goalsFor,
      goalsAgainst,
      saldo: goalsFor - goalsAgainst,
      winRate: games > 0 ? (wins / games) * 100 : 0,
      avgGoalsFor: games > 0 ? goalsFor / games : 0,
      avgGoalsAgainst: games > 0 ? goalsAgainst / games : 0,
      longestWinStreak,
      longestUnbeatenStreak,
      last5,
      scorers,
      assisters,
      highlighters,
      mvps,
      goalkeepers,
      bestGoalkeeper
    }
  }, [matches])

  return { loading, matches, refresh, ...stats }
}

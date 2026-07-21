import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useTeam } from '@/contexts/TeamContext'
import type { Player } from '@/types/database'

export function usePlayers() {
  const { team } = useTeam()
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!team) {
      setPlayers([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('players')
      .select('*')
      .eq('team_id', team.id)
      .order('is_guest', { ascending: true })
      .order('name', { ascending: true })
    setPlayers(data ?? [])
    setLoading(false)
  }, [team])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function createPlayer(input: { name: string; number?: number | null; position?: string | null; photo_url?: string | null }) {
    if (!team) return { error: 'Time não carregado' }
    const { error } = await supabase.from('players').insert({ ...input, team_id: team.id, is_guest: false })
    if (!error) await refresh()
    return { error: error?.message ?? null }
  }

  async function updatePlayer(id: string, patch: Partial<Player>) {
    const { error } = await supabase.from('players').update(patch).eq('id', id)
    if (!error) await refresh()
    return { error: error?.message ?? null }
  }

  async function deletePlayer(id: string) {
    const { error } = await supabase.from('players').delete().eq('id', id)
    if (!error) await refresh()
    return { error: error?.message ?? null }
  }

  const realPlayers = players.filter((p) => !p.is_guest)
  const guestPlayer = players.find((p) => p.is_guest) ?? null

  return { players, realPlayers, guestPlayer, loading, refresh, createPlayer, updatePlayer, deletePlayer }
}

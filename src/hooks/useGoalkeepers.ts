import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useTeam } from '@/contexts/TeamContext'
import type { Goalkeeper } from '@/types/database'

export function useGoalkeepers() {
  const { team } = useTeam()
  const [goalkeepers, setGoalkeepers] = useState<Goalkeeper[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!team) {
      setGoalkeepers([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('goalkeepers')
      .select('*')
      .eq('team_id', team.id)
      .order('is_guest', { ascending: true })
      .order('name', { ascending: true })
    setGoalkeepers(data ?? [])
    setLoading(false)
  }, [team])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function createGoalkeeper(input: { name: string; photo_url?: string | null }) {
    if (!team) return { error: 'Time não carregado' }
    const { error } = await supabase.from('goalkeepers').insert({ ...input, team_id: team.id, is_guest: false })
    if (!error) await refresh()
    return { error: error?.message ?? null }
  }

  async function updateGoalkeeper(id: string, patch: Partial<Goalkeeper>) {
    const { error } = await supabase.from('goalkeepers').update(patch).eq('id', id)
    if (!error) await refresh()
    return { error: error?.message ?? null }
  }

  async function deleteGoalkeeper(id: string) {
    const { error } = await supabase.from('goalkeepers').delete().eq('id', id)
    if (!error) await refresh()
    return { error: error?.message ?? null }
  }

  const realGoalkeepers = goalkeepers.filter((g) => !g.is_guest)
  const guestGoalkeeper = goalkeepers.find((g) => g.is_guest) ?? null

  return {
    goalkeepers,
    realGoalkeepers,
    guestGoalkeeper,
    loading,
    refresh,
    createGoalkeeper,
    updateGoalkeeper,
    deleteGoalkeeper
  }
}

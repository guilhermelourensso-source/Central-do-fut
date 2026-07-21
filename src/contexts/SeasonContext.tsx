import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { useTeam } from '@/contexts/TeamContext'
import type { Season } from '@/types/database'

type SeasonContextValue = {
  seasons: Season[]
  selectedSeason: Season | null
  selectedSeasonId: string | null
  loading: boolean
  setSelectedSeasonId: (id: string) => void
  createSeason: (name: string) => Promise<{ error: string | null }>
  renameSeason: (id: string, name: string) => Promise<{ error: string | null }>
  deleteSeason: (id: string) => Promise<{ error: string | null }>
  setActiveSeason: (id: string) => Promise<{ error: string | null }>
  refreshSeasons: () => Promise<void>
}

const SeasonContext = createContext<SeasonContextValue | undefined>(undefined)

export function SeasonProvider({ children }: { children: ReactNode }) {
  const { team } = useTeam()
  const [seasons, setSeasons] = useState<Season[]>([])
  const [selectedSeasonId, setSelectedSeasonIdState] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshSeasons = useCallback(async () => {
    if (!team) {
      setSeasons([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('seasons')
      .select('*')
      .eq('team_id', team.id)
      .order('created_at', { ascending: false })

    const list = data ?? []
    setSeasons(list)

    // Seleciona automaticamente a temporada ativa, ou a única existente,
    // já no primeiro carregamento — nunca exige F5.
    setSelectedSeasonIdState((current) => {
      if (current && list.some((s) => s.id === current)) return current
      const active = list.find((s) => s.is_active)
      if (active) return active.id
      if (list.length === 1) return list[0].id
      return list[0]?.id ?? null
    })

    setLoading(false)
  }, [team])

  useEffect(() => {
    refreshSeasons()
  }, [refreshSeasons])

  function setSelectedSeasonId(id: string) {
    setSelectedSeasonIdState(id)
  }

  async function createSeason(name: string) {
    if (!team) return { error: 'Time não carregado' }
    const shouldBeActive = seasons.length === 0
    const { data, error } = await supabase
      .from('seasons')
      .insert({ team_id: team.id, name, is_active: shouldBeActive })
      .select()
      .single()
    if (!error && data) {
      await refreshSeasons()
      setSelectedSeasonIdState(data.id)
    }
    return { error: error?.message ?? null }
  }

  async function renameSeason(id: string, name: string) {
    const { error } = await supabase.from('seasons').update({ name }).eq('id', id)
    if (!error) await refreshSeasons()
    return { error: error?.message ?? null }
  }

  async function deleteSeason(id: string) {
    const target = seasons.find((s) => s.id === id)
    if (target?.is_active) {
      return { error: 'Não é possível excluir a temporada ativa. Ative outra temporada antes de excluir esta.' }
    }
    const { error } = await supabase.from('seasons').delete().eq('id', id)
    if (!error) {
      if (selectedSeasonId === id) setSelectedSeasonIdState(null)
      await refreshSeasons()
    }
    return { error: error?.message ?? null }
  }

  async function setActiveSeason(id: string) {
    const { error } = await supabase.from('seasons').update({ is_active: true }).eq('id', id)
    if (!error) await refreshSeasons()
    return { error: error?.message ?? null }
  }

  const selectedSeason = seasons.find((s) => s.id === selectedSeasonId) ?? null

  return (
    <SeasonContext.Provider
      value={{
        seasons,
        selectedSeason,
        selectedSeasonId,
        loading,
        setSelectedSeasonId,
        createSeason,
        renameSeason,
        deleteSeason,
        setActiveSeason,
        refreshSeasons
      }}
    >
      {children}
    </SeasonContext.Provider>
  )
}

export function useSeason() {
  const ctx = useContext(SeasonContext)
  if (!ctx) throw new Error('useSeason deve ser usado dentro de SeasonProvider')
  return ctx
}

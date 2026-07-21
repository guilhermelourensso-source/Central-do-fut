import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Team } from '@/types/database'

type TeamContextValue = {
  team: Team | null
  loading: boolean
  refreshTeam: () => Promise<void>
  updateTeam: (patch: Partial<Team>) => Promise<{ error: string | null }>
}

const TeamContext = createContext<TeamContextValue | undefined>(undefined)

export function TeamProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [team, setTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshTeam = useCallback(async () => {
    if (!user) {
      setTeam(null)
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase.from('teams').select('*').eq('user_id', user.id).single()
    setTeam(data ?? null)
    setLoading(false)
  }, [user])

  useEffect(() => {
    refreshTeam()
  }, [refreshTeam])

  // Aplica a logo e as cores do time em tempo real (favicon, ícone PWA, tema)
  useEffect(() => {
    if (!team) return

    if (team.logo_url) {
      const favicon = document.getElementById('favicon') as HTMLLinkElement | null
      const appleIcon = document.getElementById('apple-icon') as HTMLLinkElement | null
      if (favicon) favicon.href = team.logo_url
      if (appleIcon) appleIcon.href = team.logo_url
    }

    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta && team.secondary_color) meta.setAttribute('content', team.secondary_color)

    document.documentElement.style.setProperty('--team-primary', team.primary_color)
    document.documentElement.style.setProperty('--team-secondary', team.secondary_color)
  }, [team])

  async function updateTeam(patch: Partial<Team>) {
    if (!team) return { error: 'Time não carregado' }
    const { data, error } = await supabase
      .from('teams')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', team.id)
      .select()
      .single()
    if (!error && data) setTeam(data)
    return { error: error?.message ?? null }
  }

  return (
    <TeamContext.Provider value={{ team, loading, refreshTeam, updateTeam }}>
      {children}
    </TeamContext.Provider>
  )
}

export function useTeam() {
  const ctx = useContext(TeamContext)
  if (!ctx) throw new Error('useTeam deve ser usado dentro de TeamProvider')
  return ctx
}

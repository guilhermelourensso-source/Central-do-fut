import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { TeamProvider } from '@/contexts/TeamContext'
import { SeasonProvider } from '@/contexts/SeasonContext'
import { Loading } from '@/components/shared/EmptyState'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loading label="Carregando sua conta..." />
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />

  return (
    <TeamProvider>
      <SeasonProvider>{children}</SeasonProvider>
    </TeamProvider>
  )
}

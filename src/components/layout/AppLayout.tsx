import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { SeasonSwitcher } from '@/components/layout/SeasonSwitcher'
import { useTeam } from '@/contexts/TeamContext'

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { loading } = useTeam()

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar desktop */}
      <aside className="hidden w-64 shrink-0 border-r border-border md:block">
        <Sidebar />
      </aside>

      {/* Sidebar mobile (drawer) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 animate-fade-in">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3 md:justify-end md:px-8">
          <button
            className="rounded-lg p-2 text-foreground hover:bg-surface-hover md:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <SeasonSwitcher />
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8">
          {loading ? null : <Outlet />}
        </main>
      </div>
    </div>
  )
}

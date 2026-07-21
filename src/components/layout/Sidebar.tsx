import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  PlusSquare,
  Swords,
  Users,
  ShieldHalf,
  BarChart3,
  Trophy,
  Star,
  CalendarRange,
  Settings,
  LogOut
} from 'lucide-react'
import { useTeam } from '@/contexts/TeamContext'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { initials } from '@/lib/utils'

const menuItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/cadastrar-jogo', label: 'Cadastrar jogo', icon: PlusSquare },
  { to: '/jogos', label: 'Jogos', icon: Swords },
  { to: '/jogadores', label: 'Jogadores', icon: Users },
  { to: '/goleiros', label: 'Goleiros', icon: ShieldHalf },
  { to: '/estatisticas', label: 'Estatísticas', icon: BarChart3 },
  { to: '/ranking', label: 'Ranking', icon: Trophy },
  { to: '/hall-da-fama', label: 'Hall da Fama', icon: Star },
  { to: '/temporadas', label: 'Temporadas', icon: CalendarRange },
  { to: '/configuracoes', label: 'Configurações', icon: Settings }
]

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { team } = useTeam()
  const { signOut } = useAuth()

  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex items-center gap-3 border-b border-border p-5">
        {team?.logo_url ? (
          <img src={team.logo_url} alt={team.name} className="h-10 w-10 rounded-xl object-cover" />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 font-display font-semibold text-accent">
            {team ? initials(team.name) : 'CJ'}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate font-display font-semibold text-foreground">{team?.name ?? 'Central de Jogos'}</p>
          {(team?.city || team?.state) && (
            <p className="truncate text-xs text-muted">
              {[team?.city, team?.state].filter(Boolean).join(' - ')}
            </p>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted hover:bg-surface-hover hover:text-foreground'
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-danger/10 hover:text-danger"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </div>
  )
}

import { Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Player } from '@/types/database'

export type CounterMap = Record<string, number>

export function PlayerCounterList({
  players,
  values,
  onChange
}: {
  players: Player[]
  values: CounterMap
  onChange: (playerId: string, delta: number) => void
}) {
  if (players.length === 0) {
    return <p className="text-sm text-muted">Cadastre jogadores primeiro.</p>
  }

  return (
    <div className="space-y-2">
      {players.map((p) => (
        <div
          key={p.id}
          className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2"
        >
          <span className="truncate text-sm">
            {p.name}
            {p.number != null && <span className="ml-1 text-xs text-muted">#{p.number}</span>}
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => onChange(p.id, -1)}
              disabled={!values[p.id]}
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <span className="w-5 text-center text-sm font-medium">{values[p.id] ?? 0}</span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => onChange(p.id, 1)}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

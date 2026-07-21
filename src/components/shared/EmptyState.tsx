import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

export function Loading({ label = 'Carregando...' }: { label?: string }) {
  return (
    <div className="flex h-full min-h-[240px] flex-col items-center justify-center gap-3 text-muted">
      <Loader2 className="h-6 w-6 animate-spin text-accent" />
      <p className="text-sm">{label}</p>
    </div>
  )
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action
}: {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
      <div className="rounded-2xl bg-accent/10 p-3 text-accent">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="font-display font-semibold text-foreground">{title}</p>
        {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  )
}

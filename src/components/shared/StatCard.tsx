import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = false,
  suffix
}: {
  label: string
  value: string | number
  icon: LucideIcon
  accent?: boolean
  suffix?: string
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted">{label}</p>
          <p className={cn('mt-2 font-display text-2xl font-semibold', accent && 'text-accent')}>
            {value}
            {suffix && <span className="ml-1 text-base font-normal text-muted">{suffix}</span>}
          </p>
        </div>
        <div className="rounded-xl bg-accent/10 p-2.5 text-accent">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  )
}

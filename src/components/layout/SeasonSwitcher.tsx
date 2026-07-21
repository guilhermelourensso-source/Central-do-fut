import { useSeason } from '@/contexts/SeasonContext'
import { Select } from '@/components/ui/select'

export function SeasonSwitcher() {
  const { seasons, selectedSeasonId, setSelectedSeasonId, loading } = useSeason()

  if (loading) return null
  if (seasons.length === 0) return null

  return (
    <Select
      value={selectedSeasonId ?? ''}
      onChange={(e) => setSelectedSeasonId(e.target.value)}
      className="w-auto min-w-[140px]"
    >
      {seasons.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
          {s.is_active ? ' (ativa)' : ''}
        </option>
      ))}
    </Select>
  )
}

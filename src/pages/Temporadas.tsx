import { useState, type ChangeEvent, type FormEvent } from 'react'
import { CalendarRange, Plus, Pencil, Trash2, CheckCircle2 } from 'lucide-react'
import { useSeason } from '@/contexts/SeasonContext'
import { useToast } from '@/contexts/ToastContext'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Loading, EmptyState } from '@/components/shared/EmptyState'
import type { Season } from '@/types/database'

export default function Temporadas() {
  const { seasons, loading, createSeason, renameSeason, deleteSeason, setActiveSeason } = useSeason()
  const { showSuccess, showError } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Season | null>(null)
  const [deleting, setDeleting] = useState<Season | null>(null)

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(s: Season) {
    setEditing(s)
    setDialogOpen(true)
  }

  async function handleDelete() {
    if (!deleting) return
    const { error } = await deleteSeason(deleting.id)
    if (error) showError(error)
    else showSuccess('Temporada excluída.')
    setDeleting(null)
  }

  async function handleActivate(s: Season) {
    const { error } = await setActiveSeason(s.id)
    if (error) showError(error)
    else showSuccess(`Temporada "${s.name}" ativada.`)
  }

  if (loading) return <Loading />

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Temporadas</h1>
          <p className="text-sm text-muted">Cada temporada guarda estatísticas independentes</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Nova temporada
        </Button>
      </div>

      {seasons.length === 0 ? (
        <EmptyState
          icon={CalendarRange}
          title="Nenhuma temporada criada"
          description="Crie a primeira temporada para começar a registrar jogos."
          action={
            <Button onClick={openCreate} size="sm">
              <Plus className="h-4 w-4" />
              Criar temporada
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {seasons.map((s) => (
            <Card key={s.id} className="flex flex-col gap-3 p-5">
              <div className="flex items-center justify-between">
                <p className="font-display font-semibold">{s.name}</p>
                {s.is_active && <Badge variant="success">Ativa</Badge>}
              </div>
              <div className="flex flex-wrap gap-2">
                {!s.is_active && (
                  <Button variant="outline" size="sm" onClick={() => handleActivate(s)}>
                    <CheckCircle2 className="h-4 w-4" />
                    Ativar
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => openEdit(s)}>
                  <Pencil className="h-4 w-4" />
                  Editar
                </Button>
                <Button variant="danger" size="sm" onClick={() => setDeleting(s)} disabled={s.is_active}>
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <SeasonDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        season={editing}
        onCreate={createSeason}
        onRename={renameSeason}
      />

      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogTitle>Excluir temporada</DialogTitle>
        <p className="text-sm text-muted">
          Tem certeza que deseja excluir <strong className="text-foreground">{deleting?.name}</strong>? Todos os
          jogos e estatísticas dessa temporada serão removidos permanentemente.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleting(null)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Excluir
          </Button>
        </div>
      </Dialog>
    </div>
  )
}

function SeasonDialog({
  open,
  onOpenChange,
  season,
  onCreate,
  onRename
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  season: Season | null
  onCreate: (name: string) => Promise<{ error: string | null }>
  onRename: (id: string, name: string) => Promise<{ error: string | null }>
}) {
  const { showSuccess, showError } = useToast()
  const [name, setName] = useState(season?.name ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    const { error } = season ? await onRename(season.id, name.trim()) : await onCreate(name.trim())
    setSaving(false)
    if (error) {
      showError(error)
      return
    }
    showSuccess(season ? 'Temporada atualizada.' : 'Temporada criada.')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle>{season ? 'Editar temporada' : 'Nova temporada'}</DialogTitle>
      <form key={season?.id ?? 'new'} onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nome da temporada</Label>
          <Input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Temporada 2026"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

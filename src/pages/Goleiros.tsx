import { useState, type ChangeEvent, type FormEvent } from 'react'
import { ShieldHalf, Plus, Pencil, Trash2, ImagePlus } from 'lucide-react'
import { useGoalkeepers } from '@/hooks/useGoalkeepers'
import { uploadTeamAsset } from '@/lib/upload'
import { useToast } from '@/contexts/ToastContext'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Loading, EmptyState } from '@/components/shared/EmptyState'
import { initials } from '@/lib/utils'
import type { Goalkeeper } from '@/types/database'

export default function Goleiros() {
  const { realGoalkeepers, guestGoalkeeper, loading, createGoalkeeper, updateGoalkeeper, deleteGoalkeeper } =
    useGoalkeepers()
  const { showSuccess, showError } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Goalkeeper | null>(null)
  const [deleting, setDeleting] = useState<Goalkeeper | null>(null)

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(g: Goalkeeper) {
    setEditing(g)
    setDialogOpen(true)
  }

  async function handleDelete() {
    if (!deleting) return
    const { error } = await deleteGoalkeeper(deleting.id)
    if (error) showError(error)
    else showSuccess('Goleiro excluído.')
    setDeleting(null)
  }

  if (loading) return <Loading />

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Goleiros</h1>
          <p className="text-sm text-muted">Goleiros do seu time</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Novo goleiro
        </Button>
      </div>

      {realGoalkeepers.length === 0 ? (
        <EmptyState
          icon={ShieldHalf}
          title="Nenhum goleiro cadastrado"
          description="Cadastre os goleiros do seu time para associá-los aos jogos."
          action={
            <Button onClick={openCreate} size="sm">
              <Plus className="h-4 w-4" />
              Cadastrar goleiro
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {realGoalkeepers.map((g) => (
            <Card key={g.id} className="flex flex-col items-center gap-3 p-5 text-center">
              {g.photo_url ? (
                <img src={g.photo_url} alt={g.name} className="h-16 w-16 rounded-full object-cover" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 font-display font-semibold text-accent">
                  {initials(g.name)}
                </div>
              )}
              <p className="font-medium">{g.name}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => openEdit(g)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="danger" size="icon" onClick={() => setDeleting(g)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}

          {guestGoalkeeper && (
            <Card className="flex flex-col items-center gap-3 border-dashed p-5 text-center opacity-70">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5 font-display font-semibold text-muted">
                {initials(guestGoalkeeper.name)}
              </div>
              <p className="font-medium">{guestGoalkeeper.name}</p>
              <Badge variant="muted">Não entra nas estatísticas</Badge>
            </Card>
          )}
        </div>
      )}

      <GoalkeeperDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        goalkeeper={editing}
        onCreate={createGoalkeeper}
        onUpdate={updateGoalkeeper}
      />

      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogTitle>Excluir goleiro</DialogTitle>
        <p className="text-sm text-muted">
          Tem certeza que deseja excluir <strong className="text-foreground">{deleting?.name}</strong>?
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

function GoalkeeperDialog({
  open,
  onOpenChange,
  goalkeeper,
  onCreate,
  onUpdate
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  goalkeeper: Goalkeeper | null
  onCreate: (input: { name: string; photo_url?: string | null }) => Promise<{ error: string | null }>
  onUpdate: (id: string, patch: Partial<Goalkeeper>) => Promise<{ error: string | null }>
}) {
  const { showSuccess, showError } = useToast()
  const [name, setName] = useState(goalkeeper?.name ?? '')
  const [photoUrl, setPhotoUrl] = useState(goalkeeper?.photo_url ?? null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handlePhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const { url, error } = await uploadTeamAsset(file, 'goalkeepers')
    setUploading(false)
    if (error) {
      showError('Não foi possível enviar a foto: ' + error)
      return
    }
    setPhotoUrl(url)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    const input = { name: name.trim(), photo_url: photoUrl }
    const { error } = goalkeeper ? await onUpdate(goalkeeper.id, input) : await onCreate(input)
    setSaving(false)
    if (error) {
      showError(error)
      return
    }
    showSuccess(goalkeeper ? 'Goleiro atualizado.' : 'Goleiro cadastrado.')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle>{goalkeeper ? 'Editar goleiro' : 'Novo goleiro'}</DialogTitle>
      <form key={goalkeeper?.id ?? 'new'} onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-center">
          <label className="relative cursor-pointer">
            {photoUrl ? (
              <img src={photoUrl} alt="" className="h-20 w-20 rounded-full object-cover" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-background text-muted">
                <ImagePlus className="h-6 w-6" />
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} disabled={uploading} />
          </label>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do goleiro" />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving || uploading}>
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

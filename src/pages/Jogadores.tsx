import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Users, Plus, Pencil, Trash2, ImagePlus } from 'lucide-react'
import { usePlayers } from '@/hooks/usePlayers'
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
import type { Player } from '@/types/database'

export default function Jogadores() {
  const { realPlayers, guestPlayer, loading, createPlayer, updatePlayer, deletePlayer } = usePlayers()
  const { showSuccess, showError } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Player | null>(null)
  const [deleting, setDeleting] = useState<Player | null>(null)

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(p: Player) {
    setEditing(p)
    setDialogOpen(true)
  }

  async function handleDelete() {
    if (!deleting) return
    const { error } = await deletePlayer(deleting.id)
    if (error) showError(error)
    else showSuccess('Jogador excluído.')
    setDeleting(null)
  }

  if (loading) return <Loading />

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Jogadores</h1>
          <p className="text-sm text-muted">Elenco do seu time</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Novo jogador
        </Button>
      </div>

      {realPlayers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum jogador cadastrado"
          description="Cadastre os jogadores do seu time para começar a registrar gols e assistências."
          action={
            <Button onClick={openCreate} size="sm">
              <Plus className="h-4 w-4" />
              Cadastrar jogador
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {realPlayers.map((p) => (
            <Card key={p.id} className="flex flex-col items-center gap-3 p-5 text-center">
              {p.photo_url ? (
                <img src={p.photo_url} alt={p.name} className="h-16 w-16 rounded-full object-cover" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 font-display font-semibold text-accent">
                  {initials(p.name)}
                </div>
              )}
              <div>
                <p className="font-medium">{p.name}</p>
                <div className="mt-1 flex flex-wrap justify-center gap-1">
                  {p.number != null && <Badge variant="muted">#{p.number}</Badge>}
                  {p.position && <Badge variant="muted">{p.position}</Badge>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => openEdit(p)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="danger" size="icon" onClick={() => setDeleting(p)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}

          {guestPlayer && (
            <Card className="flex flex-col items-center gap-3 border-dashed p-5 text-center opacity-70">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5 font-display font-semibold text-muted">
                {initials(guestPlayer.name)}
              </div>
              <div>
                <p className="font-medium">{guestPlayer.name}</p>
                <Badge variant="muted" className="mt-1">
                  Não entra nas estatísticas
                </Badge>
              </div>
            </Card>
          )}
        </div>
      )}

      <PlayerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        player={editing}
        onCreate={createPlayer}
        onUpdate={updatePlayer}
      />

      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogTitle>Excluir jogador</DialogTitle>
        <p className="text-sm text-muted">
          Tem certeza que deseja excluir <strong className="text-foreground">{deleting?.name}</strong>? Os gols e
          assistências já registrados para ele serão removidos.
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

function PlayerDialog({
  open,
  onOpenChange,
  player,
  onCreate,
  onUpdate
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  player: Player | null
  onCreate: (input: { name: string; number?: number | null; position?: string | null; photo_url?: string | null }) => Promise<{ error: string | null }>
  onUpdate: (id: string, patch: Partial<Player>) => Promise<{ error: string | null }>
}) {
  const { showSuccess, showError } = useToast()
  const [name, setName] = useState(player?.name ?? '')
  const [number, setNumber] = useState(player?.number?.toString() ?? '')
  const [position, setPosition] = useState(player?.position ?? '')
  const [photoUrl, setPhotoUrl] = useState(player?.photo_url ?? null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handlePhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const { url, error } = await uploadTeamAsset(file, 'players')
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
    const input = {
      name: name.trim(),
      number: number ? Number(number) : null,
      position: position.trim() || null,
      photo_url: photoUrl
    }
    const { error } = player ? await onUpdate(player.id, input) : await onCreate(input)
    setSaving(false)
    if (error) {
      showError(error)
      return
    }
    showSuccess(player ? 'Jogador atualizado.' : 'Jogador cadastrado.')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle>{player ? 'Editar jogador' : 'Novo jogador'}</DialogTitle>
      <form key={player?.id ?? 'new'} onSubmit={handleSubmit} className="space-y-4">
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
          <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do jogador" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="number">Número (opcional)</Label>
            <Input id="number" type="number" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="10" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="position">Posição (opcional)</Label>
            <Input id="position" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Atacante" />
          </div>
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

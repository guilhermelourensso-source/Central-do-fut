import { useState, type ChangeEvent, type FormEvent } from 'react'
import { ImagePlus, Save } from 'lucide-react'
import { useTeam } from '@/contexts/TeamContext'
import { uploadTeamAsset } from '@/lib/upload'
import { useToast } from '@/contexts/ToastContext'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loading } from '@/components/shared/EmptyState'

const BRAZIL_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

export default function Configuracoes() {
  const { team, loading, updateTeam } = useTeam()
  const { showSuccess, showError } = useToast()

  const [name, setName] = useState(team?.name ?? '')
  const [city, setCity] = useState(team?.city ?? '')
  const [state, setState] = useState(team?.state ?? '')
  const [primaryColor, setPrimaryColor] = useState(team?.primary_color ?? '#f2c94c')
  const [secondaryColor, setSecondaryColor] = useState(team?.secondary_color ?? '#0a0a0b')
  const [logoUrl, setLogoUrl] = useState(team?.logo_url ?? null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  if (loading || !team) return <Loading />

  async function handleLogo(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const { url, error } = await uploadTeamAsset(file, 'logos')
    setUploading(false)
    if (error) {
      showError('Não foi possível enviar a logo: ' + error)
      return
    }
    setLogoUrl(url)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { error } = await updateTeam({
      name: name.trim(),
      city: city.trim() || null,
      state: state || null,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      logo_url: logoUrl
    })
    setSaving(false)
    if (error) {
      showError(error)
      return
    }
    showSuccess('Configurações do time atualizadas.')
  }

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-semibold">Configurações</h1>
        <p className="text-sm text-muted">A logo e as cores são aplicadas em todo o sistema automaticamente</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Dados do time</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex justify-center">
              <label className="relative cursor-pointer">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo do time" className="h-24 w-24 rounded-2xl object-cover" />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-background text-muted">
                    <ImagePlus className="h-7 w-7" />
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleLogo} disabled={uploading} />
              </label>
            </div>
            <p className="text-center text-xs text-muted">
              Ao trocar a logo, ela é atualizada automaticamente no menu, tela de login e ícone do app instalado.
            </p>

            <div className="space-y-1.5">
              <Label htmlFor="name">Nome do time</Label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Orleans" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="state">Estado</Label>
                <select
                  id="state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="flex h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <option value="">—</option>
                  {BRAZIL_STATES.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="primaryColor">Cor principal</Label>
                <div className="flex items-center gap-2">
                  <input
                    id="primaryColor"
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-10 w-12 cursor-pointer rounded-lg border border-border bg-background"
                  />
                  <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="secondaryColor">Cor secundária</Label>
                <div className="flex items-center gap-2">
                  <input
                    id="secondaryColor"
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="h-10 w-12 cursor-pointer rounded-lg border border-border bg-background"
                  />
                  <Input value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={saving || uploading} className="w-full">
              <Save className="h-4 w-4" />
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

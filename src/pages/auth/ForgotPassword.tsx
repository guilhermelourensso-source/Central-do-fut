import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { KeyRound } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

export default function ForgotPassword() {
  const { sendPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await sendPasswordReset(email)
    setLoading(false)
    if (error) {
      setError(error)
      return
    }
    setSent(true)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm p-8">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-accent">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="font-display text-xl font-semibold">Recuperar senha</h1>
          <p className="text-sm text-muted">Enviaremos um link para redefinir sua senha</p>
        </div>

        {sent ? (
          <p className="text-center text-sm text-muted">
            Se existir uma conta com o e-mail <strong className="text-foreground">{email}</strong>, você
            receberá um link de redefinição em instantes.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@exemplo.com"
              />
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar link'}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted">
          <Link to="/login" className="font-medium text-accent hover:underline">
            Voltar para o login
          </Link>
        </p>
      </Card>
    </div>
  )
}

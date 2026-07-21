import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string) {
  const d = new Date(date + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}
// Converte "#f2c94c" em "242 201 76" (formato que o Tailwind precisa
// para poder aplicar opacidade, ex: bg-accent/10)
export function hexToRgbTriplet(hex: string): string | null {
  const clean = hex.replace('#', '').trim()
  const match = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean

  if (!/^[0-9a-fA-F]{6}$/.test(match)) return null

  const r = parseInt(match.slice(0, 2), 16)
  const g = parseInt(match.slice(2, 4), 16)
  const b = parseInt(match.slice(4, 6), 16)
  return `${r} ${g} ${b}`
}

// Decide se o texto sobre a cor escolhida deve ser preto ou branco,
// para garantir contraste legível com qualquer cor que o time escolher
export function getContrastColor(hex: string): string {
  const triplet = hexToRgbTriplet(hex)
  if (!triplet) return '#0a0a0b'
  const [r, g, b] = triplet.split(' ').map(Number)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6 ? '#0a0a0b' : '#ffffff'
}

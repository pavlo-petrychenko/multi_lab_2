import type { Hsl } from '@/core'

export function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export function cssColor({ h, s, l }: Hsl): string {
  return `hsl(${h} ${s}% ${l}%)`
}

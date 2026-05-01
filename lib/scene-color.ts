function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function normalizeHexColor(value: unknown, fallback: string) {
  if (typeof value !== 'string') return fallback

  const next = value.trim()
  if (!/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(next)) return fallback

  if (next.length === 4) {
    return `#${next[1]}${next[1]}${next[2]}${next[2]}${next[3]}${next[3]}`.toLowerCase()
  }

  return next.toLowerCase()
}

export function toRgba(color: string, alpha: number, fallback = '#cbd5e1') {
  const hex = normalizeHexColor(color, fallback).slice(1)
  const r = Number.parseInt(hex.slice(0, 2), 16)
  const g = Number.parseInt(hex.slice(2, 4), 16)
  const b = Number.parseInt(hex.slice(4, 6), 16)

  return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1)})`
}

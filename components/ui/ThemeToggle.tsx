'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className={`h-9 w-9 ${className}`} />
  }

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      aria-label={isDark ? '切换到浅色模式' : '切换到深色模式'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`
        flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors duration-200
        hover:text-foreground
        ${className}
      `}
    >
      {isDark ? (
        <MaterialSymbol icon="light_mode" size={19} />
      ) : (
        <MaterialSymbol icon="dark_mode" size={19} />
      )}
    </button>
  )
}

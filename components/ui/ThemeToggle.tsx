'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className={`h-9 w-9 animate-pulse rounded-full bg-muted ${className}`} />
  }

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      aria-label={isDark ? '切换到浅色模式' : '切换到深色模式'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`
        flex h-9 w-9 items-center justify-center rounded-full border border-border/45
        bg-background/54 text-muted-foreground backdrop-blur-xl transition-all duration-200
        hover:border-primary/24 hover:bg-background/66 hover:text-foreground
        dark:border-white/8 dark:bg-background/46 dark:hover:bg-background/58
        ${className}
      `}
    >
      {isDark ? (
        <MaterialSymbol icon="light_mode" size={18} className="text-primary" />
      ) : (
        <MaterialSymbol icon="dark_mode" size={18} className="text-primary" />
      )}
    </button>
  )
}

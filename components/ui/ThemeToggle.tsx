'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className={`h-9 w-9 animate-pulse rounded-base bg-black/[0.06] dark:bg-white/5 ${className}`} />
  }

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      aria-label={isDark ? '切换到浅色模式' : '切换到深色模式'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`
        flex h-9 w-9 items-center justify-center rounded-base border border-transparent
        bg-transparent text-muted-foreground transition-all duration-200
        hover:border-black/10 hover:bg-black/5 hover:text-foreground
        dark:hover:border-white/10 dark:hover:bg-white/5
        ${className}
      `}
    >
      {isDark ? (
        <MaterialSymbol icon="light_mode" size={18} className="text-ember" />
      ) : (
        <MaterialSymbol icon="dark_mode" size={18} className="text-ocean" />
      )}
    </button>
  )
}

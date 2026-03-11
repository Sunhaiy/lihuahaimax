/**
 * components/ui/ThemeToggle.tsx
 *
 * 主题切换按钮（深色 / 浅色）。
 * 依赖 next-themes，配合根 layout 的 ThemeProvider 使用。
 * 使用 suppressHydrationWarning 避免服务端/客户端不一致导致的闪烁。
 */

'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { RiSunLine, RiMoonLine } from '@remixicon/react'

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // 等待客户端挂载后再渲染，避免 SSR 水合不匹配
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className={`w-9 h-9 rounded-base bg-black/[0.06] dark:bg-white/5 animate-pulse ${className}`} />
  }

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      aria-label={isDark ? '切换到浅色模式' : '切换到深色模式'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`
        w-9 h-9 flex items-center justify-center rounded-base
        text-muted-foreground hover:text-foreground
        bg-transparent hover:bg-black/5 dark:hover:bg-white/5
        border border-transparent hover:border-black/10 dark:hover:border-white/10
        transition-all duration-200
        ${className}
      `}
    >
      {isDark ? (
        <RiSunLine size={18} className="text-ember" />
      ) : (
        <RiMoonLine size={18} className="text-ocean" />
      )}
    </button>
  )
}

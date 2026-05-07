'use client'

import { useEffect, useState } from 'react'

interface VisitorContext {
  locationLabel: string
  greeting: string
  quote: {
    text: string
    from: string
  }
}

const FALLBACK_CONTEXT: VisitorContext = {
  locationLabel: '远方',
  greeting: '路过这里的朋友，欢迎你。',
  quote: {
    text: '慢一点没关系，重要的是一直在靠近。',
    from: '站点备忘',
  },
}

export function HomeSidebarVisitorCard() {
  const [context, setContext] = useState<VisitorContext>(FALLBACK_CONTEXT)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadContext() {
      try {
        const response = await fetch('/api/visitor-context', { cache: 'no-store' })
        if (!response.ok) throw new Error('request failed')
        const data = (await response.json()) as VisitorContext
        if (!cancelled) setContext(data)
      } catch {
        if (!cancelled) setContext(FALLBACK_CONTEXT)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadContext()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="space-y-3">
      <div className="rounded-[24px] border border-border/80 bg-card/90 p-4">
        <p className="text-[11px] font-mono tracking-[0.12em] text-muted-foreground">Visitor</p>
        <p className="mt-2 text-base font-semibold tracking-[-0.02em] text-foreground">
          {context.greeting}
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          当前识别位置：{context.locationLabel}
        </p>
        {loading ? <div className="mt-3 h-1.5 w-16 rounded-full bg-primary/20" /> : null}
      </div>

      <div className="rounded-[24px] border border-border/80 bg-card/90 p-4">
        <p className="text-[11px] font-mono tracking-[0.12em] text-muted-foreground">Hitokoto</p>
        <p className="mt-2 text-sm leading-7 text-foreground/88">“{context.quote.text}”</p>
        <p className="mt-3 text-[11px] text-muted-foreground">{context.quote.from}</p>
      </div>
    </div>
  )
}

/**
 * components/ui/TOC.tsx
 *
 * 文章目录组件（客户端）。
 * 通过 IntersectionObserver 跟踪当前阅读位置，高亮对应标题。
 */

'use client'

import { useEffect, useState } from 'react'
import type { Heading } from '@/lib/utils/extractHeadings'

interface TOCProps {
  headings: Heading[]
}

export function TOC({ headings }: TOCProps) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    if (headings.length === 0) return

    let observer: IntersectionObserver | null = null

    // Delay to allow PostContent's useEffect to inject heading IDs into the DOM
    const timer = setTimeout(() => {
      observer = new IntersectionObserver(
        (entries) => {
          const visible = entries.filter((e) => e.isIntersecting)
          if (visible.length > 0) {
            setActiveId(visible[0].target.id)
          }
        },
        { rootMargin: '-10% 0% -80% 0%', threshold: 0 }
      )
      headings.forEach(({ id }) => {
        const el = document.getElementById(id)
        if (el) observer!.observe(el)
      })
    }, 500)

    return () => {
      clearTimeout(timer)
      observer?.disconnect()
    }
  }, [headings])

  if (headings.length === 0) return null

  const minLevel = Math.min(...headings.map((h) => h.level))

  return (
    <nav aria-label="文章目录">
      <p className="mb-3 select-none text-[11px] font-medium tracking-[0.16em] text-muted-foreground">
        目录
      </p>
      <ul className="space-y-1">
        {headings.map(({ id, level, text }) => {
          const indent = (level - minLevel) * 12
          const isActive = activeId === id
          return (
            <li key={id} style={{ paddingLeft: `${indent}px` }}>
              <a
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault()
                  const el = document.getElementById(id)
                  if (el) {
                    const top = el.getBoundingClientRect().top + window.scrollY - 80
                    window.scrollTo({ top, behavior: 'smooth' })
                  }
                  setActiveId(id)
                }}
                className={`block text-[12px] leading-snug py-0.5 pr-1 rounded transition-colors truncate
                  ${isActive
                    ? 'text-ember font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                  }`}
                title={text}
              >
                {isActive && (
                  <span className="inline-block w-1 h-1 rounded-full bg-ember mr-1.5 mb-[1px] align-middle" />
                )}
                {text}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Heading } from '@/lib/utils/extractHeadings'

interface TOCProps {
  headings: Heading[]
  readTime?: number
  publishedAt?: string | Date | null
  articleSelector?: string
}

export function TOC({
  headings,
  readTime,
  publishedAt,
  articleSelector = '#post-reading-surface',
}: TOCProps) {
  const [activeId, setActiveId] = useState<string>('')
  const [progress, setProgress] = useState(0)

  const formattedDate = useMemo(() => {
    if (!publishedAt) return null
    const date = typeof publishedAt === 'string' ? new Date(publishedAt) : publishedAt
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }, [publishedAt])

  useEffect(() => {
    const handleScroll = () => {
      const headingElements = headings
        .map((heading) => ({
          id: heading.id,
          element: document.getElementById(heading.id),
        }))
        .filter((item): item is { id: string; element: HTMLElement } => Boolean(item.element))

      if (headingElements.length > 0) {
        const current =
          headingElements
            .filter(({ element }) => element.getBoundingClientRect().top <= 120)
            .at(-1) ?? headingElements[0]

        setActiveId(current.id)
      }

      const article = document.querySelector<HTMLElement>(articleSelector)
      if (!article) return

      const rect = article.getBoundingClientRect()
      const start = rect.top + window.scrollY - 120
      const end = start + Math.max(rect.height - window.innerHeight * 0.45, 1)
      const nextProgress = ((window.scrollY - start) / Math.max(end - start, 1)) * 100
      setProgress(Math.max(0, Math.min(100, nextProgress)))
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [articleSelector, headings])

  return (
    <div className="rounded-[20px] border border-border/70 bg-card/84 p-4">
      <div className="mb-4">
        <div className="flex items-center justify-between text-[12px] text-muted-foreground">
          <span>阅读进度</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          {readTime ? <span>约 {readTime} 分钟</span> : null}
          {formattedDate ? <span>{formattedDate}</span> : null}
        </div>
      </div>

      <div className="border-t border-border/60 pt-4">
        <p className="mb-3 text-sm font-medium text-foreground">目录</p>

        {headings.length === 0 ? (
          <p className="text-xs leading-6 text-muted-foreground">这篇文章没有可展示的标题目录。</p>
        ) : (
          <ul className="space-y-1">
            {headings.map(({ id, level, text }) => {
              const indent = Math.max(0, level - 2) * 10
              const isActive = activeId === id

              return (
                <li key={id} style={{ paddingLeft: `${indent}px` }}>
                  <a
                    href={`#${id}`}
                    onClick={(event) => {
                      event.preventDefault()
                      const element = document.getElementById(id)
                      if (!element) return
                      const top = element.getBoundingClientRect().top + window.scrollY - 84
                      window.scrollTo({ top, behavior: 'smooth' })
                      setActiveId(id)
                    }}
                    className={`block rounded-lg px-2 py-1.5 text-[12px] leading-5 transition-colors ${
                      isActive ? 'bg-primary/8 text-primary' : 'text-muted-foreground hover:bg-background/55 hover:text-foreground'
                    }`}
                    title={text}
                  >
                    <span className="line-clamp-2">{text}</span>
                  </a>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

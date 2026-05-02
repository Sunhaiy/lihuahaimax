'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'
import type { WorkListItem } from '@/types/work'

interface Props {
  works: WorkListItem[]
}

export function WorksCarousel({ works }: Props) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        setActive((current) => Math.max(0, current - 1))
      }
      if (event.key === 'ArrowRight') {
        setActive((current) => Math.min(works.length - 1, current + 1))
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [works.length])

  if (works.length === 0) return null

  const activeWork = works[active]

  return (
    <div className="w-full select-none">
      <div className="relative h-[420px] overflow-hidden sm:h-[480px]">
        {works.map((work, index) => {
          const pos = index - active
          const abs = Math.abs(pos)
          if (abs > 2) return null

          let scale = 1
          let offset = '0%'
          let opacity = 1
          let zIndex = 12
          let clickable = false

          if (abs === 1) {
            scale = 0.8
            offset = pos > 0 ? '64%' : '-64%'
            opacity = 0.62
            zIndex = 6
            clickable = true
          }

          if (abs === 2) {
            scale = 0.6
            offset = pos > 0 ? '112%' : '-112%'
            opacity = 0.24
            zIndex = 2
            clickable = true
          }

          return (
            <div
              key={work.id}
              onClick={clickable ? () => setActive(index) : undefined}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 'min(68%, 820px)',
                minWidth: 280,
                transform: `translateX(calc(-50% + ${offset})) translateY(-50%) scale(${scale})`,
                opacity,
                zIndex,
                transition: 'all 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
                cursor: clickable ? 'pointer' : 'default',
              }}
            >
              <div className="overflow-hidden rounded-[28px] border border-border/70 bg-card/90 shadow-[0_18px_80px_rgba(2,6,23,0.22)] backdrop-blur-xl">
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  {work.cover_url ? (
                    <img
                      src={work.cover_url}
                      alt={work.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/18 via-card to-muted">
                      <span className="text-[88px] font-black tracking-[-0.08em] text-primary/25">
                        {work.title.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                  <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5">
                    <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.22em] text-slate-100/78">
                      {work.year ?? 'Archive'}
                    </span>
                    <span className="rounded-full border border-primary/16 bg-primary/12 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.18em] text-white/78">
                      /works/{work.slug}
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <p className="text-[11px] font-mono uppercase tracking-[0.32em] text-white/46">
                      Project Archive
                    </p>
                    <h3 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
                      {work.title}
                    </h3>
                    {work.subtitle ? (
                      <p className="mt-2 text-sm text-slate-200/78">{work.subtitle}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        <button
          onClick={() => setActive((current) => Math.max(0, current - 1))}
          disabled={active === 0}
          aria-label="上一项"
          className="absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border/70 bg-background/82 text-muted-foreground backdrop-blur-md transition-all hover:border-primary/24 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-25 sm:left-5"
        >
          <MaterialSymbol icon="chevron_left" size={22} />
        </button>
        <button
          onClick={() => setActive((current) => Math.min(works.length - 1, current + 1))}
          disabled={active === works.length - 1}
          aria-label="下一项"
          className="absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border/70 bg-background/82 text-muted-foreground backdrop-blur-md transition-all hover:border-primary/24 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-25 sm:right-5"
        >
          <MaterialSymbol icon="chevron_right" size={22} />
        </button>
      </div>

      <div className="mt-6 flex justify-center gap-2">
        {works.map((work, index) => (
          <button
            key={work.id}
            onClick={() => setActive(index)}
            aria-label={`跳到 ${work.title}`}
            className={`rounded-full transition-all duration-300 ${
              index === active ? 'h-2 w-8 bg-primary' : 'h-2 w-2 bg-white/20 hover:bg-white/32'
            }`}
          />
        ))}
      </div>

      <div key={activeWork.id} className="mx-auto mt-8 max-w-3xl text-center animate-fade-in">
        <p className="text-[11px] font-mono uppercase tracking-[0.32em] text-muted-foreground">
          Project Focus
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">
          {activeWork.title}
        </h2>
        {activeWork.summary || activeWork.description ? (
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-muted-foreground">
            {activeWork.summary || activeWork.description}
          </p>
        ) : null}

        {activeWork.tags.length > 0 ? (
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {activeWork.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-primary/14 bg-primary/10 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.18em] text-primary/85"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href={`/works/${activeWork.slug}`}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/88"
          >
            <MaterialSymbol icon="deployed_code" size={18} />
            查看项目详情
          </Link>

          {activeWork.primary_url ? (
            <a
              href={activeWork.primary_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/24 hover:text-primary"
            >
              <MaterialSymbol icon="open_in_new" size={18} />
              {activeWork.primary_label || '访问链接'}
            </a>
          ) : null}

          {activeWork.github_url || activeWork.secondary_url ? (
            <a
              href={activeWork.github_url || activeWork.secondary_url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/24 hover:text-primary"
            >
              <MaterialSymbol icon="code_blocks" size={18} />
              {activeWork.secondary_label || '查看源码 / 外链'}
            </a>
          ) : null}
        </div>
      </div>

      <p className="mt-8 text-center text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground/50">
        {String(active + 1).padStart(2, '0')} / {String(works.length).padStart(2, '0')}
      </p>
    </div>
  )
}

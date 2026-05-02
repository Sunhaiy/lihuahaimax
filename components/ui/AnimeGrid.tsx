'use client'

import { useState } from 'react'
import type { AnimeRow } from '@/types/acg'

interface Props {
  animes: AnimeRow[]
}

const STATUS_TABS = [
  { key: 'all', label: '全部' },
  { key: 'watching', label: '在看' },
  { key: 'completed', label: '看完' },
  { key: 'plan_to_watch', label: '想看' },
  { key: 'on_hold', label: '搁置' },
  { key: 'dropped', label: '弃坑' },
] as const

type StatusKey = typeof STATUS_TABS[number]['key']

const STATUS_BADGE: Record<string, { text: string; cls: string }> = {
  watching: { text: '连载中', cls: 'bg-emerald-500/90 text-white' },
  plan_to_watch: { text: '想看', cls: 'bg-primary/90 text-white' },
  on_hold: { text: '搁置', cls: 'bg-yellow-500/90 text-white' },
  dropped: { text: '弃坑', cls: 'bg-red-500/90 text-white' },
  completed: { text: '看完', cls: 'bg-black/50 text-white/70' },
}

export function AnimeGrid({ animes }: Props) {
  const [activeStatus, setActiveStatus] = useState<StatusKey>('all')

  const filtered =
    activeStatus === 'all' ? animes : animes.filter((anime) => anime.status === activeStatus)

  const counts: Record<string, number> = { all: animes.length }
  for (const anime of animes) {
    counts[anime.status] = (counts[anime.status] ?? 0) + 1
  }

  const visibleTabs = STATUS_TABS.filter(
    (tab) => tab.key === 'all' || (counts[tab.key] ?? 0) > 0
  )

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {visibleTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveStatus(tab.key)}
            className={`rounded-full border px-4 py-1.5 text-sm transition-all duration-200 ${
              activeStatus === tab.key
                ? 'border-foreground bg-foreground text-background'
                : 'border-border text-muted-foreground hover:border-primary/40 hover:text-primary'
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-[11px] font-mono opacity-60">{counts[tab.key] ?? 0}</span>
          </button>
        ))}
        <span className="ml-auto text-xs font-mono text-muted-foreground">
          共 {filtered.length} 部
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center text-sm text-muted-foreground">暂无记录</div>
      ) : (
        <div className="mt-6 grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {filtered.map((anime) => {
            const badge = STATUS_BADGE[anime.status]
            const episodeText = anime.episodes_total
              ? `${anime.episodes_watched} / ${anime.episodes_total} 集`
              : anime.status === 'completed'
                ? `共 ${anime.episodes_watched} 集`
                : undefined

            return (
              <div key={anime.id} className="group flex flex-col">
                <div className="relative aspect-[2/3] flex-shrink-0 overflow-hidden rounded-xl bg-muted">
                  {anime.cover_url ? (
                    <img
                      src={anime.cover_url}
                      alt={anime.title_cn ?? anime.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 to-muted p-3 text-center">
                      <span className="line-clamp-3 text-xs leading-tight text-muted-foreground">
                        {anime.title_cn ?? anime.title}
                      </span>
                    </div>
                  )}

                  {anime.rating != null ? (
                    <span className="absolute right-1.5 top-1.5 rounded-md bg-black/70 px-1.5 py-0.5 font-mono text-[11px] font-bold leading-none text-primary backdrop-blur-sm">
                      ★ {anime.rating}
                    </span>
                  ) : null}

                  {anime.status !== 'completed' && badge ? (
                    <span
                      className={`absolute left-1.5 top-1.5 rounded-md px-1.5 py-0.5 font-mono text-[10px] leading-none ${badge.cls}`}
                    >
                      {badge.text}
                    </span>
                  ) : null}

                  {anime.short_review ? (
                    <div className="absolute inset-0 flex flex-col justify-end bg-black/80 p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <p className="line-clamp-4 text-[11px] italic leading-relaxed text-white/90">
                        {anime.short_review}
                      </p>
                    </div>
                  ) : null}
                </div>

                <div className="mt-2 px-0.5">
                  <p className="line-clamp-1 text-xs font-medium leading-snug text-foreground">
                    {anime.title_cn ?? anime.title}
                  </p>
                  {episodeText ? (
                    <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                      {episodeText}
                    </p>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

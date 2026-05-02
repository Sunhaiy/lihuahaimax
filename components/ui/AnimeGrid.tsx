'use client'

import { useMemo, useState } from 'react'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'
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

type StatusKey = (typeof STATUS_TABS)[number]['key']

const STATUS_BADGE: Record<string, { text: string; className: string }> = {
  watching: { text: '连载中', className: 'border-emerald-400/28 bg-emerald-400/14 text-emerald-200' },
  plan_to_watch: { text: '想看', className: 'border-primary/28 bg-primary/14 text-primary' },
  on_hold: { text: '搁置', className: 'border-amber-400/28 bg-amber-400/14 text-amber-200' },
  dropped: { text: '弃坑', className: 'border-rose-400/28 bg-rose-400/14 text-rose-200' },
  completed: { text: '看完', className: 'border-white/10 bg-black/26 text-white/70' },
}

function getEpisodeText(anime: AnimeRow) {
  if (anime.episodes_total) {
    return `${anime.episodes_watched} / ${anime.episodes_total} 话`
  }

  if (anime.status === 'completed') {
    return `共 ${anime.episodes_watched} 话`
  }

  return undefined
}

export function AnimeGrid({ animes }: Props) {
  const [activeStatus, setActiveStatus] = useState<StatusKey>('all')

  const counts = useMemo(() => {
    const nextCounts: Record<string, number> = { all: animes.length }

    for (const anime of animes) {
      nextCounts[anime.status] = (nextCounts[anime.status] ?? 0) + 1
    }

    return nextCounts
  }, [animes])

  const visibleTabs = STATUS_TABS.filter(
    (tab) => tab.key === 'all' || (counts[tab.key] ?? 0) > 0
  )

  const filtered =
    activeStatus === 'all' ? animes : animes.filter((anime) => anime.status === activeStatus)

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
                : 'border-border/80 bg-card/70 text-muted-foreground hover:border-primary/30 hover:text-foreground'
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-[11px] font-mono opacity-60">{counts[tab.key] ?? 0}</span>
          </button>
        ))}

        <span className="ml-auto text-xs font-mono text-muted-foreground">共 {filtered.length} 部</span>
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center text-sm text-muted-foreground">暂无记录</div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((anime) => {
            const badge = STATUS_BADGE[anime.status]
            const episodeText = getEpisodeText(anime)
            const title = anime.title_cn ?? anime.title
            const rating = anime.rating != null ? Number(anime.rating) : null

            return (
              <article
                key={anime.id}
                className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-border/70 bg-card/72 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/28"
              >
                <div className="relative aspect-[2/3] overflow-hidden">
                  {anime.cover_url ? (
                    <img
                      src={anime.cover_url}
                      alt={title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/18 via-card to-muted px-4 text-center">
                      <span className="line-clamp-4 text-sm leading-6 text-muted-foreground">{title}</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/18 to-transparent" />
                  <div className="absolute left-3 top-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-medium backdrop-blur-xl ${badge.className}`}
                    >
                      {badge.text}
                    </span>
                  </div>

                  {rating != null && !Number.isNaN(rating) ? (
                    <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[10px] font-semibold text-white/88 backdrop-blur-xl">
                      <MaterialSymbol icon="star" size={12} fill />
                      {rating.toFixed(1)}
                    </span>
                  ) : null}

                  <div className="absolute inset-x-3 bottom-3 rounded-[18px] border border-white/10 bg-black/28 px-3.5 py-3 backdrop-blur-xl">
                    <p className="line-clamp-2 text-sm font-semibold leading-5 text-white">{title}</p>
                    <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-white/62">
                      <span className="inline-flex min-w-0 items-center gap-1.5">
                        <MaterialSymbol icon="tv" size={12} />
                        <span className="truncate">{episodeText ?? anime.type.toUpperCase()}</span>
                      </span>
                      {anime.start_season ? (
                        <span className="truncate font-mono text-white/46">{anime.start_season}</span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-2 px-3.5 pb-3.5 pt-3">
                  <div className="flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/36 px-2.5 py-1 font-mono">
                      <MaterialSymbol icon="schedule" size={12} />
                      {episodeText ?? '未更新'}
                    </span>
                    <span className="font-mono uppercase tracking-[0.16em]">{anime.type}</span>
                  </div>

                  {anime.short_review ? (
                    <p className="line-clamp-3 text-[12px] leading-5 text-muted-foreground">
                      {anime.short_review}
                    </p>
                  ) : (
                    <p className="line-clamp-2 text-[12px] leading-5 text-muted-foreground/72">
                      收藏一部会想反复回来的作品，把追番的情绪和进度都安静记下来。
                    </p>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </>
  )
}

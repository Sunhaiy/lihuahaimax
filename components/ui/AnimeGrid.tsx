/**
 * components/ui/AnimeGrid.tsx
 *
 * 动漫列表客户端组件 — 状态筛选 + 卡片网格。
 */

'use client'

import { useState } from 'react'
import type { AnimeRow } from '@/types/acg'

interface Props {
  animes: AnimeRow[]
}

const STATUS_TABS = [
  { key: 'all',           label: '全部' },
  { key: 'watching',      label: '在看' },
  { key: 'completed',     label: '已看' },
  { key: 'plan_to_watch', label: '想看' },
  { key: 'on_hold',       label: '搁置' },
  { key: 'dropped',       label: '弃坑' },
] as const

type StatusKey = typeof STATUS_TABS[number]['key']

const STATUS_BADGE: Record<string, { text: string; cls: string }> = {
  watching:      { text: '连载中', cls: 'bg-emerald-500/90 text-white' },
  plan_to_watch: { text: '想看',   cls: 'bg-ocean/90 text-white' },
  on_hold:       { text: '搁置',   cls: 'bg-yellow-500/90 text-white' },
  dropped:       { text: '弃坑',   cls: 'bg-red-500/90 text-white' },
  completed:     { text: '已看',   cls: 'bg-black/50 text-white/70' },
}

export function AnimeGrid({ animes }: Props) {
  const [activeStatus, setActiveStatus] = useState<StatusKey>('all')

  const filtered = activeStatus === 'all'
    ? animes
    : animes.filter(a => a.status === activeStatus)

  /* 各状态数量 */
  const counts: Record<string, number> = { all: animes.length }
  for (const a of animes) {
    counts[a.status] = (counts[a.status] ?? 0) + 1
  }

  /* 只显示有数据的 tab */
  const visibleTabs = STATUS_TABS.filter(t => t.key === 'all' || (counts[t.key] ?? 0) > 0)

  return (
    <>
      {/* ── 状态筛选 ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {visibleTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveStatus(tab.key)}
            className={`text-sm px-4 py-1.5 rounded-full border transition-all duration-200
              ${activeStatus === tab.key
                ? 'bg-foreground text-background border-foreground'
                : 'border-border text-muted-foreground hover:border-ember/40 hover:text-ember'}`}
          >
            {tab.label}
            <span className="ml-1.5 text-[11px] font-mono opacity-60">
              {counts[tab.key] ?? 0}
            </span>
          </button>
        ))}
        <span className="ml-auto text-xs font-mono text-muted-foreground">
          共 {filtered.length} 部
        </span>
      </div>

      {/* ── 卡片网格 ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground text-sm">暂无记录</div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 mt-6">
          {filtered.map(anime => {
            const badge = STATUS_BADGE[anime.status]
            const epText = anime.episodes_total
              ? `${anime.episodes_watched} / ${anime.episodes_total} 集`
              : anime.status === 'completed' ? `全 ${anime.episodes_watched} 集` : undefined

            return (
              <div key={anime.id} className="group flex flex-col">
                {/* 封面 */}
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-muted flex-shrink-0">
                  {anime.cover_url ? (
                    <img
                      src={anime.cover_url}
                      alt={anime.title_cn ?? anime.title}
                      className="w-full h-full object-cover group-hover:scale-105
                                 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-ember/15 to-muted
                                    flex items-center justify-center p-3 text-center">
                      <span className="text-xs text-muted-foreground leading-tight line-clamp-3">
                        {anime.title_cn ?? anime.title}
                      </span>
                    </div>
                  )}

                  {/* 评分徽章 — 右上角 */}
                  {anime.rating != null && (
                    <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md
                                     bg-black/70 backdrop-blur-sm text-ember text-[11px] font-mono font-bold
                                     leading-none">
                      ★ {anime.rating}
                    </span>
                  )}

                  {/* 状态徽章 — 当非 completed 时显示 */}
                  {anime.status !== 'completed' && badge && (
                    <span className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md
                                      text-[10px] font-mono leading-none ${badge.cls}`}>
                      {badge.text}
                    </span>
                  )}

                  {/* 悬浮遮罩（有简评时显示） */}
                  {anime.short_review && (
                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100
                                    transition-opacity duration-300 flex flex-col justify-end p-3">
                      <p className="text-white/90 text-[11px] leading-relaxed line-clamp-4 italic">
                        {anime.short_review}
                      </p>
                    </div>
                  )}
                </div>

                {/* 信息 */}
                <div className="mt-2 px-0.5">
                  <p className="text-xs font-medium text-foreground line-clamp-1 leading-snug">
                    {anime.title_cn ?? anime.title}
                  </p>
                  {epText && (
                    <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                      {epText}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

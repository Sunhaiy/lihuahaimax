/**
 * app/(blog)/anime/page.tsx
 *
 * 动漫追踪 — 全宽 Hero + 状态筛选卡片墙。
 */

import type { Metadata } from 'next'
import { findAnimes } from '@/lib/db/dao/acgDao'
import { AnimeGrid } from '@/components/ui/AnimeGrid'

export const metadata: Metadata = { title: '追番列表 · 梨花海' }
export const revalidate = 3600

export default async function AnimePage() {
  const { data: animes } = await findAnimes({ pageSize: 200 })

  /* 随机选一张有封面的动漫作为 Hero 背景 */
  const coverPool = animes.filter(a => a.cover_url)
  const heroBg = coverPool.length > 0
    ? coverPool[Math.floor(Math.random() * coverPool.length)].cover_url!
    : null

  const total     = animes.length
  const completed = animes.filter(a => a.status === 'completed').length
  const watching  = animes.filter(a => a.status === 'watching').length

  return (
    <div className="-mt-16">

      {/* ══════════════════════════════════════════════════
          Hero 全宽
          ══════════════════════════════════════════════════ */}
      <section className="relative h-72 sm:h-80 flex items-end overflow-hidden">

        {/* 背景：模糊封面 or 渐变 */}
        {heroBg ? (
          <img
            src={heroBg}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-30 pointer-events-none"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-950/60 via-background to-background pointer-events-none" />
        )}

        {/* 深色渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-black/20 pointer-events-none" />

        {/* 内容区 */}
        <div className="relative max-w-6xl mx-auto px-6 w-full pb-8">
          <p className="text-xs font-mono text-ember tracking-[0.3em] uppercase mb-2">ANIME LIST</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-2">追番列表</h1>
          <p className="text-sm text-muted-foreground mb-4">记录我的二次元之旅</p>

          {/* 快速统计 */}
          <div className="flex items-center gap-5 text-sm">
            <span className="font-mono">
              <span className="text-xl font-bold text-ember">{total}</span>
              <span className="text-muted-foreground ml-1">部合计</span>
            </span>
            <span className="w-px h-4 bg-border" />
            <span className="text-muted-foreground">
              <span className="text-emerald-400 font-medium">{watching}</span> 在追
            </span>
            <span className="text-muted-foreground">
              <span className="text-foreground font-medium">{completed}</span> 完结
            </span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          筛选 + 网格
          ══════════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {animes.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">暂无动漫记录</p>
        ) : (
          <AnimeGrid animes={animes} />
        )}
      </div>
    </div>
  )
}

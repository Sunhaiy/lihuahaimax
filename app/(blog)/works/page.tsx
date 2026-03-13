/**
 * app/(blog)/works/page.tsx
 *
 * 作品集页面 — Coverflow 轮播展示个人项目。
 */

import type { Metadata } from 'next'
import { findWorks } from '@/lib/db/dao/worksDao'
import { WorksCarousel } from '@/components/ui/WorksCarousel'

export const metadata: Metadata = { title: '作品 · 梨花海' }
export const revalidate = 60

export default async function WorksPage() {
  const works = await findWorks()

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col">
      {/* ── 页头 ── */}
      <div className="max-w-5xl mx-auto px-6 pt-16 pb-10 text-center w-full">
        <p className="text-xs font-mono text-ember tracking-[0.3em] uppercase mb-3">WORKS</p>
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-3">作品</h1>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
          代码与创意的结晶 — 每一个项目都是一段完整的故事
        </p>
      </div>

      {/* ── 分隔线 ── */}
      <div className="w-px h-8 bg-gradient-to-b from-ember/40 to-transparent mx-auto mb-10" />

      {/* ── 轮播 ── */}
      <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 w-full pb-20">
        {works.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">暂无作品，敬请期待。</div>
        ) : (
          <WorksCarousel works={works} />
        )}
      </div>
    </div>
  )
}

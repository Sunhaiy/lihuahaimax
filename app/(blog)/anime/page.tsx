/**
 * app/(blog)/anime/page.tsx
 *
 * 动漫追踪 — 独立页面。
 */

import type { Metadata } from 'next'
import { findAnimes } from '@/lib/db/dao/acgDao'

export const metadata: Metadata = { title: '动漫追踪 · 梨花海' }
export const revalidate = 3600

const STATUS_LABELS: Record<string, string> = {
  watching: '连载中', completed: '已完结', on_hold: '搁置', dropped: '弃坑', plan_to_watch: '想看',
}

const STATUS_COLOR: Record<string, string> = {
  watching: 'text-emerald-400', completed: 'text-muted-foreground',
  on_hold: 'text-yellow-400', dropped: 'text-red-400', plan_to_watch: 'text-ocean',
}

export default async function AnimePage() {
  const { data: animes } = await findAnimes({ pageSize: 200 })

  const completed = animes.filter((a) => a.status === 'completed').length
  const watching = animes.filter((a) => a.status === 'watching').length
  const planToWatch = animes.filter((a) => a.status === 'plan_to_watch').length

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* 页头 */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-foreground mb-2">📺 动漫追踪</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span><span className="text-foreground font-medium">{completed}</span> 部完结</span>
          <span><span className="text-emerald-400 font-medium">{watching}</span> 部连载中</span>
          <span><span className="text-ocean font-medium">{planToWatch}</span> 部计划</span>
          <span><span className="text-foreground font-medium">{animes.length}</span> 部合计</span>
        </div>
      </div>

      {/* 海报墙 */}
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-3">
        {animes.map((anime) => (
          <div key={anime.id} className="group relative">
            <div className="aspect-[2/3] rounded-lg overflow-hidden bg-muted">
              {anime.cover_url ? (
                <img
                  src={anime.cover_url}
                  alt={anime.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center
                                text-muted-foreground text-[10px] text-center p-2 leading-tight">
                  {anime.title_cn ?? anime.title}
                </div>
              )}

              {/* 悬浮遮罩 */}
              <div className="absolute inset-0 bg-black/85 rounded-lg opacity-0 group-hover:opacity-100
                              transition-opacity duration-300 flex flex-col justify-end p-2">
                <p className="text-white text-[10px] font-medium line-clamp-2 mb-1">
                  {anime.title_cn ?? anime.title}
                </p>
                {anime.short_review && (
                  <p className="text-gray-300 text-[9px] line-clamp-2 italic">{anime.short_review}</p>
                )}
                {anime.rating && (
                  <span className="text-ember text-[10px] font-mono mt-1">★ {anime.rating}</span>
                )}
              </div>
            </div>

            {/* 状态标签 */}
            <p className={`mt-1.5 text-[10px] text-center truncate font-mono ${STATUS_COLOR[anime.status] ?? 'text-muted-foreground'}`}>
              {STATUS_LABELS[anime.status] ?? anime.status}
            </p>
          </div>
        ))}
      </div>

      {animes.length === 0 && (
        <p className="text-center text-muted-foreground py-20">暂无动漫记录</p>
      )}
    </div>
  )
}

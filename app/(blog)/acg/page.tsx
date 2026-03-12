/**
 * app/(blog)/acg/page.tsx
 *
 * 数字陈列室 — 动漫海报墙 + 游戏卡带翻转展示。
 */

import type { Metadata } from 'next'
import { findAnimes, findGames } from '@/lib/db/dao/acgDao'

export const metadata: Metadata = { title: '数字陈列室' }
export const revalidate = 3600

const ANIME_STATUS_LABELS: Record<string, string> = {
  watching: '连载中', completed: '已完结', on_hold: '搁置', dropped: '弃坑', plan_to_watch: '想看',
}
const GAME_STATUS_LABELS: Record<string, string> = {
  playing: '游玩中', completed: '已通关', abandoned: '弃坑', plan_to_play: '计划', platinum: '白金',
}

export default async function AcgPage() {
  const [{ data: animes }, { data: games }] = await Promise.all([
    findAnimes({ pageSize: 100 }),
    findGames({ pageSize: 100 }),
  ])

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* ── 动漫 ─────────────────────────────────────────── */}
      <section id="anime" className="mb-20">
        <h2 className="text-2xl font-bold mb-2">动漫追踪</h2>
        <p className="text-muted-foreground text-sm mb-8">
          {animes.filter((a) => a.status === 'completed').length} 部完结 ·{' '}
          {animes.filter((a) => a.status === 'watching').length} 部连载中
        </p>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {animes.map((anime) => (
            <div key={anime.id} className="group relative">
              {/* 海报 */}
              <div className="aspect-[2/3] rounded-card overflow-hidden bg-muted mb-2">
                {anime.cover_url ? (
                  <img
                    src={anime.cover_url}
                    alt={anime.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs text-center p-2">
                    {anime.title_cn ?? anime.title}
                  </div>
                )}

                {/* 悬浮信息遮罩 */}
                <div className="absolute inset-0 bg-black/80 rounded-card opacity-0 group-hover:opacity-100
                                transition-opacity duration-300 flex flex-col justify-end p-2">
                  <p className="text-white text-[10px] font-medium line-clamp-2 mb-1">
                    {anime.title_cn ?? anime.title}
                  </p>
                  {anime.short_review && (
                    <p className="text-gray-300 text-[9px] line-clamp-2 italic">
                      {anime.short_review}
                    </p>
                  )}
                  {anime.rating && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-ember text-[10px] font-mono">★ {anime.rating}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 状态标签 */}
              <div className="text-[10px] text-center text-muted-foreground truncate">
                {ANIME_STATUS_LABELS[anime.status] ?? anime.status}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 游戏 ─────────────────────────────────────────── */}
      <section id="games">
        <h2 className="text-2xl font-bold mb-2">游戏收藏</h2>
        <p className="text-muted-foreground text-sm mb-8">
          {games.filter((g) => g.status === 'completed' || g.status === 'platinum').length} 部通关 ·{' '}
          {games.filter((g) => g.status === 'playing').length} 部游玩中
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {games.map((game) => (
            <div key={game.id} className="game-card-flip">
              <div className="relative game-card-inner aspect-square">
                {/* 正面 —— 游戏封面 */}
                <div className="game-card-front">
                  {game.cover_url ? (
                    <img src={game.cover_url} alt={game.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted
                                    text-muted-foreground text-xs text-center p-3">
                      {game.title}
                    </div>
                  )}
                </div>
                {/* 背面 —— 游戏详情 */}
                <div className="game-card-back">
                  <p className="text-sm font-semibold text-foreground text-center mb-3">{game.title}</p>
                  <div className="space-y-1 text-xs text-muted-foreground font-mono text-center">
                    <p>{game.platform.toUpperCase()}</p>
                    <p className="text-ocean">{GAME_STATUS_LABELS[game.status]}</p>
                    {game.play_hours && <p>{game.play_hours}h</p>}
                    {game.rating && <p className="text-ember">★ {game.rating}</p>}
                  </div>
                  {game.short_review && (
                    <p className="mt-3 text-[10px] text-muted-foreground italic text-center line-clamp-3">
                      {game.short_review}
                    </p>
                  )}
                </div>
              </div>
              {/* 游戏名 */}
              <p className="mt-2 text-xs text-center text-muted-foreground truncate">{game.title}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

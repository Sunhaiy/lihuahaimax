/**
 * app/(blog)/games/page.tsx
 *
 * 游戏收藏 — 独立页面。
 */

import type { Metadata } from 'next'
import { findGames } from '@/lib/db/dao/acgDao'

export const metadata: Metadata = { title: '游戏收藏 · 梨花海' }
export const revalidate = 3600

const STATUS_LABELS: Record<string, string> = {
  playing: '游玩中', completed: '已通关', abandoned: '弃坑', plan_to_play: '计划', platinum: '白金',
}

const STATUS_COLOR: Record<string, string> = {
  playing: 'text-emerald-400', completed: 'text-muted-foreground',
  platinum: 'text-ember', abandoned: 'text-red-400', plan_to_play: 'text-ocean',
}

const PLATFORM_ICON: Record<string, string> = {
  pc: '🖥', switch: '🎮', ps5: '🎮', ps4: '🎮', xbox: '🎮', mobile: '📱', other: '🕹',
}

export default async function GamesPage() {
  const { data: games } = await findGames({ pageSize: 200 })

  const completed = games.filter((g) => g.status === 'completed' || g.status === 'platinum').length
  const playing = games.filter((g) => g.status === 'playing').length

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* 页头 */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-foreground mb-2">🎮 游戏收藏</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span><span className="text-foreground font-medium">{completed}</span> 部通关</span>
          <span><span className="text-emerald-400 font-medium">{playing}</span> 部游玩中</span>
          <span><span className="text-foreground font-medium">{games.length}</span> 部合计</span>
        </div>
      </div>

      {/* 游戏卡片网格 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {games.map((game) => (
          <div key={game.id} className="game-card-flip">
            <div className="relative game-card-inner aspect-square">
              {/* 正面 */}
              <div className="game-card-front">
                {game.cover_url ? (
                  <img src={game.cover_url} alt={game.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted
                                  text-muted-foreground text-xs text-center p-3 leading-tight">
                    {game.title}
                  </div>
                )}
              </div>

              {/* 背面 */}
              <div className="game-card-back">
                <p className="text-sm font-semibold text-foreground text-center mb-3 line-clamp-2">
                  {game.title}
                </p>
                <div className="space-y-1 text-xs text-muted-foreground font-mono text-center">
                  <p>{PLATFORM_ICON[game.platform] ?? '🕹'} {game.platform.toUpperCase()}</p>
                  <p className={STATUS_COLOR[game.status] ?? 'text-muted-foreground'}>
                    {STATUS_LABELS[game.status]}
                  </p>
                  {game.play_hours != null && <p>{game.play_hours}h 游玩</p>}
                  {game.rating && <p className="text-ember">★ {game.rating}</p>}
                </div>
                {game.short_review && (
                  <p className="mt-3 text-[10px] text-muted-foreground italic text-center line-clamp-3">
                    {game.short_review}
                  </p>
                )}
              </div>
            </div>

            <p className="mt-2 text-xs text-center text-muted-foreground truncate">{game.title}</p>
          </div>
        ))}
      </div>

      {games.length === 0 && (
        <p className="text-center text-muted-foreground py-20">暂无游戏记录</p>
      )}
    </div>
  )
}

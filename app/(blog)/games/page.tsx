import type { Metadata } from 'next'
import { GameGrid } from '@/components/ui/GameGrid'
import { findGames } from '@/lib/db/dao/acgDao'

export const metadata: Metadata = { title: '游戏收藏 · 梨花海' }
export const revalidate = 3600

export default async function GamesPage() {
  const { data: games } = await findGames({ pageSize: 200 })

  const completed = games.filter((game) => game.status === 'completed' || game.status === 'platinum').length
  const playing = games.filter((game) => game.status === 'playing').length

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-10">
        <h1 className="mb-2 text-3xl font-bold text-foreground">游戏收藏</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span>
            <span className="font-medium text-foreground">{completed}</span> 部通关
          </span>
          <span>
            <span className="font-medium text-emerald-400">{playing}</span> 部游玩中
          </span>
          <span>
            <span className="font-medium text-foreground">{games.length}</span> 部合计
          </span>
        </div>
      </div>

      <GameGrid games={games} />
    </div>
  )
}

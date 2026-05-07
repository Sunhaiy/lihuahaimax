import type { Metadata } from 'next'
import { GameGrid } from '@/components/ui/GameGrid'
import { findGames } from '@/lib/db/dao/acgDao'
import { getSiteProfile } from '@/lib/site'

export const metadata: Metadata = {
  title: '游戏收藏',
  description: '记录我玩过、正在玩和准备玩的游戏。',
  alternates: {
    canonical: '/games',
  },
}

export const revalidate = 3600

export default async function GamesPage() {
  const [{ data: games }, siteProfile] = await Promise.all([findGames({ pageSize: 200 }), getSiteProfile()])

  const coverPool = games.filter((game) => game.cover_url)
  const heroBg = siteProfile.gamesHeroImageUrl || coverPool[0]?.cover_url || null

  const completed = games.filter(
    (game) => game.status === 'completed' || game.status === 'platinum'
  ).length
  const playing = games.filter((game) => game.status === 'playing').length

  return (
    <div className="-mt-16">
      <section className="relative isolate flex h-72 items-end overflow-hidden border-b border-white/6 sm:h-80">
        {heroBg ? (
          <img
            src={heroBg}
            alt=""
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full scale-[1.04] object-cover opacity-52 saturate-[1.08]"
          />
        ) : (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-950/35 via-background/20 to-background" />
        )}

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_32%)]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/88 via-background/40 to-black/12" />

        <div className="relative mx-auto w-full max-w-6xl px-6 pb-8">
          <p className="mb-2 text-xs font-mono uppercase tracking-[0.3em] text-ember">GAME ARCHIVE</p>
          <h1 className="mb-2 text-4xl font-bold text-foreground sm:text-5xl">游戏收藏</h1>
          <p className="mb-4 text-sm text-muted-foreground">记录我玩过、在玩和准备开的游戏。</p>

          <div className="flex items-center gap-5 text-sm">
            <span className="font-mono">
              <span className="text-xl font-bold text-ember">{games.length}</span>
              <span className="ml-1 text-muted-foreground">部合计</span>
            </span>
            <span className="h-4 w-px bg-border" />
            <span className="text-muted-foreground">
              <span className="font-medium text-emerald-400">{playing}</span> 在玩
            </span>
            <span className="text-muted-foreground">
              <span className="font-medium text-foreground">{completed}</span> 已通关
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {games.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">暂无游戏记录</p>
        ) : (
          <GameGrid games={games} />
        )}
      </div>
    </div>
  )
}

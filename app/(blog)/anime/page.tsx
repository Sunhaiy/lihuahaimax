import type { Metadata } from 'next'
import { AnimeGrid } from '@/components/ui/AnimeGrid'
import { findAnimes } from '@/lib/db/dao/acgDao'

export const metadata: Metadata = { title: '追番列表 · 梨花海' }
export const revalidate = 3600

export default async function AnimePage() {
  const { data: animes } = await findAnimes({ pageSize: 200 })

  const coverPool = animes.filter((anime) => anime.cover_url)
  const heroBg =
    coverPool.length > 0
      ? coverPool[Math.floor(Math.random() * coverPool.length)].cover_url!
      : null

  const total = animes.length
  const completed = animes.filter((anime) => anime.status === 'completed').length
  const watching = animes.filter((anime) => anime.status === 'watching').length

  return (
    <div className="-mt-16">
      <section className="relative isolate flex h-72 items-end overflow-hidden border-b border-white/6 sm:h-80">
        {heroBg ? (
          <img
            src={heroBg}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full scale-[1.04] object-cover opacity-52 saturate-[1.08] pointer-events-none"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-950/35 via-background/20 to-background pointer-events-none" />
        )}

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,138,107,0.12),transparent_32%)] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/88 via-background/40 to-black/12 pointer-events-none" />

        <div className="relative mx-auto w-full max-w-6xl px-6 pb-8">
          <p className="mb-2 text-xs font-mono uppercase tracking-[0.3em] text-ember">ANIME LIST</p>
          <h1 className="mb-2 text-4xl font-bold text-foreground sm:text-5xl">追番列表</h1>
          <p className="mb-4 text-sm text-muted-foreground">记录我的二次元之旅</p>

          <div className="flex items-center gap-5 text-sm">
            <span className="font-mono">
              <span className="text-xl font-bold text-ember">{total}</span>
              <span className="ml-1 text-muted-foreground">部合计</span>
            </span>
            <span className="h-4 w-px bg-border" />
            <span className="text-muted-foreground">
              <span className="font-medium text-emerald-400">{watching}</span> 在追
            </span>
            <span className="text-muted-foreground">
              <span className="font-medium text-foreground">{completed}</span> 完结
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {animes.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">暂无动画记录</p>
        ) : (
          <AnimeGrid animes={animes} />
        )}
      </div>
    </div>
  )
}

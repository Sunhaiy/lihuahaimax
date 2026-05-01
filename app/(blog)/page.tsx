import type { Metadata } from 'next'
import Link from 'next/link'
import { SceneBackground } from '@/components/scene/SceneBackground'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'
import { ActivityHeatmap } from '@/components/ui/ActivityHeatmap'
import { PostCard } from '@/components/ui/PostCard'
import { findPosts } from '@/lib/db/dao/postDao'
import { findMoments } from '@/lib/db/dao/momentDao'
import { getActivityHeatmap } from '@/lib/db/dao/activityDao'
import { getBackgroundSceneSettings } from '@/lib/scene'
import type { MomentRow } from '@/types/moment'

export const metadata: Metadata = {
  title: '梨花海 · 首页',
  description: '极客视角的个人数字中枢。文章、瞬间、ACG、项目与光影记录共存在同一片场景里。',
}

export const revalidate = 60

function getMomentPreview(moment: MomentRow): { text: string; mono: boolean } | null {
  if (moment.content) return { text: moment.content, mono: false }
  if (!moment.meta) return null

  if (moment.type === 'sleep') {
    const meta = moment.meta as {
      sleepStart?: string
      sleepEnd?: string
      deepSleepMinutes?: number
      score?: number | null
    }

    const parts: string[] = []
    if (meta.sleepStart && meta.sleepEnd) parts.push(`入睡 ${meta.sleepStart}  起床 ${meta.sleepEnd}`)
    if (meta.deepSleepMinutes != null) parts.push(`深睡 ${meta.deepSleepMinutes}min`)
    if (meta.score != null) parts.push(`评分 ${meta.score}`)
    return parts.length > 0 ? { text: parts.join('\n'), mono: true } : null
  }

  if (moment.type === 'steps') {
    const meta = moment.meta as { steps?: number; distance?: number; calories?: number }
    const parts: string[] = []
    if (meta.steps != null) parts.push(`${meta.steps.toLocaleString()} 步`)
    if (meta.distance != null) parts.push(`${meta.distance} km`)
    if (meta.calories != null) parts.push(`${meta.calories} kcal`)
    return parts.length > 0 ? { text: parts.join('  '), mono: true } : null
  }

  if (moment.type === 'link') {
    const meta = moment.meta as { title?: string; url?: string }
    const text = meta.title || meta.url
    return text ? { text, mono: false } : null
  }

  return null
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)

  const [postsResult, momentsResult, scene, activityData] = await Promise.all([
    findPosts({ status: 'published', pageSize: 6, page }),
    findMoments({ publicOnly: true, pageSize: 10 }),
    getBackgroundSceneSettings(),
    getActivityHeatmap(365),
  ])

  const hasSceneImage = Boolean(scene.image.url)

  return (
    <SceneBackground scene={scene} page="home" className="min-h-screen">
      <section className="relative -mt-16 flex min-h-[100svh] flex-col overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: hasSceneImage
              ? 'linear-gradient(180deg, rgba(2, 6, 23, 0.28) 0%, rgba(2, 6, 23, 0.22) 38%, rgba(2, 6, 23, 0.72) 100%)'
              : 'linear-gradient(180deg, rgba(2, 6, 23, 0.12) 0%, rgba(2, 6, 23, 0.08) 45%, rgba(2, 6, 23, 0.42) 100%)',
          }}
        />
        <div
          aria-hidden
          className="absolute left-1/2 top-28 h-72 w-72 -translate-x-1/2 rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(circle, rgba(56, 189, 248, 0.18), transparent 70%)' }}
        />

        <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pb-20 pt-28 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-medium tracking-[0.24em] text-white/55">
              欢迎来到
            </p>
            <h1 className="mt-5 text-6xl font-semibold tracking-[-0.08em] text-white sm:text-8xl">
              梨花海
            </h1>
            <div className="mt-6 inline-flex max-w-2xl flex-wrap items-center justify-center gap-2 rounded-full border border-white/10 bg-black/18 px-4 py-2 text-[11px] font-mono uppercase tracking-[0.22em] text-white/62 backdrop-blur-md">
              <span>INTER VARIABLE</span>
              <span className="text-white/24">/</span>
              <span>ROBOTO MONO VARIABLE</span>
              <span className="text-white/24">/</span>
              <span>MATERIAL SYMBOLS</span>
            </div>
            <p className="mx-auto mt-8 max-w-xl text-base leading-8 text-white/72">
              极客视角的个人数字中枢，记录代码与生活、追番与游戏，以及凌晨 3 点的每一场雷雨。
            </p>
          </div>

          {momentsResult.data.length > 0 ? (
            <div className="mt-auto pt-16">
              <div className="mx-auto max-w-5xl rounded-[30px] border border-white/10 bg-black/24 p-4 shadow-[0_24px_90px_rgba(2,6,23,0.35)] backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/74">
                      <MaterialSymbol icon="chat_bubble" size={16} />
                    </span>
                    <span className="text-sm font-medium text-white/88">瞬间</span>
                  </div>
                  <Link
                    href="/moments"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/64 transition-colors hover:bg-white/12 hover:text-white"
                    aria-label="查看全部瞬间"
                  >
                    <MaterialSymbol icon="arrow_forward" size={16} />
                  </Link>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {momentsResult.data.map((moment) => {
                    const preview = getMomentPreview(moment)

                    return (
                      <Link
                        key={moment.id}
                        href="/moments"
                        className="group relative flex min-h-[148px] w-60 flex-shrink-0 flex-col justify-between overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.04] p-4 transition-colors hover:bg-white/[0.06]"
                      >
                        <div className="scene-terminal-grid absolute inset-0 opacity-[0.03]" />
                        <div className="relative z-10">
                          {moment.images.length > 0 ? (
                            <div className="mb-3 aspect-[16/9] overflow-hidden rounded-[16px] border border-white/8 bg-black/25">
                              <img
                                src={moment.images[0]}
                                alt=""
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                              />
                            </div>
                          ) : null}

                          {preview ? (
                            <p
                              className={`line-clamp-4 text-xs leading-6 text-white/78 whitespace-pre-line ${
                                preview.mono ? 'font-mono' : ''
                              }`}
                            >
                              {preview.text}
                            </p>
                          ) : (
                            <p className="text-xs leading-6 text-white/40">这一刻还没留下文字。</p>
                          )}
                        </div>

                        <div className="relative z-10 mt-4 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.18em] text-white/42">
                          <span className="inline-flex items-center gap-1.5">
                            <MaterialSymbol icon="schedule" size={13} />
                            {new Date(moment.created_at).toLocaleString('zh-CN', {
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/8 text-white/50 transition-colors group-hover:bg-white/14 group-hover:text-white/84">
                            <MaterialSymbol icon="arrow_outward" size={13} />
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="relative z-10 rounded-t-[2rem] border-t border-white/5 bg-background/94 backdrop-blur-2xl">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 items-start gap-8 pb-20 pt-14 lg:grid-cols-[1fr_240px]">
            <div className="min-w-0" id="latest-posts">
              <ActivityHeatmap data={activityData} />

              <div className="mt-8">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-semibold tracking-[-0.04em] text-foreground">最新文章</h2>
                  <Link href="/posts" className="inline-flex items-center gap-1.5 text-sm text-ember transition-colors hover:text-ember/75">
                    查看全部
                    <MaterialSymbol icon="arrow_forward" size={16} />
                  </Link>
                </div>

                {postsResult.data.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">暂无文章。</p>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {postsResult.data.map((post) => (
                        <PostCard key={post.id} post={post} />
                      ))}
                    </div>

                    {postsResult.total > 6 ? (
                      <div className="mt-8 flex justify-center gap-2">
                        {Array.from({ length: Math.ceil(postsResult.total / 6) }, (_, index) => index + 1).map((current) => (
                          <Link
                            key={current}
                            href={`/?page=${current}#latest-posts`}
                            className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm transition-colors ${
                              current === page
                                ? 'border-foreground bg-foreground text-background'
                                : 'border-border text-muted-foreground hover:border-ember/40 hover:text-ember'
                            }`}
                          >
                            {current}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            </div>

            <aside className="flex flex-col gap-3 lg:sticky lg:top-20">
              <div className="flex flex-col items-center rounded-2xl border border-border bg-card/90 p-5 text-center">
                <div className="relative mb-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-ember/30 bg-gradient-to-br from-ember/50 to-ember/10">
                    <span className="select-none text-2xl font-semibold text-ember">梨</span>
                  </div>
                  <div className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-card bg-emerald-500" />
                </div>
                <p className="text-sm font-semibold text-foreground">梨花海</p>
                <p className="mt-0.5 text-xs font-medium tracking-[0.08em] text-ember">极客 · 二次元 · 代码诗人</p>
                <p className="mb-4 mt-2 text-[11px] leading-relaxed text-muted-foreground">
                  热爱 coding，追番打游戏，记录凌晨 3 点的一切。
                </p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {[
                    { href: '/posts', label: '文章' },
                    { href: '/moments', label: '瞬间' },
                    { href: '/about', label: '关于我' },
                  ].map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      className="rounded-full border border-border bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground transition-all duration-200 hover:border-ember/40 hover:bg-ember/5 hover:text-ember"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-border bg-card p-4 text-center">
                  <p className="text-2xl font-semibold leading-none text-ember">{postsResult.total}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">篇文章</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 text-center">
                  <p className="text-2xl font-semibold leading-none text-ember">{momentsResult.total}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">条瞬间</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </SceneBackground>
  )
}

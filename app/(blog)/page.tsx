import type { Metadata } from 'next'
import Link from 'next/link'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'
import { ActivityHeatmap } from '@/components/ui/ActivityHeatmap'
import { HomeSidebarVisitorCard } from '@/components/ui/HomeSidebarVisitorCard'
import { PostCard } from '@/components/ui/PostCard'
import { getActivityHeatmap } from '@/lib/db/dao/activityDao'
import { findMoments } from '@/lib/db/dao/momentDao'
import { findAllTags, findPosts } from '@/lib/db/dao/postDao'
import { getBackgroundSceneSettings } from '@/lib/scene'
import { toRgba } from '@/lib/scene-color'
import { getSiteProfile } from '@/lib/site'
import { extractPlainTextFromRichContent } from '@/lib/utils/extractHeadings'
import type { MomentRow } from '@/types/moment'

export const metadata: Metadata = {
  title: '首页',
  description: '记录文章、瞬间、ACG、项目与生活轨迹。',
}

export const revalidate = 60

function getMomentPreview(moment: MomentRow): { text: string; mono: boolean } | null {
  if (moment.content) return { text: moment.content, mono: false }
  if (moment.content_json) {
    const text = extractPlainTextFromRichContent(moment.content_json)
    if (text) return { text, mono: false }
  }
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

  const [postsResult, momentsResult, scene, activityData, siteProfile, tags] = await Promise.all([
    findPosts({ status: 'published', pageSize: 6, page }),
    findMoments({ publicOnly: true, pageSize: 10 }),
    getBackgroundSceneSettings(),
    getActivityHeatmap(365),
    getSiteProfile(),
    findAllTags(),
  ])

  const hasSceneImage = Boolean(scene.image.url)
  const latestMoment = momentsResult.data[0] ?? null
  const latestMomentPreview = latestMoment ? getMomentPreview(latestMoment) : null
  const topTags = tags.slice(0, 18)

  return (
    <>
      <section className="relative -mt-16 flex min-h-[100svh] flex-col overflow-hidden bg-background">
        {hasSceneImage ? (
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${scene.image.url})`,
              backgroundPosition: scene.image.position,
              backgroundSize: scene.image.size,
              opacity: scene.image.opacity,
              filter: `saturate(0.94) brightness(${1 - scene.image.opacity * 0.12})`,
            }}
          />
        ) : null}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: hasSceneImage
              ? 'linear-gradient(180deg, hsl(var(--background) / 0.22) 0%, hsl(var(--background) / 0.28) 28%, hsl(var(--background) / 0.88) 100%)'
              : 'linear-gradient(180deg, hsl(var(--background) / 0.12) 0%, hsl(var(--background) / 0.2) 46%, hsl(var(--background) / 0.96) 100%)',
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at top, hsl(var(--primary) / 0.14), transparent 36%), linear-gradient(180deg, transparent 0%, hsl(var(--background) / 0.1) 48%, hsl(var(--background) / 0.2) 100%)',
          }}
        />
        <div
          aria-hidden
          className="absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full blur-[140px]"
          style={{
            background: `radial-gradient(circle, ${toRgba(
              '#10b981',
              hasSceneImage ? 0.18 : 0.1
            )}, transparent 70%)`,
          }}
        />

        <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pb-20 pt-28 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-3xl text-center">
            <p className="scene-copy-subtle text-xs tracking-[0.14em]">欢迎来到</p>
            <h1 className="scene-copy mt-5 text-6xl font-semibold tracking-[-0.08em] sm:text-8xl">
              {siteProfile.siteName}
            </h1>
            <div className="scene-chip mt-6 max-w-2xl flex-wrap justify-center gap-2 px-4 py-2 text-[11px] font-mono uppercase tracking-[0.14em] backdrop-blur-md">
              <span>{siteProfile.siteNameEn}</span>
              <span className="text-hero-subtle/40">/</span>
              <span>{siteProfile.roleLine}</span>
              <span className="text-white/24">/</span>
              <span>{siteProfile.slogan}</span>
            </div>
            <p className="scene-copy-muted mx-auto mt-8 max-w-xl text-base leading-8">
              {siteProfile.bio}
            </p>
          </div>

          {momentsResult.data.length > 0 ? (
            <div className="mt-auto pt-16">
              <div className="mx-auto max-w-5xl rounded-[32px] border border-white/8 bg-[rgba(24,24,26,0.72)] p-5 backdrop-blur-2xl sm:p-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <span className="scene-icon-badge h-8 w-8 rounded-2xl">
                      <MaterialSymbol icon="chat_bubble" size={16} />
                    </span>
                    <span className="text-sm font-medium text-white/88">瞬间</span>
                  </div>
                  <Link
                    href="/moments"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/8 bg-white/[0.03] text-white/48 transition-colors hover:bg-white/[0.05] hover:text-white/82"
                    aria-label="查看全部瞬间"
                  >
                    <MaterialSymbol icon="arrow_forward" size={16} />
                  </Link>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {momentsResult.data.map((moment) => {
                    const preview = getMomentPreview(moment)

                    return (
                      <Link
                        key={moment.id}
                        href="/moments"
                        className="group relative flex min-h-[172px] w-[18rem] flex-shrink-0 flex-col justify-between overflow-hidden rounded-[24px] border border-white/[0.07] bg-[rgba(20,20,22,0.56)] p-4 backdrop-blur-xl transition-all duration-300 hover:border-white/[0.1] hover:bg-[rgba(24,24,26,0.62)] sm:w-[19rem]"
                      >
                        <div className="scene-terminal-grid absolute inset-0 opacity-[0.03]" />
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-white/[0.01] opacity-70" />
                        <div className="relative z-10">
                          {moment.images.length > 0 ? (
                            <div className="mb-3 aspect-[16/9] overflow-hidden rounded-[18px] border border-white/8 bg-black/10">
                              <img
                                src={moment.images[0]}
                                alt=""
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                              />
                            </div>
                          ) : null}

                          {preview ? (
                            <p
                              className={`scene-copy-muted line-clamp-4 whitespace-pre-line text-[13px] leading-6 ${
                                preview.mono ? 'font-mono' : ''
                              }`}
                            >
                              {preview.text}
                            </p>
                          ) : (
                            <p className="text-xs leading-6 text-white/40">这一刻还没留下文字。</p>
                          )}
                        </div>

                        <div className="scene-copy-subtle relative z-10 mt-5 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.12em]">
                          <span className="inline-flex items-center gap-1.5">
                            <MaterialSymbol icon="schedule" size={13} />
                            {new Date(moment.created_at).toLocaleString('zh-CN', {
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/8 bg-white/[0.03] text-white/34 transition-colors group-hover:bg-white/[0.06] group-hover:text-white/72">
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

      <section className="relative z-10 rounded-t-[2rem] border-t border-hero-border/16 bg-background/96 backdrop-blur-2xl">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 items-start gap-8 pb-20 pt-14 lg:grid-cols-[1fr_280px]">
            <div className="min-w-0" id="latest-posts">
              <ActivityHeatmap data={activityData} />

              <div className="mt-8">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-semibold tracking-[-0.03em] text-foreground">
                    最新文章
                  </h2>
                  <Link
                    href="/posts"
                    className="inline-flex items-center gap-1.5 text-sm text-primary transition-colors hover:text-primary/75"
                  >
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
                        <PostCard
                          key={post.id}
                          post={post}
                          fallbackCoverUrl={siteProfile.defaultPostCoverUrl}
                        />
                      ))}
                    </div>

                    {postsResult.total > 6 ? (
                      <div className="mt-8 flex justify-center gap-2">
                        {Array.from(
                          { length: Math.ceil(postsResult.total / 6) },
                          (_, index) => index + 1
                        ).map((current) => (
                          <Link
                            key={current}
                            href={`/?page=${current}#latest-posts`}
                            className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm transition-colors ${
                              current === page
                                ? 'border-foreground bg-foreground text-background'
                                : 'border-border text-muted-foreground hover:border-primary/40 hover:text-primary'
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

            <aside className="flex flex-col gap-3 lg:sticky lg:top-20 lg:self-start">
              <div className="rounded-[24px] border border-border/80 bg-card/92 p-5 shadow-[0_18px_46px_rgba(10,10,12,0.05)]">
                <div className="relative mb-4 flex items-center gap-3">
                  <div className="relative">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-primary/28 bg-gradient-to-br from-primary/28 to-primary/8">
                      {siteProfile.avatarUrl ? (
                        <img
                          src={siteProfile.avatarUrl}
                          alt={siteProfile.ownerName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="select-none text-2xl font-semibold text-primary">
                          {siteProfile.ownerInitial}
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-card bg-emerald-500" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{siteProfile.ownerName}</p>
                    <p className="mt-1 text-[11px] tracking-[0.06em] text-primary">
                      {siteProfile.roleLine}
                    </p>
                  </div>
                </div>

                <p className="text-[12px] leading-6 text-muted-foreground">{siteProfile.bio}</p>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-[18px] border border-border/70 bg-background/45 px-4 py-3 text-center">
                    <p className="text-2xl font-semibold leading-none text-ember">{postsResult.total}</p>
                    <p className="mt-1 text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground">Posts</p>
                  </div>
                  <div className="rounded-[18px] border border-border/70 bg-background/45 px-4 py-3 text-center">
                    <p className="text-2xl font-semibold leading-none text-ember">{momentsResult.total}</p>
                    <p className="mt-1 text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground">Moments</p>
                  </div>
                </div>
              </div>

              <HomeSidebarVisitorCard />

              <div className="rounded-[24px] border border-border/80 bg-card/90 p-4">
                <p className="text-[11px] font-mono tracking-[0.12em] text-muted-foreground">标签云</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {topTags.map(({ tag, count }) => (
                    <Link
                      key={tag}
                      href={`/posts?tag=${encodeURIComponent(tag)}`}
                      className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/45 px-3 py-1.5 text-xs text-foreground/82 transition-colors hover:border-primary/30 hover:bg-primary/6 hover:text-primary"
                    >
                      <span>{tag}</span>
                      <span className="text-[10px] text-muted-foreground">{count}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {latestMoment ? (
                <div className="rounded-[24px] border border-border/80 bg-card/90 p-4">
                  <p className="text-[11px] font-mono tracking-[0.12em] text-muted-foreground">最新瞬间</p>
                  <p className="mt-3 line-clamp-4 text-sm leading-7 text-foreground/84">
                    {latestMomentPreview?.text || '这一刻还没留下文字，但它已经被收进 moments 里了。'}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{new Date(latestMoment.created_at).toLocaleString('zh-CN')}</span>
                    <Link href="/moments" className="text-primary transition-colors hover:text-primary/75">
                      去 moments
                    </Link>
                  </div>
                </div>
              ) : null}
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}

/**
 * app/(blog)/page.tsx
 *
 * 首页 — Server Component。
 * Hero 全屏 + 瞬间卡片叠在底部（磨砂玻璃大容器）+ 文章列表。
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { findPosts } from '@/lib/db/dao/postDao'
import { findMoments } from '@/lib/db/dao/momentDao'
import { getSetting } from '@/lib/db/dao/settingsDao'
import { getActivityHeatmap } from '@/lib/db/dao/activityDao'
import { Card, CardBody } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { ActivityHeatmap } from '@/components/ui/ActivityHeatmap'
import type { MomentRow } from '@/types/moment'
import { SETTINGS_KEYS } from '@/lib/constants/settings'
import { RiTimeLine, RiMessage2Line, RiArrowRightSLine } from '@remixicon/react'

export const metadata: Metadata = {
  title: '梨花海 · 首页',
  description: '极客视角的个人数字中枢。文章、瞬间、ACG、光影相册。',
}

export const revalidate = 60

export default async function HomePage() {
  const [postsResult, momentsResult, heroBgSettings, activityData] = await Promise.all([
    findPosts({ status: 'published', pageSize: 5 }),
    findMoments({ publicOnly: true, pageSize: 10 }),
    getSetting(SETTINGS_KEYS.HERO_BG),
    getActivityHeatmap(365),
  ])

  const HERO_BG = typeof heroBgSettings?.url === 'string' ? heroBgSettings.url : ''
  const hasBg = Boolean(HERO_BG)

  return (
    <>
      {/* ══════════════════════════════════════════════════
          Hero — 全屏
          ══════════════════════════════════════════════════ */}
      <section
        className="relative flex flex-col overflow-hidden"
        style={{
          height: '100vh',
          ...(hasBg
            ? { backgroundImage: `url(${HERO_BG})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : {}),
        }}
      >
        {/* 滤镜层1：整体暗化 */}
        {hasBg && (
          <div aria-hidden className="absolute inset-0 bg-black/40 pointer-events-none" />
        )}

        {/* 滤镜层2：底部渐变 */}
        <div
          aria-hidden
          className={`absolute inset-0 pointer-events-none ${
            hasBg
              ? 'bg-gradient-to-t from-black/90 via-black/15 to-transparent'
              : 'bg-gradient-to-br from-ember/10 via-background to-background'
          }`}
        />

        {/* 装饰光晕（仅无图模式） */}
        {!hasBg && (
          <>
            <div aria-hidden className="absolute -top-40 -left-20 w-[600px] h-[600px] rounded-full
                                        bg-ember/8 blur-[160px] pointer-events-none" />
            <div aria-hidden className="absolute top-0 right-0 w-96 h-96 rounded-full
                                        bg-ember/5 blur-[120px] pointer-events-none" />
          </>
        )}

        {/* ── 标题区：正中央 ── */}
        <div className="relative flex-1 flex flex-col items-center justify-center
                        text-center px-6 pb-96 animate-fade-in">
          <p className={`text-xs font-mono tracking-[0.3em] uppercase mb-4 ${
            hasBg ? 'text-white/45' : 'text-ember'
          }`}>
            欢迎来到
          </p>
          <h1 className={`text-7xl sm:text-8xl font-bold tracking-tight leading-none mb-5 ${
            hasBg ? 'text-white' : 'text-foreground'
          }`}>
            梨花海
          </h1>
          <p className={`text-sm max-w-xs leading-loose ${
            hasBg ? 'text-white/50' : 'text-muted-foreground'
          }`}>
            极客视角的个人数字中枢<br />
            记录代码与生活，追番与游戏<br />
            以及凌晨 3 点的一切
          </p>
        </div>

        {/* ── 瞬间大容器：固定在 Hero 底部 ── */}
        {momentsResult.data.length > 0 && (
          <div className="absolute bottom-24 inset-x-0 px-6">
            <div className={`max-w-5xl mx-auto rounded-2xl border p-4 ${
              hasBg
                ? 'bg-black/30 backdrop-blur-xl border-white/10'
                : 'bg-card/80 backdrop-blur-md border-border'
            }`}>
              {/* 标题行 */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon
                    icon={RiMessage2Line}
                    size={16}
                    className={hasBg ? 'text-white/60' : 'text-ember'}
                  />
                  <span className={`text-sm font-semibold ${
                    hasBg ? 'text-white/80' : 'text-foreground'
                  }`}>
                    瞬间
                  </span>
                </div>
                <Link
                  href="/moments"
                  className={`w-7 h-7 rounded-full flex items-center justify-center
                              transition-colors ${
                    hasBg
                      ? 'bg-white/10 hover:bg-white/20 text-white/60 hover:text-white'
                      : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                  }`}
                  aria-label="查看全部瞬间"
                >
                  <Icon icon={RiArrowRightSLine} size={16} />
                </Link>
              </div>

              {/* 卡片横向滚动行 */}
              <div className="flex gap-2.5 overflow-x-auto
                              [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {momentsResult.data.map((moment: MomentRow) => (
                  <Link
                    key={moment.id}
                    href="/moments"
                    className={`group relative flex-shrink-0 w-52 rounded-xl p-3.5 overflow-hidden
                                flex flex-col justify-between min-h-[100px]
                                before:absolute before:inset-0 before:-translate-x-full before:skew-x-[-20deg]
                                before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent
                                before:transition-transform before:duration-500 before:pointer-events-none
                                hover:before:translate-x-full
                                ${hasBg ? 'bg-white/5' : 'bg-muted/60'}`}
                  >
                    {/* 图片预览（有图时显示） */}
                    {moment.images.length > 0 && (
                      <div className="aspect-video rounded-lg overflow-hidden mb-2.5 bg-black/20">
                        <img
                          src={moment.images[0]}
                          alt=""
                          className="w-full h-full object-cover
                                     group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}

                    {/* 正文 */}
                    {moment.content && (
                      <p className={`text-xs leading-relaxed line-clamp-3 flex-1 ${
                        hasBg ? 'text-white/80' : 'text-foreground'
                      }`}>
                        {moment.content}
                      </p>
                    )}

                    {/* 底部：时间 + 跳转按钮 */}
                    <div className="flex items-center justify-between mt-2.5">
                      <div className={`flex items-center gap-1 ${
                        hasBg ? 'text-white/35' : 'text-muted-foreground'
                      }`}>
                        <Icon icon={RiTimeLine} size={11} />
                        <time className="text-[9px] font-mono">
                          {new Date(moment.created_at).toLocaleString('zh-CN', {
                            month: '2-digit', day: '2-digit',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </time>
                      </div>
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center
                                        flex-shrink-0 transition-colors
                                        ${hasBg
                                          ? 'bg-white/10 text-white/40 group-hover:bg-white/20 group-hover:text-white/70'
                                          : 'bg-muted text-muted-foreground group-hover:bg-border group-hover:text-foreground'
                                        }`}>
                        <Icon icon={RiArrowRightSLine} size={12} />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════
          主内容区（圆角上沿面板，与 hero 平滑融合）
          ══════════════════════════════════════════════════ */}
      <div className="relative z-10 -mt-12 rounded-t-[2rem] bg-background">
        <div className="max-w-7xl mx-auto px-3 sm:px-5">
          <section className="pt-14 pb-20">
            {/* 两栏布局：左栏主内容 + 右栏侧边栏 */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-8 items-start">

              {/* ── 左栏：活跃度 + 文章列表 ── */}
              <div className="min-w-0">
                <ActivityHeatmap data={activityData} />

                <div className="mt-8">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold text-foreground">最新文章</h2>
                    <Link href="/posts" className="text-sm text-ember hover:text-ember/70 transition-colors">
                      查看全部 →
                    </Link>
                  </div>

                  <div className="space-y-2.5">
                    {postsResult.data.length === 0 ? (
                      <p className="text-muted-foreground text-sm py-8 text-center">暂无文章。</p>
                    ) : (
                      postsResult.data.map((post) => (
                        <Card key={post.id} hoverable glow="ember">
                          <CardBody className="py-3.5">
                            <Link href={`/posts/${post.slug}`} className="block group">
                              <div className="flex items-center gap-4">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-foreground group-hover:text-ember
                                                 transition-colors truncate">
                                    {post.title}
                                  </h3>
                                  {post.excerpt && (
                                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                      {post.excerpt}
                                    </p>
                                  )}
                                </div>
                                <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                                  {post.tags.slice(0, 2).map((tag) => (
                                    <span key={tag}
                                      className="text-[10px] font-mono px-1.5 py-0.5 rounded
                                                 bg-ember/10 text-ember border border-ember/20">
                                      {tag}
                                    </span>
                                  ))}
                                  <time className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                                    {post.published_at
                                      ? new Date(post.published_at).toLocaleDateString('zh-CN')
                                      : '草稿'}
                                  </time>
                                </div>
                              </div>
                            </Link>
                          </CardBody>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* ── 右栏：个人介绍 + 数据统计 ── */}
              <div className="flex flex-col gap-3 lg:sticky lg:top-6">
                {/* 头像 + 简介 */}
                <div className="rounded-2xl border border-border bg-card p-5 flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-ember/40 to-ember/10
                                  border border-ember/25 flex items-center justify-center mb-3 shrink-0">
                    <span className="text-xl font-bold text-ember select-none">梨</span>
                  </div>
                  <p className="font-semibold text-sm text-foreground">梨花海</p>
                  <p className="text-[11px] text-ember mt-0.5 font-mono tracking-wide">极客 · 二次元 · 代码诗人</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mt-3">
                    热爱 coding，追番打游戏，<br />记录凌晨 3 点的一切。
                  </p>
                </div>

                {/* 数据统计 */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-border bg-card p-3 text-center">
                    <p className="text-lg font-bold text-foreground">{postsResult.total}</p>
                    <p className="text-[10px] text-muted-foreground">篇文章</p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-3 text-center">
                    <p className="text-lg font-bold text-foreground">{momentsResult.total}</p>
                    <p className="text-[10px] text-muted-foreground">条瞬间</p>
                  </div>
                </div>
              </div>

            </div>
          </section>
        </div>
      </div>
    </>
  )
}

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
import { Card, CardBody } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import type { MomentRow } from '@/types/moment'
import { SETTINGS_KEYS } from '@/lib/constants/settings'
import { RiTimeLine, RiMessage2Line, RiArrowRightSLine } from '@remixicon/react'

export const metadata: Metadata = {
  title: '梨花海 · 首页',
  description: '极客视角的个人数字中枢。文章、瞬间、ACG、光影相册。',
}

export const revalidate = 60

export default async function HomePage() {
  const [postsResult, momentsResult, heroBgSettings] = await Promise.all([
    findPosts({ status: 'published', pageSize: 5 }),
    findMoments({ publicOnly: true, pageSize: 10 }),
    getSetting(SETTINGS_KEYS.HERO_BG),
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
                    className={`group flex-shrink-0 w-52 rounded-xl border p-3.5
                                flex flex-col justify-between min-h-[100px]
                                transition-all duration-200
                                hover:ring-1 hover:ring-ember/50
                                ${hasBg
                                  ? 'bg-white/5 border-white/8 hover:bg-white/10 hover:border-ember/30'
                                  : 'bg-background border-border hover:bg-muted hover:border-ember/40'
                                }`}
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
          文章列表
          ══════════════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-6">
        <section className="pt-16 pb-20">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-foreground">最新文章</h2>
            <Link href="/posts" className="text-sm text-ember hover:text-ember-400 transition-colors">
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
        </section>
      </div>
    </>
  )
}

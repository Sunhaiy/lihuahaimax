/**
 * app/(blog)/posts/[slug]/page.tsx
 *
 * 文章详情页 — SSG + ISR。
 * 头部：圆角封面图 + 居中标题/标签 + 毛玻璃元数据横条。
 * 主体：左侧正文 + 右侧粘性目录侧边栏。
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { findPostBySlug, findPosts, incrementViewCount, findAdjacentPosts } from '@/lib/db/dao/postDao'
import { PostContent } from './PostContent'
import { TOC } from '@/components/ui/TOC'
import { CommentSection } from './CommentSection'
import { extractHeadings, estimateReadTime } from '@/lib/utils/extractHeadings'
import { RiTimeLine, RiEyeLine, RiArrowLeftSLine, RiArrowRightSLine } from '@remixicon/react'

export const revalidate = 3600

export async function generateStaticParams() {
  const result = await findPosts({ status: 'published', pageSize: 100 })
  return result.data.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const post = await findPostBySlug(slug)
  if (!post) return { title: '文章不存在' }

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.cover_url ? [post.cover_url] : [],
      type: 'article',
      publishedTime: post.published_at?.toISOString(),
    },
  }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await findPostBySlug(slug)

  if (!post || post.status !== 'published') notFound()

  incrementViewCount(post.id).catch(() => {})

  const adjacent = post.published_at
    ? await findAdjacentPosts(post.published_at, post.id)
    : { prev: null, next: null }

  const headings = extractHeadings(post.content as object)
  const readTime = estimateReadTime(post.content as object)
  const hasCover = Boolean(post.cover_url)

  return (
    <>
      {/* ══════════════════════════════════════════════════
          头部 Hero — 全宽封面图 + 居中标题 + 毛玻璃元数据条
          ══════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{ minHeight: '420px' }}
      >
          {/* 背景图 / 无封面渐变 */}
          {hasCover ? (
            <img
              src={post.cover_url!}
              alt=""
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <>
              <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black" />
              <div aria-hidden className="absolute -top-32 -left-16 w-[480px] h-[480px] rounded-full bg-ember/10 blur-[120px] pointer-events-none" />
              <div aria-hidden className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-ember/5 blur-[80px] pointer-events-none" />
            </>
          )}

          {/* 渐变叠层：顶部浅 → 底部深，确保文字可读 */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-black/30 to-black/10"
          />

          {/* 居中内容区：标签 + 标题 + 摘要 */}
          <div className="relative flex flex-col items-center justify-center text-center px-6 sm:px-20 pt-16 pb-28 min-h-[420px]">

            {/* 分类标签 */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mb-5">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/posts?tag=${encodeURIComponent(tag)}`}
                    className="text-xs font-mono px-3 py-1 rounded-full
                               bg-white/10 border border-white/20 text-white/80
                               hover:bg-white/20 transition-colors backdrop-blur-sm"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            {/* 标题 */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-snug text-white max-w-3xl">
              {post.title}
            </h1>

            {/* 摘要 */}
            {post.excerpt && (
              <p className="mt-4 text-sm sm:text-base text-white/55 max-w-xl leading-relaxed">
                {post.excerpt}
              </p>
            )}
          </div>

          {/* 毛玻璃元数据横条 — 绝对定位在图片底部 */}
          <div className="absolute bottom-0 inset-x-0 flex justify-center px-6 pb-6">
            <div className="flex items-center gap-0 rounded-xl overflow-hidden
                            backdrop-blur-md bg-black/35 border border-white/10
                            text-white/70 text-xs font-mono divide-x divide-white/10">

              {/* 作者 */}
              <div className="px-4 py-2.5 text-white/90 font-semibold">
                梨花海
              </div>

              {/* 发布日期 */}
              {post.published_at && (
                <div className="flex items-center gap-1.5 px-4 py-2.5">
                  <RiTimeLine size={12} className="shrink-0" />
                  <time dateTime={post.published_at.toISOString()}>
                    {new Date(post.published_at).toLocaleDateString('zh-CN', {
                      year: 'numeric', month: '2-digit', day: '2-digit',
                    })}
                  </time>
                </div>
              )}

              {/* 阅读次数 */}
              <div className="flex items-center gap-1.5 px-4 py-2.5">
                <RiEyeLine size={12} className="shrink-0" />
                <span>{post.view_count}</span>
              </div>

              {/* 预计阅读时长 */}
              <div className="px-4 py-2.5">
                约 {readTime} 分钟
              </div>
            </div>
          </div>

        </section>

      {/* ══════════════════════════════════════════════════
          主体：两栏布局（正文 + TOC 侧边栏）
          ══════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-3 sm:px-5 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-10 items-start">

          {/* ── 左栏：正文 ── */}
          <article className="min-w-0">

            <PostContent content={post.content as object} />

            <div className="border-t border-border mt-12 mb-8" />

            {/* 作者卡片 */}
            <div className="rounded-2xl border border-border bg-card p-6 flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-ember/40 to-ember/10
                              border border-ember/25 flex items-center justify-center shrink-0">
                <span className="text-xl font-bold text-ember select-none">梨</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground mb-0.5">梨花海</p>
                <p className="text-[11px] text-ember font-mono tracking-wide mb-2">极客 · 二次元 · 代码诗人</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  热爱 coding，追番打游戏，记录凌晨 3 点的一切。
                </p>
              </div>
            </div>

            {/* 上一篇 / 下一篇 */}
            {(adjacent.prev || adjacent.next) && (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {adjacent.prev ? (
                  <Link
                    href={`/posts/${adjacent.prev.slug}`}
                    className="group flex items-start gap-3 rounded-xl border border-border bg-card
                               p-4 hover:border-ember/40 transition-colors"
                  >
                    <RiArrowLeftSLine size={18} className="shrink-0 mt-0.5 text-muted-foreground
                                                            group-hover:text-ember transition-colors" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground mb-1 font-mono">上一篇</p>
                      <p className="text-sm font-medium text-foreground group-hover:text-ember
                                    transition-colors line-clamp-2">
                        {adjacent.prev.title}
                      </p>
                    </div>
                  </Link>
                ) : <div />}

                {adjacent.next ? (
                  <Link
                    href={`/posts/${adjacent.next.slug}`}
                    className="group flex items-start gap-3 rounded-xl border border-border bg-card
                               p-4 hover:border-ember/40 transition-colors sm:flex-row-reverse text-right"
                  >
                    <RiArrowRightSLine size={18} className="shrink-0 mt-0.5 text-muted-foreground
                                                             group-hover:text-ember transition-colors" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground mb-1 font-mono">下一篇</p>
                      <p className="text-sm font-medium text-foreground group-hover:text-ember
                                    transition-colors line-clamp-2">
                        {adjacent.next.title}
                      </p>
                    </div>
                  </Link>
                ) : <div />}
              </div>
            )}

            {/* 评论区 */}
            <CommentSection postId={post.id} />

          </article>

          {/* ── 右栏：目录 ── */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-xl border border-border bg-card p-4
                            max-h-[calc(100vh-7rem)] overflow-y-auto
                            [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <TOC headings={headings} />
              {headings.length === 0 && (
                <p className="text-xs text-muted-foreground">本文暂无目录</p>
              )}
            </div>
          </aside>

        </div>
      </div>
    </>
  )
}

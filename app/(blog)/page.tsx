/**
 * app/(blog)/page.tsx
 *
 * 首页 — Server Component。
 * 展示最新文章列表 + 最新瞬间预览。
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { findPosts } from '@/lib/db/dao/postDao'
import { findMoments } from '@/lib/db/dao/momentDao'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: '梨花海 · 首页',
  description: '极客视角的个人数字中枢。文章、瞬间、ACG、光影相册。',
}

// ISR: 每 60 秒重新生成
export const revalidate = 60

export default async function HomePage() {
  const [postsResult, momentsResult] = await Promise.all([
    findPosts({ status: 'published', pageSize: 5 }),
    findMoments({ publicOnly: true, pageSize: 5 }),
  ])

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="mb-20 animate-fade-in">
        <div className="relative">
          {/* 背景光晕 */}
          <div
            aria-hidden
            className="absolute -top-20 -left-20 w-96 h-96 rounded-full
                       bg-ember/8 blur-[100px] pointer-events-none"
          />
          <div
            aria-hidden
            className="absolute -top-10 right-10 w-64 h-64 rounded-full
                       bg-ember/5 blur-[80px] pointer-events-none"
          />

          <p className="text-sm font-mono text-ember mb-3 tracking-widest uppercase">
            欢迎来到
          </p>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-foreground mb-6 leading-tight">
            梨花海
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
            极客视角的个人数字中枢。记录代码与生活，追番与游戏，
            以及凌晨 3 点的一切。
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="primary">
              <Link href="/posts">阅读文章</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/moments">查看瞬间</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── 最新文章 ──────────────────────────────────────── */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">최신 문장 · 最新文章</h2>
          <Link
            href="/posts"
            className="text-sm text-ember hover:text-ember-400 transition-colors"
          >
            查看全部 →
          </Link>
        </div>

        <div className="space-y-4">
          {postsResult.data.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">暂无文章。</p>
          ) : (
            postsResult.data.map((post) => (
              <Card key={post.id} hoverable glow="ocean">
                <CardBody className="py-4">
                  <Link href={`/posts/${post.slug}`} className="block group">
                    <h3 className="font-semibold text-foreground group-hover:text-ocean transition-colors mb-1">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <time dateTime={String(post.published_at)}>
                        {post.published_at
                          ? new Date(post.published_at).toLocaleDateString('zh-CN')
                          : '草稿'}
                      </time>
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded bg-black/[0.06] dark:bg-white/5 border border-border"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </Link>
                </CardBody>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* ── 最新瞬间 ──────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">极客瞬间</h2>
          <Link
            href="/moments"
            className="text-sm text-ember hover:text-ember-400 transition-colors"
          >
            查看全部 →
          </Link>
        </div>

        {momentsResult.data.length === 0 ? (
          <p className="text-muted-foreground text-sm py-8 text-center">暂无瞬间。</p>
        ) : (
          <div className="space-y-0">
            {momentsResult.data.map((moment, i) => (
              <div key={moment.id} className="flex gap-4">
                {/* 时间轴 */}
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-ocean mt-2 flex-shrink-0 ring-4 ring-ocean/10" />
                  {i < momentsResult.data.length - 1 && (
                    <div className="w-px flex-1 bg-black/[0.06] dark:bg-white/5 mt-2" />
                  )}
                </div>
                {/* 内容 */}
                <div className="pb-8 flex-1">
                  <time className="text-xs text-muted-foreground font-mono">
                    {new Date(moment.created_at).toLocaleString('zh-CN', {
                      month: 'numeric', day: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </time>
                  {moment.content && (
                    <p className="mt-1 text-sm text-foreground leading-relaxed">
                      {moment.content}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

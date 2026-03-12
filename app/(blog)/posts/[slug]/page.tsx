/**
 * app/(blog)/posts/[slug]/page.tsx
 *
 * 文章详情页 — SSG + ISR。
 * Tiptap JSONB 内容渲染由前端组件处理（纯只读模式）。
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { findPostBySlug, findPosts, incrementViewCount } from '@/lib/db/dao/postDao'
import { PostContent } from './PostContent'

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

  // 异步更新浏览量（不阻塞渲染）
  incrementViewCount(post.id).catch(() => {})

  return (
    <article className="max-w-3xl mx-auto px-6 py-12">
      {/* 封面 */}
      {post.cover_url && (
        <div className="aspect-[21/9] rounded-surface overflow-hidden mb-10 bg-muted">
          <img src={post.cover_url} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      {/* 元信息 */}
      <header className="mb-10">
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <span key={tag} className="text-xs font-mono px-2 py-1 rounded
                                       bg-ember/10 text-ember border border-ember/20">
              {tag}
            </span>
          ))}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4 leading-snug">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="text-lg text-muted-foreground leading-relaxed mb-4">
            {post.excerpt}
          </p>
        )}
        <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
          {post.published_at && (
            <time dateTime={post.published_at.toISOString()}>
              {new Date(post.published_at).toLocaleDateString('zh-CN', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </time>
          )}
          <span>{post.view_count} 次阅读</span>
        </div>
      </header>

      {/* 分隔线 */}
      <div className="border-t border-border mb-10" />

      {/* 文章正文（客户端 Tiptap 渲染） */}
      <PostContent content={post.content} />
    </article>
  )
}

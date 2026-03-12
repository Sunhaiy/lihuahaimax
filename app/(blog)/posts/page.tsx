/**
 * app/(blog)/posts/page.tsx
 *
 * 文章列表页 — Server Component + SSG/ISR。
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { findPosts } from '@/lib/db/dao/postDao'

export const metadata: Metadata = { title: '文章' }
export const revalidate = 60

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tag?: string; keyword?: string; category?: string }>
}) {
  const { page, tag, keyword, category } = await searchParams
  const result = await findPosts({
    status: 'published',
    page: Number(page ?? 1),
    pageSize: 12,
    tag: tag ?? undefined,
    category: category ?? undefined,
    keyword: keyword ?? undefined,
  })

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">
        {category ? category : '文章'}
      </h1>
      <p className="text-muted-foreground text-sm mb-10">
        共 {result.total} 篇 · 第 {result.page} / {result.totalPages} 页
      </p>

      {result.data.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          没有符合条件的文章。
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {result.data.map((post) => (
            <Link key={post.id} href={`/posts/${post.slug}`} className="group block">
              <article className="h-full border border-border rounded-card p-5
                                  transition-all duration-300
                                  hover:border-ocean/20 hover:shadow-[0_0_24px_rgba(14,165,233,0.06)]">
                {post.cover_url && (
                  <div className="aspect-video rounded-base overflow-hidden mb-4 bg-muted">
                    <img
                      src={post.cover_url}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-[10px] font-mono px-1.5 py-0.5 rounded
                                               bg-ember/10 text-ember border border-ember/20">
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="font-semibold text-foreground group-hover:text-ember
                               transition-colors mb-2 line-clamp-2">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {post.excerpt}
                  </p>
                )}
                <time className="text-xs text-muted-foreground font-mono">
                  {post.published_at
                    ? new Date(post.published_at).toLocaleDateString('zh-CN')
                    : ''}
                </time>
              </article>
            </Link>
          ))}
        </div>
      )}

      {/* 简单分页 */}
      {result.totalPages > 1 && (
        <div className="flex justify-center gap-3 mt-12">
          {Array.from({ length: result.totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/posts?page=${p}${tag ? `&tag=${tag}` : ''}${keyword ? `&keyword=${keyword}` : ''}`}
              className={`w-9 h-9 flex items-center justify-center rounded-base text-sm
                transition-colors
                ${p === result.page
                  ? 'bg-ocean text-white'
                  : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'
                }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

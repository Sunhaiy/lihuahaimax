/**
 * app/(blog)/posts/page.tsx
 *
 * 文章列表页 — 推荐轮播 + 分类/标签筛选 + 三列卡片网格。
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { findPosts, findAllTags, findCategories } from '@/lib/db/dao/postDao'
import { FeaturedCarousel } from '@/components/ui/FeaturedCarousel'
import { PostsFilter } from '@/components/ui/PostsFilter'

export const metadata: Metadata = { title: '文章 · 梨花海' }
export const revalidate = 60

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tags?: string; keyword?: string; category?: string }>
}) {
  const { page, tags: tagsParam, keyword, category } = await searchParams

  const currentCategory = category ?? ''
  const currentTags = tagsParam ? tagsParam.split(',').filter(Boolean) : []
  const isFiltered = Boolean(currentCategory || currentTags.length || keyword)
  const currentPage = Number(page ?? 1)

  const [featuredResult, allTagsResult, categoriesResult, filteredResult] = await Promise.all([
    findPosts({ status: 'published', pageSize: 9 }),
    findAllTags(),
    findCategories(),
    findPosts({
      status: 'published',
      page: currentPage,
      pageSize: 9,
      tags: currentTags.length > 0 ? currentTags : undefined,
      category: currentCategory || undefined,
      keyword: keyword ?? undefined,
    }),
  ])

  const carouselPosts = [
    ...featuredResult.data.filter((post) => post.is_featured && post.cover_url),
    ...featuredResult.data.filter((post) => post.is_featured && !post.cover_url),
    ...featuredResult.data.filter((post) => !post.is_featured && post.cover_url),
    ...featuredResult.data.filter((post) => !post.is_featured && !post.cover_url),
  ].slice(0, 9)

  const totalPublished = featuredResult.total

  function paginationHref(p: number) {
    const params = new URLSearchParams()
    params.set('page', String(p))
    if (currentCategory) params.set('category', currentCategory)
    if (currentTags.length) params.set('tags', currentTags.join(','))
    if (keyword) params.set('keyword', keyword)
    return `/posts?${params.toString()}`
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">

      {/* ── 推荐文章（无筛选时展示） ── */}
      {!isFiltered && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground">推荐文章</h2>
          </div>
          <FeaturedCarousel posts={carouselPosts} />
        </section>
      )}

      {/* ── 筛选状态页头 ── */}
      {isFiltered && (
        <div className="mb-8">
          <p className="text-xs font-mono text-ember tracking-[0.25em] uppercase mb-2">POSTS</p>
          <h1 className="text-3xl font-bold text-foreground mb-1">
            {currentCategory || (currentTags.length ? `#${currentTags[0]}` : '全部文章')}
          </h1>
          <p className="text-sm text-muted-foreground">共 {filteredResult.total} 篇</p>
        </div>
      )}

      {/* ── 筛选栏（客户端组件） ── */}
      <PostsFilter
        categories={categoriesResult}
        tags={allTagsResult}
        currentCategory={currentCategory}
        currentTags={currentTags}
        totalPublished={totalPublished}
      />

      {/* ── 文章网格 ── */}
      {filteredResult.data.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">没有符合条件的文章。</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResult.data.map((post) => (
            <Link key={post.id} href={`/posts/${post.slug}`} className="group block h-full">
              <div className={`relative rounded-xl overflow-hidden border border-border
                               flex flex-col h-full
                               hover:border-border/90
                               transition-all duration-300`}>
                {/* 封面 */}
                <div className="aspect-[16/10] overflow-hidden bg-muted flex-shrink-0">
                  {post.cover_url ? (
                    <img
                      src={post.cover_url}
                      alt={post.title}
                      className="w-full h-full object-cover
                                 group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-ember/12 via-card to-muted
                                    flex items-center justify-center relative">
                      <span className="text-5xl font-bold select-none
                                       text-transparent bg-clip-text
                                       bg-gradient-to-br from-ember/30 to-ember/10">
                        {post.category?.charAt(0) ?? '文'}
                      </span>
                      <div className="absolute inset-0 opacity-[0.03]"
                           style={{ backgroundImage: 'repeating-linear-gradient(0deg,currentColor 0,currentColor 1px,transparent 1px,transparent 24px),repeating-linear-gradient(90deg,currentColor 0,currentColor 1px,transparent 1px,transparent 24px)' }} />
                    </div>
                  )}
                </div>
                {/* 信息 */}
                <div className="p-4 bg-card flex flex-col flex-1">
                  <h3 className="font-semibold text-sm text-foreground
                                 group-hover:text-ember transition-colors duration-200
                                 line-clamp-2 leading-snug flex-1">
                    {post.title}
                  </h3>
                  <div className="flex items-center justify-between mt-3">
                    <time className="text-[11px] text-muted-foreground font-mono">
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString('zh-CN')
                        : ''}
                    </time>
                    {post.category && (
                      <span className="text-[10px] font-mono text-muted-foreground/60">
                        {post.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* ── 分页 ── */}
      {filteredResult.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          {Array.from({ length: filteredResult.totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={paginationHref(p)}
              className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm
                          border transition-colors
                          ${p === filteredResult.page
                            ? 'bg-foreground text-background border-foreground'
                            : 'border-border text-muted-foreground hover:border-ember/40 hover:text-ember'}`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

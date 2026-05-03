/**
 * components/ui/FeaturedCarousel.tsx
 *
 * 推荐文章轮播 — 每次展示 3 篇，超出时可翻页。
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { RiArrowLeftSLine, RiArrowRightSLine } from '@remixicon/react'
import { resolveMediaUrl } from '@/lib/media'
import type { PostRow } from '@/types/post'

type CarouselPost = Pick<PostRow, 'id' | 'slug' | 'title' | 'cover_url' | 'published_at' | 'category'>

export function FeaturedCarousel({
  posts,
  fallbackCoverUrl,
}: {
  posts: CarouselPost[]
  fallbackCoverUrl?: string | null
}) {
  const [page, setPage] = useState(0)
  const PER = 3
  const totalPages = Math.ceil(posts.length / PER)
  const visible = posts.slice(page * PER, page * PER + PER)

  if (posts.length === 0) return null

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {visible.map((post) => {
          const coverUrl = resolveMediaUrl(post.cover_url, fallbackCoverUrl)
          return (
          <Link
            key={post.id}
            href={`/posts/${post.slug}`}
            className="group relative block aspect-[3/2] overflow-hidden rounded-xl border border-border/80 bg-card/92 transition-colors duration-300 hover:border-border/90"
          >
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 via-muted to-card
                              flex items-center justify-center">
                <span className="text-5xl font-bold select-none
                                 text-transparent bg-clip-text
                                 bg-gradient-to-br from-primary/45 to-primary/10">
                  {post.category?.charAt(0) ?? '文'}
                </span>
              </div>
            )}
            {/* 底部渐变 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            {/* 信息 */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-white text-sm font-bold line-clamp-2 leading-snug">
                {post.title}
              </p>
              <time className="text-white/50 text-[10px] font-mono mt-1.5 block">
                {post.published_at
                  ? new Date(post.published_at).toLocaleDateString('zh-CN')
                  : ''}
              </time>
            </div>
          </Link>
          )
        })}
      </div>

      {/* 翻页控件 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3">
          {/* 指示点 */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`h-1.5 rounded-full transition-all duration-200
                            ${i === page
                              ? 'w-5 bg-primary'
                              : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'}`}
              />
            ))}
          </div>
          {/* 箭头 */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="w-7 h-7 rounded-lg border border-border flex items-center justify-center
                         text-muted-foreground hover:text-primary hover:border-primary/40
                         disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <RiArrowLeftSLine size={15} />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="w-7 h-7 rounded-lg border border-border flex items-center justify-center
                         text-muted-foreground hover:text-primary hover:border-primary/40
                         disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <RiArrowRightSLine size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

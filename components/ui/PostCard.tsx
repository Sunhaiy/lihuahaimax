/**
 * components/ui/PostCard.tsx
 *
 * 文章卡片 — 等高网格布局，封面图 + 默认占位 + shimmer 悬停效果。
 * 在首页和文章列表页复用同一套视觉。
 */

import Link from 'next/link'
import type { PostRow } from '@/types/post'
import { SHIMMER } from '@/lib/styles'

interface PostCardProps {
  post: Pick<PostRow, 'id' | 'slug' | 'title' | 'excerpt' | 'cover_url' | 'category' | 'tags' | 'published_at'>
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Link href={`/posts/${post.slug}`} className="block group h-full">
      <div className={`relative rounded-xl border border-border bg-card overflow-hidden
                      flex flex-col h-full
                      transition-all duration-300
                      hover:border-primary/35 hover:shadow-[0_16px_36px_rgba(5,150,105,0.12)]
                      ${SHIMMER}`}>

        {/* ── 封面区 ── */}
        <div className="aspect-[16/9] relative overflow-hidden flex-shrink-0">
          {post.cover_url ? (
            <img
              src={post.cover_url}
              alt={post.title}
              className="w-full h-full object-cover
                         group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            /* 默认封面：多层渐变 + 分类首字 + 网格纹理 */
            <div className="w-full h-full relative
                            bg-gradient-to-br from-primary/12 via-card to-muted
                            flex items-center justify-center">
              <span className="text-7xl font-bold leading-none select-none
                               text-transparent bg-clip-text
                               bg-gradient-to-br from-primary/40 to-primary/10">
                {post.category?.charAt(0) ?? '文'}
              </span>
              <div className="absolute inset-0 opacity-[0.03]"
                   style={{ backgroundImage: 'repeating-linear-gradient(0deg,currentColor 0,currentColor 1px,transparent 1px,transparent 32px),repeating-linear-gradient(90deg,currentColor 0,currentColor 1px,transparent 1px,transparent 32px)' }} />
            </div>
          )}

          {/* 底部渐变遮罩 */}
          <div className="absolute inset-x-0 bottom-0 h-10
                          bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

          {/* 分类 badge */}
          {post.category && (
            <span className="absolute top-2.5 left-2.5 z-10
                             text-[10px] font-medium px-2 py-0.5 rounded-full
                             bg-black/55 backdrop-blur-sm
                             text-white/85 border border-white/10 leading-tight">
              {post.category}
            </span>
          )}
        </div>

        {/* ── 内容区 ── */}
        <div className="flex flex-col flex-1 px-4 pt-3.5 pb-4">
          <h3 className="font-semibold text-foreground group-hover:text-primary
                         transition-colors duration-200 line-clamp-2 leading-snug mb-1.5">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* 标签 + 日期 */}
          <div className="flex items-center justify-between mt-auto pt-3">
            <div className="flex gap-1 flex-wrap">
              {post.tags.slice(0, 2).map((tag) => (
                <span key={tag}
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded
                             bg-muted text-muted-foreground">
                  #{tag}
                </span>
              ))}
            </div>
            <time className="text-[11px] font-mono text-muted-foreground/50 flex-shrink-0 ml-2">
              {post.published_at
                ? new Date(post.published_at).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
                : '草稿'}
            </time>
          </div>
        </div>

      </div>
    </Link>
  )
}

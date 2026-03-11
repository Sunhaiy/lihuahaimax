/**
 * app/dashboard/posts/page.tsx
 *
 * 文章列表管理 — 全状态列表（草稿 + 已发布 + 存档）。
 */

import Link from 'next/link'
import { findPosts } from '@/lib/db/dao/postDao'
import { Button } from '@/components/ui/Button'

const STATUS_LABELS: Record<string, [string, string]> = {
  draft: ['草稿', 'text-muted-foreground bg-white/5'],
  published: ['已发布', 'text-green-400 bg-green-400/10'],
  archived: ['已存档', 'text-muted-foreground bg-white/5'],
}

export default async function DashboardPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>
}) {
  const { page, status } = await searchParams
  const result = await findPosts({
    page: Number(page ?? 1),
    pageSize: 20,
    status: (status as 'draft' | 'published' | 'archived') ?? undefined,
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">文章管理</h1>
        <Button asChild variant="primary" size="sm">
          <Link href="/dashboard/editor">+ 新建文章</Link>
        </Button>
      </div>

      {/* 状态筛选 */}
      <div className="flex gap-2 mb-6">
        {[
          ['', '全部'],
          ['published', '已发布'],
          ['draft', '草稿'],
          ['archived', '已存档'],
        ].map(([val, label]) => (
          <Link
            key={val}
            href={`/dashboard/posts${val ? `?status=${val}` : ''}`}
            className={`px-3 py-1 text-xs rounded-base border transition-colors
              ${(status ?? '') === val
                ? 'bg-ocean text-white border-ocean'
                : 'border-white/10 text-muted-foreground hover:text-foreground'
              }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* 文章表格 */}
      <div className="rounded-card border border-white/5 overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto] text-xs text-muted-foreground
                        px-5 py-3 border-b border-white/5 font-medium">
          <span>标题</span>
          <span className="text-right pr-10">状态</span>
          <span className="text-right pr-10">浏览</span>
          <span className="text-right">发布日期</span>
        </div>

        {result.data.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">暂无文章。</div>
        ) : (
          result.data.map((post) => {
            const [statusLabel, statusCls] = STATUS_LABELS[post.status] ?? ['未知', '']
            return (
              <div
                key={post.id}
                className="grid grid-cols-[1fr_auto_auto_auto] items-center
                           px-5 py-3.5 border-b last:border-b-0 border-white/5
                           hover:bg-white/[0.02] transition-colors"
              >
                <Link
                  href={`/dashboard/editor/${post.id}`}
                  className="font-medium text-sm text-foreground hover:text-ocean transition-colors truncate pr-4"
                >
                  {post.title}
                </Link>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded mr-8 ${statusCls}`}>
                  {statusLabel}
                </span>
                <span className="text-xs text-muted-foreground font-mono w-16 text-right pr-8">
                  {post.view_count}
                </span>
                <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                  {post.published_at
                    ? new Date(post.published_at).toLocaleDateString('zh-CN')
                    : '—'}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

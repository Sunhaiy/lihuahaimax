/**
 * app/dashboard/posts/page.tsx
 *
 * 文章列表管理 — 全状态列表，支持搜索 / 分类过滤 / 删除。
 */

import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { findPosts, findCategories, deletePost } from '@/lib/db/dao/postDao'
import { Button } from '@/components/ui/Button'
import { DeletePostBtn } from './DeletePostBtn'

const STATUS_LABELS: Record<string, [string, string]> = {
  draft: ['草稿', 'text-muted-foreground bg-black/[0.06] dark:bg-white/5'],
  published: ['已发布', 'text-green-400 bg-green-400/10'],
  archived: ['已存档', 'text-muted-foreground bg-black/[0.06] dark:bg-white/5'],
}

async function handleDelete(formData: FormData) {
  'use server'
  const id = Number(formData.get('id'))
  if (id) {
    await deletePost(id)
    revalidatePath('/dashboard/posts')
  }
}

export default async function DashboardPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; category?: string; keyword?: string }>
}) {
  const { page, status, category, keyword } = await searchParams

  const [result, allCategories] = await Promise.all([
    findPosts({
      page: Number(page ?? 1),
      pageSize: 20,
      status: (status as 'draft' | 'published' | 'archived') ?? undefined,
      category: category ?? undefined,
      keyword: keyword ?? undefined,
    }),
    findCategories(),
  ])

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const p: Record<string, string> = {}
    if (status) p.status = status
    if (category) p.category = category
    if (keyword) p.keyword = keyword
    Object.assign(p, overrides)
    // Remove undefined/empty keys
    Object.keys(p).forEach((k) => { if (!p[k]) delete p[k] })
    const qs = new URLSearchParams(p).toString()
    return `/dashboard/posts${qs ? `?${qs}` : ''}`
  }

  return (
    <div>
      {/* ── 标题栏 ────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">文章管理</h1>
        <Button asChild variant="primary" size="sm">
          <Link href="/dashboard/editor">+ 新建文章</Link>
        </Button>
      </div>

      {/* ── 搜索框 ───────────────────────────────────────── */}
      <form method="GET" action="/dashboard/posts" className="mb-5">
        {status && <input type="hidden" name="status" value={status} />}
        {category && <input type="hidden" name="category" value={category} />}
        <div className="flex gap-2 max-w-md">
          <input
            name="keyword"
            defaultValue={keyword ?? ''}
            placeholder="搜索标题 / 摘要…"
            className="flex-1 text-sm px-3 py-1.5 rounded-base border border-border
                       bg-background text-foreground placeholder:text-muted-foreground
                       focus:outline-none focus:ring-1 focus:ring-ember/50"
          />
          <button
            type="submit"
            className="px-3 py-1.5 text-xs rounded-base border border-border
                       text-muted-foreground hover:text-foreground hover:border-ember/50 transition-colors"
          >
            搜索
          </button>
          {keyword && (
            <Link
              href={buildUrl({ keyword: undefined })}
              className="px-3 py-1.5 text-xs rounded-base border border-border
                         text-muted-foreground hover:text-foreground transition-colors"
            >
              清除
            </Link>
          )}
        </div>
      </form>

      {/* ── 筛选条 ───────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 mb-6">
        {/* 状态过滤 */}
        {[
          [undefined, '全部状态'] as const,
          ['published', '已发布'] as const,
          ['draft', '草稿'] as const,
          ['archived', '已存档'] as const,
        ].map(([val, label]) => (
          <Link
            key={val ?? 'all'}
            href={buildUrl({ status: val, page: undefined })}
            className={`px-3 py-1 text-xs rounded-base border transition-colors
              ${(status ?? '') === (val ?? '')
                ? 'bg-ember text-white border-ember'
                : 'border-border text-muted-foreground hover:text-foreground'
              }`}
          >
            {label}
          </Link>
        ))}

        {allCategories.length > 0 && (
          <>
            <span className="w-px h-5 self-center bg-border" />
            {/* 分类过滤 */}
            <Link
              href={buildUrl({ category: undefined, page: undefined })}
              className={`px-3 py-1 text-xs rounded-base border transition-colors
                ${!category
                  ? 'bg-ember text-white border-ember'
                  : 'border-border text-muted-foreground hover:text-foreground'
                }`}
            >
              全部分类
            </Link>
            {allCategories.map(({ category: cat }) => (
              <Link
                key={cat}
                href={buildUrl({ category: cat, page: undefined })}
                className={`px-3 py-1 text-xs rounded-base border transition-colors
                  ${category === cat
                    ? 'bg-ember text-white border-ember'
                    : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
              >
                {cat}
              </Link>
            ))}
          </>
        )}
      </div>

      {/* ── 文章表格 ─────────────────────────────────────── */}
      <div className="rounded-card border border-border overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] text-xs text-muted-foreground
                        px-5 py-3 border-b border-border font-medium bg-black/[0.02] dark:bg-white/[0.02]">
          <span>标题 / 分类</span>
          <span className="text-right pr-8">状态</span>
          <span className="text-right pr-8">浏览</span>
          <span className="text-right pr-8">发布日期</span>
          <span className="text-right">操作</span>
        </div>

        {result.data.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">暂无文章。</div>
        ) : (
          result.data.map((post) => {
            const [statusLabel, statusCls] = STATUS_LABELS[post.status] ?? ['未知', '']
            return (
              <div
                key={post.id}
                className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center
                           px-5 py-3 border-b last:border-b-0 border-border
                           hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
              >
                {/* 标题 + 分类 */}
                <div className="min-w-0 pr-4">
                  <Link
                    href={`/dashboard/editor/${post.id}`}
                    className="block font-medium text-sm text-foreground hover:text-ember
                               transition-colors truncate"
                  >
                    {post.title}
                  </Link>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {post.category}
                  </span>
                </div>

                {/* 状态 */}
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded mr-8 ${statusCls}`}>
                  {statusLabel}
                </span>

                {/* 浏览量 */}
                <span className="text-xs text-muted-foreground font-mono w-14 text-right pr-8">
                  {post.view_count}
                </span>

                {/* 日期 */}
                <span className="text-xs text-muted-foreground font-mono whitespace-nowrap pr-8">
                  {post.published_at
                    ? new Date(post.published_at).toLocaleDateString('zh-CN')
                    : '—'}
                </span>

                {/* 删除 */}
                <DeletePostBtn id={post.id} title={post.title} action={handleDelete} />
              </div>
            )
          })
        )}
      </div>

      {/* ── 分页 ─────────────────────────────────────────── */}
      {result.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <span className="text-xs text-muted-foreground">
            共 {result.total} 篇
          </span>
          <div className="flex gap-1.5">
            {Array.from({ length: result.totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={buildUrl({ page: String(p) })}
                className={`w-8 h-8 flex items-center justify-center rounded text-xs transition-colors
                  ${p === result.page
                    ? 'bg-ember text-white'
                    : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
              >
                {p}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

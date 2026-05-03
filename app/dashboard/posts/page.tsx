import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import {
  AdminEmptyState,
  ADMIN_INPUT_CLASS,
  AdminListToolbar,
  AdminPageHeader,
  AdminPanel,
  AdminStatusBadge,
} from '@/components/admin/AdminPrimitives'
import { Button } from '@/components/ui/Button'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'
import { deletePost, findCategories, findPosts } from '@/lib/db/dao/postDao'
import { DeletePostBtn } from './DeletePostBtn'

const STATUS_LABELS: Record<string, { label: string; tone: 'neutral' | 'success' | 'warning' }> = {
  draft: { label: '草稿', tone: 'neutral' },
  published: { label: '已发布', tone: 'success' },
  archived: { label: '归档', tone: 'warning' },
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
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (category) params.set('category', category)
    if (keyword) params.set('keyword', keyword)

    Object.entries(overrides).forEach(([key, value]) => {
      if (!value) {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })

    const query = params.toString()
    return `/dashboard/posts${query ? `?${query}` : ''}`
  }

  const filtersActive = Boolean(status || category || keyword)

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Content"
        title="文章管理"
        description="统一处理搜索、筛选、状态查看与编辑入口。列表保留足够的信息密度，但把高频动作固定在顺手的位置。"
        actions={
          <Button asChild>
            <Link href="/dashboard/editor">
              <MaterialSymbol icon="edit_square" size={18} />
              新建文章
            </Link>
          </Button>
        }
        meta={
          <>
            <AdminStatusBadge tone="accent">{result.total} 篇内容</AdminStatusBadge>
            {keyword ? <AdminStatusBadge>搜索：{keyword}</AdminStatusBadge> : null}
          </>
        }
      />

      <AdminListToolbar>
        <form method="GET" action="/dashboard/posts" className="space-y-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex max-w-xl flex-1 gap-2">
              {status ? <input type="hidden" name="status" value={status} /> : null}
              {category ? <input type="hidden" name="category" value={category} /> : null}
              <div className="relative flex-1">
                <MaterialSymbol
                  icon="search"
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  name="keyword"
                  defaultValue={keyword ?? ''}
                  placeholder="搜索标题、摘要或内容关键词"
                  className={`${ADMIN_INPUT_CLASS} pl-10`}
                />
              </div>
              <Button type="submit" variant="secondary">
                搜索
              </Button>
              {filtersActive ? (
                <Button asChild variant="ghost">
                  <Link href="/dashboard/posts">清空</Link>
                </Button>
              ) : null}
            </div>

            <div className="text-sm text-muted-foreground">
              第 {result.page} / {result.totalPages} 页
            </div>
          </div>

          <div className="space-y-3">
            <FilterRow
              label="状态"
              items={[
                { key: 'all', href: buildUrl({ status: undefined, page: undefined }), label: '全部', active: !status },
                {
                  key: 'published',
                  href: buildUrl({ status: 'published', page: undefined }),
                  label: '已发布',
                  active: status === 'published',
                },
                {
                  key: 'draft',
                  href: buildUrl({ status: 'draft', page: undefined }),
                  label: '草稿',
                  active: status === 'draft',
                },
                {
                  key: 'archived',
                  href: buildUrl({ status: 'archived', page: undefined }),
                  label: '归档',
                  active: status === 'archived',
                },
              ]}
            />

            {allCategories.length > 0 ? (
              <FilterRow
                label="分类"
                items={[
                  {
                    key: 'all',
                    href: buildUrl({ category: undefined, page: undefined }),
                    label: '全部分类',
                    active: !category,
                  },
                  ...allCategories.map(({ category: current }) => ({
                    key: current,
                    href: buildUrl({ category: current, page: undefined }),
                    label: current,
                    active: category === current,
                  })),
                ]}
              />
            ) : null}
          </div>
        </form>
      </AdminListToolbar>

      <AdminPanel
        title="文章列表"
        description="把状态、分类、浏览量和发布日期放在同一条信息流里，编辑与删除动作固定在右侧。"
        icon="format_list_bulleted"
      >
        {result.data.length === 0 ? (
          <AdminEmptyState
            title="没有符合条件的文章"
            description="换个关键词，或者先清空筛选看看全部内容。"
            action={
              <Button asChild variant="secondary">
                <Link href="/dashboard/editor">写新文章</Link>
              </Button>
            }
          />
        ) : (
          <div className="overflow-hidden rounded-[24px] border border-border/70">
            <div className="hidden grid-cols-[minmax(0,1.5fr)_120px_90px_140px_120px] gap-4 border-b border-border/70 bg-background/42 px-5 py-3 text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground lg:grid">
              <span>标题 / 分类</span>
              <span>状态</span>
              <span>浏览</span>
              <span>发布日期</span>
              <span className="text-right">操作</span>
            </div>

            <div className="divide-y divide-border/70">
              {result.data.map((post) => {
                const statusMeta = STATUS_LABELS[post.status] ?? {
                  label: post.status,
                  tone: 'neutral' as const,
                }

                return (
                  <div
                    key={post.id}
                    className="grid gap-4 px-5 py-4 transition-colors hover:bg-background/42 lg:grid-cols-[minmax(0,1.5fr)_120px_90px_140px_120px] lg:items-center"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/dashboard/editor/${post.id}`}
                        className="block truncate text-sm font-medium text-foreground transition-colors hover:text-primary"
                      >
                        {post.title}
                      </Link>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {post.is_featured ? (
                          <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-mono text-primary">
                            推荐
                          </span>
                        ) : null}
                        {post.category ? <span>{post.category}</span> : <span>未分类</span>}
                        <span>·</span>
                        <span className="font-mono">{post.slug}</span>
                      </div>
                    </div>

                    <div className="flex items-center lg:block">
                      <AdminStatusBadge tone={statusMeta.tone}>{statusMeta.label}</AdminStatusBadge>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <span className="lg:hidden">浏览 </span>
                      <span className="font-mono">{post.view_count}</span>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {post.published_at ? new Date(post.published_at).toLocaleDateString('zh-CN') : '未发布'}
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/dashboard/editor/${post.id}`}>编辑</Link>
                      </Button>
                      <DeletePostBtn id={post.id} title={post.title} action={handleDelete} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {result.totalPages > 1 ? (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-5">
            <p className="text-sm text-muted-foreground">共 {result.total} 篇文章</p>
            <div className="flex gap-2">
              {Array.from({ length: result.totalPages }, (_, index) => index + 1).map((currentPage) => (
                <Link
                  key={currentPage}
                  href={buildUrl({ page: String(currentPage) })}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-2xl border text-sm transition-colors ${
                    currentPage === result.page
                      ? 'border-primary/20 bg-primary text-primary-foreground'
                      : 'border-border/70 bg-background/45 text-muted-foreground hover:border-border hover:text-foreground'
                  }`}
                >
                  {currentPage}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </AdminPanel>
    </div>
  )
}

function FilterRow({
  label,
  items,
}: {
  label: string
  items: Array<{ key: string; href: string; label: string; active: boolean }>
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
        {label}
      </span>
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs transition-colors ${
            item.active
              ? 'border-primary/20 bg-primary/10 text-foreground'
              : 'border-border/70 bg-background/45 text-muted-foreground hover:border-border hover:text-foreground'
          }`}
        >
          {item.label}
        </Link>
      ))}
    </div>
  )
}

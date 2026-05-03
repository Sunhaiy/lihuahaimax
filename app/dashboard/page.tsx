import Link from 'next/link'
import {
  AdminEmptyState,
  AdminPageHeader,
  AdminPanel,
  AdminStatusBadge,
} from '@/components/admin/AdminPrimitives'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'
import { countPendingComments } from '@/lib/db/dao/commentDao'
import { findPosts } from '@/lib/db/dao/postDao'
import { query } from '@/lib/db'

async function getStats() {
  const [posts, moments, animes, games, gallery, pendingComments, recentPosts] = await Promise.all([
    query<{ count: string; published: string; drafts: string }>(
      `SELECT COUNT(*) as count,
              COUNT(*) FILTER (WHERE status = 'published') as published,
              COUNT(*) FILTER (WHERE status = 'draft') as drafts
       FROM posts`
    ),
    query<{ count: string }>(`SELECT COUNT(*) as count FROM moments`),
    query<{ count: string }>(`SELECT COUNT(*) as count FROM animes`),
    query<{ count: string }>(`SELECT COUNT(*) as count FROM games`),
    query<{ count: string }>(`SELECT COUNT(*) as count FROM gallery_items`),
    countPendingComments(),
    findPosts({ pageSize: 5 }),
  ])

  return {
    postCount: Number(posts.rows[0]?.count ?? 0),
    publishedCount: Number(posts.rows[0]?.published ?? 0),
    draftCount: Number(posts.rows[0]?.drafts ?? 0),
    momentCount: Number(moments.rows[0]?.count ?? 0),
    animeCount: Number(animes.rows[0]?.count ?? 0),
    gameCount: Number(games.rows[0]?.count ?? 0),
    galleryCount: Number(gallery.rows[0]?.count ?? 0),
    pendingComments,
    recentPosts: recentPosts.data,
  }
}

export default async function DashboardPage() {
  const stats = await getStats()

  const cards = [
    {
      label: '文章',
      value: stats.postCount,
      sub: `${stats.publishedCount} 已发布 · ${stats.draftCount} 草稿`,
      href: '/dashboard/posts',
      icon: 'article',
    },
    {
      label: '瞬间',
      value: stats.momentCount,
      sub: '动态与状态记录',
      href: '/dashboard/moments',
      icon: 'dynamic_feed',
    },
    {
      label: '评论队列',
      value: stats.pendingComments,
      sub: '需要处理的评论',
      href: '/dashboard/comments',
      icon: 'forum',
    },
    {
      label: 'ACG',
      value: stats.animeCount + stats.gameCount,
      sub: `${stats.animeCount} 动漫 · ${stats.gameCount} 游戏`,
      href: '/dashboard/acg',
      icon: 'stadia_controller',
    },
  ]

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Control Center"
        title="后台总览"
        description="把高频入口、待处理事项和最近编辑放在同一块工作台里，减少在后台来回跳转。"
        meta={
          <>
            <AdminStatusBadge tone="accent">统一后台主题</AdminStatusBadge>
            {stats.pendingComments > 0 ? (
              <AdminStatusBadge tone="warning">{stats.pendingComments} 条评论待处理</AdminStatusBadge>
            ) : (
              <AdminStatusBadge tone="neutral">评论队列已清空</AdminStatusBadge>
            )}
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-[26px] border border-border/75 bg-card/76 p-5 backdrop-blur-xl transition-colors hover:border-primary/18 hover:bg-card/86"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-foreground">{card.value}</p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-background/55 text-primary">
                <MaterialSymbol icon={card.icon} size={20} />
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">{card.sub}</p>
          </Link>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <AdminPanel
          title="最近编辑"
          description="把最近内容放在前面，方便继续改、继续发，或者快速校对状态。"
          icon="history"
        >
          {stats.recentPosts.length === 0 ? (
            <AdminEmptyState
              title="还没有文章"
              description="先写一篇文章，后台工作台就会从这里长起来。"
            />
          ) : (
            <div className="space-y-3">
              {stats.recentPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/dashboard/editor/${post.id}`}
                  className="flex items-center justify-between gap-4 rounded-[22px] border border-border/70 bg-background/40 px-4 py-4 transition-colors hover:border-primary/18 hover:bg-background/58"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{post.title}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {post.category ? <span>{post.category}</span> : <span>未分类</span>}
                      <span>·</span>
                      <span>
                        {post.published_at
                          ? new Date(post.published_at).toLocaleDateString('zh-CN')
                          : '未发布'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <AdminStatusBadge
                      tone={
                        post.status === 'published'
                          ? 'success'
                          : post.status === 'draft'
                            ? 'neutral'
                            : 'warning'
                      }
                    >
                      {post.status === 'published' ? '已发布' : post.status === 'draft' ? '草稿' : '归档'}
                    </AdminStatusBadge>
                    <MaterialSymbol icon="arrow_forward" size={18} className="text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </AdminPanel>

        <div className="space-y-6">
          <AdminPanel
            title="待处理"
            description="把真正需要你立刻决策的事情收在一处。"
            icon="notifications_active"
          >
            <div className="space-y-3">
              <QuickTask
                href="/dashboard/comments"
                title="评论审核"
                description={
                  stats.pendingComments > 0
                    ? `${stats.pendingComments} 条评论还没处理。`
                    : '目前没有待审核评论。'
                }
                tone={stats.pendingComments > 0 ? 'accent' : 'neutral'}
              />
              <QuickTask
                href="/dashboard/posts"
                title="草稿整理"
                description={
                  stats.draftCount > 0
                    ? `${stats.draftCount} 篇草稿还没发布。`
                    : '当前没有待整理草稿。'
                }
                tone={stats.draftCount > 0 ? 'accent' : 'neutral'}
              />
            </div>
          </AdminPanel>

          <AdminPanel title="快捷入口" description="常用动作直接一步到位。" icon="bolt">
            <div className="grid gap-3 sm:grid-cols-2">
              <QuickEntry href="/dashboard/editor" icon="edit_square" label="新建文章" />
              <QuickEntry href="/dashboard/moments" icon="dynamic_feed" label="发布瞬间" />
              <QuickEntry href="/dashboard/settings" icon="wallpaper" label="站点设置" />
              <QuickEntry href="/dashboard/acg" icon="stadia_controller" label="管理 ACG" />
            </div>
          </AdminPanel>
        </div>
      </div>
    </div>
  )
}

function QuickTask({
  href,
  title,
  description,
  tone,
}: {
  href: string
  title: string
  description: string
  tone: 'neutral' | 'accent'
}) {
  const toneClass = {
    neutral: 'border-border/70 bg-background/40',
    accent: 'border-primary/18 bg-primary/8',
  }[tone]

  return (
    <Link
      href={href}
      className={`flex items-center justify-between gap-4 rounded-[22px] border px-4 py-4 transition-colors hover:border-primary/18 hover:bg-background/56 ${toneClass}`}
    >
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      <MaterialSymbol icon="arrow_forward" size={18} className="text-muted-foreground" />
    </Link>
  )
}

function QuickEntry({
  href,
  icon,
  label,
}: {
  href: string
  icon: string
  label: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-[22px] border border-border/70 bg-background/40 px-4 py-4 text-sm font-medium text-foreground transition-colors hover:border-primary/18 hover:bg-background/58"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-background/55 text-primary">
        <MaterialSymbol icon={icon} size={18} />
      </span>
      {label}
    </Link>
  )
}

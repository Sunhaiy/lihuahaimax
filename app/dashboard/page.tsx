/**
 * app/dashboard/page.tsx
 *
 * 后台概览页 — 数据统计卡片。
 */

import { query } from '@/lib/db'
import { Card, CardBody } from '@/components/ui/Card'

async function getStats() {
  const [posts, moments, animes, games, gallery] = await Promise.all([
    query<{ count: string; published: string }>(
      `SELECT COUNT(*) as count,
              COUNT(*) FILTER (WHERE status = 'published') as published
       FROM posts`
    ),
    query<{ count: string }>(`SELECT COUNT(*) as count FROM moments`),
    query<{ count: string }>(`SELECT COUNT(*) as count FROM animes`),
    query<{ count: string }>(`SELECT COUNT(*) as count FROM games`),
    query<{ count: string }>(`SELECT COUNT(*) as count FROM gallery_items`),
  ])

  return {
    postCount: Number(posts.rows[0]?.count ?? 0),
    publishedCount: Number(posts.rows[0]?.published ?? 0),
    momentCount: Number(moments.rows[0]?.count ?? 0),
    animeCount: Number(animes.rows[0]?.count ?? 0),
    gameCount: Number(games.rows[0]?.count ?? 0),
    galleryCount: Number(gallery.rows[0]?.count ?? 0),
  }
}

export default async function DashboardPage() {
  const stats = await getStats()

  const cards = [
    { label: '文章总数', value: stats.postCount, sub: `${stats.publishedCount} 已发布`, color: 'text-ocean' },
    { label: '极客瞬间', value: stats.momentCount, sub: '条记录', color: 'text-ember' },
    { label: '追番数', value: stats.animeCount, sub: '部动漫', color: 'text-purple-400' },
    { label: '游戏收藏', value: stats.gameCount, sub: '款游戏', color: 'text-green-400' },
    { label: '光影相册', value: stats.galleryCount, sub: '张图片', color: 'text-yellow-400' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">概览</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardBody className="py-5">
              <p className="text-xs text-muted-foreground mb-1">{card.label}</p>
              <p className={`text-3xl font-bold font-mono ${card.color}`}>{card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="text-sm text-muted-foreground">
        <p>欢迎回来。使用左侧导航管理内容。</p>
      </div>
    </div>
  )
}

import { unstable_cache } from 'next/cache'
import { query } from '@/lib/db'

export interface ActivityDay {
  date: string
  count: number
}

const getActivityHeatmapCached = unstable_cache(
  async (days: number): Promise<ActivityDay[]> => {
    const result = await query<{ date: string; count: string }>(
      `WITH date_series AS (
         SELECT generate_series(
           (NOW() - INTERVAL '1 day' * $1)::date,
           NOW()::date,
           INTERVAL '1 day'
         )::date AS day
       ),
       post_counts AS (
         SELECT published_at::date AS day, COUNT(*) AS cnt
         FROM posts
         WHERE status = 'published'
           AND published_at >= NOW() - INTERVAL '1 day' * $1
         GROUP BY 1
       ),
       moment_counts AS (
         SELECT created_at::date AS day, COUNT(*) AS cnt
         FROM moments
         WHERE created_at >= NOW() - INTERVAL '1 day' * $1
         GROUP BY 1
       )
       SELECT
         d.day::text                                       AS date,
         COALESCE(p.cnt, 0) + COALESCE(m.cnt, 0)          AS count
       FROM date_series d
       LEFT JOIN post_counts p ON p.day = d.day
       LEFT JOIN moment_counts m ON m.day = d.day
       ORDER BY d.day`,
      [days]
    )

    return result.rows.map((row) => ({
      date: row.date,
      count: Number(row.count),
    }))
  },
  ['activity-heatmap'],
  {
    revalidate: 300,
    tags: ['posts', 'moments'],
  }
)

export async function getActivityHeatmap(days: number = 365): Promise<ActivityDay[]> {
  return getActivityHeatmapCached(days)
}

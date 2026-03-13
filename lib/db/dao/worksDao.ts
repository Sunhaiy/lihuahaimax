/**
 * lib/db/dao/worksDao.ts
 *
 * 作品数据访问层。
 */

import { query } from '@/lib/db'

export interface WorkRow {
  id: number
  title: string
  subtitle: string | null
  description: string | null
  cover_url: string
  tags: string[]
  url: string | null
  github_url: string | null
  year: number | null
  sort_order: number
  created_at: Date
}

export async function findWorks(): Promise<WorkRow[]> {
  const result = await query<WorkRow>(
    `SELECT * FROM works ORDER BY sort_order ASC, created_at DESC`
  )
  return result.rows
}

export async function findWorkById(id: number): Promise<WorkRow | null> {
  const result = await query<WorkRow>(
    `SELECT * FROM works WHERE id = $1`,
    [id]
  )
  return result.rows[0] ?? null
}

export async function insertWork(input: Omit<WorkRow, 'id' | 'created_at'>): Promise<WorkRow> {
  const result = await query<WorkRow>(
    `INSERT INTO works (title, subtitle, description, cover_url, tags, url, github_url, year, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      input.title,
      input.subtitle ?? null,
      input.description ?? null,
      input.cover_url,
      input.tags,
      input.url ?? null,
      input.github_url ?? null,
      input.year ?? null,
      input.sort_order,
    ]
  )
  return result.rows[0]
}

export async function deleteWork(id: number): Promise<boolean> {
  const result = await query(
    `DELETE FROM works WHERE id = $1`,
    [id]
  )
  return (result.rowCount ?? 0) > 0
}

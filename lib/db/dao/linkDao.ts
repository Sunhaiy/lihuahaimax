/**
 * lib/db/dao/linkDao.ts
 *
 * 友情链接数据访问层。
 */

import { query } from '@/lib/db'
import type { LinkRow, CreateLinkInput, UpdateLinkInput } from '@/types/link'

export async function findLinks(activeOnly = true): Promise<LinkRow[]> {
  const where = activeOnly ? `WHERE is_active = TRUE` : ''
  const result = await query<LinkRow>(
    `SELECT * FROM links ${where} ORDER BY sort_order ASC, id ASC`
  )
  return result.rows
}

export async function findLinkById(id: number): Promise<LinkRow | null> {
  const result = await query<LinkRow>(`SELECT * FROM links WHERE id = $1`, [id])
  return result.rows[0] ?? null
}

export async function insertLink(input: CreateLinkInput): Promise<LinkRow> {
  const result = await query<LinkRow>(
    `INSERT INTO links (name, url, description, avatar_url, category, sort_order, is_active)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`,
    [
      input.name,
      input.url,
      input.description ?? null,
      input.avatarUrl ?? null,
      input.category ?? 'friend',
      input.sortOrder ?? 0,
      input.isActive ?? true,
    ]
  )
  return result.rows[0]
}

export async function updateLink(id: number, input: UpdateLinkInput): Promise<LinkRow | null> {
  const map: [keyof UpdateLinkInput, string][] = [
    ['name', 'name'], ['url', 'url'], ['description', 'description'],
    ['avatarUrl', 'avatar_url'], ['category', 'category'],
    ['sortOrder', 'sort_order'], ['isActive', 'is_active'],
  ]
  const setClauses: string[] = []
  const values: unknown[] = []
  let idx = 1

  for (const [key, col] of map) {
    if (input[key] !== undefined) {
      setClauses.push(`${col} = $${idx++}`)
      values.push(input[key])
    }
  }
  if (setClauses.length === 0) return findLinkById(id)

  values.push(id)
  const result = await query<LinkRow>(
    `UPDATE links SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  )
  return result.rows[0] ?? null
}

export async function deleteLink(id: number): Promise<boolean> {
  const result = await query(`DELETE FROM links WHERE id = $1`, [id])
  return (result.rowCount ?? 0) > 0
}

/**
 * lib/db/dao/momentDao.ts
 *
 * 极客瞬间数据访问层。
 */

import { query } from '@/lib/db'
import type { MomentRow, CreateMomentInput, UpdateMomentInput } from '@/types/moment'

// ============================================================
// 查询
// ============================================================

export async function findMoments(params: {
  page?: number
  pageSize?: number
  type?: string
  publicOnly?: boolean
} = {}): Promise<{ data: MomentRow[]; total: number }> {
  const { page = 1, pageSize = 20, type, publicOnly = true } = params
  const conditions: string[] = []
  const values: unknown[] = []
  let idx = 1

  if (publicOnly) {
    conditions.push(`is_public = $${idx++}`)
    values.push(true)
  }
  if (type) {
    conditions.push(`type = $${idx++}`)
    values.push(type)
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
  const offset = (page - 1) * pageSize

  const [dataResult, countResult] = await Promise.all([
    query<MomentRow>(
      `SELECT * FROM moments ${where}
       ORDER BY created_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...values, pageSize, offset]
    ),
    query<{ count: string }>(`SELECT COUNT(*) as count FROM moments ${where}`, values),
  ])

  return {
    data: dataResult.rows,
    total: Number(countResult.rows[0].count),
  }
}

export async function findMomentById(id: number): Promise<MomentRow | null> {
  const result = await query<MomentRow>(`SELECT * FROM moments WHERE id = $1`, [id])
  return result.rows[0] ?? null
}

// ============================================================
// 创建
// ============================================================

export async function insertMoment(input: CreateMomentInput): Promise<MomentRow> {
  const result = await query<MomentRow>(
    `INSERT INTO moments (type, content, images, meta, mood, weather, location, is_public)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      input.type ?? 'text',
      input.content ?? null,
      input.images ?? [],
      input.meta ? JSON.stringify(input.meta) : null,
      input.mood ?? null,
      input.weather ?? null,
      input.location ?? null,
      input.isPublic ?? true,
    ]
  )
  return result.rows[0]
}

// ============================================================
// 更新
// ============================================================

export async function updateMoment(id: number, input: UpdateMomentInput): Promise<MomentRow | null> {
  const setClauses: string[] = []
  const values: unknown[] = []
  let idx = 1

  if (input.type !== undefined) { setClauses.push(`type = $${idx++}`); values.push(input.type) }
  if (input.content !== undefined) { setClauses.push(`content = $${idx++}`); values.push(input.content) }
  if (input.images !== undefined) { setClauses.push(`images = $${idx++}`); values.push(input.images) }
  if (input.meta !== undefined) { setClauses.push(`meta = $${idx++}`); values.push(JSON.stringify(input.meta)) }
  if (input.mood !== undefined) { setClauses.push(`mood = $${idx++}`); values.push(input.mood) }
  if (input.weather !== undefined) { setClauses.push(`weather = $${idx++}`); values.push(input.weather) }
  if (input.location !== undefined) { setClauses.push(`location = $${idx++}`); values.push(input.location) }
  if (input.isPublic !== undefined) { setClauses.push(`is_public = $${idx++}`); values.push(input.isPublic) }

  if (setClauses.length === 0) return findMomentById(id)

  values.push(id)
  const result = await query<MomentRow>(
    `UPDATE moments SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  )
  return result.rows[0] ?? null
}

// ============================================================
// 删除
// ============================================================

export async function deleteMoment(id: number): Promise<boolean> {
  const result = await query(`DELETE FROM moments WHERE id = $1`, [id])
  return (result.rowCount ?? 0) > 0
}

// ============================================================
// 手环数据批量写入（定时任务专用）
// ============================================================

export async function upsertMiBandMoment(
  type: 'sleep' | 'steps' | 'heartrate',
  meta: Record<string, unknown>,
  date: Date
): Promise<MomentRow> {
  // 同一天的同类型数据做 upsert（通过 meta->>'date' 判断唯一性）
  const result = await query<MomentRow>(
    `INSERT INTO moments (type, meta, is_public, created_at)
     VALUES ($1, $2, TRUE, $3)
     ON CONFLICT DO NOTHING
     RETURNING *`,
    [type, JSON.stringify({ ...meta, date: date.toISOString().slice(0, 10) }), date]
  )

  if (result.rows[0]) return result.rows[0]

  // 若已存在则更新
  const update = await query<MomentRow>(
    `UPDATE moments
     SET meta = $1
     WHERE type = $2 AND (meta->>'date') = $3
     RETURNING *`,
    [JSON.stringify({ ...meta, date: date.toISOString().slice(0, 10) }), type, date.toISOString().slice(0, 10)]
  )
  return update.rows[0]
}

/**
 * lib/db/dao/galleryDao.ts
 *
 * 光影相册数据访问层。
 */

import { query } from '@/lib/db'
import type { GalleryItemRow, CreateGalleryItemInput, UpdateGalleryItemInput } from '@/types/gallery'

export async function findGalleryItems(params: {
  page?: number
  pageSize?: number
  category?: string
  tag?: string
  featuredOnly?: boolean
} = {}): Promise<{ data: GalleryItemRow[]; total: number }> {
  const { page = 1, pageSize = 30, category, tag, featuredOnly } = params
  const conditions: string[] = []
  const values: unknown[] = []
  let idx = 1

  if (category) { conditions.push(`category = $${idx++}`); values.push(category) }
  if (tag) { conditions.push(`$${idx++} = ANY(tags)`); values.push(tag) }
  if (featuredOnly) { conditions.push(`is_featured = $${idx++}`); values.push(true) }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const offset = (page - 1) * pageSize

  const [dataResult, countResult] = await Promise.all([
    query<GalleryItemRow>(
      `SELECT * FROM gallery_items ${where}
       ORDER BY sort_order ASC, created_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...values, pageSize, offset]
    ),
    query<{ count: string }>(`SELECT COUNT(*) as count FROM gallery_items ${where}`, values),
  ])
  return { data: dataResult.rows, total: Number(countResult.rows[0].count) }
}

export async function findGalleryItemById(id: number): Promise<GalleryItemRow | null> {
  const result = await query<GalleryItemRow>(`SELECT * FROM gallery_items WHERE id = $1`, [id])
  return result.rows[0] ?? null
}

export async function insertGalleryItem(input: CreateGalleryItemInput): Promise<GalleryItemRow> {
  const result = await query<GalleryItemRow>(
    `INSERT INTO gallery_items
       (title, description, url, thumbnail_url, width, height, file_size,
        file_name, category, exif, tags, is_featured, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     RETURNING *`,
    [
      input.title ?? null,
      input.description ?? null,
      input.url,
      input.thumbnailUrl ?? null,
      input.width ?? null,
      input.height ?? null,
      input.fileSize ?? null,
      input.fileName,
      input.category ?? 'photo',
      input.exif ? JSON.stringify(input.exif) : null,
      input.tags ?? [],
      input.isFeatured ?? false,
      input.sortOrder ?? 0,
    ]
  )
  return result.rows[0]
}

export async function updateGalleryItem(
  id: number,
  input: UpdateGalleryItemInput
): Promise<GalleryItemRow | null> {
  const map: [keyof UpdateGalleryItemInput, string][] = [
    ['title', 'title'], ['description', 'description'], ['thumbnailUrl', 'thumbnail_url'],
    ['width', 'width'], ['height', 'height'], ['fileSize', 'file_size'],
    ['category', 'category'], ['exif', 'exif'], ['tags', 'tags'],
    ['isFeatured', 'is_featured'], ['sortOrder', 'sort_order'],
  ]
  const setClauses: string[] = []
  const values: unknown[] = []
  let idx = 1

  for (const [key, col] of map) {
    if (input[key] !== undefined) {
      const val = key === 'exif' ? JSON.stringify(input[key]) : input[key]
      setClauses.push(`${col} = $${idx++}`)
      values.push(val)
    }
  }
  if (setClauses.length === 0) return findGalleryItemById(id)

  values.push(id)
  const result = await query<GalleryItemRow>(
    `UPDATE gallery_items SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  )
  return result.rows[0] ?? null
}

export async function deleteGalleryItem(id: number): Promise<boolean> {
  const result = await query(`DELETE FROM gallery_items WHERE id = $1`, [id])
  return (result.rowCount ?? 0) > 0
}

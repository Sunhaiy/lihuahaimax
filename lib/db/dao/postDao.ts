/**
 * lib/db/dao/postDao.ts
 *
 * 文章数据访问层。
 * 所有与 posts 表的 SQL 交互只能在此文件中发生。
 * 调用方（Service 层）不得直接操作 SQL。
 */

import { query } from '@/lib/db'
import type {
  PostRow,
  CreatePostInput,
  UpdatePostInput,
  PostQueryParams,
  PaginatedResult,
} from '@/types/post'

// ============================================================
// 查询
// ============================================================

export async function findPostById(id: number): Promise<PostRow | null> {
  const result = await query<PostRow>(
    `SELECT * FROM posts WHERE id = $1`,
    [id]
  )
  return result.rows[0] ?? null
}

export async function findPostBySlug(slug: string): Promise<PostRow | null> {
  const result = await query<PostRow>(
    `SELECT * FROM posts WHERE slug = $1`,
    [slug]
  )
  return result.rows[0] ?? null
}

export async function findPosts(params: PostQueryParams = {}): Promise<PaginatedResult<PostRow>> {
  const {
    page = 1,
    pageSize = 10,
    status,
    tag,
    category,
    keyword,
  } = params

  const conditions: string[] = []
  const values: unknown[] = []
  let idx = 1

  if (status) {
    conditions.push(`status = $${idx++}`)
    values.push(status)
  }
  if (tag) {
    conditions.push(`$${idx++} = ANY(tags)`)
    values.push(tag)
  }
  if (category) {
    conditions.push(`category = $${idx++}`)
    values.push(category)
  }
  if (keyword) {
    conditions.push(`(title ILIKE $${idx++} OR excerpt ILIKE $${idx++})`)
    values.push(`%${keyword}%`, `%${keyword}%`)
    idx++ // 占位符已用两个
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
  const offset = (page - 1) * pageSize

  const [dataResult, countResult] = await Promise.all([
    query<PostRow>(
      `SELECT id, title, slug, excerpt, cover_url, status, tags, category, view_count,
              created_at, updated_at, published_at
       FROM posts
       ${where}
       ORDER BY published_at DESC NULLS LAST, created_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...values, pageSize, offset]
    ),
    query<{ count: string }>(
      `SELECT COUNT(*) as count FROM posts ${where}`,
      values
    ),
  ])

  const total = Number(countResult.rows[0].count)

  return {
    data: dataResult.rows,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

/** 获取已发布文章的所有分类及数量 */
export async function findCategories(): Promise<{ category: string; count: number }[]> {
  const result = await query<{ category: string; count: string }>(
    `SELECT category, COUNT(*) as count
     FROM posts
     WHERE status = 'published'
     GROUP BY category
     ORDER BY count DESC, category ASC`
  )
  return result.rows.map((r) => ({ category: r.category, count: Number(r.count) }))
}

// ============================================================
// 创建
// ============================================================

export async function insertPost(input: CreatePostInput): Promise<PostRow> {
  const result = await query<PostRow>(
    `INSERT INTO posts (title, slug, content, excerpt, cover_url, status, tags, category, published_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      input.title,
      input.slug,
      JSON.stringify(input.content),
      input.excerpt ?? null,
      input.coverUrl ?? null,
      input.status ?? 'draft',
      input.tags ?? [],
      input.category ?? '未分类',
      input.status === 'published' ? new Date() : null,
    ]
  )
  return result.rows[0]
}

// ============================================================
// 更新
// ============================================================

export async function updatePost(id: number, input: UpdatePostInput): Promise<PostRow | null> {
  const setClauses: string[] = []
  const values: unknown[] = []
  let idx = 1

  if (input.title !== undefined) { setClauses.push(`title = $${idx++}`); values.push(input.title) }
  if (input.slug !== undefined) { setClauses.push(`slug = $${idx++}`); values.push(input.slug) }
  if (input.content !== undefined) { setClauses.push(`content = $${idx++}`); values.push(JSON.stringify(input.content)) }
  if (input.excerpt !== undefined) { setClauses.push(`excerpt = $${idx++}`); values.push(input.excerpt) }
  if (input.coverUrl !== undefined) { setClauses.push(`cover_url = $${idx++}`); values.push(input.coverUrl) }
  if (input.tags !== undefined) { setClauses.push(`tags = $${idx++}`); values.push(input.tags) }
  if (input.category !== undefined) { setClauses.push(`category = $${idx++}`); values.push(input.category) }
  if (input.status !== undefined) {
    setClauses.push(`status = $${idx++}`)
    values.push(input.status)
    // 首次发布时设置 published_at
    if (input.status === 'published') {
      setClauses.push(`published_at = COALESCE(published_at, NOW())`)
    }
  }

  if (setClauses.length === 0) return findPostById(id)

  values.push(id)
  const result = await query<PostRow>(
    `UPDATE posts SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  )
  return result.rows[0] ?? null
}

export async function incrementViewCount(id: number): Promise<void> {
  await query(
    `UPDATE posts SET view_count = view_count + 1 WHERE id = $1`,
    [id]
  )
}

/** 获取相邻文章（上一篇 / 下一篇），按发布时间排序 */
export async function findAdjacentPosts(
  publishedAt: Date,
  id: number
): Promise<{ prev: PostRow | null; next: PostRow | null }> {
  const cols = `id, title, slug, cover_url, tags, published_at`
  const [prevResult, nextResult] = await Promise.all([
    query<PostRow>(
      `SELECT ${cols} FROM posts
       WHERE status = 'published'
         AND (published_at < $1 OR (published_at = $1 AND id < $2))
       ORDER BY published_at DESC, id DESC
       LIMIT 1`,
      [publishedAt, id]
    ),
    query<PostRow>(
      `SELECT ${cols} FROM posts
       WHERE status = 'published'
         AND (published_at > $1 OR (published_at = $1 AND id > $2))
       ORDER BY published_at ASC, id ASC
       LIMIT 1`,
      [publishedAt, id]
    ),
  ])
  return {
    prev: prevResult.rows[0] ?? null,
    next: nextResult.rows[0] ?? null,
  }
}

/** 重命名分类（批量更新该分类下所有文章） */
export async function renameCategory(oldName: string, newName: string): Promise<number> {
  const result = await query(
    `UPDATE posts SET category = $2 WHERE category = $1`,
    [oldName, newName]
  )
  return result.rowCount ?? 0
}

/** 删除分类（将该分类下所有文章重置为"未分类"） */
export async function resetCategory(name: string): Promise<number> {
  const result = await query(
    `UPDATE posts SET category = '未分类' WHERE category = $1 AND category != '未分类'`,
    [name]
  )
  return result.rowCount ?? 0
}

// ============================================================
// 删除
// ============================================================

export async function deletePost(id: number): Promise<boolean> {
  const result = await query(
    `DELETE FROM posts WHERE id = $1`,
    [id]
  )
  return (result.rowCount ?? 0) > 0
}

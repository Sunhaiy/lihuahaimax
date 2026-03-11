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
  if (keyword) {
    conditions.push(`(title ILIKE $${idx++} OR excerpt ILIKE $${idx++})`)
    values.push(`%${keyword}%`, `%${keyword}%`)
    idx++ // 占位符已用两个
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
  const offset = (page - 1) * pageSize

  const [dataResult, countResult] = await Promise.all([
    query<PostRow>(
      `SELECT id, title, slug, excerpt, cover_url, status, tags, view_count,
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

// ============================================================
// 创建
// ============================================================

export async function insertPost(input: CreatePostInput): Promise<PostRow> {
  const result = await query<PostRow>(
    `INSERT INTO posts (title, slug, content, excerpt, cover_url, status, tags, published_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      input.title,
      input.slug,
      JSON.stringify(input.content),
      input.excerpt ?? null,
      input.coverUrl ?? null,
      input.status ?? 'draft',
      input.tags ?? [],
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

import { revalidateTag, unstable_cache } from 'next/cache'
import { query } from '@/lib/db'

const COMMENTS_TAG = 'comments'

export interface CommentRow {
  id: number
  post_id: number
  author_name: string
  author_email: string | null
  parent_id: number | null
  content: string
  location_label: string | null
  browser_label: string | null
  os_label: string | null
  is_by_author: boolean
  is_approved: boolean
  created_at: Date
  reply_to_name?: string | null
  post_title?: string | null
}

export interface InsertCommentInput {
  post_id: number
  author_name: string
  author_email?: string | null
  parent_id?: number | null
  content: string
  location_label?: string | null
  browser_label?: string | null
  os_label?: string | null
  is_by_author?: boolean
  is_approved?: boolean
}

const BASE_SELECT = `
  SELECT
    c.id,
    c.post_id,
    c.author_name,
    c.author_email,
    c.parent_id,
    c.content,
    c.location_label,
    c.browser_label,
    c.os_label,
    c.is_by_author,
    c.is_approved,
    c.created_at,
    parent.author_name AS reply_to_name
`

const findApprovedCommentsCached = unstable_cache(
  async (postId: number): Promise<CommentRow[]> => {
    const result = await query<CommentRow>(
      `${BASE_SELECT}
       FROM comments c
       LEFT JOIN comments parent ON parent.id = c.parent_id
       WHERE c.post_id = $1 AND c.is_approved = TRUE
       ORDER BY COALESCE(c.parent_id, c.id) ASC, c.parent_id NULLS FIRST, c.created_at ASC`,
      [postId]
    )

    return result.rows
  },
  ['approved-comments'],
  {
    revalidate: 120,
    tags: [COMMENTS_TAG],
  }
)

export async function findApprovedComments(postId: number): Promise<CommentRow[]> {
  return findApprovedCommentsCached(postId)
}

export async function findCommentById(id: number): Promise<CommentRow | null> {
  const result = await query<CommentRow>(
    `${BASE_SELECT}
     FROM comments c
     LEFT JOIN comments parent ON parent.id = c.parent_id
     WHERE c.id = $1
     LIMIT 1`,
    [id]
  )

  return result.rows[0] ?? null
}

export async function insertComment(input: InsertCommentInput): Promise<CommentRow> {
  const result = await query<CommentRow>(
    `INSERT INTO comments (
       post_id,
       author_name,
       author_email,
       parent_id,
       content,
       location_label,
       browser_label,
       os_label,
       is_by_author,
       is_approved
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      input.post_id,
      input.author_name,
      input.author_email ?? null,
      input.parent_id ?? null,
      input.content,
      input.location_label ?? null,
      input.browser_label ?? null,
      input.os_label ?? null,
      input.is_by_author ?? false,
      input.is_approved ?? false,
    ]
  )

  revalidateTag(COMMENTS_TAG)
  return result.rows[0]
}

export async function approveComment(id: number): Promise<boolean> {
  const result = await query(`UPDATE comments SET is_approved = TRUE WHERE id = $1`, [id])
  revalidateTag(COMMENTS_TAG)
  return (result.rowCount ?? 0) > 0
}

export async function deleteComment(id: number): Promise<boolean> {
  const result = await query(`DELETE FROM comments WHERE id = $1`, [id])
  revalidateTag(COMMENTS_TAG)
  return (result.rowCount ?? 0) > 0
}

export async function countPendingComments(): Promise<number> {
  const result = await query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM comments WHERE is_approved = FALSE`
  )

  return Number(result.rows[0]?.count ?? 0)
}

export async function findAllComments(): Promise<CommentRow[]> {
  const result = await query<CommentRow>(
    `${BASE_SELECT},
        p.title AS post_title
     FROM comments c
     LEFT JOIN comments parent ON parent.id = c.parent_id
     LEFT JOIN posts p ON p.id = c.post_id
     ORDER BY c.created_at DESC`
  )

  return result.rows
}

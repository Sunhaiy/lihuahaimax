/**
 * lib/db/dao/commentDao.ts
 *
 * 评论数据访问层。
 */

import { query } from '@/lib/db'

export interface CommentRow {
  id: number
  post_id: number
  author_name: string
  author_email: string | null
  content: string
  is_approved: boolean
  created_at: Date
}

export interface InsertCommentInput {
  post_id: number
  author_name: string
  author_email?: string
  content: string
}

/** 获取文章的已审核评论（公开） */
export async function findApprovedComments(postId: number): Promise<CommentRow[]> {
  const result = await query<CommentRow>(
    `SELECT id, post_id, author_name, content, is_approved, created_at
     FROM comments
     WHERE post_id = $1 AND is_approved = TRUE
     ORDER BY created_at ASC`,
    [postId]
  )
  return result.rows
}

/** 提交新评论（默认待审） */
export async function insertComment(input: InsertCommentInput): Promise<CommentRow> {
  const result = await query<CommentRow>(
    `INSERT INTO comments (post_id, author_name, author_email, content)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [input.post_id, input.author_name, input.author_email ?? null, input.content]
  )
  return result.rows[0]
}

/** 审核通过评论（管理员） */
export async function approveComment(id: number): Promise<boolean> {
  const result = await query(
    `UPDATE comments SET is_approved = TRUE WHERE id = $1`,
    [id]
  )
  return (result.rowCount ?? 0) > 0
}

/** 删除评论（管理员） */
export async function deleteComment(id: number): Promise<boolean> {
  const result = await query(
    `DELETE FROM comments WHERE id = $1`,
    [id]
  )
  return (result.rowCount ?? 0) > 0
}

/** 获取待审评论数（管理后台用） */
export async function countPendingComments(): Promise<number> {
  const result = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM comments WHERE is_approved = FALSE`
  )
  return Number(result.rows[0].count)
}

/** 获取所有评论（管理后台用） */
export async function findAllComments(): Promise<CommentRow[]> {
  const result = await query<CommentRow>(
    `SELECT * FROM comments ORDER BY created_at DESC`
  )
  return result.rows
}

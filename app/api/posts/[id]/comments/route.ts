/**
 * app/api/posts/[id]/comments/route.ts
 *
 * GET  /api/posts/[id]/comments — 获取文章已审核评论（公开）
 * POST /api/posts/[id]/comments — 提交新评论（无需登录，待审状态）
 */

import { NextRequest, NextResponse } from 'next/server'
import { findApprovedComments, insertComment } from '@/lib/db/dao/commentDao'
import { findPostById } from '@/lib/db/dao/postDao'
import { z } from 'zod'

const submitSchema = z.object({
  author_name: z.string().min(1).max(50),
  author_email: z.string().email().optional().or(z.literal('')),
  content: z.string().min(1).max(2000),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const postId = Number(id)
  if (isNaN(postId)) return NextResponse.json({ error: 'Invalid post id' }, { status: 400 })

  try {
    const comments = await findApprovedComments(postId)
    return NextResponse.json(comments)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const postId = Number(id)
  if (isNaN(postId)) return NextResponse.json({ error: 'Invalid post id' }, { status: 400 })

  // 确认文章存在
  const post = await findPostById(postId)
  if (!post || post.status !== 'published') {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const parsed = submitSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    await insertComment({
      post_id: postId,
      author_name: parsed.data.author_name,
      author_email: parsed.data.author_email || undefined,
      content: parsed.data.content,
    })
    return NextResponse.json({ message: '评论已提交，待审核后显示' }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

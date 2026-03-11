/**
 * app/api/posts/[id]/route.ts
 *
 * GET    /api/posts/:slug  — 获取单篇文章（slug 或 id）
 * PATCH  /api/posts/:id   — 更新文章（需鉴权）
 * DELETE /api/posts/:id   — 删除文章（需鉴权）
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { findPostBySlug, findPostById, updatePost, deletePost, incrementViewCount } from '@/lib/db/dao/postDao'
import { z } from 'zod'

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/).optional(),
  content: z.record(z.unknown()).optional(),
  excerpt: z.string().optional(),
  coverUrl: z.string().url().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  tags: z.array(z.string()).optional(),
})

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // 支持 slug 或数字 id 查找
  const isNumeric = /^\d+$/.test(id)
  const post = isNumeric ? await findPostById(Number(id)) : await findPostBySlug(id)

  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // 未登录用户不能访问非 published 状态
  const session = await auth()
  if (!session && post.status !== 'published') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // 异步更新浏览量（不阻塞响应）
  if (post.status === 'published') {
    incrementViewCount(post.id).catch(() => {})
  }

  return NextResponse.json(post)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const post = await updatePost(Number(id), parsed.data)
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(post)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const ok = await deletePost(Number(id))
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return new NextResponse(null, { status: 204 })
}

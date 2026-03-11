/**
 * app/api/posts/route.ts
 *
 * GET  /api/posts  — 文章列表（公开）
 * POST /api/posts  — 创建文章（需鉴权）
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { findPosts, insertPost } from '@/lib/db/dao/postDao'
import { z } from 'zod'

const createSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  content: z.record(z.unknown()),
  excerpt: z.string().optional(),
  coverUrl: z.string().url().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  tags: z.array(z.string()).optional(),
})

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const page = Number(searchParams.get('page') ?? 1)
  const pageSize = Math.min(Number(searchParams.get('pageSize') ?? 10), 50)
  const status = searchParams.get('status') as 'draft' | 'published' | 'archived' | null
  const session = await auth()

  try {
    const result = await findPosts({
      page,
      pageSize,
      // 未登录用户只能看已发布的
      status: session ? (status ?? undefined) : 'published',
      tag: searchParams.get('tag') ?? undefined,
      keyword: searchParams.get('keyword') ?? undefined,
    })
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const post = await insertPost(parsed.data)
    return NextResponse.json(post, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    if (msg.includes('unique')) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

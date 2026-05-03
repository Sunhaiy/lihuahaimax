import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import {
  deletePost,
  findPostById,
  findPostBySlug,
  incrementViewCount,
  updatePost,
} from '@/lib/db/dao/postDao'

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/).optional(),
  content: z.record(z.unknown()).optional(),
  excerpt: z.string().optional(),
  coverUrl: z.string().min(1).optional(),
  coverAlt: z.string().max(200).optional(),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(320).optional(),
  isFeatured: z.boolean().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
})

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const isNumeric = /^\d+$/.test(id)
  const post = isNumeric ? await findPostById(Number(id)) : await findPostBySlug(id)

  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const session = await auth()
  if (!session && post.status !== 'published') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

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

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const ok = await deletePost(Number(id))
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return new NextResponse(null, { status: 204 })
}

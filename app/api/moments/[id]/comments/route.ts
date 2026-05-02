import { NextRequest, NextResponse } from 'next/server'
import { getMomentComments, insertMomentComment } from '@/lib/db/dao/momentDao'
import { z } from 'zod'

const commentSchema = z.object({
  authorName: z.string().trim().min(1).max(32),
  content: z.string().trim().min(1).max(500),
})

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const comments = await getMomentComments(Number(id))

  if (!comments) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ data: comments })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json().catch(() => null)
  const parsed = commentSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const comment = await insertMomentComment(Number(id), parsed.data)
  if (!comment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(comment, { status: 201 })
}

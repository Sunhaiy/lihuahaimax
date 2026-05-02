import { NextRequest, NextResponse } from 'next/server'
import { toggleMomentLike } from '@/lib/db/dao/momentDao'
import { z } from 'zod'

const likeSchema = z.object({
  visitorKey: z.string().min(12).max(128),
})

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json().catch(() => null)
  const parsed = likeSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid visitor key' }, { status: 400 })
  }

  const summary = await toggleMomentLike(Number(id), parsed.data.visitorKey)
  if (!summary) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(summary)
}

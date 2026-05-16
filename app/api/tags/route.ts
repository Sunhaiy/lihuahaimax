import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { findAllTags, renameTag, resetTag } from '@/lib/db/dao/postDao'

export async function GET() {
  try {
    const tags = await findAllTags()
    return NextResponse.json(tags)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = z
    .object({
      oldName: z.string().min(1),
      newName: z.string().min(1).max(50),
    })
    .safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { oldName, newName } = parsed.data
  const count = await renameTag(oldName, newName)
  return NextResponse.json({ updated: count })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = z.object({ name: z.string().min(1) }).safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const count = await resetTag(parsed.data.name)
  return NextResponse.json({ updated: count })
}

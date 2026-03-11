/**
 * app/api/links/[id]/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { findLinkById, updateLink, deleteLink } from '@/lib/db/dao/linkDao'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  url: z.string().url().optional(),
  description: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  category: z.enum(['friend', 'tool', 'resource', 'inspire', 'other']).optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const parsed = updateSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const link = await updateLink(Number(id), parsed.data)
  if (!link) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(link)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const ok = await deleteLink(Number(id))
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return new NextResponse(null, { status: 204 })
}

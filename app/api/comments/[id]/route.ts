/**
 * app/api/comments/[id]/route.ts
 *
 * PATCH  /api/comments/[id] — 审核通过（管理员）
 * DELETE /api/comments/[id] — 删除评论（管理员）
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { approveComment, deleteComment } from '@/lib/db/dao/commentDao'

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const commentId = Number(id)
  if (isNaN(commentId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const ok = await approveComment(commentId)
  if (!ok) return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
  return NextResponse.json({ message: 'Approved' })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const commentId = Number(id)
  if (isNaN(commentId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const ok = await deleteComment(commentId)
  if (!ok) return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
  return new NextResponse(null, { status: 204 })
}

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { updateLinkSubmission } from '@/lib/db/dao/linkSubmissionDao'

const updateSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  adminNote: z.string().trim().max(500).nullable().optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = updateSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { id } = await params
  const submission = await updateLinkSubmission(Number(id), parsed.data)

  if (!submission) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(submission)
}

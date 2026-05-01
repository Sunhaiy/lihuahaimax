import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { findWorkById, updateWork, deleteWork } from '@/lib/db/dao/worksDao'
import { updateWorkSchema } from '@/lib/validation/work'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const { id } = await params
  const work = await findWorkById(Number(id))

  if (!work) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (!work.is_published && !session) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(work)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = updateWorkSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { id } = await params

  try {
    const work = await updateWork(Number(id), parsed.data)
    if (!work) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(work)
  } catch (error) {
    console.error('[works.update]', error)
    return NextResponse.json({ error: 'Failed to update work' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const ok = await deleteWork(Number(id))

  if (!ok) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return new NextResponse(null, { status: 204 })
}

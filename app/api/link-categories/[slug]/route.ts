import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { deleteLinkCategory } from '@/lib/db/dao/linkCategoryDao'

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params
  const result = await deleteLinkCategory(decodeURIComponent(slug))
  if (!result.deleted) {
    return NextResponse.json({ error: 'Category not found or cannot be deleted' }, { status: 400 })
  }

  return NextResponse.json(result)
}

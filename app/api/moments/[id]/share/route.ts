import { NextRequest, NextResponse } from 'next/server'
import { incrementMomentShare } from '@/lib/db/dao/momentDao'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const summary = await incrementMomentShare(Number(id))

  if (!summary) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(summary)
}

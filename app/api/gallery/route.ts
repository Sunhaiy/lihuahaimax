/**
 * app/api/gallery/route.ts
 *
 * GET /api/gallery — 相册列表
 */

import { NextRequest, NextResponse } from 'next/server'
import { findGalleryItems } from '@/lib/db/dao/galleryDao'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const result = await findGalleryItems({
    page: Number(searchParams.get('page') ?? 1),
    pageSize: Number(searchParams.get('pageSize') ?? 30),
    category: searchParams.get('category') ?? undefined,
    tag: searchParams.get('tag') ?? undefined,
    featuredOnly: searchParams.get('featured') === 'true',
  })
  return NextResponse.json(result)
}

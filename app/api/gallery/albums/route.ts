import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { findGalleryAlbums, insertGalleryAlbum } from '@/lib/db/dao/galleryAlbumDao'

const createAlbumSchema = z.object({
  name: z.string().trim().min(1, 'Album name is required'),
  slug: z.string().trim().optional(),
  description: z.string().trim().optional(),
  sortOrder: z.number().int().optional(),
})

export async function GET() {
  const albums = await findGalleryAlbums()
  return NextResponse.json(albums)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parsed = createAlbumSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const album = await insertGalleryAlbum(parsed.data)
  return NextResponse.json(album, { status: 201 })
}

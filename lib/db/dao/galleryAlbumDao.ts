import { withTransaction } from '@/lib/db'
import type { CreateGalleryAlbumInput, GalleryAlbumRow } from '@/types/gallery'

function slugifyAlbum(value: string) {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/['"`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || 'album'
}

export async function findGalleryAlbums(): Promise<GalleryAlbumRow[]> {
  return withTransaction(async (client) => {
    const result = await client.query<GalleryAlbumRow>(
      `SELECT id, name, slug, description, cover_image_url, sort_order, created_at
       FROM gallery_albums
       ORDER BY sort_order ASC, created_at DESC`
    )
    return result.rows
  })
}

export async function insertGalleryAlbum(input: CreateGalleryAlbumInput): Promise<GalleryAlbumRow> {
  const desiredSlug = slugifyAlbum(input.slug || input.name)

  return withTransaction(async (client) => {
    let slug = desiredSlug
    let suffix = 2

    while (true) {
      const exists = await client.query<{ id: number }>(
        `SELECT id FROM gallery_albums WHERE slug = $1 LIMIT 1`,
        [slug]
      )

      if (exists.rowCount === 0) break

      slug = `${desiredSlug}-${suffix}`
      suffix += 1
    }

    const result = await client.query<GalleryAlbumRow>(
      `INSERT INTO gallery_albums (name, slug, description, cover_image_url, sort_order)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, slug, description, cover_image_url, sort_order, created_at`,
      [
        input.name.trim(),
        slug,
        input.description?.trim() || null,
        input.coverImageUrl?.trim() || null,
        input.sortOrder ?? 0,
      ]
    )

    return result.rows[0]
  })
}

export async function deleteGalleryAlbum(id: number): Promise<void> {
  await withTransaction(async (client) => {
    await client.query(`DELETE FROM gallery_albums WHERE id = $1`, [id])
  })
}

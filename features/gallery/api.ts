import type {
  CreateGalleryAlbumInput,
  GalleryAlbumRow,
  GalleryItemRow,
  UpdateGalleryItemInput,
} from './types'

export async function fetchGalleryItems(params: {
  page?: number
  pageSize?: number
  category?: string
  tag?: string
  albumId?: number
} = {}) {
  const qs = new URLSearchParams(
    Object.entries(params)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, String(value)])
  )

  const res = await fetch(`/api/gallery?${qs}`)
  if (!res.ok) throw new Error('Failed to fetch gallery items')
  return res.json() as Promise<{ data: GalleryItemRow[]; total: number }>
}

export async function fetchGalleryAlbums() {
  const res = await fetch('/api/gallery/albums')
  if (!res.ok) throw new Error('Failed to fetch gallery albums')
  return res.json() as Promise<GalleryAlbumRow[]>
}

export async function createGalleryAlbum(input: CreateGalleryAlbumInput): Promise<GalleryAlbumRow> {
  const res = await fetch('/api/gallery/albums', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  if (!res.ok) throw new Error('Failed to create gallery album')
  return res.json()
}

export async function deleteGalleryAlbum(id: number): Promise<void> {
  const res = await fetch(`/api/gallery/albums?id=${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete gallery album')
}

export async function uploadGalleryImage(
  file: File,
  meta?: {
    title?: string
    description?: string
    tags?: string[]
    category?: string
  }
): Promise<GalleryItemRow> {
  const form = new FormData()
  form.append('file', file)
  if (meta?.title) form.append('title', meta.title)
  if (meta?.description) form.append('description', meta.description)
  if (meta?.tags) form.append('tags', JSON.stringify(meta.tags))
  if (meta?.category) form.append('category', meta.category)

  const res = await fetch('/api/upload', { method: 'POST', body: form })
  if (!res.ok) throw new Error('Failed to upload image')
  return res.json()
}

export async function updateGalleryItem(id: number, input: UpdateGalleryItemInput): Promise<GalleryItemRow> {
  const res = await fetch(`/api/gallery/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  if (!res.ok) throw new Error('Failed to update gallery item')
  return res.json()
}

export async function deleteGalleryItem(id: number): Promise<void> {
  const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete gallery item')
}

import type { GalleryItem, UpdateGalleryItemInput } from './types'

export async function fetchGalleryItems(params: {
  page?: number
  pageSize?: number
  category?: string
  tag?: string
} = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
  )
  const res = await fetch(`/api/gallery?${qs}`)
  if (!res.ok) throw new Error('Failed to fetch gallery items')
  return res.json() as Promise<{ data: GalleryItem[]; total: number }>
}

/**
 * 上传图片文件（multipart/form-data）
 */
export async function uploadGalleryImage(file: File, meta?: {
  title?: string
  description?: string
  tags?: string[]
  category?: string
}): Promise<GalleryItem> {
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

export async function updateGalleryItem(id: number, input: UpdateGalleryItemInput): Promise<GalleryItem> {
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

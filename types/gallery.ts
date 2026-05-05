export type GalleryCategory = 'photo' | 'artwork' | 'screenshot' | 'other'

export interface ExifData {
  make: string | null
  model: string | null
  lensModel: string | null
  focalLength: number | null
  focalLengthIn35mm: number | null
  aperture: number | null
  shutterSpeed: string | null
  iso: number | null
  flash: string | null
  software: string | null
  dateTimeOriginal: string | null
  gpsLatitude: number | null
  gpsLongitude: number | null
  gpsAltitude: number | null
}

export interface GalleryAlbumRow {
  id: number
  name: string
  slug: string
  description: string | null
  cover_image_url: string | null
  sort_order: number
  created_at: Date
}

export interface GalleryAlbum {
  id: number
  name: string
  slug: string
  description: string | null
  coverImageUrl: string | null
  sortOrder: number
  createdAt: string
}

export interface GalleryItemRow {
  id: number
  title: string | null
  description: string | null
  url: string
  thumbnail_url: string | null
  width: number | null
  height: number | null
  file_size: number | null
  file_name: string
  category: GalleryCategory
  exif: ExifData | null
  tags: string[]
  is_featured: boolean
  sort_order: number
  album_id: number | null
  created_at: Date
}

export interface GalleryItem {
  id: number
  title: string | null
  description: string | null
  url: string
  thumbnailUrl: string | null
  width: number | null
  height: number | null
  fileSize: number | null
  fileName: string
  category: GalleryCategory
  exif: ExifData | null
  tags: string[]
  isFeatured: boolean
  sortOrder: number
  albumId: number | null
  createdAt: string
}

export interface CreateGalleryAlbumInput {
  name: string
  slug?: string
  description?: string
  coverImageUrl?: string
  sortOrder?: number
}

export interface CreateGalleryItemInput {
  title?: string
  description?: string
  url: string
  thumbnailUrl?: string
  width?: number
  height?: number
  fileSize?: number
  fileName: string
  category?: GalleryCategory
  exif?: ExifData
  tags?: string[]
  isFeatured?: boolean
  sortOrder?: number
  albumId?: number | null
}

export type UpdateGalleryItemInput = Partial<Omit<CreateGalleryItemInput, 'url' | 'fileName'>>

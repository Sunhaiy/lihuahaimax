export type PostStatus = 'draft' | 'published' | 'archived'

export interface PostRow {
  id: number
  title: string
  slug: string
  content: object
  excerpt: string | null
  cover_url: string | null
  cover_alt: string | null
  seo_title: string | null
  seo_description: string | null
  is_featured: boolean
  status: PostStatus
  tags: string[]
  category: string
  view_count: number
  created_at: Date
  updated_at: Date
  published_at: Date | null
}

export interface Post {
  id: number
  title: string
  slug: string
  content: object
  excerpt: string | null
  coverUrl: string | null
  coverAlt: string | null
  seoTitle: string | null
  seoDescription: string | null
  isFeatured: boolean
  status: PostStatus
  tags: string[]
  category: string
  viewCount: number
  createdAt: string
  updatedAt: string
  publishedAt: string | null
}

export type PostListItem = Omit<Post, 'content'>

export interface CreatePostInput {
  title: string
  slug: string
  content: object
  excerpt?: string
  coverUrl?: string
  coverAlt?: string
  seoTitle?: string
  seoDescription?: string
  isFeatured?: boolean
  status?: PostStatus
  tags?: string[]
  category?: string
}

export type UpdatePostInput = Partial<CreatePostInput>

export interface PostQueryParams {
  page?: number
  pageSize?: number
  status?: PostStatus
  tag?: string
  tags?: string[]
  category?: string
  keyword?: string
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

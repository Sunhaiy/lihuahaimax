// ============================================================
// 文章 (Post) 类型定义
// ============================================================

/** 文章状态 */
export type PostStatus = 'draft' | 'published' | 'archived'

/** 文章在数据库中的原始形态（snake_case，与 SQL 列名一致） */
export interface PostRow {
  id: number
  title: string
  slug: string
  /** Tiptap JSON 内容，存为 JSONB */
  content: object
  excerpt: string | null
  cover_url: string | null
  status: PostStatus
  tags: string[]
  view_count: number
  created_at: Date
  updated_at: Date
  published_at: Date | null
}

/** 前端使用的驼峰形态 */
export interface Post {
  id: number
  title: string
  slug: string
  content: object
  excerpt: string | null
  coverUrl: string | null
  status: PostStatus
  tags: string[]
  viewCount: number
  createdAt: string
  updatedAt: string
  publishedAt: string | null
}

/** 文章列表项（不含完整 content） */
export type PostListItem = Omit<Post, 'content'>

/** 创建文章的输入 */
export interface CreatePostInput {
  title: string
  slug: string
  content: object
  excerpt?: string
  coverUrl?: string
  status?: PostStatus
  tags?: string[]
}

/** 更新文章的输入 */
export type UpdatePostInput = Partial<CreatePostInput>

/** 文章列表查询参数 */
export interface PostQueryParams {
  page?: number
  pageSize?: number
  status?: PostStatus
  tag?: string
  keyword?: string
}

/** 分页结果包装 */
export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

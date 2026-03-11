// ============================================================
// 友情链接 (Link) 类型定义
// ============================================================

export type LinkCategory = 'friend' | 'tool' | 'resource' | 'inspire' | 'other'

export interface LinkRow {
  id: number
  name: string
  url: string
  description: string | null
  avatar_url: string | null
  category: LinkCategory
  sort_order: number
  is_active: boolean
  created_at: Date
}

export interface Link {
  id: number
  name: string
  url: string
  description: string | null
  avatarUrl: string | null
  category: LinkCategory
  sortOrder: number
  isActive: boolean
  createdAt: string
}

export interface CreateLinkInput {
  name: string
  url: string
  description?: string
  avatarUrl?: string
  category?: LinkCategory
  sortOrder?: number
  isActive?: boolean
}

export type UpdateLinkInput = Partial<CreateLinkInput>

// ============================================================
// 友情链接 (Link) 类型定义
// ============================================================

export type LinkCategory = string

export interface LinkCategoryRow {
  slug: string
  label: string
  description: string | null
  icon: string | null
  sort_order: number
  is_default: boolean
  link_count: number
  created_at: Date
}

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

export type LinkSubmissionStatus = 'pending' | 'approved' | 'rejected'

export interface LinkSubmissionRow {
  id: number
  site_name: string
  site_url: string
  site_description: string | null
  site_avatar_url: string | null
  site_rss_url: string | null
  contact_email: string
  contact_note: string | null
  status: LinkSubmissionStatus
  admin_note: string | null
  reviewed_at: Date | null
  created_at: Date
}

export interface CreateLinkSubmissionInput {
  siteName: string
  siteUrl: string
  siteDescription?: string
  siteAvatarUrl?: string
  siteRssUrl?: string
  contactEmail: string
  contactNote?: string
}

export interface UpdateLinkSubmissionInput {
  status?: LinkSubmissionStatus
  adminNote?: string | null
}

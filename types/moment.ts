export type MomentType =
  | 'text'
  | 'image'
  | 'sleep'
  | 'steps'
  | 'heartrate'
  | 'mood'
  | 'link'

export interface MiBandSleepData {
  sleepStart: string
  sleepEnd: string
  deepSleepMinutes: number
  lightSleepMinutes: number
  remMinutes: number
  score: number | null
}

export interface MiBandStepsData {
  steps: number
  distance: number
  calories: number
  activeMinutes: number
}

export interface MomentRow {
  id: number
  type: MomentType
  content: string | null
  images: string[]
  meta: Record<string, unknown> | null
  mood: string | null
  weather: string | null
  location: string | null
  is_public: boolean
  share_count: number
  like_count: number
  comment_count: number
  created_at: Date
}

export interface Moment {
  id: number
  type: MomentType
  content: string | null
  images: string[]
  meta: Record<string, unknown> | null
  mood: string | null
  weather: string | null
  location: string | null
  isPublic: boolean
  shareCount: number
  likeCount: number
  commentCount: number
  createdAt: string
}

export interface CreateMomentInput {
  type: MomentType
  content?: string
  images?: string[]
  meta?: Record<string, unknown>
  mood?: string
  weather?: string
  location?: string
  isPublic?: boolean
}

export type UpdateMomentInput = Partial<CreateMomentInput>

export interface MomentCommentRow {
  id: number
  moment_id: number
  author_name: string
  content: string
  created_at: Date
}

export interface MomentComment {
  id: number
  momentId: number
  authorName: string
  content: string
  createdAt: string
}

export interface CreateMomentCommentInput {
  authorName: string
  content: string
}

export interface MomentEngagementSummary {
  momentId: number
  likeCount: number
  commentCount: number
  shareCount: number
  liked: boolean
}

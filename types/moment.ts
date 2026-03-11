// ============================================================
// 极客瞬间 (Moment) 类型定义
// ============================================================

/** 瞬间类型 —— 便于前端差异化渲染 */
export type MomentType =
  | 'text'       // 纯文字随想
  | 'image'      // 图片配文
  | 'sleep'      // 小米手环睡眠数据
  | 'steps'      // 小米手环步数数据
  | 'heartrate'  // 小米手环心率数据
  | 'mood'       // 心情打卡
  | 'link'       // 分享链接

/** 小米手环睡眠数据结构（预留） */
export interface MiBandSleepData {
  sleepStart: string  // ISO8601
  sleepEnd: string    // ISO8601
  deepSleepMinutes: number
  lightSleepMinutes: number
  remMinutes: number
  score: number | null
}

/** 小米手环步数数据结构（预留） */
export interface MiBandStepsData {
  steps: number
  distance: number   // 米
  calories: number   // 千卡
  activeMinutes: number
}

/** 数据库原始行 */
export interface MomentRow {
  id: number
  type: MomentType
  content: string | null
  images: string[]
  /** 扩展数据，如手环数据，存为 JSONB */
  meta: Record<string, unknown> | null
  mood: string | null
  weather: string | null
  location: string | null
  is_public: boolean
  created_at: Date
}

/** 前端使用的驼峰形态 */
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
  createdAt: string
}

/** 创建瞬间的输入 */
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

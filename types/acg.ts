// ============================================================
// 数字陈列室 (ACG) 类型定义
// ============================================================

// --------------------------------
// 动漫 (Anime)
// --------------------------------

export type AnimeStatus = 'watching' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_watch'
export type AnimeType = 'tv' | 'movie' | 'ova' | 'special'

export interface AnimeRow {
  id: number
  title: string
  title_cn: string | null
  cover_url: string | null
  type: AnimeType
  episodes_total: number | null
  episodes_watched: number
  status: AnimeStatus
  rating: number | null        // 1-10，可为空
  short_review: string | null  // 毒舌简评
  start_season: string | null  // e.g. "2024春"
  mal_id: number | null        // MyAnimeList ID，便于未来对接数据
  created_at: Date
  updated_at: Date
}

export interface Anime {
  id: number
  title: string
  titleCn: string | null
  coverUrl: string | null
  type: AnimeType
  episodesTotal: number | null
  episodesWatched: number
  status: AnimeStatus
  rating: number | null
  shortReview: string | null
  startSeason: string | null
  malId: number | null
  createdAt: string
  updatedAt: string
}

export interface CreateAnimeInput {
  title: string
  titleCn?: string
  coverUrl?: string
  type?: AnimeType
  episodesTotal?: number
  episodesWatched?: number
  status?: AnimeStatus
  rating?: number
  shortReview?: string
  startSeason?: string
  malId?: number
}

export type UpdateAnimeInput = Partial<CreateAnimeInput>

// --------------------------------
// 游戏 (Game)
// --------------------------------

export type GameStatus = 'playing' | 'completed' | 'abandoned' | 'plan_to_play' | 'platinum'
export type GamePlatform = 'pc' | 'ps5' | 'ps4' | 'switch' | 'xbox' | 'mobile' | 'other'

export interface GameRow {
  id: number
  title: string
  cover_url: string | null
  cartridge_image_url: string | null  // 3D 卡带翻转用图
  platform: GamePlatform
  status: GameStatus
  play_hours: number | null           // 游玩时长（小时）
  rating: number | null
  short_review: string | null
  completed_at: Date | null
  created_at: Date
  updated_at: Date
}

export interface Game {
  id: number
  title: string
  coverUrl: string | null
  cartridgeImageUrl: string | null
  platform: GamePlatform
  status: GameStatus
  playHours: number | null
  rating: number | null
  shortReview: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateGameInput {
  title: string
  coverUrl?: string
  cartridgeImageUrl?: string
  platform?: GamePlatform
  status?: GameStatus
  playHours?: number
  rating?: number
  shortReview?: string
  completedAt?: string
}

export type UpdateGameInput = Partial<CreateGameInput>

// ============================================================
// 光影相册 (Gallery) 类型定义
// ============================================================

/** 相册类型 */
export type GalleryCategory = 'photo' | 'artwork' | 'screenshot' | 'other'

/** 从 EXIF 解析出的相机信息 */
export interface ExifData {
  make: string | null           // 相机品牌，如 "Apple"
  model: string | null          // 相机型号，如 "iPhone 15 Pro"
  lensModel: string | null      // 镜头型号
  focalLength: number | null    // 焦段 (mm)
  focalLengthIn35mm: number | null
  aperture: number | null       // 光圈值 f/x
  shutterSpeed: string | null   // 快门速度，如 "1/250"
  iso: number | null            // ISO 感光度
  flash: string | null          // 闪光灯状态
  software: string | null       // 处理软件
  dateTimeOriginal: string | null  // 拍摄时间 ISO8601
  gpsLatitude: number | null    // 纬度
  gpsLongitude: number | null   // 经度
  gpsAltitude: number | null    // 海拔
}

/** 数据库原始行 */
export interface GalleryItemRow {
  id: number
  title: string | null
  description: string | null
  url: string                   // 对外访问 URL（/uploads/...）
  thumbnail_url: string | null  // 缩略图 URL
  width: number | null
  height: number | null
  file_size: number | null      // 字节
  file_name: string             // 原始文件名
  category: GalleryCategory
  exif: ExifData | null         // JSONB
  tags: string[]
  is_featured: boolean
  sort_order: number
  created_at: Date
}

/** 前端使用的驼峰形态 */
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
  createdAt: string
}

/** 上传图片时的元数据输入 */
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
}

export type UpdateGalleryItemInput = Partial<Omit<CreateGalleryItemInput, 'url' | 'fileName'>>

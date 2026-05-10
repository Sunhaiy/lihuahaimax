/**
 * lib/storage/LocalStorage.ts
 *
 * 本地文件系统存储实现（默认方案）。
 * 文件保存到 process.env.UPLOAD_DIR（默认 ./public/uploads）。
 * 对外通过 /uploads/... 路径访问（Next.js static file serving）。
 */

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import type { StorageService, UploadResult } from './StorageService'

export class LocalStorage implements StorageService {
  private readonly uploadDir: string
  private readonly publicPath: string

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR
      ? path.resolve(process.env.UPLOAD_DIR)
      : path.join(process.cwd(), 'public', 'uploads')

    this.publicPath = process.env.UPLOAD_PUBLIC_PATH ?? '/uploads'
  }

  async upload(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    subDir = ''
  ): Promise<UploadResult> {
    // 按年/月分目录，避免单目录文件过多
    const now = new Date()
    const dateDir = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`
    const targetDir = path.join(this.uploadDir, subDir, dateDir)

    // 确保目录存在
    fs.mkdirSync(targetDir, { recursive: true })

    // 生成唯一文件名（避免冲突）
    const ext = path.extname(originalName).toLowerCase() || this.extFromMime(mimeType)
    const hash = crypto.randomBytes(8).toString('hex')
    const fileName = `${hash}${ext}`
    const absolutePath = path.join(targetDir, fileName)

    // 写入磁盘
    fs.writeFileSync(absolutePath, buffer)

    // 拼接对外访问 URL
    const relativePath = path.posix.join(
      this.publicPath,
      subDir,
      dateDir,
      fileName
    )

    return {
      url: relativePath,
      absolutePath,
      fileName,
      fileSize: buffer.length,
      mimeType,
    }
  }

  async delete(url: string): Promise<void> {
    // 将 URL 反推回本地路径
    const relativePart = url.replace(this.publicPath, '')
    const absolutePath = path.join(this.uploadDir, relativePart)

    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath)
    }
  }

  async exists(url: string): Promise<boolean> {
    const relativePart = url.replace(this.publicPath, '')
    const absolutePath = path.join(this.uploadDir, relativePart)
    return fs.existsSync(absolutePath)
  }

  private extFromMime(mimeType: string): string {
    const map: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'image/avif': '.avif',
      'video/mp4': '.mp4',
      'video/webm': '.webm',
      'video/ogg': '.ogv',
      'video/quicktime': '.mov',
    }
    return map[mimeType] ?? ''
  }
}

// 导出单例
export const storage: StorageService = new LocalStorage()

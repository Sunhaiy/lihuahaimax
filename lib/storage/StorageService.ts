/**
 * lib/storage/StorageService.ts
 *
 * 存储服务抽象接口。
 *
 * 设计原则：当前使用 Node.js fs 本地存储，
 * 若未来需要切换到 S3 / R2 / 阿里 OSS，
 * 只需新增一个实现类，业务层代码一行不改。
 */

export interface UploadResult {
  /** 对外访问 URL（如 /uploads/2024/08/image.jpg） */
  url: string
  /** 服务器上的绝对路径（内部使用） */
  absolutePath: string
  /** 文件名 */
  fileName: string
  /** 文件大小（字节） */
  fileSize: number
  /** MIME 类型 */
  mimeType: string
}

export interface StorageService {
  /**
   * 上传文件
   * @param buffer 文件内容
   * @param originalName 原始文件名（用于提取扩展名）
   * @param mimeType MIME 类型
   * @param subDir 子目录（可选，如 'covers', 'gallery'）
   */
  upload(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    subDir?: string
  ): Promise<UploadResult>

  /**
   * 删除文件
   * @param url 对外访问 URL
   */
  delete(url: string): Promise<void>

  /**
   * 检查文件是否存在
   */
  exists(url: string): Promise<boolean>
}

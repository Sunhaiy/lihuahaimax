/**
 * app/dashboard/gallery/page.tsx
 *
 * 相册管理 — 上传 + 瀑布流展示。
 */

'use client'

import { useRef } from 'react'
import { useGalleryItems, useUploadImage, useDeleteGalleryItem } from '@/features/gallery/hooks'
import { Button } from '@/components/ui/Button'
import { GalleryImageSkeleton } from '@/components/ui/Skeleton'

export default function DashboardGalleryPage() {
  const { data, isLoading, mutate } = useGalleryItems({ pageSize: 60 })
  const { trigger: upload, isMutating: uploading } = useUploadImage()
  const { trigger: deleteItem } = useDeleteGalleryItem()
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    for (const file of files) {
      await upload({ file })
    }
    mutate()
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleDelete(id: number) {
    if (!confirm('确定删除这张图片吗？该操作不可撤销。')) return
    await deleteItem(id)
    mutate()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">相册管理</h1>
        <div className="flex items-center gap-3">
          {uploading && <span className="text-xs text-muted-foreground">上传中…</span>}
          <Button size="sm" onClick={() => fileRef.current?.click()}>
            上传图片
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFiles}
          />
        </div>
      </div>

      {/* 拖放提示区 */}
      <div
        className="border-2 border-dashed border-white/10 rounded-surface p-10 text-center mb-8
                   hover:border-ocean/30 transition-colors cursor-pointer"
        onClick={() => fileRef.current?.click()}
      >
        <p className="text-muted-foreground text-sm">
          点击或将图片拖拽到此处上传
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          支持 JPEG, PNG, WebP, AVIF（最大 20MB）
        </p>
      </div>

      {/* 图片网格 */}
      {isLoading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <GalleryImageSkeleton key={i} className="aspect-square" />
          ))}
        </div>
      ) : data?.data?.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">暂无图片。</div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {data?.data?.map((item: { id: number; thumbnail_url: string | null; url: string; file_name: string; title: string | null }) => (
            <div key={item.id} className="group relative aspect-square">
              <div className="w-full h-full rounded-card overflow-hidden bg-white/5">
                <img
                  src={item.thumbnail_url ?? item.url}
                  alt={item.title ?? item.file_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="absolute top-1 right-1 w-6 h-6 rounded flex items-center justify-center
                           bg-red-500/80 text-white text-xs opacity-0 group-hover:opacity-100
                           transition-opacity hover:bg-red-500"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

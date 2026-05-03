'use client'

import { useRef, useState } from 'react'
import {
  AdminEmptyState,
  AdminListToolbar,
  AdminNotice,
  AdminPageHeader,
  AdminPanel,
  AdminStatusBadge,
} from '@/components/admin/AdminPrimitives'
import { Button } from '@/components/ui/Button'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'
import { GalleryImageSkeleton } from '@/components/ui/Skeleton'
import { useDeleteGalleryItem, useGalleryItems, useUploadImage } from '@/features/gallery/hooks'

export default function DashboardGalleryPage() {
  const { data, isLoading, mutate } = useGalleryItems({ pageSize: 60 })
  const { trigger: upload, isMutating: uploading } = useUploadImage()
  const { trigger: deleteItem } = useDeleteGalleryItem()
  const fileRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')

  const items = data?.data ?? []

  async function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    if (!files.length) return

    setError('')

    try {
      for (const file of files) {
        await upload({ file })
      }
      await mutate()
    } catch (err) {
      setError(err instanceof Error ? err.message : '图片上传失败')
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('确定删除这张图片吗？该操作不可撤销。')) return

    setError('')

    try {
      await deleteItem(id)
      await mutate()
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除图片失败')
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Gallery Library"
        title="相册管理"
        description="上传、整理和删除图像资源。这里不再保留旧式卡片拼贴感，而是统一回后台的资料库与批量工作节奏。"
        actions={
          <Button onClick={() => fileRef.current?.click()} loading={uploading}>
            <MaterialSymbol icon="upload" size={18} />
            {uploading ? '上传中' : '上传图片'}
          </Button>
        }
        meta={
          <>
            <AdminStatusBadge tone="accent">{items.length} 张图片</AdminStatusBadge>
            <AdminStatusBadge tone="neutral">批量上传</AdminStatusBadge>
          </>
        }
      />

      {error ? <AdminNotice tone="danger">{error}</AdminNotice> : null}

      <AdminListToolbar className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <AdminStatusBadge tone="neutral">支持 JPEG / PNG / WebP / AVIF</AdminStatusBadge>
          <AdminStatusBadge tone="neutral">单张上限 20MB</AdminStatusBadge>
        </div>
        <p className="text-sm text-muted-foreground">点击上传按钮，或直接点击下方上传面板。</p>
      </AdminListToolbar>

      <AdminPanel
        title="上传面板"
        description="这里专门负责把图片纳入资源库，和下方图库浏览区分开。"
        icon="image_arrow_up"
      >
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex w-full flex-col items-center justify-center rounded-[26px] border border-dashed border-border/70 bg-background/34 px-6 py-14 text-center transition-colors hover:border-primary/18 hover:bg-background/44"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border/70 bg-background/55 text-primary">
            <MaterialSymbol icon="cloud_upload" size={26} />
          </span>
          <p className="mt-5 text-sm font-medium text-foreground">点击选择图片，或把文件拖到这里</p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            上传完成后会自动刷新图库。这里不再用旧的悬浮块样式，而是作为一块明确的资源入口。
          </p>
        </button>
      </AdminPanel>

      <AdminPanel
        title="图库浏览"
        description="按统一网格浏览最近上传的图片，删除操作保持轻但明确。"
        icon="photo_library"
      >
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <GalleryImageSkeleton key={index} className="aspect-square rounded-[22px]" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <AdminEmptyState
            icon="imagesmode"
            title="还没有图片"
            description="先上传几张图，图库浏览区会在这里建立起来。"
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
            {items.map((item: { id: number; thumbnail_url: string | null; url: string; file_name: string; title: string | null }) => (
              <article
                key={item.id}
                className="group overflow-hidden rounded-[22px] border border-border/70 bg-background/36 transition-colors hover:border-primary/18 hover:bg-background/48"
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={item.thumbnail_url ?? item.url}
                    alt={item.title ?? item.file_name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  <button
                    onClick={() => void handleDelete(item.id)}
                    className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-xl border border-red-500/20 bg-black/45 text-red-300 opacity-0 backdrop-blur-md transition-all hover:bg-red-500/18 group-hover:opacity-100"
                    title="删除图片"
                  >
                    <MaterialSymbol icon="delete" size={16} />
                  </button>
                </div>
                <div className="px-3 py-3">
                  <p className="truncate text-xs font-medium text-foreground">{item.title ?? item.file_name}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </AdminPanel>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFiles}
      />
    </div>
  )
}

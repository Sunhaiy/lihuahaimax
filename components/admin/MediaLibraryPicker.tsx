'use client'

import { useMemo, useRef, useState } from 'react'
import { useGalleryItems, useUploadImage } from '@/features/gallery/hooks'
import type { GalleryCategory, GalleryItem } from '@/types/gallery'
import { Button } from '@/components/ui/Button'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'
import { AdminEmptyState, AdminStatusBadge, ADMIN_INPUT_CLASS } from './AdminPrimitives'

type MediaLibraryPickerProps = {
  value?: string | null
  onSelect: (url: string) => void
  buttonLabel?: string
  dialogTitle?: string
  description?: string
  category?: GalleryCategory
}

export function MediaLibraryPicker({
  value,
  onSelect,
  buttonLabel = '从相册选择',
  dialogTitle = '媒体资源库',
  description = '从已经上传的图片里直接选择，也可以在这里继续补一张新的。',
  category,
}: MediaLibraryPickerProps) {
  const [open, setOpen] = useState(false)
  const [keyword, setKeyword] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const { data, isLoading, mutate } = useGalleryItems({ pageSize: 80, category })
  const { trigger: upload, isMutating: uploading } = useUploadImage()

  const items = useMemo(() => {
    const source = (data?.data ?? []) as GalleryItem[]
    const query = keyword.trim().toLowerCase()
    if (!query) return source

    return source.filter((item) =>
      [item.title, item.fileName, ...(item.tags ?? [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query)
    )
  }, [data?.data, keyword])

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    await upload({ file, meta: { category } })
    await mutate()

    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <MaterialSymbol icon="photo_library" size={16} />
        {buttonLabel}
      </Button>

      {open ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6">
          <button
            type="button"
            className="absolute inset-0 bg-black/56 backdrop-blur-md"
            aria-label="关闭媒体资源库"
            onClick={() => setOpen(false)}
          />

          <div className="relative flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-[30px] border border-white/10 bg-[rgba(18,18,20,0.88)] text-foreground shadow-2xl backdrop-blur-2xl">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 px-5 py-5 sm:px-6">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
                  Media Library
                </p>
                <h3 className="mt-2 text-xl font-semibold text-white">{dialogTitle}</h3>
                <p className="mt-2 text-sm leading-6 text-white/62">{description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => inputRef.current?.click()}
                  loading={uploading}
                >
                  <MaterialSymbol icon="image_arrow_up" size={16} />
                  {uploading ? '上传中' : '上传图片'}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                  <MaterialSymbol icon="close" size={16} />
                  关闭
                </Button>
              </div>
            </div>

            <div className="border-b border-white/10 px-5 py-4 sm:px-6">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[220px] flex-1">
                  <MaterialSymbol
                    icon="search"
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    placeholder="按标题、文件名或标签搜索"
                    className={`${ADMIN_INPUT_CLASS} pl-10`}
                  />
                </div>
                <AdminStatusBadge tone="neutral">{items.length} 张</AdminStatusBadge>
                {value ? <AdminStatusBadge tone="accent">当前已绑定图片</AdminStatusBadge> : null}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              {isLoading ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {Array.from({ length: 12 }).map((_, index) => (
                    <div
                      key={index}
                      className="aspect-[4/3] animate-pulse rounded-[22px] border border-white/10 bg-white/[0.04]"
                    />
                  ))}
                </div>
              ) : items.length === 0 ? (
                <AdminEmptyState
                  icon="imagesmode"
                  title="还没有可用图片"
                  description="先上传一张，后面文章封面、默认封面和资料图都可以直接复用。"
                  action={
                    <Button size="sm" onClick={() => inputRef.current?.click()}>
                      上传第一张
                    </Button>
                  }
                />
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {items.map((item) => {
                    const selected = value === item.url

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onSelect(item.url)
                          setOpen(false)
                        }}
                        className={`group overflow-hidden rounded-[22px] border text-left transition-all duration-300 ${
                          selected
                            ? 'border-primary/28 bg-primary/10'
                            : 'border-white/10 bg-white/[0.03] hover:-translate-y-0.5 hover:border-white/18 hover:bg-white/[0.05]'
                        }`}
                      >
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <img
                            src={item.thumbnailUrl ?? item.url}
                            alt={item.title ?? item.fileName}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                          {selected ? (
                            <span className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-primary/22 bg-primary/18 text-primary">
                              <MaterialSymbol icon="check" size={15} />
                            </span>
                          ) : null}
                        </div>
                        <div className="space-y-1 px-3 py-3">
                          <p className="truncate text-sm font-medium text-white">
                            {item.title || item.fileName}
                          </p>
                          <p className="truncate text-[11px] font-mono text-white/45">{item.url}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
            />
          </div>
        </div>
      ) : null}
    </>
  )
}

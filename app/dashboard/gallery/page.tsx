'use client'

import { useEffect, useRef, useState } from 'react'
import {
  ADMIN_INPUT_CLASS,
  ADMIN_SELECT_CLASS,
  ADMIN_TEXTAREA_CLASS,
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
import {
  useCreateGalleryAlbum,
  useDeleteGalleryAlbum,
  useDeleteGalleryItem,
  useGalleryAlbums,
  useGalleryItems,
  useUpdateGalleryItem,
  useUploadImage,
} from '@/features/gallery/hooks'

type GalleryDashboardAlbum = {
  id: number
  name: string
  slug: string
  description: string | null
}

type GalleryDashboardItem = {
  id: number
  thumbnail_url: string | null
  url: string
  file_name: string
  title: string | null
  description: string | null
  album_id: number | null
}

export default function DashboardGalleryPage() {
  const { data, isLoading, mutate } = useGalleryItems({ pageSize: 60 })
  const { data: albumData, isLoading: albumsLoading, mutate: mutateAlbums } = useGalleryAlbums()
  const { trigger: upload, isMutating: uploading } = useUploadImage()
  const { trigger: createAlbum, isMutating: creatingAlbum } = useCreateGalleryAlbum()
  const { trigger: deleteAlbum, isMutating: deletingAlbum } = useDeleteGalleryAlbum()
  const { trigger: deleteItem } = useDeleteGalleryItem()
  const fileRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const [albumName, setAlbumName] = useState('')
  const [albumSlug, setAlbumSlug] = useState('')
  const [albumDescription, setAlbumDescription] = useState('')

  const items = (data?.data ?? []) as GalleryDashboardItem[]
  const albums = (albumData ?? []) as GalleryDashboardAlbum[]

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
      setError(err instanceof Error ? err.message : '上传图片失败')
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleDeleteItem(id: number) {
    if (!confirm('确定删除这张图片吗？这个操作不可撤销。')) return

    setError('')

    try {
      await deleteItem(id)
      await mutate()
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除图片失败')
    }
  }

  async function handleCreateAlbum(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    try {
      await createAlbum({
        name: albumName,
        slug: albumSlug || undefined,
        description: albumDescription || undefined,
      })
      setAlbumName('')
      setAlbumSlug('')
      setAlbumDescription('')
      await mutateAlbums()
    } catch (err) {
      setError(err instanceof Error ? err.message : '新建相册失败')
    }
  }

  async function handleDeleteAlbum(id: number, name: string) {
    if (!confirm(`确定删除相册「${name}」吗？图片会保留在图库里，只会解除归类。`)) return

    setError('')

    try {
      await deleteAlbum(id)
      await Promise.all([mutateAlbums(), mutate()])
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除相册失败')
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Gallery Library"
        title="相册管理"
        description="先新建自己的相册分类，再把图片归进对应相册。前台左侧的相册集合会直接读取这里的数据。"
        actions={
          <Button onClick={() => fileRef.current?.click()} loading={uploading}>
            <MaterialSymbol icon="upload" size={18} />
            {uploading ? '上传中' : '上传图片'}
          </Button>
        }
        meta={
          <>
            <AdminStatusBadge tone="accent">{items.length} 张图片</AdminStatusBadge>
            <AdminStatusBadge tone="neutral">{albums.length} 个相册</AdminStatusBadge>
          </>
        }
      />

      {error ? <AdminNotice tone="danger">{error}</AdminNotice> : null}

      <AdminListToolbar className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <AdminStatusBadge tone="neutral">支持 JPEG / PNG / WebP / AVIF</AdminStatusBadge>
          <AdminStatusBadge tone="neutral">单张上限 20MB</AdminStatusBadge>
          <AdminStatusBadge tone="neutral">图片可独立绑定相册</AdminStatusBadge>
        </div>
        <p className="text-sm text-muted-foreground">
          图片简介留空时，前台主图下方不会显示任何说明文案。
        </p>
      </AdminListToolbar>

      <AdminPanel
        title="相册分类"
        description="这里的新建相册会成为前台左侧的真实分类。Slug 可选，想控制英文副标题时再填。"
        icon="collections_bookmark"
      >
        <form className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]" onSubmit={handleCreateAlbum}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
                相册名称
              </span>
              <input
                value={albumName}
                onChange={(event) => setAlbumName(event.target.value)}
                className={ADMIN_INPUT_CLASS}
                placeholder="比如：海边日记"
                required
              />
            </label>

            <label className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
                Slug
              </span>
              <input
                value={albumSlug}
                onChange={(event) => setAlbumSlug(event.target.value)}
                className={ADMIN_INPUT_CLASS}
                placeholder="beach-diary"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
                说明
              </span>
              <textarea
                value={albumDescription}
                onChange={(event) => setAlbumDescription(event.target.value)}
                rows={4}
                className={ADMIN_TEXTAREA_CLASS}
                placeholder="可选。写英文短句时会优先作为左侧卡片的小标题。"
              />
            </label>

            <div className="flex items-center justify-end gap-3 md:col-span-2">
              <Button type="submit" loading={creatingAlbum} disabled={!albumName.trim()}>
                <MaterialSymbol icon="create_new_folder" size={18} />
                新建相册
              </Button>
            </div>
          </div>

          <div className="rounded-[24px] border border-border/70 bg-background/36 p-4">
            <p className="text-sm font-medium text-foreground">现有相册</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              新建后就可以在下方图片卡片里直接选择归属相册，也可以在这里直接删除。
            </p>

            <div className="mt-4 space-y-3">
              {albumsLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <GalleryImageSkeleton key={index} className="h-20 rounded-[18px]" />
                ))
              ) : albums.length === 0 ? (
                <AdminEmptyState
                  icon="photo_album"
                  title="还没有自定义相册"
                  description="先建一个分类，前台左侧就能出现新的风格化相册卡。"
                />
              ) : (
                albums.map((album) => (
                  <div
                    key={album.id}
                    className="rounded-[18px] border border-border/70 bg-background/52 px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{album.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">/{album.slug}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <AdminStatusBadge tone="neutral">
                          {items.filter((item) => item.album_id === album.id).length} 张
                        </AdminStatusBadge>
                        <button
                          type="button"
                          onClick={() => void handleDeleteAlbum(album.id, album.name)}
                          disabled={deletingAlbum}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/8 text-red-300 transition-colors hover:bg-red-500/16 disabled:cursor-not-allowed disabled:opacity-60"
                          title="删除相册"
                        >
                          <MaterialSymbol icon="delete" size={16} />
                        </button>
                      </div>
                    </div>
                    {album.description ? (
                      <p className="mt-2 text-xs leading-6 text-muted-foreground">{album.description}</p>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>
        </form>
      </AdminPanel>

      <AdminPanel
        title="上传面板"
        description="先把图片放进图库，后面再逐张归到你自己的相册里。"
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
            上传完成后会自动刷新图库。你可以在下方继续补充简介，并把它归进指定相册。
          </p>
        </button>
      </AdminPanel>

      <AdminPanel
        title="图库编辑"
        description="每张图都可以单独写简介、绑定相册。保存后前台会立刻同步。"
        icon="photo_library"
      >
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="rounded-[24px] border border-border/70 bg-background/36 p-4">
                <GalleryImageSkeleton className="aspect-[16/10] rounded-[18px]" />
                <GalleryImageSkeleton className="mt-4 h-5 w-40 rounded-full" />
                <GalleryImageSkeleton className="mt-3 h-24 w-full rounded-[18px]" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <AdminEmptyState
            icon="imagesmode"
            title="还没有图片"
            description="先上传几张图片，下面就会出现可编辑的图库卡片。"
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {items.map((item) => (
              <GalleryItemEditorCard
                key={item.id}
                item={item}
                albums={albums}
                onDelete={handleDeleteItem}
                onSaved={() => void mutate()}
              />
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

function GalleryItemEditorCard({
  item,
  albums,
  onDelete,
  onSaved,
}: {
  item: GalleryDashboardItem
  albums: GalleryDashboardAlbum[]
  onDelete: (id: number) => Promise<void>
  onSaved: () => void
}) {
  const { trigger: saveItem, isMutating: saving } = useUpdateGalleryItem(item.id)
  const [description, setDescription] = useState(item.description ?? '')
  const [albumId, setAlbumId] = useState(item.album_id ? String(item.album_id) : '')
  const [error, setError] = useState('')

  const dirty =
    description !== (item.description ?? '') || albumId !== (item.album_id ? String(item.album_id) : '')

  useEffect(() => {
    setDescription(item.description ?? '')
    setAlbumId(item.album_id ? String(item.album_id) : '')
  }, [item.album_id, item.description])

  async function handleSave() {
    setError('')

    try {
      await saveItem({
        description: description.trim() || '',
        albumId: albumId ? Number(albumId) : null,
      })
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存图片信息失败')
    }
  }

  return (
    <article className="overflow-hidden rounded-[24px] border border-border/70 bg-background/36">
      <div className="relative aspect-[16/10] overflow-hidden border-b border-border/70">
        <img
          src={item.thumbnail_url ?? item.url}
          alt={item.title ?? item.file_name}
          className="h-full w-full object-cover"
        />
        <button
          onClick={() => void onDelete(item.id)}
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/20 bg-black/45 text-red-300 backdrop-blur-md transition-all hover:bg-red-500/18"
          title="删除图片"
        >
          <MaterialSymbol icon="delete" size={16} />
        </button>
      </div>

      <div className="space-y-4 p-4">
        <div className="space-y-1">
          <p className="truncate text-sm font-medium text-foreground">{item.title ?? item.file_name}</p>
          <p className="text-xs text-muted-foreground">{item.file_name}</p>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
            所属相册
          </label>
          <select
            value={albumId}
            onChange={(event) => setAlbumId(event.target.value)}
            className={ADMIN_SELECT_CLASS}
          >
            <option value="">未归档</option>
            {albums.map((album) => (
              <option key={album.id} value={album.id}>
                {album.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
            图片简介
          </label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            className={ADMIN_TEXTAREA_CLASS}
            placeholder="这张图想展示什么、记录什么，都可以写在这里。留空则前台不显示。"
          />
        </div>

        {error ? <AdminNotice tone="danger">{error}</AdminNotice> : null}

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">保存后，前台说明和相册分类都会直接同步。</p>
          <Button
            variant="secondary"
            size="sm"
            loading={saving}
            disabled={!dirty && !saving}
            onClick={() => void handleSave()}
          >
            <MaterialSymbol icon="save" size={16} />
            保存
          </Button>
        </div>
      </div>
    </article>
  )
}

/**
 * app/(blog)/gallery/page.tsx
 *
 * 光影相册 — 瀑布流 (Masonry) 布局，悬浮展示 EXIF 数据。
 */

import type { Metadata } from 'next'
import { findGalleryItems } from '@/lib/db/dao/galleryDao'

export const metadata: Metadata = { title: '光影相册' }
export const revalidate = 600

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>
}) {
  const { category, page } = await searchParams
  const { data: items } = await findGalleryItems({
    category: category ?? undefined,
    page: Number(page ?? 1),
    pageSize: 60,
  })

  const categories = ['all', 'photo', 'artwork', 'screenshot']

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">光影相册</h1>
      <p className="text-muted-foreground text-sm mb-8">
        {items.length} 张 · 用光和影记录世界的角落
      </p>

      {/* 分类筛选 */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {categories.map((cat) => (
          <a
            key={cat}
            href={cat === 'all' ? '/gallery' : `/gallery?category=${cat}`}
            className={`px-3 py-1 text-sm rounded-base transition-colors border
              ${(category ?? 'all') === cat
                ? 'bg-ocean text-white border-ocean'
                : 'border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground'
              }`}
          >
            {cat === 'all' ? '全部' : { photo: '摄影', artwork: '艺术', screenshot: '截图' }[cat] ?? cat}
          </a>
        ))}
      </div>

      {/* 瀑布流 */}
      {items.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">暂无图片。</div>
      ) : (
        <div className="masonry-3">
          {items.map((item) => (
            <div key={item.id} className="masonry-item group relative cursor-zoom-in">
              <div className="rounded-card overflow-hidden bg-white/5">
                <img
                  src={item.thumbnail_url ?? item.url}
                  alt={item.title ?? item.file_name}
                  className="w-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  loading="lazy"
                />

                {/* EXIF 悬浮信息 */}
                {item.exif && (
                  <div className="absolute inset-0 bg-black/80 rounded-card opacity-0 group-hover:opacity-100
                                  transition-opacity duration-300 flex flex-col justify-end p-4">
                    {item.title && (
                      <p className="text-white text-sm font-medium mb-2">{item.title}</p>
                    )}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[11px] font-mono text-gray-300">
                      {item.exif.make && item.exif.model && (
                        <span className="col-span-2 text-ocean">
                          {item.exif.make} {item.exif.model}
                        </span>
                      )}
                      {item.exif.focalLength && (
                        <span>{item.exif.focalLength}mm</span>
                      )}
                      {item.exif.aperture && (
                        <span>f/{item.exif.aperture}</span>
                      )}
                      {item.exif.shutterSpeed && (
                        <span>{item.exif.shutterSpeed}s</span>
                      )}
                      {item.exif.iso && (
                        <span>ISO {item.exif.iso}</span>
                      )}
                      {item.exif.dateTimeOriginal && (
                        <span className="col-span-2 text-gray-400 text-[10px]">
                          {new Date(item.exif.dateTimeOriginal).toLocaleDateString('zh-CN')}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

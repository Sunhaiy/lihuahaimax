import type { Metadata } from 'next'
import { ImmersiveGallery } from '@/components/ui/ImmersiveGallery'
import { findGalleryItems } from '@/lib/db/dao/galleryDao'

export const metadata: Metadata = {
  title: '光影相册',
  description: '以沉浸式横向画廊的方式浏览收藏的摄影与画面。',
}

export const revalidate = 600

export default async function GalleryPage() {
  const { data: items } = await findGalleryItems({
    page: 1,
    pageSize: 120,
  })

  return <ImmersiveGallery items={items} />
}

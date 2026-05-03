import type { Metadata } from 'next'
import { WorksCarousel } from '@/components/ui/WorksCarousel'
import { findWorks } from '@/lib/db/dao/worksDao'

export const metadata: Metadata = {
  title: '项目票夹',
  description: '用票据式沉浸预览浏览项目作品。',
}

export const revalidate = 60

export default async function WorksPage() {
  const works = await findWorks()

  return (
    <main className="min-h-[calc(100vh-64px)] overflow-hidden bg-[#f4efe8]">
      {works.length === 0 ? (
        <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-6 text-center text-black/55">
          暂无项目，敬请期待。
        </div>
      ) : (
        <WorksCarousel works={works} />
      )}
    </main>
  )
}

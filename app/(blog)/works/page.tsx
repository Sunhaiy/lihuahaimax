import type { Metadata } from 'next'
import { WorksStampGrid } from '@/components/ui/WorksStampGrid'
import { findWorks } from '@/lib/db/dao/worksDao'

export const metadata: Metadata = {
  title: '项目',
  description: '集中浏览公开项目，并直接跳转官网或 GitHub。',
}

export const revalidate = 60

export default async function WorksPage() {
  const works = await findWorks()

  return (
    <main className="min-h-[calc(100vh-64px)] overflow-hidden">
      {works.length === 0 ? (
        <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-6 text-center text-muted-foreground">
          暂无项目，敬请期待。
        </div>
      ) : (
        <WorksStampGrid works={works} />
      )}
    </main>
  )
}

import type { Metadata } from 'next'
import { WorksCarousel } from '@/components/ui/WorksCarousel'
import { findWorks } from '@/lib/db/dao/worksDao'

export const metadata: Metadata = { title: '作品 · 梨花海' }
export const revalidate = 60

export default async function WorksPage() {
  const works = await findWorks()

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 pb-20 sm:px-6">
      <div className="mx-auto w-full max-w-6xl pt-16 text-center">
        <p className="text-[11px] font-mono uppercase tracking-[0.35em] text-primary/72">
          Works Archive
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-foreground sm:text-5xl">
          项目档案
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-muted-foreground">
          从作品卡片进入到完整项目详情，统一查看封面、状态、里程碑、贡献者与对外链接。
          这部分已经升级为完整的项目实体，而不只是一个简单轮播。
        </p>
      </div>

      <div className="mx-auto my-10 h-8 w-px bg-gradient-to-b from-ember/40 to-transparent" />

      <div className="mx-auto flex-1 w-full max-w-6xl pb-20">
        {works.length === 0 ? (
          <div className="rounded-[28px] border border-white/8 bg-card/70 py-24 text-center text-muted-foreground backdrop-blur-xl">
            暂无项目，敬请期待。
          </div>
        ) : (
          <WorksCarousel works={works} />
        )}
      </div>
    </div>
  )
}

import type { Metadata } from 'next'
import { findMoments } from '@/lib/db/dao/momentDao'
import { getSiteProfile } from '@/lib/site'
import type { MomentRow } from '@/types/moment'
import { MomentFeedCard } from './MomentFeedCard'

export const metadata: Metadata = {
  title: '瞬间',
  description: '把失眠后的清晨、突如其来的雷雨、照片与零碎念头都收在这里。',
}

export const revalidate = 30

function serializeMoment(moment: MomentRow) {
  return {
    ...moment,
    created_at:
      moment.created_at instanceof Date
        ? moment.created_at.toISOString()
        : new Date(moment.created_at).toISOString(),
  }
}

export default async function MomentsPage() {
  const [{ data: moments }, siteProfile] = await Promise.all([
    findMoments({ publicOnly: true, pageSize: 50 }),
    getSiteProfile(),
  ])

  return (
    <div className="mx-auto max-w-[880px] px-3 pb-16 pt-8 sm:px-6 sm:pt-10">
      <section className="mb-7 px-1 sm:px-2">
        <p className="scene-copy-subtle text-[11px] font-mono uppercase tracking-[0.28em]">
          Moments Archive
        </p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="scene-copy text-3xl font-black tracking-[-0.07em] sm:text-5xl">
              瞬间
            </h1>
            <p className="scene-copy-muted mt-3 max-w-2xl text-sm leading-7">
              {siteProfile.ownerName} 的照片、碎碎念、天气和路过的小事，都按社交动态的节奏收在这里。
            </p>
          </div>
          <p className="scene-chip w-fit px-3 py-1 text-xs font-bold">
            {moments.length} 条记录
          </p>
        </div>
      </section>

      {moments.length === 0 ? (
        <div className="scene-panel rounded-[28px] px-8 py-24 text-center">
          <p className="scene-copy text-lg font-semibold">暂时还没有新的瞬间。</p>
          <p className="scene-copy-muted mt-3 text-sm leading-7">
            等下一场雨落下来，这里会先亮起第一张卡片。
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {moments.map((moment) => (
            <MomentFeedCard
              key={moment.id}
              moment={serializeMoment(moment)}
              siteProfile={siteProfile}
            />
          ))}
        </div>
      )}
    </div>
  )
}

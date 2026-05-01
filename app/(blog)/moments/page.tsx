import type { Metadata } from 'next'
import { MomentsStatusHeader } from '@/components/scene/MomentsStatusHeader'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'
import { findMoments } from '@/lib/db/dao/momentDao'
import { SHIMMER } from '@/lib/styles'
import type { MomentRow } from '@/types/moment'

export const metadata: Metadata = { title: '极客瞬间 · 梨花海' }
export const revalidate = 30

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} 小时前`

  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} 天前`

  const months = Math.floor(days / 30)
  if (months < 12) return `${months} 个月前`

  return `${Math.floor(months / 12)} 年前`
}

export default async function MomentsPage() {
  const { data: moments } = await findMoments({ publicOnly: true, pageSize: 50 })

  return (
    <>
      <MomentsStatusHeader />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">
        {moments.length === 0 ? (
          <div className="scene-panel rounded-[28px] px-8 py-24 text-center text-sm scene-copy-muted">
            暂无瞬间，等下一场雨落下来。
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {moments.map((moment) => (
              <MomentCard key={moment.id} moment={moment} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

function MomentCard({ moment }: { moment: MomentRow }) {
  return (
    <article
      className={`scene-panel group relative overflow-hidden rounded-[26px] transition-all duration-300 hover:border-primary/24 ${SHIMMER}`}
    >
      <div className="scene-terminal-grid absolute inset-0 opacity-[0.035]" />

      <div className="relative z-10 px-5 pt-5 pb-4 sm:px-6">
        <header className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="scene-icon-badge h-11 w-11 rounded-2xl">
              <span className="text-base font-semibold">梨</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">梨花海</p>
              <p className="text-[11px] font-mono uppercase tracking-[0.24em] text-slate-300/50">
                {moment.type}
              </p>
            </div>
          </div>
          <time className="scene-chip px-3 py-1 text-[11px] font-mono uppercase tracking-[0.22em]">
            {timeAgo(new Date(moment.created_at))}
          </time>
        </header>

        {moment.content ? (
          <p className="scene-copy-muted mt-4 whitespace-pre-line text-[15px] leading-8">
            {moment.content}
          </p>
        ) : null}

        {(moment.type === 'sleep' || moment.type === 'steps') && moment.meta ? (
          <div className="mt-4">
            <MiBandData type={moment.type} meta={moment.meta as Record<string, unknown>} />
          </div>
        ) : null}

        {moment.images.length > 0 ? (
          moment.images.length === 1 ? (
            <div className="mt-4 overflow-hidden rounded-[22px] border border-hero-border/16 bg-background/30">
              <img
                src={moment.images[0]}
                alt=""
                className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {moment.images.slice(0, 4).map((url, index) => (
                <div
                  key={index}
                  className="relative aspect-square overflow-hidden rounded-[18px] border border-hero-border/16 bg-background/30"
                >
                  <img
                    src={url}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  {index === 3 && moment.images.length > 4 ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/58">
                      <span className="text-white font-semibold">+{moment.images.length - 4}</span>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )
        ) : null}

        {(moment.mood || moment.weather || moment.location) ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {moment.mood ? <MetaBadge icon="favorite" label={moment.mood} /> : null}
            {moment.weather ? <MetaBadge icon="rainy" label={moment.weather} /> : null}
            {moment.location ? <MetaBadge icon="pin_drop" label={moment.location} /> : null}
          </div>
        ) : null}
      </div>

      <footer className="relative z-10 mt-4 flex items-center gap-3 border-t border-hero-border/16 px-5 py-3 sm:px-6">
        <ActionChip icon="share" label="分享" />
        <ActionChip icon="favorite" label="喜欢" />
        <span className="scene-copy-subtle ml-auto text-[11px] font-mono uppercase tracking-[0.22em]">
          {new Date(moment.created_at).toLocaleDateString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
          })}
        </span>
      </footer>
    </article>
  )
}

function MetaBadge({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="scene-chip-primary gap-1.5 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.16em]">
      <MaterialSymbol icon={icon} size={14} />
      {label}
    </span>
  )
}

function ActionChip({ icon, label }: { icon: string; label: string }) {
  return (
    <button className="scene-action px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.18em]">
      <MaterialSymbol icon={icon} size={14} />
      {label}
    </button>
  )
}

function MiBandData({ type, meta }: { type: string; meta: Record<string, unknown> }) {
  if (type === 'sleep') {
    return (
      <div className="rounded-[20px] border border-hero-border/16 bg-hero-panel/52 p-4">
        <p className="scene-copy-subtle text-[11px] font-mono uppercase tracking-[0.24em]">
          Sleep Telemetry
        </p>
        <div className="scene-copy-muted mt-3 flex flex-wrap gap-3 text-xs font-mono">
          {meta.sleepStart != null ? <span>入睡 {String(meta.sleepStart)}</span> : null}
          {meta.sleepEnd != null ? <span>起床 {String(meta.sleepEnd)}</span> : null}
          {typeof meta.deepSleepMinutes === 'number' ? (
            <span className="text-sky-200">深睡 {meta.deepSleepMinutes}min</span>
          ) : null}
          {typeof meta.score === 'number' ? (
            <span className="text-amber-200">评分 {meta.score}</span>
          ) : null}
        </div>
      </div>
    )
  }

  if (type === 'steps') {
    return (
      <div className="rounded-[20px] border border-hero-border/16 bg-hero-panel/52 p-4">
        <p className="scene-copy-subtle text-[11px] font-mono uppercase tracking-[0.24em]">
          Motion Telemetry
        </p>
        <div className="scene-copy-muted mt-3 flex flex-wrap gap-3 text-xs font-mono">
          {typeof meta.steps === 'number' ? (
            <span className="text-sky-200">{meta.steps.toLocaleString()} 步</span>
          ) : null}
          {typeof meta.distance === 'number' ? (
            <span>{(meta.distance / 1000).toFixed(2)} km</span>
          ) : null}
          {typeof meta.calories === 'number' ? <span>{meta.calories} kcal</span> : null}
        </div>
      </div>
    )
  }

  return null
}

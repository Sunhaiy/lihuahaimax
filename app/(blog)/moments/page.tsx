/**
 * app/(blog)/moments/page.tsx
 *
 * 极客瞬间页 — 社交卡片网格布局。
 */

import type { Metadata } from 'next'
import { findMoments } from '@/lib/db/dao/momentDao'
import { Icon } from '@/components/ui/Icon'
import { RiHeart2Line, RiShareForwardLine, RiMapPin2Line } from '@remixicon/react'
import type { MomentRow } from '@/types/moment'
import { SHIMMER } from '@/lib/styles'

export const metadata: Metadata = { title: '极客瞬间 · 梨花海' }
export const revalidate = 30

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return '刚刚'
  if (m < 60) return `${m}分钟前`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}小时前`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}天前`
  const mo = Math.floor(d / 30)
  if (mo < 12) return `${mo}个月前`
  return `${Math.floor(mo / 12)}年前`
}


export default async function MomentsPage() {
  const { data: moments } = await findMoments({ publicOnly: true, pageSize: 50 })

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">

      {/* ── 页头 ── */}
      <div className="max-w-xl mx-auto mb-10">
        <p className="text-xs font-mono text-ember tracking-[0.25em] uppercase mb-3">MOMENTS</p>
        <h1 className="text-3xl font-bold text-foreground mb-2">极客瞬间</h1>
        <p className="text-sm text-muted-foreground">碎片生活流，真实作息与随想。</p>
      </div>

      {moments.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">暂无瞬间。</div>
      ) : (
        <div className="max-w-xl mx-auto flex flex-col gap-4">
          {moments.map((moment) => (
            <MomentCard key={moment.id} moment={moment} />
          ))}
        </div>
      )}

    </div>
  )
}

/* ── 单张瞬间卡 ─────────────────────────────────────── */
function MomentCard({ moment }: { moment: MomentRow }) {
  return (
    <div
      className={`group relative rounded-2xl border border-border bg-card overflow-hidden
                 flex flex-col
                 transition-all duration-300
                 hover:[border-color:rgba(255,138,107,0.35)]
                 ${SHIMMER}`}
    >
      {/* ── 头部：头像 + 用户名 + 类型 + 时间 ── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full flex-shrink-0
                          bg-gradient-to-br from-ember/50 to-ember/15
                          border border-ember/30 flex items-center justify-center">
            <span className="text-sm font-bold text-ember select-none leading-none">梨</span>
          </div>
          <p className="text-xs font-semibold text-foreground">梨花海</p>
        </div>
        <time className="text-[10px] font-mono text-muted-foreground flex-shrink-0">
          {timeAgo(new Date(moment.created_at))}
        </time>
      </div>

      {/* ── 正文 ── */}
      {moment.content && (
        <p className="px-4 text-sm text-foreground leading-relaxed whitespace-pre-line">
          {moment.content}
        </p>
      )}

      {/* ── 手环数据（sleep / steps） ── */}
      {(moment.type === 'sleep' || moment.type === 'steps') && moment.meta && (
        <div className="mx-4 mt-3">
          <MiBandData type={moment.type} meta={moment.meta as Record<string, unknown>} />
        </div>
      )}

      {/* ── 图片 ── */}
      {moment.images.length > 0 && (
        moment.images.length === 1 ? (
          <div className="mt-3 overflow-hidden">
            <img
              src={moment.images[0]}
              alt=""
              className="w-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
            />
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-0.5">
            {moment.images.slice(0, 4).map((url, j) => (
              <div key={j} className="relative aspect-square bg-muted overflow-hidden">
                <img
                  src={url}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />
                {j === 3 && moment.images.length > 4 && (
                  <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">+{moment.images.length - 4}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* ── 标签：mood / weather / location ── */}
      {(moment.mood || moment.weather || moment.location) && (
        <div className="flex flex-wrap gap-1.5 px-4 mt-3">
          {moment.mood && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {moment.mood}
            </span>
          )}
          {moment.weather && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {moment.weather}
            </span>
          )}
          {moment.location && (
            <span className="flex items-center gap-0.5 text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              <Icon icon={RiMapPin2Line} size={9} />
              {moment.location}
            </span>
          )}
        </div>
      )}

      {/* ── 底部操作行 ── */}
      <div className="flex items-center gap-4 px-4 py-3 mt-3 border-t border-border">
        <button className="flex items-center gap-1.5 text-muted-foreground/60 hover:text-muted-foreground transition-colors">
          <Icon icon={RiShareForwardLine} size={13} />
          <span className="text-[10px] font-mono">分享</span>
        </button>
        <button className="flex items-center gap-1.5 text-muted-foreground/60 hover:text-ember transition-colors">
          <Icon icon={RiHeart2Line} size={13} />
          <span className="text-[10px] font-mono">喜欢</span>
        </button>
        <time className="ml-auto text-[10px] font-mono text-muted-foreground/40">
          {new Date(moment.created_at).toLocaleDateString('zh-CN', {
            month: '2-digit', day: '2-digit',
          })}
        </time>
      </div>
    </div>
  )
}

/* ── 手环数据块 ─────────────────────────────────────── */
function MiBandData({ type, meta }: { type: string; meta: Record<string, unknown> }) {
  if (type === 'sleep') {
    return (
      <div className="flex flex-wrap gap-3 p-3 rounded-xl bg-muted/60 border border-border text-xs font-mono">
        {meta.sleepStart != null && (
          <span className="text-muted-foreground">入睡 {String(meta.sleepStart)}</span>
        )}
        {meta.sleepEnd != null && (
          <span className="text-muted-foreground">起床 {String(meta.sleepEnd)}</span>
        )}
        {typeof meta.deepSleepMinutes === 'number' && (
          <span className="text-purple-400">深睡 {meta.deepSleepMinutes}min</span>
        )}
        {typeof meta.score === 'number' && (
          <span className="text-ocean">评分 {meta.score}</span>
        )}
      </div>
    )
  }
  if (type === 'steps') {
    return (
      <div className="flex flex-wrap gap-3 p-3 rounded-xl bg-muted/60 border border-border text-xs font-mono">
        {typeof meta.steps === 'number' && (
          <span className="text-green-400">{meta.steps.toLocaleString()} 步</span>
        )}
        {typeof meta.distance === 'number' && (
          <span className="text-muted-foreground">{(meta.distance / 1000).toFixed(2)} km</span>
        )}
        {typeof meta.calories === 'number' && (
          <span className="text-muted-foreground">{meta.calories} kcal</span>
        )}
      </div>
    )
  }
  return null
}

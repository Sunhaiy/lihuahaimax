/**
 * app/(blog)/moments/page.tsx
 *
 * 极客瞬间页 — 时间轴布局。
 */

import type { Metadata } from 'next'
import { findMoments } from '@/lib/db/dao/momentDao'

export const metadata: Metadata = { title: '极客瞬间' }
export const revalidate = 30

export default async function MomentsPage() {
  const { data: moments } = await findMoments({ publicOnly: true, pageSize: 50 })

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">极客瞬间</h1>
      <p className="text-muted-foreground text-sm mb-12">
        碎片生活流，真实作息与随想。
      </p>

      {moments.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">暂无瞬间。</div>
      ) : (
        <div className="relative">
          {moments.map((moment, i) => (
            <div key={moment.id} className="flex gap-6 group">
              {/* 时间轴线 */}
              <div className="flex flex-col items-center flex-shrink-0 w-6">
                <div
                  className="w-2.5 h-2.5 rounded-full mt-1.5 ring-4
                              bg-ocean ring-ocean/15 flex-shrink-0
                              group-hover:ring-ocean/30 transition-all"
                />
                {i < moments.length - 1 && (
                  <div className="w-px flex-1 bg-black/[0.06] dark:bg-white/5 my-2" />
                )}
              </div>

              {/* 内容区 */}
              <div className="pb-10 flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <time className="text-xs text-muted-foreground font-mono">
                    {new Date(moment.created_at).toLocaleString('zh-CN', {
                      year: 'numeric', month: 'numeric', day: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </time>
                  {/* 类型标签 */}
                  <TypeBadge type={moment.type} />
                </div>

                {/* 文字内容 */}
                {moment.content && (
                  <p className="text-sm text-foreground leading-relaxed mb-3">
                    {moment.content}
                  </p>
                )}

                {/* 图片 */}
                {moment.images?.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                    {moment.images.map((url, j) => (
                      <div key={j} className="aspect-square rounded-card overflow-hidden bg-muted">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                {/* 手环数据展示（sleep / steps） */}
                {(moment.type === 'sleep' || moment.type === 'steps') && moment.meta && (
                  <MiBandData type={moment.type} meta={moment.meta as Record<string, unknown>} />
                )}

                {/* 标签元数据 */}
                {(moment.mood || moment.weather || moment.location) && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {moment.mood && (
                      <span className="text-xs px-2 py-0.5 rounded bg-black/[0.06] dark:bg-white/5 text-muted-foreground">
                        {moment.mood}
                      </span>
                    )}
                    {moment.weather && (
                      <span className="text-xs px-2 py-0.5 rounded bg-black/[0.06] dark:bg-white/5 text-muted-foreground">
                        {moment.weather}
                      </span>
                    )}
                    {moment.location && (
                      <span className="text-xs px-2 py-0.5 rounded bg-black/[0.06] dark:bg-white/5 text-muted-foreground">
                        📍 {moment.location}
                      </span>
                    )}
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

function TypeBadge({ type }: { type: string }) {
  const map: Record<string, [string, string]> = {
    text: ['随想', 'text-muted-foreground bg-black/[0.06] dark:bg-white/5'],
    image: ['图片', 'text-ocean bg-ocean/10'],
    sleep: ['睡眠', 'text-purple-400 bg-purple-400/10'],
    steps: ['步数', 'text-green-400 bg-green-400/10'],
    heartrate: ['心率', 'text-red-400 bg-red-400/10'],
    mood: ['心情', 'text-ember bg-ember/10'],
    link: ['链接', 'text-ocean bg-ocean/10'],
  }
  const [label, cls] = map[type] ?? ['未知', '']
  return (
    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border border-white/10 ${cls}`}>
      {label}
    </span>
  )
}

function MiBandData({ type, meta }: { type: string; meta: Record<string, unknown> }) {
  if (type === 'sleep') {
    return (
      <div className="flex flex-wrap gap-3 mt-2 p-3 rounded-base bg-white/3 border border-white/5 text-xs font-mono">
        {meta.sleepStart != null && <span>入睡 {String(meta.sleepStart)}</span>}
        {meta.sleepEnd != null && <span>起床 {String(meta.sleepEnd)}</span>}
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
      <div className="flex flex-wrap gap-3 mt-2 p-3 rounded-base bg-white/3 border border-white/5 text-xs font-mono">
        {typeof meta.steps === 'number' && <span className="text-green-400">{meta.steps} 步</span>}
        {typeof meta.distance === 'number' && <span>{(meta.distance / 1000).toFixed(2)} km</span>}
        {typeof meta.calories === 'number' && <span>{meta.calories} kcal</span>}
      </div>
    )
  }
  return null
}

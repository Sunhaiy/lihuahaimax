/**
 * components/ui/WorksCarousel.tsx
 *
 * Coverflow 风格的作品展示轮播 — 中央卡片全尺寸，左右渐缩。
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { RiArrowLeftSLine, RiArrowRightSLine, RiGithubLine, RiExternalLinkLine } from '@remixicon/react'

export interface WorkItem {
  id: number
  title: string
  subtitle: string | null
  description: string | null
  cover_url: string
  tags: string[]
  url: string | null
  github_url: string | null
  year: number | null
}

interface Props {
  works: WorkItem[]
}

export function WorksCarousel({ works }: Props) {
  const [active, setActive] = useState(0)

  const prev = useCallback(() => setActive(i => Math.max(0, i - 1)), [])
  const next = useCallback(() => setActive(i => Math.min(works.length - 1, i + 1)), [works.length])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prev, next])

  if (works.length === 0) return null

  const activeWork = works[active]

  return (
    <div className="w-full select-none">

      {/* ── 轮播主体 ── */}
      <div className="relative h-[360px] sm:h-[420px] overflow-hidden">

        {works.map((work, idx) => {
          const pos = idx - active   // -2, -1, 0, +1, +2
          const abs = Math.abs(pos)
          if (abs > 2) return null

          /* 根据位置计算视觉属性 */
          let scale = 1
          let tx = '0%'   // relative to container center
          let opacity = 1
          let zIdx = 10
          let clickable = false

          if (abs === 1) {
            scale   = 0.76
            tx      = pos > 0 ? '62%' : '-62%'
            opacity = 0.6
            zIdx    = 5
            clickable = true
          } else if (abs === 2) {
            scale   = 0.55
            tx      = pos > 0 ? '108%' : '-108%'
            opacity = 0.25
            zIdx    = 1
            clickable = true
          }

          return (
            <div
              key={work.id}
              onClick={clickable ? () => setActive(idx) : undefined}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '62%',
                minWidth: 280,
                transform: `translateX(calc(-50% + ${tx})) translateY(-50%) scale(${scale})`,
                opacity,
                zIndex: zIdx,
                transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                cursor: clickable ? 'pointer' : 'default',
                transformOrigin: 'center center',
              }}
            >
              <div className="rounded-2xl border border-border bg-card overflow-hidden
                              shadow-[0_4px_40px_rgba(0,0,0,0.18)]">
                {/* 封面图 */}
                <div className="aspect-[16/9] bg-muted overflow-hidden">
                  {work.cover_url ? (
                    <img
                      src={work.cover_url}
                      alt={work.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-ember/20 via-card to-muted
                                    flex items-center justify-center relative overflow-hidden">
                      {/* 网格装饰 */}
                      <div className="absolute inset-0 opacity-[0.06]"
                           style={{
                             backgroundImage: 'repeating-linear-gradient(0deg,currentColor 0,currentColor 1px,transparent 1px,transparent 28px),repeating-linear-gradient(90deg,currentColor 0,currentColor 1px,transparent 1px,transparent 28px)',
                           }} />
                      <span className="relative text-[80px] font-black leading-none text-transparent
                                        bg-clip-text bg-gradient-to-br from-ember/40 to-ember/10 select-none">
                        {work.title.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {/* ── 左右箭头 ── */}
        <button
          onClick={prev}
          disabled={active === 0}
          aria-label="上一个"
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20
                     w-10 h-10 rounded-full border border-border bg-background/80 backdrop-blur-sm
                     flex items-center justify-center
                     text-muted-foreground hover:text-ember hover:border-ember/40
                     disabled:opacity-25 disabled:cursor-not-allowed
                     transition-all duration-200"
        >
          <RiArrowLeftSLine size={20} />
        </button>

        <button
          onClick={next}
          disabled={active === works.length - 1}
          aria-label="下一个"
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20
                     w-10 h-10 rounded-full border border-border bg-background/80 backdrop-blur-sm
                     flex items-center justify-center
                     text-muted-foreground hover:text-ember hover:border-ember/40
                     disabled:opacity-25 disabled:cursor-not-allowed
                     transition-all duration-200"
        >
          <RiArrowRightSLine size={20} />
        </button>
      </div>

      {/* ── 小圆点指示器 ── */}
      <div className="flex justify-center gap-2 mt-6">
        {works.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActive(idx)}
            aria-label={`跳转到第 ${idx + 1} 个`}
            className={`rounded-full transition-all duration-300
              ${idx === active
                ? 'w-6 h-2 bg-ember'
                : 'w-2 h-2 bg-border hover:bg-muted-foreground'}`}
          />
        ))}
      </div>

      {/* ── 当前作品详情 ── */}
      <div
        key={activeWork.id}
        className="mt-8 max-w-xl mx-auto text-center animate-fade-in"
      >
        {/* 年份 */}
        {activeWork.year && (
          <p className="text-xs font-mono text-ember tracking-[0.25em] uppercase mb-2">
            {activeWork.year}
          </p>
        )}

        {/* 标题 */}
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
          {activeWork.title}
        </h2>

        {/* 副标题 */}
        {activeWork.subtitle && (
          <p className="text-sm text-muted-foreground mb-4">{activeWork.subtitle}</p>
        )}

        {/* 描述 */}
        {activeWork.description && (
          <p className="text-sm text-muted-foreground leading-relaxed mb-5 max-w-lg mx-auto">
            {activeWork.description}
          </p>
        )}

        {/* 技术标签 */}
        {activeWork.tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5 mb-6">
            {activeWork.tags.map(tag => (
              <span
                key={tag}
                className="text-[11px] font-mono px-2.5 py-0.5 rounded-full
                           bg-ember/10 text-ember border border-ember/20"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 链接按钮 */}
        {(activeWork.github_url || activeWork.url) && (
          <div className="flex justify-center gap-3">
            {activeWork.github_url && (
              <a
                href={activeWork.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                           border border-border bg-card text-foreground
                           hover:border-ember/40 hover:text-ember transition-all duration-200"
              >
                <RiGithubLine size={15} />
                GitHub
              </a>
            )}
            {activeWork.url && (
              <a
                href={activeWork.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                           bg-ember text-white hover:bg-ember/85 transition-all duration-200"
              >
                <RiExternalLinkLine size={15} />
                在线演示
              </a>
            )}
          </div>
        )}
      </div>

      {/* ── 导航数字 ── */}
      <p className="text-center text-[11px] font-mono text-muted-foreground/50 mt-8">
        {String(active + 1).padStart(2, '0')} / {String(works.length).padStart(2, '0')}
      </p>
    </div>
  )
}

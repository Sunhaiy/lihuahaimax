'use client'

import { useMemo, useState } from 'react'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'
import { useGsapScope } from '@/hooks/useGsapScope'
import type { WorkListItem } from '@/types/work'

interface Props {
  works: WorkListItem[]
}

export function WorksCarousel({ works }: Props) {
  const [active, setActive] = useState(0)
  const activeWork = works[active] ?? works[0]

  const primaryHref = activeWork?.primary_url || activeWork?.url || ''
  const githubHref = activeWork?.github_url || activeWork?.secondary_url || ''

  const summary = useMemo(() => {
    if (!activeWork) return ''
    return activeWork.summary || activeWork.subtitle || activeWork.description || ''
  }, [activeWork])

  const { scopeRef } = useGsapScope<HTMLDivElement>((scope, { gsap, prefersReducedMotion }) => {
    const stage = scope.querySelector('[data-works-stage]')
    const media = scope.querySelector('[data-works-media]')
    const copy = scope.querySelector('[data-works-copy]')
    const actions = scope.querySelector('[data-works-actions]')

    if (!stage || !media || !copy || !actions) return

    if (prefersReducedMotion) {
      gsap.set([stage, media, copy, actions], { clearProps: 'all', autoAlpha: 1 })
      return
    }

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.fromTo(stage, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 })
    tl.fromTo(media, { autoAlpha: 0, y: 24, scale: 0.98 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.58 })
    tl.fromTo(copy, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.42 }, '-=0.28')
    tl.fromTo(actions, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.34 }, '-=0.2')
  }, [active])

  if (!activeWork) return null

  return (
    <section
      ref={scopeRef}
      className="works-theme relative isolate flex min-h-[calc(100vh-4rem)] items-center overflow-hidden px-4 py-12 sm:px-6 lg:px-10"
      style={{ backgroundColor: 'var(--works-stage)', color: 'var(--works-stage-copy)' }}
      data-works-stage
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 12%, var(--works-glow-primary) 0%, var(--works-glow-secondary) 24%, transparent 56%)',
        }}
      />

      <div className="relative mx-auto grid w-full max-w-7xl items-start gap-10 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0">
          <div
            className="rounded-[32px] border border-border/70 bg-background/24 px-5 py-5 backdrop-blur-xl sm:px-7 sm:py-6"
            data-works-copy
          >
            <p className="text-[11px] font-mono uppercase tracking-[0.34em] text-primary">
              // Project archive
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.08em] sm:text-6xl">
              {activeWork.title}
            </h1>
            {activeWork.subtitle ? (
              <p className="mt-3 text-lg text-muted-foreground sm:text-2xl">{activeWork.subtitle}</p>
            ) : null}
            {activeWork.tags.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {activeWork.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex rounded-full border border-border/70 bg-background/45 px-3 py-1 text-sm text-muted-foreground"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div
            className="mt-8 overflow-hidden rounded-[36px] border border-border/70 bg-background/16 shadow-[0_32px_90px_rgba(0,0,0,0.14)]"
            data-works-media
          >
            <div className="aspect-[16/10] w-full overflow-hidden bg-background/20">
              {activeWork.cover_url ? (
                <img src={activeWork.cover_url} alt={activeWork.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/16 via-background to-muted">
                  <span className="text-7xl font-black tracking-[-0.08em] text-primary/28">
                    {activeWork.title.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 px-5 py-4 text-sm text-muted-foreground sm:px-6">
              <div className="flex flex-wrap items-center gap-4">
                <span>年份：{activeWork.year ?? '—'}</span>
                <span>标识：{activeWork.slug}</span>
              </div>
              <span>更新于：{new Date(activeWork.updated_at).toLocaleDateString('zh-CN')}</span>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {works.map((work, index) => {
              const isActive = index === active
              return (
                <button
                  key={work.id}
                  type="button"
                  onClick={() => setActive(index)}
                  className={`rounded-[24px] border px-4 py-4 text-left transition-all ${
                    isActive
                      ? 'border-primary/30 bg-primary/8 shadow-[0_12px_36px_rgba(16,185,129,0.08)]'
                      : 'border-border/70 bg-background/35 hover:border-primary/18 hover:bg-background/55'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-foreground">{work.title}</p>
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {work.summary || work.subtitle || '这条项目还没有补充摘要。'}
                      </p>
                    </div>
                    {isActive ? <MaterialSymbol icon="check_circle" size={18} className="text-primary" /> : null}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start" data-works-actions>
          <div className="rounded-[30px] border border-border/70 bg-background/38 p-6 backdrop-blur-xl">
            <p className="text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
              Project summary
            </p>
            <p className="mt-4 text-sm leading-7 text-foreground/82">
              {summary || '这条项目还没有补充更多介绍。'}
            </p>
          </div>

          <div className="rounded-[30px] border border-border/70 bg-background/38 p-6 backdrop-blur-xl">
            <p className="text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
              Quick actions
            </p>
            <div className="mt-4 space-y-3">
              <a
                href={primaryHref || undefined}
                target={primaryHref ? '_blank' : undefined}
                rel="noreferrer"
                className={`flex min-h-[3.5rem] items-center justify-between rounded-[20px] border px-4 text-sm font-semibold transition-all ${
                  primaryHref
                    ? 'border-primary/28 bg-primary text-primary-foreground hover:opacity-92'
                    : 'cursor-not-allowed border-border/70 bg-background/52 text-muted-foreground'
                }`}
                aria-disabled={!primaryHref}
              >
                <span>{activeWork.primary_label || '打开官网'}</span>
                <MaterialSymbol icon="open_in_new" size={18} />
              </a>

              <a
                href={githubHref || undefined}
                target={githubHref ? '_blank' : undefined}
                rel="noreferrer"
                className={`flex min-h-[3.5rem] items-center justify-between rounded-[20px] border px-4 text-sm font-semibold transition-all ${
                  githubHref
                    ? 'border-border bg-card text-foreground hover:border-primary/24 hover:text-primary'
                    : 'cursor-not-allowed border-border/70 bg-background/52 text-muted-foreground'
                }`}
                aria-disabled={!githubHref}
              >
                <span>{activeWork.secondary_label || '打开 GitHub'}</span>
                <MaterialSymbol icon="code" size={18} />
              </a>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}

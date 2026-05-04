'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'
import { useGsapScope } from '@/hooks/useGsapScope'
import type { WorkContributor, WorkDetail, WorkListItem } from '@/types/work'

interface WorkDetailShowcaseProps {
  work: WorkDetail
  works: WorkListItem[]
  siteUrl: string
}

interface ActionLink {
  href: string
  label: string
  icon: string
}

const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export function WorkDetailShowcase({ work, works, siteUrl }: WorkDetailShowcaseProps) {
  const gallery = buildGallery(work)
  const [activeImage, setActiveImage] = useState(0)
  const overview = (work.content || work.description || work.summary || '')
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
  const progress = resolveProgress(work.progress_text)
  const canonicalUrl = buildCanonicalUrl(siteUrl, work.slug)
  const links = buildLinks(work, canonicalUrl)
  const contributors = buildContributors(work)
  const currentIndex = Math.max(0, works.findIndex((item) => item.slug === work.slug))
  const previousWork = works.length ? works[(currentIndex - 1 + works.length) % works.length] : null
  const nextWork = works.length ? works[(currentIndex + 1) % works.length] : null
  const selectedImage = gallery[activeImage] || work.hero_image_url || work.cover_url || ''

  useEffect(() => {
    setActiveImage(0)
  }, [work.id])

  const { scopeRef } = useGsapScope<HTMLDivElement>((scope, { gsap, prefersReducedMotion }) => {
    if (prefersReducedMotion) return

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    const image = scope.querySelector('[data-work-main-image]')

    tl.fromTo(
      scope.querySelectorAll('[data-work-intro]'),
      { autoAlpha: 0, y: 18 },
      { autoAlpha: 1, y: 0, duration: 0.56, stagger: 0.07 }
    )

    tl.fromTo(
      scope.querySelectorAll('[data-work-panel]'),
      { autoAlpha: 0, y: 24 },
      { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08 },
      '-=0.34'
    )

    if (image) {
      tl.fromTo(
        image,
        { autoAlpha: 0.4, scale: 1.03 },
        { autoAlpha: 1, scale: 1, duration: 0.75, ease: 'expo.out' },
        0.08
      )
    }
  }, [work.id])

  const { scopeRef: imageScopeRef } = useGsapScope<HTMLDivElement>((scope, { gsap, prefersReducedMotion }) => {
    if (prefersReducedMotion) return

    const image = scope.querySelector('[data-work-main-image]')
    if (!image) return

    gsap.fromTo(
      image,
      { autoAlpha: 0.55, scale: 1.015 },
      { autoAlpha: 1, scale: 1, duration: 0.45, ease: 'power2.out' }
    )
  }, [selectedImage])

  return (
    <section className="mx-auto max-w-7xl px-6 py-12 sm:px-8" ref={scopeRef}>
      <div className="space-y-8">
        <div className="space-y-4">
          <Link
            href="/works"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            data-work-intro
          >
            <MaterialSymbol icon="arrow_back" size={18} />
            返回项目列表
          </Link>

          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-3xl space-y-4">
              <div
                className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-1.5 text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground backdrop-blur-md"
                data-work-intro
              >
                <MaterialSymbol icon="deployed_code" size={14} />
                <span>Project Detail</span>
              </div>

              <div className="space-y-3">
                <h1 className="text-4xl font-semibold tracking-[-0.05em] text-foreground sm:text-5xl" data-work-intro>
                  {work.title}
                </h1>
                <p className="text-lg text-foreground/82" data-work-intro>
                  {work.subtitle || '项目详情页'}
                </p>
                <p className="max-w-2xl text-sm leading-8 text-muted-foreground" data-work-intro>
                  {work.summary || work.description || '一个围绕项目展示、说明和跳转构建的详情页面。'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2" data-work-intro>
              {work.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full border border-border/80 bg-card/70 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.12fr)_360px]">
          <div className="space-y-6">
            <section className="scene-panel overflow-hidden rounded-[30px] p-4 sm:p-5" data-work-panel>
              <div ref={imageScopeRef} className="space-y-4">
                <div className="overflow-hidden rounded-[24px] border border-border/70 bg-black/5 dark:bg-white/5">
                  {selectedImage ? (
                    <img
                      key={selectedImage}
                      src={selectedImage}
                      alt={work.title}
                      className="aspect-[16/10] w-full object-cover"
                      data-work-main-image
                    />
                  ) : (
                    <div
                      className="flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-primary/18 via-primary/8 to-transparent"
                      data-work-main-image
                    >
                      <span className="text-[7rem] font-black tracking-[-0.08em] text-primary/16">
                        {work.title.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {gallery.length > 1 ? (
                  <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
                    {gallery.map((image, index) => {
                      const active = activeImage === index

                      return (
                        <button
                          key={`${image}-${index}`}
                          type="button"
                          onClick={() => setActiveImage(index)}
                          className={`overflow-hidden rounded-[18px] border transition-all duration-200 ${
                            active
                              ? 'border-primary/45 ring-1 ring-primary/25'
                              : 'border-border/70 hover:border-primary/25'
                          }`}
                        >
                          <img src={image} alt="" className="aspect-square w-full object-cover" />
                        </button>
                      )
                    })}
                  </div>
                ) : null}
              </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-2">
              <section className="scene-panel rounded-[28px] p-6" data-work-panel>
                <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
                  <MaterialSymbol icon="subject" size={14} />
                  <span>项目概览</span>
                </div>
                <div className="mt-4 space-y-4 text-[15px] leading-8 text-foreground/82">
                  {(overview.length ? overview : [work.summary || '暂无项目说明']).slice(0, 3).map((paragraph, index) => (
                    <p key={`${paragraph}-${index}`}>{paragraph}</p>
                  ))}
                </div>
              </section>

              <section className="scene-panel rounded-[28px] p-6" data-work-panel>
                <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
                  <MaterialSymbol icon="timeline" size={14} />
                  <span>关键节点</span>
                </div>
                <div className="mt-4 space-y-5">
                  {work.milestones.length > 0 ? (
                    work.milestones.slice(0, 3).map((item, index) => (
                      <div key={`${item.title}-${index}`} className="flex gap-4">
                        <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                        <div>
                          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                            {item.date}
                          </p>
                          <h3 className="mt-1 text-lg font-semibold text-foreground">{item.title}</h3>
                          <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm leading-7 text-muted-foreground">暂无里程碑数据，后续可以继续从后台补充。</p>
                  )}
                </div>
              </section>
            </div>
          </div>

          <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
            <section className="scene-panel rounded-[28px] p-6" data-work-panel>
              <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
                <MaterialSymbol icon="group" size={14} />
                <span>参与者</span>
              </div>
              <div className="mt-4 space-y-3">
                {contributors.map((item, index) => (
                  <div
                    key={`${item.name}-${index}`}
                    className="flex items-center gap-3 rounded-[22px] border border-border/70 bg-card/55 p-4"
                  >
                    {item.avatar_url ? (
                      <img src={item.avatar_url} alt={item.name} className="h-11 w-11 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/25 bg-primary/12 text-sm font-semibold text-primary">
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{item.role || '项目成员'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="scene-panel rounded-[28px] p-6" data-work-panel>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
                    当前进度
                  </div>
                  <div className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-foreground">
                    {work.progress_text || `${progress.current}/${progress.total || progress.current || 1}`}
                  </div>
                </div>
                <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  {formatStatus(work.status_text || 'active')}
                </span>
              </div>

              {progress.percent !== null ? (
                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>完成度</span>
                    <span>{progress.percent}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${progress.percent}%` }} />
                  </div>
                </div>
              ) : null}

              <div className="mt-6 grid grid-cols-2 gap-3">
                <InfoCell label="版本" value={work.version_text || 'v1.0.0'} />
                <InfoCell label="年份" value={String(work.year || new Date(work.created_at).getFullYear())} />
                <InfoCell label="更新" value={dateFormatter.format(new Date(work.updated_at))} />
                <InfoCell label="排序" value={String(work.sort_order || currentIndex + 1).padStart(2, '0')} />
              </div>
            </section>

            <section className="scene-panel rounded-[28px] p-6" data-work-panel>
              <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
                项目入口
              </div>
              <div className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-foreground">
                {work.primary_label || '查看项目'}
              </div>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {work.summary || '从这里进入项目主页、案例页、仓库或归档链接。'}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-4 rounded-[22px] border border-border/70 bg-card/40 p-4">
                <PriceBlock label="售价" value={work.price ? formatPrice(work.price) : '免费'} highlight />
                <PriceBlock
                  label="原价"
                  value={work.original_price ? formatPrice(work.original_price) : work.price ? formatPrice(work.price) : '免费'}
                />
              </div>

              <div className="mt-5 flex flex-col gap-3">
                <Button asChild size="lg" className="rounded-[18px]">
                  <a href={work.primary_url || work.url || canonicalUrl} target="_blank" rel="noopener noreferrer">
                    <MaterialSymbol icon="arrow_outward" size={18} />
                    {work.primary_label || '打开项目'}
                  </a>
                </Button>

                {work.secondary_url || work.github_url ? (
                  <Button asChild variant="secondary" size="lg" className="rounded-[18px]">
                    <a
                      href={work.secondary_url || work.github_url || canonicalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MaterialSymbol icon="link" size={18} />
                      {work.secondary_label || '查看相关链接'}
                    </a>
                  </Button>
                ) : null}
              </div>
            </section>

            <section className="scene-panel rounded-[28px] p-6" data-work-panel>
              <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
                <MaterialSymbol icon="hub" size={14} />
                <span>链接与信息</span>
              </div>
              <div className="mt-4 space-y-3">
                {links.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-[20px] border border-border/70 bg-card/55 px-4 py-3 text-sm text-foreground transition-colors hover:border-primary/24 hover:text-primary"
                  >
                    <span className="flex items-center gap-3">
                      <MaterialSymbol icon={item.icon} size={18} className="text-muted-foreground" />
                      {item.label}
                    </span>
                    <MaterialSymbol icon="arrow_outward" size={18} className="text-muted-foreground" />
                  </a>
                ))}
              </div>
            </section>
          </aside>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-[1fr_auto_1fr]" data-work-panel>
          <ProjectNavCard direction="prev" work={previousWork} />
          <div className="inline-flex items-center justify-center rounded-full border border-border/70 bg-card/60 px-5 py-3 text-[11px] font-mono uppercase tracking-[0.28em] text-muted-foreground">
            Detail {String(currentIndex + 1).padStart(2, '0')} / {String(Math.max(works.length, 1)).padStart(2, '0')}
          </div>
          <ProjectNavCard direction="next" work={nextWork} />
        </div>
      </div>
    </section>
  )
}

function PriceBlock({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-2 text-2xl font-semibold tracking-[-0.04em] ${highlight ? 'text-primary' : 'text-foreground/80'}`}>
        {value}
      </p>
    </div>
  )
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-border/70 bg-card/55 px-4 py-3">
      <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}

function ProjectNavCard({
  direction,
  work,
}: {
  direction: 'prev' | 'next'
  work: WorkListItem | null
}) {
  const icon = direction === 'prev' ? 'arrow_back' : 'arrow_forward'
  const label = direction === 'prev' ? '上一项' : '下一项'

  return (
    <Link
      href={work ? `/works/${work.slug}` : '/works'}
      className="group flex items-center gap-3 rounded-[22px] border border-border/70 bg-card/60 px-4 py-4 transition-colors hover:border-primary/24"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-background/50 text-muted-foreground transition-colors group-hover:text-primary">
        <MaterialSymbol icon={icon} size={18} />
      </span>
      <span className="min-w-0">
        <span className="block text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">{label}</span>
        <span className="block truncate text-base font-semibold text-foreground">{work?.title || '返回作品页'}</span>
      </span>
    </Link>
  )
}

function buildGallery(work: WorkDetail) {
  return Array.from(
    new Set(
      [work.hero_image_url, work.cover_url, ...work.gallery].filter(
        (item): item is string => Boolean(item && item.trim())
      )
    )
  ).slice(0, 6)
}

function buildLinks(work: WorkDetail, canonicalUrl: string): ActionLink[] {
  const links: ActionLink[] = []
  const seen = new Set<string>()

  function push(href: string | null | undefined, label: string, icon: string) {
    if (!href || seen.has(href)) return
    seen.add(href)
    links.push({ href, label, icon })
  }

  push(work.primary_url || work.url, work.primary_label || '打开项目', 'open_in_new')
  push(work.secondary_url, work.secondary_label || '查看补充说明', 'article')
  push(work.github_url, '查看 GitHub', 'code')
  push(canonicalUrl, '项目归档链接', 'link')

  return links
}

function buildContributors(work: WorkDetail): WorkContributor[] {
  if (work.contributors.length > 0) return work.contributors.slice(0, 3)

  return [
    {
      name: 'Lihua Hai',
      role: 'Design / Full-stack',
      avatar_url: null,
    },
  ]
}

function resolveProgress(progressText: string | null) {
  if (!progressText) {
    return { current: 0, total: 0, percent: null as number | null }
  }

  const percentMatch = progressText.match(/(\d{1,3})\s*%/)
  if (percentMatch) {
    const percent = Math.min(100, Math.max(0, Number(percentMatch[1])))
    return { current: percent, total: 100, percent }
  }

  const ratioMatch = progressText.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/)
  if (!ratioMatch) {
    return { current: 0, total: 0, percent: null as number | null }
  }

  const current = Number(ratioMatch[1])
  const total = Number(ratioMatch[2])
  const percent = total > 0 ? Math.round((current / total) * 100) : null
  return { current, total, percent }
}

function formatStatus(value: string) {
  return value
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function buildCanonicalUrl(siteUrl: string, slug: string) {
  const base = siteUrl?.trim() || 'http://localhost:3000'
  return `${base.replace(/\/$/, '')}/works/${slug}`
}

function formatPrice(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return '¥0'
  if (/^[¥$€£]/.test(trimmed)) return trimmed
  return `¥${trimmed}`
}

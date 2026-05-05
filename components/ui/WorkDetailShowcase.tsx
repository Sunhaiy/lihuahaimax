'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useGsapScope } from '@/hooks/useGsapScope'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'
import type { WorkContributor, WorkDetail, WorkListItem, WorkMilestone } from '@/types/work'

interface WorkDetailShowcaseProps {
  work: WorkDetail
  works: WorkListItem[]
  siteUrl: string
}

const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export function WorkDetailShowcase({ work, works, siteUrl }: WorkDetailShowcaseProps) {
  const gallery = useMemo(() => buildGallery(work), [work])
  const overview = useMemo(() => buildOverview(work), [work])
  const contributors = useMemo(() => buildContributors(work), [work])
  const primaryHref = work.primary_url || work.url || buildCanonicalUrl(siteUrl, work.slug)
  const secondaryHref = work.secondary_url || work.github_url || primaryHref
  const [activeImage, setActiveImage] = useState(0)
  const selectedImage = gallery[activeImage] || work.hero_image_url || work.cover_url || ''
  const currentIndex = Math.max(0, works.findIndex((item) => item.slug === work.slug))
  const previousWork = works.length ? works[(currentIndex - 1 + works.length) % works.length] : null
  const nextWork = works.length ? works[(currentIndex + 1) % works.length] : null
  const timelineRef = useRef<HTMLDivElement | null>(null)
  const dragStateRef = useRef({ isDown: false, startX: 0, scrollLeft: 0 })

  useEffect(() => {
    setActiveImage(0)
  }, [work.id])

  const { scopeRef } = useGsapScope<HTMLDivElement>((scope, { gsap, prefersReducedMotion }) => {
    const shine = scope.querySelector('[data-archive-shine]')
    const hero = scope.querySelector('[data-archive-hero]')
    const timelineNodes = scope.querySelectorAll('[data-archive-node]')

    if (prefersReducedMotion) return

    const intro = gsap.timeline({ defaults: { ease: 'power3.out' } })
    intro.fromTo(
      scope.querySelectorAll('[data-archive-intro]'),
      { autoAlpha: 0, y: 18 },
      { autoAlpha: 1, y: 0, duration: 0.58, stagger: 0.08 }
    )
    intro.fromTo(
      scope.querySelectorAll('[data-archive-panel]'),
      { autoAlpha: 0, y: 28 },
      { autoAlpha: 1, y: 0, duration: 0.68, stagger: 0.08 },
      '-=0.3'
    )
    intro.fromTo(
      timelineNodes,
      { autoAlpha: 0, x: 24 },
      { autoAlpha: 1, x: 0, duration: 0.5, stagger: 0.06 },
      '-=0.28'
    )

    if (hero) {
      gsap.fromTo(hero, { scale: 1.02, autoAlpha: 0.65 }, { scale: 1, autoAlpha: 1, duration: 0.85, ease: 'expo.out' })
    }

    if (shine) {
      gsap.set(shine, { xPercent: -130, rotate: -18 })
      gsap.to(shine, {
        xPercent: 220,
        duration: 5.6,
        ease: 'power1.inOut',
        repeat: -1,
        repeatDelay: 1.3,
      })
    }
  }, [work.id])

  function handleTimelineMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    const container = timelineRef.current
    if (!container) return
    dragStateRef.current = {
      isDown: true,
      startX: event.pageX - container.offsetLeft,
      scrollLeft: container.scrollLeft,
    }
  }

  function handleTimelineMouseUp() {
    dragStateRef.current.isDown = false
  }

  function handleTimelineMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const container = timelineRef.current
    if (!container || !dragStateRef.current.isDown) return

    event.preventDefault()
    const x = event.pageX - container.offsetLeft
    const walk = (x - dragStateRef.current.startX) * 1.8
    container.scrollLeft = dragStateRef.current.scrollLeft - walk
  }

  return (
    <section className="relative overflow-hidden bg-[#050505] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_16%,rgba(242,185,75,0.13),transparent_26%),radial-gradient(circle_at_76%_20%,rgba(255,255,255,0.08),transparent_20%),linear-gradient(180deg,#070707_0%,#020202_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/10" />
      <div className="pointer-events-none absolute bottom-[-12rem] left-1/2 h-80 w-[46rem] -translate-x-1/2 rounded-full bg-[#f2b94b]/10 blur-[160px]" />

      <div ref={scopeRef} className="relative mx-auto max-w-[1500px] px-6 pb-20 pt-14 sm:px-8 xl:px-12">
        <div className="mb-12 space-y-5">
          <p className="text-[11px] font-mono uppercase tracking-[0.44em] text-[#7e6f52]" data-archive-intro>
            // CLASSIFIED_ARCHIVE_V.2026
          </p>

          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-4xl">
              <h1 className="text-[2.9rem] font-black leading-none tracking-[-0.08em] text-white sm:text-[4.4rem]" data-archive-intro>
                {work.title}
                <span className="ml-4 inline-block font-serif text-[1.7rem] font-bold tracking-[-0.04em] text-[#c5b28a] sm:text-[2.35rem]">
                  摘录 / ARCHIVE
                </span>
              </h1>
              <p className="mt-4 max-w-2xl text-[15px] leading-8 text-white/58" data-archive-intro>
                {work.subtitle || work.summary || '项目档案节点已接入主数据库，以下为当前公开摘要与协议信息。'}
              </p>
            </div>

            {work.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2" data-archive-intro>
                {work.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-mono tracking-[0.16em] text-white/62"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_330px]">
          <div className="min-w-0 space-y-10">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
              <section className="space-y-4" data-archive-panel>
                <div className="overflow-hidden rounded-[30px] border border-white/8 bg-black/70">
                  <div className="relative aspect-[16/9] overflow-hidden" data-archive-hero>
                    <div className="absolute left-4 top-4 z-20 h-8 w-8 border-l-[1.5px] border-t-[1.5px] border-[#f2b94b]" />
                    <div className="absolute bottom-4 right-4 z-20 h-8 w-8 border-b-[1.5px] border-r-[1.5px] border-[#f2b94b]" />

                    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
                      <div
                        data-archive-shine
                        className="absolute inset-y-0 left-[-28%] w-[32%] bg-[linear-gradient(90deg,transparent_0%,rgba(242,185,75,0.18)_50%,transparent_100%)]"
                      />
                    </div>

                    {selectedImage ? (
                      <img src={selectedImage} alt={work.title} className="h-full w-full object-cover opacity-85" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-[#0b0b0b]">
                        <span className="text-lg font-black tracking-[0.35em] text-white/12">[[ NO_SIGNAL_ESTABLISHED ]]</span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04),rgba(0,0,0,0.44))]" />

                    {work.seal ? (
                      <div className="absolute bottom-7 right-7 z-20 bg-[#ff5a45] px-4 py-2 font-serif text-sm font-black tracking-[0.12em] text-black">
                        {work.seal}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-4 text-[10px] font-mono uppercase tracking-[0.26em] text-white/24">
                  <span>COORDS: 42.08 / 15.99</span>
                  <span className="h-px w-8 bg-white/12" />
                  <span>ZOOM: 1.0x</span>
                </div>

                {gallery.length > 1 ? (
                  <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
                    {gallery.map((image, index) => (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        onClick={() => setActiveImage(index)}
                        className={`overflow-hidden rounded-[16px] border transition-all ${
                          activeImage === index
                            ? 'border-[#f2b94b]/40 bg-[#f2b94b]/8'
                            : 'border-white/8 bg-white/[0.02] hover:border-white/16'
                        }`}
                      >
                        <img src={image} alt="" className="aspect-square w-full object-cover" />
                      </button>
                    ))}
                  </div>
                ) : null}
              </section>

              <aside className="border-l border-white/6 pl-0 xl:pl-8" data-archive-panel>
                <div className="space-y-8">
                  <section>
                    <h4 className="text-[12px] uppercase tracking-[0.22em] text-[#7e6f52]">参与者 Contributors</h4>
                    <div className="mt-4 space-y-3">
                      {contributors.length > 0 ? (
                        contributors.map((user, index) => (
                          <div key={`${user.name}-${index}`} className="flex items-center gap-3">
                            {user.avatar_url ? (
                              <img src={user.avatar_url} alt={user.name} className="h-10 w-10 rounded-full border border-white/10 object-cover" />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-black text-black">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                              <p className="truncate text-[11px] uppercase tracking-[0.16em] text-white/36">
                                {user.role || 'Member'}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-white/28">[[ NO_DATA ]]</p>
                      )}
                    </div>
                  </section>

                  <div className="h-px bg-white/8" />

                  <section>
                    <h4 className="text-[12px] uppercase tracking-[0.22em] text-[#7e6f52]">当前进度 Progress</h4>
                    <div className="mt-4 flex items-end gap-3">
                      <span className="text-[2rem] font-black leading-none tracking-[-0.06em] text-white">
                        {work.progress_text || '0/0'}
                      </span>
                      <span className="pb-1 text-lg font-bold text-[#f2b94b]">
                        {work.status_text || 'UNKNOWN'}
                      </span>
                    </div>
                  </section>

                  <div className="h-px bg-white/8" />

                  <section>
                    <h4 className="text-[12px] uppercase tracking-[0.22em] text-[#7e6f52]">系统版本 Version</h4>
                    <div className="mt-4 text-xl font-bold text-white">{work.version_text || 'v1.0.0'}</div>

                    <div className="mt-6 flex gap-6">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.22em] text-white/28">PRICE_NOW</p>
                        <p className="mt-2 text-[2rem] font-black tracking-[-0.06em] text-[#f2b94b]">
                          {formatPrice(work.price)}
                        </p>
                      </div>
                      {work.original_price ? (
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.22em] text-white/28">PRICE_OLD</p>
                          <p className="mt-2 text-[2rem] font-black tracking-[-0.06em] text-white/18 line-through">
                            {formatPrice(work.original_price)}
                          </p>
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-8 space-y-3">
                      <a
                        href={secondaryHref}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex w-full items-center justify-center rounded-none border border-white/18 bg-white/90 px-5 py-4 text-sm font-black tracking-[0.16em] text-black transition-colors hover:bg-white"
                      >
                        APPLY_TO_JOIN
                      </a>
                      <a
                        href={primaryHref}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex w-full items-center justify-center rounded-none border border-[#f2b94b] bg-[#f2b94b] px-5 py-4 text-sm font-black tracking-[0.16em] text-black transition-colors hover:bg-white hover:border-white"
                      >
                        ACCESS_NODE
                      </a>
                    </div>
                  </section>
                </div>
              </aside>
            </div>

            {work.milestones.length > 0 ? (
              <section data-archive-panel>
                <div className="mb-8 flex items-center gap-5">
                  <span className="text-[11px] font-mono uppercase tracking-[0.28em] text-[#7e6f52]">
                    DEVELOPMENT_TIMELINE
                  </span>
                  <div className="h-px flex-1 bg-white/8" />
                </div>

                <div
                  ref={timelineRef}
                  className="cursor-grab overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  onMouseDown={handleTimelineMouseDown}
                  onMouseLeave={handleTimelineMouseUp}
                  onMouseUp={handleTimelineMouseUp}
                  onMouseMove={handleTimelineMouseMove}
                >
                  <div className="flex min-w-max gap-0 pl-1 pr-8">
                    {work.milestones.map((step, index) => (
                      <TimelineNode key={`${step.title}-${index}`} step={step} index={index} />
                    ))}
                    <div className="flex flex-col items-center px-10 pt-10 text-white/18">
                      <div className="h-2 w-2 rounded-full bg-white/20" />
                      <span className="mt-4 text-[10px] font-mono uppercase tracking-[0.28em]">EOF</span>
                    </div>
                  </div>
                </div>
              </section>
            ) : null}

            <section data-archive-panel>
              <div className="mb-8 flex items-center gap-5">
                <span className="text-[11px] font-mono uppercase tracking-[0.28em] text-[#7e6f52]">
                  PRODUCT_SPECIFICATION / 产品详述
                </span>
                <div className="h-px flex-1 bg-white/8" />
              </div>

              <div className="max-w-4xl space-y-5">
                {overview.map((paragraph, index) => (
                  <p key={`${paragraph}-${index}`} className="text-[15px] leading-9 text-white/62">
                    {paragraph}
                  </p>
                ))}
                <p className="border-l-2 border-white/12 pl-4 text-[14px] italic leading-8 text-white/32">
                  该节点已通过核心协议验证，所有数据流向受控且加密。开发者可申请接入 API 获取实时遥测数据。
                </p>
              </div>
            </section>
          </div>

          <aside className="space-y-4 xl:pt-24" data-archive-panel>
            <MetaCell label="更新时间" value={dateFormatter.format(new Date(work.updated_at))} />
            <MetaCell label="创建时间" value={dateFormatter.format(new Date(work.created_at))} />
            <MetaCell label="归档序号" value={`0${currentIndex + 1}`} />
            <MetaCell label="主入口" value={stripProtocol(primaryHref)} />
          </aside>
        </div>

        <div className="mt-14 grid gap-3 sm:grid-cols-[1fr_auto_1fr]" data-archive-panel>
          <ProjectNavCard direction="prev" work={previousWork} />
          <div className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-[11px] font-mono uppercase tracking-[0.28em] text-white/40">
            Detail {String(currentIndex + 1).padStart(2, '0')} / {String(Math.max(works.length, 1)).padStart(2, '0')}
          </div>
          <ProjectNavCard direction="next" work={nextWork} />
        </div>
      </div>

      <div className="pointer-events-none fixed bottom-[-3%] left-[-2%] z-0 whitespace-nowrap text-[12rem] font-black tracking-[-0.08em] text-white/[0.02] sm:text-[18rem]">
        DECODING_MODULE_{work.slug.toUpperCase()}
      </div>
    </section>
  )
}

function TimelineNode({ step, index }: { step: WorkMilestone; index: number }) {
  return (
    <div className="w-[320px] flex-shrink-0 pt-4" data-archive-node>
      <div className="mb-4 flex flex-col">
        <span className="text-[10px] font-black tracking-[0.24em] text-[#f2b94b]">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="mt-1 text-[12px] text-white/26">{step.date}</span>
      </div>

      <div className="flex h-5 items-center">
        <div className="h-2 w-2 rounded-full bg-[#f2b94b] shadow-[0_0_16px_rgba(242,185,75,0.8)]" />
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <div className="pr-8 pt-5">
        {step.link ? (
          <a
            href={step.link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 border-b border-dashed border-white/26 text-[1.05rem] font-bold text-white transition-colors hover:border-[#f2b94b] hover:text-[#f2b94b]"
          >
            {step.title}
            <span className="text-[10px]">↗</span>
          </a>
        ) : (
          <h5 className="text-[1.05rem] font-bold text-white">{step.title}</h5>
        )}
        <p className="mt-3 text-[13px] leading-7 text-white/38">{step.desc}</p>
      </div>
    </div>
  )
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-white/8 bg-white/[0.02] px-4 py-4">
      <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-white/26">{label}</p>
      <p className="mt-3 break-all text-sm leading-7 text-white/76">{value}</p>
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
  const label = direction === 'prev' ? '上一项目' : '下一项目'

  return (
    <Link
      href={work ? `/works/${work.slug}` : '/works'}
      className="group flex items-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-4 transition-colors hover:border-[#f2b94b]/26"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-white/44 transition-colors group-hover:text-[#f2b94b]">
        <MaterialSymbol icon={icon} size={18} />
      </span>
      <span className="min-w-0">
        <span className="block text-[10px] font-mono uppercase tracking-[0.22em] text-white/22">{label}</span>
        <span className="block truncate text-base font-semibold text-white">{work?.title || '返回作品页'}</span>
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

function buildOverview(work: WorkDetail) {
  const source = work.content || work.description || work.summary || ''
  const paragraphs = source
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  return paragraphs.length > 0
    ? paragraphs
    : ['该项目仍在持续迭代中，详细说明稍后会在此节点继续补充。']
}

function buildContributors(work: WorkDetail): WorkContributor[] {
  if (work.contributors.length > 0) return work.contributors

  return [
    {
      name: 'Lihua Hai',
      role: 'Design / Full-stack',
      avatar_url: null,
    },
  ]
}

function buildCanonicalUrl(siteUrl: string, slug: string) {
  const base = siteUrl?.trim() || 'http://localhost:3000'
  return `${base.replace(/\/$/, '')}/works/${slug}`
}

function formatPrice(value: string | null) {
  const trimmed = value?.trim()
  if (!trimmed) return '¥0'
  if (/^[¥$]/.test(trimmed)) return trimmed
  return `¥${trimmed}`
}

function stripProtocol(value: string) {
  return value.replace(/^https?:\/\//, '')
}

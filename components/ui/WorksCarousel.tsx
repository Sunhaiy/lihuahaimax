'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'
import type { WorkListItem } from '@/types/work'

interface Props {
  works: WorkListItem[]
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

export function WorksCarousel({ works }: Props) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        setActive((current) => (current - 1 + works.length) % works.length)
      }
      if (event.key === 'ArrowRight') {
        setActive((current) => (current + 1) % works.length)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [works.length])

  if (works.length === 0) return null

  const activeWork = works[active]
  const ticketDate = formatTicketDate(activeWork)
  const ticketTime = formatTicketTime(activeWork)

  return (
    <section className="relative isolate flex min-h-[calc(100vh-5rem)] w-full items-center justify-center overflow-hidden bg-[#f4efe8] px-4 py-12 sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.95)_0%,rgba(248,245,239,0.98)_24%,rgba(244,239,232,1)_58%,rgba(239,232,224,1)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(214,203,191,0.12),transparent_14%,transparent_86%,rgba(214,203,191,0.12))]" />
      <div className="pointer-events-none absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-white/60 blur-[110px]" />
      <div className="pointer-events-none absolute left-1/2 top-[28%] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[#d8ccbf]/18 blur-[130px]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-[linear-gradient(180deg,transparent,rgba(205,194,182,0.26))]" />

      <div className="relative mx-auto flex w-full flex-col items-center">
        <div className="relative w-full max-w-[19.6rem] sm:max-w-[20.2rem]">
          <div className="pointer-events-none absolute inset-x-7 top-4 h-full rounded-[2rem] bg-black/12 blur-[20px]" />
          <div className="pointer-events-none absolute inset-x-5 top-[0.85rem] h-full rounded-[1.95rem] bg-black/16 opacity-70" />
          <div className="pointer-events-none absolute inset-x-3 top-2 h-full rounded-[1.9rem] bg-[#1b1b1b] opacity-78" />

          <article className="relative overflow-hidden rounded-[1.85rem] border border-black/12 bg-[#171717] p-[0.92rem] text-white shadow-[0_28px_90px_rgba(0,0,0,0.22),0_6px_22px_rgba(0,0,0,0.14)] transition-transform duration-300 hover:-translate-y-0.5">
            <Link
              href={`/works/${activeWork.slug}`}
              className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              aria-label={`Open ${activeWork.title}`}
            >
              <div className="relative overflow-hidden rounded-[1.08rem] border border-white/7 bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]">
                <div className="aspect-[1.43/1]">
                  {activeWork.cover_url ? (
                    <img
                      src={activeWork.cover_url}
                      alt={activeWork.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(146,122,255,0.7),transparent_32%),radial-gradient(circle_at_70%_30%,rgba(35,215,255,0.65),transparent_34%),radial-gradient(circle_at_50%_75%,rgba(255,92,163,0.55),transparent_30%),linear-gradient(135deg,#050505,#2e2e2e)]">
                      <span className="text-7xl font-black tracking-[-0.08em] text-white/16">
                        {activeWork.title.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04),rgba(0,0,0,0.22))]" />
              </div>

              <div className="px-[0.35rem] pb-1 pt-[1.15rem]">
                <p className="text-[0.78rem] font-medium tracking-[-0.01em] text-white/34">Name</p>
                <h2 className="mt-1.5 text-[1.12rem] font-semibold leading-[1.12] tracking-[-0.055em] text-white sm:text-[1.22rem]">
                  {activeWork.title}
                </h2>

                <div className="mt-[1.35rem] grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[0.78rem] font-medium tracking-[-0.01em] text-white/24">Date</p>
                    <p className="mt-[0.32rem] text-[0.9rem] font-medium tracking-[-0.025em] text-white/90">
                      {ticketDate}
                    </p>
                  </div>
                  <div>
                    <p className="text-[0.78rem] font-medium tracking-[-0.01em] text-white/24">Time</p>
                    <p className="mt-[0.32rem] text-[0.9rem] font-medium tracking-[-0.025em] text-white/90">
                      {ticketTime}
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative mt-[1.35rem]">
                <span className="absolute -left-[1.55rem] top-1/2 h-[1.1rem] w-[1.1rem] -translate-y-1/2 rounded-full bg-[#f4efe8] shadow-[inset_-1px_0_0_rgba(0,0,0,0.08)]" />
                <span className="absolute -right-[1.55rem] top-1/2 h-[1.1rem] w-[1.1rem] -translate-y-1/2 rounded-full bg-[#f4efe8] shadow-[inset_1px_0_0_rgba(0,0,0,0.08)]" />
                <div className="h-px w-full bg-[radial-gradient(circle,rgba(255,255,255,0.45)_1px,transparent_1.2px)] bg-[length:10px_1px] bg-repeat-x bg-center opacity-90" />
              </div>

              <div className="px-[1rem] pb-[1rem] pt-[1.55rem]">
                <div className="relative h-[2.55rem] overflow-hidden rounded-[2px] border border-black/22 bg-[linear-gradient(90deg,#5d5d5d_0%,#ececec_14%,#fcfcfc_30%,#c8c8c8_49%,#efefef_69%,#fafafa_84%,#5c5c5c_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.46),inset_0_-1px_0_rgba(0,0,0,0.18),0_9px_18px_rgba(0,0,0,0.2)]">
                  <div className="absolute inset-y-0 left-[14%] w-[18%] bg-white/28 blur-[10px]" />
                  <div className="absolute inset-y-0 right-[11%] w-[14%] bg-white/26 blur-[8px]" />
                </div>
              </div>
            </Link>
          </article>
        </div>

        <div className="mt-9 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActive((current) => (current - 1 + works.length) % works.length)}
            aria-label="Previous project"
            className="flex h-[3.1rem] w-[3.1rem] items-center justify-center rounded-full border border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(236,230,222,0.9))] text-[#1d1d1d] shadow-[0_10px_24px_rgba(0,0,0,0.08)] transition-colors hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(241,234,226,0.96))]"
          >
            <MaterialSymbol icon="chevron_left" size={19} />
          </button>

          <div className="flex items-center gap-2">
            {works.map((work, index) => (
              <button
                key={work.id}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Go to ${work.title}`}
                className={`rounded-full transition-all duration-300 ${
                  index === active
                    ? 'h-2.5 w-7 bg-[#161616]'
                    : 'h-2.5 w-2.5 bg-black/18 hover:bg-black/28'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setActive((current) => (current + 1) % works.length)}
            aria-label="Next project"
            className="flex h-[3.1rem] w-[3.1rem] items-center justify-center rounded-full border border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(236,230,222,0.9))] text-[#1d1d1d] shadow-[0_10px_24px_rgba(0,0,0,0.08)] transition-colors hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(241,234,226,0.96))]"
          >
            <MaterialSymbol icon="chevron_right" size={19} />
          </button>
        </div>

        <div className="mt-5 text-center">
          <p className="text-[0.72rem] font-mono uppercase tracking-[0.32em] text-black/34">
            {String(active + 1).padStart(2, '0')} / {String(works.length).padStart(2, '0')}
          </p>
          {activeWork.subtitle || activeWork.summary || activeWork.description ? (
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-black/48">
              {activeWork.subtitle || activeWork.summary || activeWork.description}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function formatTicketDate(work: WorkListItem) {
  const timestamp = resolveTicketTimestamp(work)
  return dateFormatter.format(timestamp)
}

function formatTicketTime(work: WorkListItem) {
  const timestamp = resolveTicketTimestamp(work)
  return timeFormatter.format(timestamp).toLowerCase()
}

function resolveTicketTimestamp(work: WorkListItem) {
  const candidates = [work.updated_at, work.created_at]

  for (const value of candidates) {
    const timestamp = new Date(value)
    if (!Number.isNaN(timestamp.getTime())) return timestamp
  }

  return new Date()
}

'use client'

import { useEffect, useMemo, useState } from 'react'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'
import type { GalleryItemRow } from '@/types/gallery'

type LensStop = 35 | 50 | 85

type ImmersiveGalleryProps = {
  items: GalleryItemRow[]
}

type GallerySlide = {
  id: number
  title: string
  description: string
  imageUrl: string
  lensStop: LensStop
}

const LENS_STOPS: LensStop[] = [35, 50, 85]

export function ImmersiveGallery({ items }: ImmersiveGalleryProps) {
  const slides = useMemo<GallerySlide[]>(() => buildSlides(items), [items])
  const collections = useMemo(() => buildCollections(slides), [slides])
  const initialLens = useMemo<LensStop>(() => {
    return LENS_STOPS.find((lens) => collections[lens].length > 0) ?? 50
  }, [collections])

  const [activeLens, setActiveLens] = useState<LensStop>(initialLens)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    setActiveLens(initialLens)
  }, [initialLens])

  useEffect(() => {
    setActiveIndex(0)
  }, [activeLens])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowLeft') {
        setActiveIndex((current) => current - 1)
      }
      if (event.key === 'ArrowRight') {
        setActiveIndex((current) => current + 1)
      }
      if (event.key === 'ArrowUp') {
        const currentLensIndex = LENS_STOPS.indexOf(activeLens)
        const nextLens = LENS_STOPS[Math.max(0, currentLensIndex - 1)]
        setActiveLens(nextLens)
      }
      if (event.key === 'ArrowDown') {
        const currentLensIndex = LENS_STOPS.indexOf(activeLens)
        const nextLens = LENS_STOPS[Math.min(LENS_STOPS.length - 1, currentLensIndex + 1)]
        setActiveLens(nextLens)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeLens])

  const activeSlides = collections[activeLens]
  const safeIndex = normalizeIndex(activeIndex, activeSlides.length)
  const activeSlide = activeSlides[safeIndex]
  const prevSlide = activeSlides[normalizeIndex(safeIndex - 1, activeSlides.length)]
  const nextSlide = activeSlides[normalizeIndex(safeIndex + 1, activeSlides.length)]
  const markerPosition = activeSlides.length > 1 ? safeIndex / (activeSlides.length - 1) : 0.5

  return (
    <section className="relative isolate min-h-[calc(100vh-4rem)] overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_32%),radial-gradient(circle_at_top,rgba(90,120,255,0.08),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.85))]" />

      <div className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
        {slides.length === 0 ? (
          <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
              <MaterialSymbol icon="photo_library" size={30} className="text-white/60" />
            </div>
            <h1 className="mt-6 text-2xl font-semibold">相册里还没有图片</h1>
            <p className="mt-3 text-sm text-white/48">先去后台上传几张照片，这里就会切成沉浸式预览。</p>
          </div>
        ) : (
          <>
            <div className="relative flex h-[62vh] min-h-[30rem] w-full max-w-[72rem] items-center justify-center">
              <GalleryCard
                slide={prevSlide}
                position="left"
                onClick={() => setActiveIndex((current) => current - 1)}
              />
              <GalleryCard
                slide={activeSlide}
                position="center"
                onClick={() => setActiveIndex((current) => current)}
              />
              <GalleryCard
                slide={nextSlide}
                position="right"
                onClick={() => setActiveIndex((current) => current + 1)}
              />
            </div>

            <div className="mt-10 flex w-full max-w-[42rem] flex-col items-center">
              <div className="flex items-center gap-1 rounded-full border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.03))] p-2 shadow-[0_20px_45px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                {LENS_STOPS.map((lens) => {
                  const active = activeLens === lens

                  return (
                    <button
                      key={lens}
                      type="button"
                      onClick={() => setActiveLens(lens)}
                      className={`min-w-[7rem] rounded-full px-6 py-3 text-center text-[1.05rem] font-semibold transition-all duration-300 ${
                        active
                          ? 'bg-white/[0.06] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]'
                          : 'text-white/28 hover:text-white/46'
                      }`}
                    >
                      {lens}mm
                    </button>
                  )
                })}
              </div>

              <div className="relative mt-7 w-full max-w-[34rem] px-4">
                <div className="relative h-11">
                  <div className="absolute inset-x-4 top-1/2 flex -translate-y-1/2 items-center justify-between [mask-image:linear-gradient(90deg,transparent_0%,rgba(0,0,0,0.85)_12%,black_20%,black_80%,rgba(0,0,0,0.85)_88%,transparent_100%)]">
                    {Array.from({ length: 49 }).map((_, index) => {
                      const distance = Math.abs(index - 24)
                      const major = index % 4 === 0
                      const medium = !major && index % 2 === 0

                      const heightClass = major ? 'h-8' : medium ? 'h-6' : 'h-4'
                      const opacity =
                        distance <= 6
                          ? 'opacity-100'
                          : distance <= 12
                            ? 'opacity-80'
                            : distance <= 18
                              ? 'opacity-55'
                              : 'opacity-28'

                      return (
                        <span
                          key={index}
                          className={`block w-px rounded-full bg-white ${heightClass} ${opacity}`}
                        />
                      )
                    })}
                  </div>
                  <div className="pointer-events-none absolute inset-x-0 top-1/2 h-10 -translate-y-1/2 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_38%)] blur-xl" />
                  <span
                    className="absolute top-1/2 h-9 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff3b30] shadow-[0_0_18px_rgba(255,59,48,0.85)]"
                    style={{ left: `calc(1rem + ${markerPosition * 100}% - ${markerPosition * 2}rem)` }}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

function GalleryCard({
  slide,
  position,
  onClick,
}: {
  slide?: GallerySlide
  position: 'left' | 'center' | 'right'
  onClick: () => void
}) {
  if (!slide) return null

  const positionClass =
    position === 'center'
      ? 'z-20 translate-y-0 scale-100 rotate-0 opacity-100'
      : position === 'left'
        ? 'z-10 -translate-x-[38%] translate-y-1 scale-[0.86] -rotate-[8deg] opacity-72 blur-[0.2px]'
        : 'z-10 translate-x-[38%] translate-y-1 scale-[0.86] rotate-[8deg] opacity-72 blur-[0.2px]'

  const sizeClass =
    position === 'center'
      ? 'h-[31rem] w-[min(32rem,42vw)] rounded-[2rem] sm:h-[36rem]'
      : 'h-[28rem] w-[min(24rem,31vw)] rounded-[1.75rem] sm:h-[32rem]'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`absolute overflow-hidden ${sizeClass} ${positionClass} transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]`}
      aria-label={slide.title}
    >
      <div className="absolute inset-0 rounded-[inherit] bg-white/[0.04]" />
      <img
        src={slide.imageUrl}
        alt={slide.title}
        className="h-full w-full rounded-[inherit] object-cover"
      />
      <div
        className={`absolute inset-0 rounded-[inherit] ${
          position === 'center'
            ? 'bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.03)_100%)]'
            : 'bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.38)_100%)]'
        }`}
      />
      <div
        className={`absolute inset-x-8 bottom-6 h-10 rounded-full blur-2xl ${
          position === 'center' ? 'bg-black/35' : 'bg-black/20'
        }`}
      />
    </button>
  )
}

function buildSlides(items: GalleryItemRow[]): GallerySlide[] {
  const source = items.length > 0 ? items : []

  return source.map((item, index) => ({
    id: item.id,
    title: item.title?.trim() || item.file_name,
    description: item.description?.trim() || '',
    imageUrl: item.url,
    lensStop: resolveLensStop(item, index),
  }))
}

function buildCollections(slides: GallerySlide[]): Record<LensStop, GallerySlide[]> {
  const grouped = {
    35: slides.filter((slide) => slide.lensStop === 35),
    50: slides.filter((slide) => slide.lensStop === 50),
    85: slides.filter((slide) => slide.lensStop === 85),
  } satisfies Record<LensStop, GallerySlide[]>

  LENS_STOPS.forEach((lens, lensIndex) => {
    if (grouped[lens].length === 0) {
      const fallback = slides.filter((_, index) => index % LENS_STOPS.length === lensIndex)
      grouped[lens] = fallback.length > 0 ? fallback : slides
    }
  })

  return grouped
}

function resolveLensStop(item: GalleryItemRow, index: number): LensStop {
  const focal = item.exif?.focalLengthIn35mm ?? item.exif?.focalLength ?? null

  if (typeof focal === 'number' && Number.isFinite(focal)) {
    return LENS_STOPS.reduce((closest, current) => {
      return Math.abs(current - focal) < Math.abs(closest - focal) ? current : closest
    }, 50 as LensStop)
  }

  return LENS_STOPS[index % LENS_STOPS.length]
}

function normalizeIndex(index: number, length: number) {
  if (length === 0) return 0
  return (index % length + length) % length
}

'use client'

import { useEffect, useLayoutEffect, useRef, useState, type DependencyList, type RefObject } from 'react'
import { gsap } from 'gsap'

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return

    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setPrefersReducedMotion(media.matches)

    update()

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', update)
      return () => media.removeEventListener('change', update)
    }

    media.addListener(update)
    return () => media.removeListener(update)
  }, [])

  return prefersReducedMotion
}

export function useGsapScope<T extends HTMLElement>(
  setup: (scope: T, tools: { gsap: typeof gsap; prefersReducedMotion: boolean }) => void | (() => void),
  deps: DependencyList = []
): { scopeRef: RefObject<T | null>; prefersReducedMotion: boolean } {
  const scopeRef = useRef<T | null>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  useIsomorphicLayoutEffect(() => {
    if (!scopeRef.current) return

    let cleanup: void | (() => void)

    if (prefersReducedMotion) {
      cleanup = setup(scopeRef.current, { gsap, prefersReducedMotion })
      return () => {
        cleanup?.()
      }
    }

    const ctx = gsap.context(() => {
      cleanup = setup(scopeRef.current as T, { gsap, prefersReducedMotion })
    }, scopeRef)

    return () => {
      cleanup?.()
      ctx.revert()
    }
  }, [prefersReducedMotion, ...deps])

  return { scopeRef, prefersReducedMotion }
}

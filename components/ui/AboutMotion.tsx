'use client'

import { useEffect } from 'react'

const ABOUT_MOTION_STYLES = `
.about-portfolio.about-motion-enabled .about-reveal,
.about-portfolio.about-motion-enabled .about-stagger > * {
  opacity: 0;
  filter: blur(14px);
  transform: translate3d(0, 44px, 0);
  transition:
    opacity .9s cubic-bezier(.16,1,.3,1),
    filter .9s cubic-bezier(.16,1,.3,1),
    transform .9s cubic-bezier(.16,1,.3,1);
  transition-delay: var(--reveal-delay, 0ms);
}

.about-portfolio.about-motion-enabled .about-stagger > * {
  transition-delay: calc(var(--stagger-index, 0) * 74ms);
}

.about-portfolio.about-motion-enabled .about-reveal.is-visible,
.about-portfolio.about-motion-enabled .about-stagger > *.is-visible {
  opacity: 1;
  filter: blur(0);
  transform: translate3d(0, 0, 0);
}

.about-portfolio.about-mounted .about-hero-title {
  animation: about-title-in .86s cubic-bezier(.16,1,.3,1) both;
}

.about-portfolio.about-mounted .about-hero-copy {
  animation: about-copy-in 1.05s cubic-bezier(.16,1,.3,1) both;
}

.about-portfolio.about-mounted .about-hero-link {
  animation: about-orb-in .86s cubic-bezier(.16,1,.3,1) both;
}

.about-hero-link {
  position: relative;
  isolation: isolate;
}

.about-hero-link::after {
  content: '';
  position: absolute;
  inset: -12px;
  z-index: -1;
  border-radius: inherit;
  border: 1px solid rgba(255,255,255,.16);
  opacity: 0;
  transform: scale(.76);
}

.about-portfolio.about-mounted .about-hero-link::after {
  animation: about-orb-ring 1.25s cubic-bezier(.16,1,.3,1) .18s both;
}

.about-project-card {
  transition: border-color .35s ease, transform .35s cubic-bezier(.16,1,.3,1);
}

.about-project-card:hover {
  border-color: rgba(255,255,255,.76);
  transform: translateY(-4px);
}

@keyframes about-title-in {
  from { opacity: 0; transform: translateY(22px); filter: blur(8px); }
  to { opacity: 1; transform: translateY(0); filter: blur(0); }
}

@keyframes about-copy-in {
  from { opacity: 0; transform: translateY(22px); filter: blur(8px); }
  to { opacity: 1; transform: translateY(0); filter: blur(0); }
}

@keyframes about-orb-in {
  from { opacity: 0; transform: translateY(22px) rotate(-14deg) scale(.72); }
  to { opacity: 1; transform: translateY(0) rotate(0) scale(1); }
}

@keyframes about-orb-ring {
  0% { opacity: .72; transform: scale(.76); }
  100% { opacity: 0; transform: scale(1.45); }
}

@media (prefers-reduced-motion: reduce) {
  .about-portfolio.about-motion-enabled .about-reveal,
  .about-portfolio.about-motion-enabled .about-stagger > * {
    opacity: 1;
    filter: none;
    transform: none;
    transition: none;
  }
  .about-portfolio *,
  .about-portfolio *::before,
  .about-portfolio *::after {
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .001ms !important;
  }
}
`

export function AboutMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.about-portfolio')
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const revealTargets = Array.from(
      document.querySelectorAll<HTMLElement>('.about-reveal, .about-stagger > *')
    )

    root?.classList.add('about-motion-enabled')

    if (reduceMotion) {
      revealTargets.forEach((target) => target.classList.add('is-visible'))
      root?.classList.add('about-mounted')
      return () => {
        root?.classList.remove('about-motion-enabled', 'about-mounted')
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        })
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.16 }
    )

    revealTargets.forEach((target) => observer.observe(target))

    const mountFrame = window.requestAnimationFrame(() => {
      root?.classList.add('about-mounted')
    })
    return () => {
      window.cancelAnimationFrame(mountFrame)
      observer.disconnect()
      root?.classList.remove('about-motion-enabled', 'about-mounted')
    }
  }, [])

  return (
    <style>{ABOUT_MOTION_STYLES}</style>
  )
}

import type React from 'react'
import Link from 'next/link'
import { SceneShell } from '@/components/scene/SceneShell'
import { NavBar } from '@/components/ui/NavBar'
import { findCategories } from '@/lib/db/dao/postDao'
import { getBackgroundSceneSettings } from '@/lib/scene'
import { getSiteProfile } from '@/lib/site'

function hexToHslChannels(hex?: string | null) {
  const clean = (hex || '#10b981').replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16) / 255
  const g = parseInt(clean.slice(2, 4), 16) / 255
  const b = parseInt(clean.slice(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  const lightness = (max + min) / 2

  let hue = 0
  if (delta !== 0) {
    if (max === r) hue = ((g - b) / delta) % 6
    else if (max === g) hue = (b - r) / delta + 2
    else hue = (r - g) / delta + 4
  }

  hue = Math.round(hue * 60)
  if (hue < 0) hue += 360

  const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1))
  return `${hue} ${Math.round(saturation * 100)}% ${Math.round(lightness * 100)}%`
}

export default async function BlogLayout({ children }: { children: React.ReactNode }) {
  const [categories, scene, siteProfile] = await Promise.all([
    findCategories().catch(() => []),
    getBackgroundSceneSettings(),
    getSiteProfile(),
  ])

  const rssHref = siteProfile.rssUrl?.startsWith('http')
    ? siteProfile.rssUrl
    : siteProfile.rssUrl || '/rss.xml'
  const themeChannels = hexToHslChannels(siteProfile.themeColor)
  const themeStyle = {
    '--primary': themeChannels,
    '--ring': themeChannels,
    '--accent': themeChannels,
    '--ember': themeChannels,
  } as React.CSSProperties

  return (
    <SceneShell
      scene={scene}
      canEdit={false}
      quickActionHref={siteProfile.githubUrl}
      quickActionLabel="GitHub"
      style={themeStyle}
    >
      <div
        className="public-theme flex min-h-screen flex-col bg-background text-foreground"
        style={themeStyle}
      >
        <NavBar
          categories={categories}
          siteProfile={{
            siteName: siteProfile.siteName,
            siteNameEn: siteProfile.siteNameEn,
          }}
        />

        <main className="min-h-0 flex-1 pt-16">{children}</main>

        <footer className="relative z-20 mt-auto shrink-0 border-t border-border bg-background py-8">
          <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              (c) {new Date().getFullYear()} {siteProfile.siteName} · {siteProfile.footerText}
            </p>

            <div className="flex items-center gap-4">
              <Link
                href={rssHref}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                RSS
              </Link>
              <Link
                href="/sitemap.xml"
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                网站地图
              </Link>
              <Link
                href="/links"
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                友情链接
              </Link>
              <Link
                href="/dashboard"
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                后台
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </SceneShell>
  )
}

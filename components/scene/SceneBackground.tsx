'use client'

import { SceneContentLayer } from './SceneContentLayer'
import { SceneFilterLayer } from './SceneFilterLayer'
import { SceneWeatherLayer } from './SceneWeatherLayer'
import { toRgba } from '@/lib/scene-color'
import type { BackgroundSceneSettings, SceneEnabledPage } from '@/types/work'

interface SceneBackgroundProps {
  scene: BackgroundSceneSettings
  page: SceneEnabledPage
  children: React.ReactNode
  className?: string
  contentClassName?: string
}

function isSceneWeatherEnabled(
  scene: BackgroundSceneSettings,
  page: SceneEnabledPage
) {
  return scene.weather.preset !== 'none' && (
    scene.weather.enabledPages.includes('all') ||
    scene.weather.enabledPages.includes(page)
  )
}

export function SceneBackground({
  scene,
  page,
  children,
  className = '',
  contentClassName = '',
}: SceneBackgroundProps) {
  const hasImage = Boolean(scene.image.url)

  return (
    <div className={`relative isolate ${className}`.trim()}>
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-background" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: hasImage
              ? `url(${scene.image.url})`
              : `radial-gradient(circle at top, ${toRgba(scene.filter.tintColor, 0.16)}, transparent 40%)`,
            backgroundPosition: scene.image.position,
            backgroundSize: scene.image.size,
            opacity: scene.image.opacity,
            filter: `saturate(1.02) brightness(${1 - scene.image.opacity * 0.18})`,
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: `hsl(var(--background) / ${0.14 + scene.image.opacity * 0.18})` }}
        />
        <div className="absolute inset-0 scene-terminal-grid opacity-[0.03]" />
        <SceneFilterLayer scene={scene} />
        <SceneWeatherLayer
          preset={scene.weather.preset}
          intensity={scene.weather.intensity}
          enabled={isSceneWeatherEnabled(scene, page)}
        />
      </div>
      <SceneContentLayer className={contentClassName}>{children}</SceneContentLayer>
    </div>
  )
}

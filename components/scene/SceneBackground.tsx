'use client'

import { SceneContentLayer } from './SceneContentLayer'
import { SceneFilterLayer } from './SceneFilterLayer'
import { SceneWeatherLayer } from './SceneWeatherLayer'
import type { BackgroundSceneSettings, SceneEnabledPage } from '@/types/work'

interface SceneBackgroundProps {
  scene: BackgroundSceneSettings
  page: SceneEnabledPage
  children: React.ReactNode
  className?: string
  contentClassName?: string
}

function isWeatherEnabled(scene: BackgroundSceneSettings, page: SceneEnabledPage) {
  if (page === 'works') return false

  return (
    scene.weather.preset !== 'none' &&
    (scene.weather.enabledPages.includes('all') || scene.weather.enabledPages.includes(page))
  )
}

export function SceneBackground({
  scene,
  page,
  children,
  className = '',
  contentClassName = '',
}: SceneBackgroundProps) {
  const weatherEnabled = isWeatherEnabled(scene, page)
  const hasImage = Boolean(scene.image.url) && page !== 'moments'
  const weatherIntensity =
    page === 'moments' ? Math.max(scene.weather.intensity, 0.58) : scene.weather.intensity

  return (
    <div className={`scene-page-${page} relative isolate bg-background ${className}`.trim()}>
      {hasImage ? (
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${scene.image.url})`,
            backgroundPosition: scene.image.position,
            backgroundSize: scene.image.size,
            opacity: scene.image.opacity,
          }}
        />
      ) : null}

      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <SceneFilterLayer scene={scene} />
      </div>

      <SceneWeatherLayer
        preset={scene.weather.preset}
        intensity={weatherIntensity}
        enabled={weatherEnabled}
      />

      <SceneContentLayer className={contentClassName}>{children}</SceneContentLayer>
    </div>
  )
}

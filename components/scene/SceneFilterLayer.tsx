import type { BackgroundSceneSettings } from '@/types/work'
import { toRgba } from '@/lib/scene-color'

interface SceneFilterLayerProps {
  scene: BackgroundSceneSettings
}

export function SceneFilterLayer({ scene }: SceneFilterLayerProps) {
  const topOverlay = 0.12 + scene.filter.overlay * 0.48
  const bottomOverlay = Math.min(0.9, 0.22 + scene.filter.overlay * 0.58 + scene.filter.gradient * 0.12)
  const topTint = 0.04 + scene.filter.gradient * 0.1
  const vignetteStart = 0.24 + scene.filter.vignette * 0.56
  const vignetteEnd = Math.min(0.92, 0.34 + scene.filter.vignette * 0.5)

  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: `blur(${scene.filter.blur}px)`,
          WebkitBackdropFilter: `blur(${scene.filter.blur}px)`,
          background: `linear-gradient(180deg, hsl(var(--background) / ${topOverlay}) 0%, hsl(var(--background) / ${bottomOverlay}) 100%)`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at top, ${toRgba(scene.filter.tintColor, topTint)} 0%, transparent 46%),
            radial-gradient(circle at bottom, hsl(var(--background) / ${vignetteStart}) 0%, hsl(var(--background) / ${vignetteEnd}) 100%)`,
        }}
      />
      <div
        className="absolute inset-0 scene-noise"
        style={{ opacity: scene.filter.noise }}
      />
    </>
  )
}

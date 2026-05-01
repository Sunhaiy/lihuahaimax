import type { BackgroundSceneSettings } from '@/types/work'

interface SceneFilterLayerProps {
  scene: BackgroundSceneSettings
}

export function SceneFilterLayer({ scene }: SceneFilterLayerProps) {
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: `blur(${scene.filter.blur}px)`,
          WebkitBackdropFilter: `blur(${scene.filter.blur}px)`,
          background: `linear-gradient(180deg, rgba(2, 6, 23, ${scene.filter.overlay}) 0%, rgba(2, 6, 23, ${Math.min(0.92, scene.filter.overlay + scene.filter.gradient * 0.22)}) 100%)`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at top, rgba(56, 189, 248, ${scene.filter.gradient * 0.22}) 0%, transparent 42%),
            radial-gradient(circle at bottom, rgba(2, 6, 23, ${scene.filter.vignette}) 0%, rgba(2, 6, 23, ${Math.min(0.96, scene.filter.vignette + 0.22)}) 100%)`,
        }}
      />
      <div
        className="absolute inset-0 scene-noise"
        style={{ opacity: scene.filter.noise }}
      />
    </>
  )
}

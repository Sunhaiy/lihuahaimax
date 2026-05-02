'use client'

import { SceneContentLayer } from './SceneContentLayer'
import type { BackgroundSceneSettings, SceneEnabledPage } from '@/types/work'

interface SceneBackgroundProps {
  scene: BackgroundSceneSettings
  page: SceneEnabledPage
  children: React.ReactNode
  className?: string
  contentClassName?: string
}

export function SceneBackground({
  children,
  className = '',
  contentClassName = '',
}: SceneBackgroundProps) {
  return (
    <div className={`relative isolate bg-background ${className}`.trim()}>
      <SceneContentLayer className={contentClassName}>{children}</SceneContentLayer>
    </div>
  )
}

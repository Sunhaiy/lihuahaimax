'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { SceneBackground } from './SceneBackground'
import { SceneQuickSettings } from './SceneQuickSettings'
import type { BackgroundSceneSettings, SceneEnabledPage } from '@/types/work'

interface SceneShellProps {
  scene: BackgroundSceneSettings
  canEdit: boolean
  quickActionHref?: string
  quickActionLabel?: string
  children: React.ReactNode
}

function resolveScenePage(pathname: string): SceneEnabledPage {
  if (pathname === '/') return 'home'
  if (pathname.startsWith('/moments')) return 'moments'
  if (pathname.startsWith('/works')) return 'works'
  return 'all'
}

export function SceneShell({
  scene,
  canEdit,
  quickActionHref,
  quickActionLabel,
  children,
}: SceneShellProps) {
  const pathname = usePathname()
  const [savedScene, setSavedScene] = useState(scene)
  const [liveScene, setLiveScene] = useState(scene)

  useEffect(() => {
    setSavedScene(scene)
    setLiveScene(scene)
  }, [scene])

  return (
    <SceneBackground scene={liveScene} page={resolveScenePage(pathname)} className="min-h-screen">
      {children}
      <SceneQuickSettings
        scene={savedScene}
        canEdit={canEdit}
        quickActionHref={quickActionHref}
        quickActionLabel={quickActionLabel}
        onPreviewChange={setLiveScene}
        onSceneSaved={(nextScene) => {
          setSavedScene(nextScene)
          setLiveScene(nextScene)
        }}
      />
    </SceneBackground>
  )
}

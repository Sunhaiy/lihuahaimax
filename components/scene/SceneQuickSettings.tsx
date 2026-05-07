'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'
import type { BackgroundSceneSettings } from '@/types/work'

interface SceneQuickSettingsProps {
  scene: BackgroundSceneSettings
  canEdit: boolean
  onPreviewChange: (scene: BackgroundSceneSettings) => void
  onSceneSaved: (scene: BackgroundSceneSettings) => void
  quickActionHref?: string
  quickActionLabel?: string
}

export function SceneQuickSettings({
  scene,
  canEdit,
  onPreviewChange,
  onSceneSaved,
  quickActionHref,
  quickActionLabel = '自定义',
}: SceneQuickSettingsProps) {
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    onPreviewChange(scene)
    onSceneSaved(scene)
  }, [onPreviewChange, onSceneSaved, scene])

  if (!mounted) return null

  const showCustomAction = Boolean(quickActionHref)

  return (
    <div className="fixed bottom-6 right-6 z-[70] flex flex-col items-end gap-3">
      {open ? (
        <div className="flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex h-12 min-w-[9.5rem] items-center justify-between rounded-full border border-border/80 bg-background/92 px-4 text-sm font-medium text-foreground shadow-[0_16px_38px_rgba(15,23,42,0.12)] backdrop-blur-2xl transition-all hover:border-primary/24 hover:text-primary dark:shadow-[0_16px_38px_rgba(0,0,0,0.32)]"
          >
            <span>返回顶部</span>
            <MaterialSymbol icon="arrow_upward" size={18} />
          </button>

          {showCustomAction ? (
            <Link
              href={quickActionHref!}
              target="_blank"
              rel="noreferrer"
              className="flex h-12 min-w-[9.5rem] items-center justify-between rounded-full border border-border/80 bg-background/92 px-4 text-sm font-medium text-foreground shadow-[0_16px_38px_rgba(15,23,42,0.12)] backdrop-blur-2xl transition-all hover:border-primary/24 hover:text-primary dark:shadow-[0_16px_38px_rgba(0,0,0,0.32)]"
            >
              <span>{quickActionLabel}</span>
              <MaterialSymbol icon="open_in_new" size={18} />
            </Link>
          ) : null}

          {canEdit ? (
            <Button
              size="sm"
              variant="secondary"
              className="rounded-full"
              onClick={() => setOpen(false)}
            >
              编辑模式已关闭
            </Button>
          ) : null}
        </div>
      ) : null}

      <button
        type="button"
        aria-label={open ? '收起快捷按钮' : '展开快捷按钮'}
        onClick={() => setOpen((current) => !current)}
        className="flex h-14 w-14 items-center justify-center rounded-full border border-border/80 bg-background/92 text-primary shadow-[0_16px_42px_rgba(15,23,42,0.16)] backdrop-blur-2xl transition-transform duration-200 hover:-translate-y-1 dark:shadow-[0_16px_42px_rgba(0,0,0,0.34)]"
      >
        <MaterialSymbol icon={open ? 'close' : 'widgets'} size={22} />
      </button>
    </div>
  )
}

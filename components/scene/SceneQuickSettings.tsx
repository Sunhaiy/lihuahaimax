'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'
import type { BackgroundSceneSettings } from '@/types/work'

interface SceneQuickSettingsProps {
  scene: BackgroundSceneSettings
  canEdit: boolean
  onPreviewChange: (scene: BackgroundSceneSettings) => void
  onSceneSaved: (scene: BackgroundSceneSettings) => void
}

type NoticeTone = 'neutral' | 'success' | 'error'

function isLocalSceneLab() {
  if (typeof window === 'undefined') return false
  return ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname)
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

const noticeClasses: Record<NoticeTone, string> = {
  neutral: 'border-white/10 bg-white/[0.04] text-muted-foreground',
  success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200',
  error: 'border-red-500/20 bg-red-500/10 text-red-200',
}

export function SceneQuickSettings({
  scene,
  canEdit,
  onPreviewChange,
  onSceneSaved,
}: SceneQuickSettingsProps) {
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(scene)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<{ tone: NoticeTone; text: string } | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setDraft(scene)
  }, [scene])

  useEffect(() => {
    onPreviewChange(draft)
  }, [draft, onPreviewChange])

  if (!mounted || !isLocalSceneLab()) return null

  function updateDraft(updater: (current: BackgroundSceneSettings) => BackgroundSceneSettings) {
    setDraft((current) => updater(current))
    setNotice(null)
  }

  function applyNeutralPreset() {
    updateDraft((current) => ({
      ...current,
      image: {
        ...current.image,
        opacity: clamp(Math.max(current.image.opacity, 0.56), 0, 1),
      },
      weather: {
        ...current.weather,
        intensity: 0.56,
      },
      filter: {
        ...current.filter,
        tintColor: '#e2e8f0',
        overlay: 0.34,
        gradient: 0.12,
        blur: 8,
        vignette: 0.22,
      },
    }))
    setNotice({ tone: 'neutral', text: '已切到更清透的中性夜雨预设，先看效果再决定要不要保存。' })
  }

  function resetDraft() {
    setDraft(scene)
    setNotice({ tone: 'neutral', text: '已恢复为当前已保存的全站场景设置。' })
  }

  async function saveDraft() {
    if (!canEdit) {
      setNotice({ tone: 'error', text: '当前只能本地预览。先登录后台，再把这套参数保存到全站。' })
      return
    }

    setSaving(true)
    setNotice(null)

    try {
      const response = await fetch('/api/settings/background-scene', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })

      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        const error =
          payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
            ? payload.error
            : '保存失败，请稍后再试。'
        throw new Error(error)
      }

      onSceneSaved(payload as BackgroundSceneSettings)
      setNotice({ tone: 'success', text: '场景设置已保存，全站公共页面都会同步使用这套参数。' })
    } catch (error) {
      setNotice({
        tone: 'error',
        text: error instanceof Error ? error.message : '保存失败，请稍后再试。',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-[70] flex flex-col items-end gap-3">
      {open ? (
        <div className="w-[min(24rem,calc(100vw-1.5rem))] rounded-[28px] border border-white/10 bg-background/85 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.55)] backdrop-blur-2xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.26em] text-muted-foreground">
                Scene Lab
              </p>
              <h2 className="mt-2 text-lg font-semibold text-foreground">实时场景调节</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                这里改的是本页实时预览。满意后再保存，就会同步到首页、文章、动漫和其他公共页面。
              </p>
            </div>

            <button
              type="button"
              aria-label="关闭场景调节面板"
              onClick={() => setOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-muted-foreground transition-colors hover:text-foreground"
            >
              <MaterialSymbol icon="close" size={18} />
            </button>
          </div>

          {notice ? (
            <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm leading-6 ${noticeClasses[notice.tone]}`}>
              {notice.text}
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={applyNeutralPreset}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-white/[0.08]"
            >
              更清透
            </button>
            <button
              type="button"
              onClick={() =>
                updateDraft((current) => ({
                  ...current,
                  weather: {
                    ...current.weather,
                    preset: current.weather.preset === 'storm' ? 'none' : 'storm',
                  },
                }))
              }
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-white/[0.08]"
            >
              {draft.weather.preset === 'storm' ? '关闭天气' : '开启天气'}
            </button>
          </div>

          <div className="mt-5 space-y-4">
            <Field label="氛围色">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3">
                <input
                  type="color"
                  value={draft.filter.tintColor}
                  onChange={(event) =>
                    updateDraft((current) => ({
                      ...current,
                      filter: { ...current.filter, tintColor: event.target.value },
                    }))
                  }
                  className="h-11 w-14 cursor-pointer rounded-xl border border-white/10 bg-transparent p-1"
                />
                <input
                  value={draft.filter.tintColor}
                  onChange={(event) =>
                    updateDraft((current) => ({
                      ...current,
                      filter: { ...current.filter, tintColor: event.target.value },
                    }))
                  }
                  className={INPUT_CLASS}
                />
              </div>
            </Field>

            <RangeField
              label="叠层浓度"
              value={draft.filter.overlay}
              onChange={(value) =>
                updateDraft((current) => ({
                  ...current,
                  filter: { ...current.filter, overlay: value },
                }))
              }
            />
            <RangeField
              label="渐变强度"
              value={draft.filter.gradient}
              onChange={(value) =>
                updateDraft((current) => ({
                  ...current,
                  filter: { ...current.filter, gradient: value },
                }))
              }
            />
            <RangeField
              label="边缘压暗"
              value={draft.filter.vignette}
              onChange={(value) =>
                updateDraft((current) => ({
                  ...current,
                  filter: { ...current.filter, vignette: value },
                }))
              }
            />
            <RangeField
              label="天气强度"
              value={draft.weather.intensity}
              onChange={(value) =>
                updateDraft((current) => ({
                  ...current,
                  weather: { ...current.weather, intensity: value },
                }))
              }
            />
            <RangeField
              label="背景图透明度"
              value={draft.image.opacity}
              onChange={(value) =>
                updateDraft((current) => ({
                  ...current,
                  image: { ...current.image, opacity: value },
                }))
              }
            />
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <Button variant="secondary" size="sm" onClick={resetDraft}>
              <MaterialSymbol icon="replay" size={16} />
              重置
            </Button>
            <Button size="sm" onClick={saveDraft} loading={saving}>
              <MaterialSymbol icon="save" size={16} />
              保存全站
            </Button>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        aria-label="打开场景调节面板"
        onClick={() => setOpen((current) => !current)}
        className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-background/85 text-ember shadow-[0_14px_42px_rgba(2,6,23,0.45)] backdrop-blur-xl transition-transform duration-200 hover:-translate-y-1"
      >
        <MaterialSymbol icon="tune" size={22} fill />
      </button>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block space-y-2">
      <span className="text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  )
}

function RangeField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <Field label={label}>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
        <div className="flex items-center justify-between text-sm text-foreground">
          <span>{value.toFixed(2)}</span>
          <span className="text-xs text-muted-foreground">0 - 1</span>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="mt-3 w-full accent-[hsl(var(--ember))]"
        />
      </div>
    </Field>
  )
}

const INPUT_CLASS =
  'h-11 flex-1 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-foreground placeholder:text-muted-foreground/45 focus:outline-none focus:ring-2 focus:ring-ocean/35'

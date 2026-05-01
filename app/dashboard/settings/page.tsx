'use client'

import { useEffect, useRef, useState } from 'react'
import useSWR from 'swr'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'
import type { BackgroundSceneSettings, SceneEnabledPage } from '@/types/work'

const fetcher = (url: string) => fetch(url).then((response) => response.json())

function readApiError(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== 'object') return fallback

  const source = payload as {
    error?: string | { fieldErrors?: Record<string, string[]>; formErrors?: string[] }
  }

  if (typeof source.error === 'string' && source.error.trim()) {
    return source.error
  }

  if (source.error && typeof source.error === 'object') {
    const formError = source.error.formErrors?.find(Boolean)
    if (formError) return formError

    const fieldError = Object.values(source.error.fieldErrors ?? {})
      .flat()
      .find(Boolean)
    if (fieldError) return fieldError
  }

  return fallback
}

const ENABLED_PAGES: Array<{ key: SceneEnabledPage; label: string; description: string }> = [
  { key: 'home', label: '首页 Hero', description: '推荐启用风暴天气，让首页与 Moments 共用统一氛围。' },
  { key: 'moments', label: 'Moments', description: '风暴效果主展示页，雨滴和闪电会最明显。' },
  { key: 'works-detail', label: '项目详情', description: '后续可复用到详情页场景。' },
]

async function saveScene(scene: BackgroundSceneSettings) {
  const res = await fetch('/api/settings/background-scene', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scene),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => null)
    throw new Error(readApiError(error, '保存失败'))
  }

  return res.json()
}

async function uploadSceneImage(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch('/api/settings/background-scene', {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => null)
    throw new Error(readApiError(error, '上传失败'))
  }

  return res.json()
}

async function clearSceneImage() {
  const res = await fetch('/api/settings/background-scene', { method: 'DELETE' })
  if (!res.ok) {
    const error = await res.json().catch(() => null)
    throw new Error(readApiError(error, '清除失败'))
  }
  return res.json()
}

export default function SettingsPage() {
  const { data, isLoading, mutate } = useSWR<BackgroundSceneSettings>(
    '/api/settings/background-scene',
    fetcher
  )
  const [form, setForm] = useState<BackgroundSceneSettings | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (data) setForm(data)
  }, [data])

  function updateForm(updater: (current: BackgroundSceneSettings) => BackgroundSceneSettings) {
    setForm((current) => (current ? updater(current) : current))
  }

  async function handleSave() {
    if (!form) return
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const next = await saveScene(form)
      mutate(next, false)
      setSuccess('场景设置已保存。')
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')
    setSuccess('')

    try {
      const next = await uploadSceneImage(file)
      mutate(next, false)
      setSuccess('背景图已更新。')
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleClearImage() {
    setClearing(true)
    setError('')
    setSuccess('')

    try {
      const next = await clearSceneImage()
      mutate(next, false)
      setSuccess('背景图已清除。')
    } catch (err) {
      setError(err instanceof Error ? err.message : '清除失败')
    } finally {
      setClearing(false)
    }
  }

  if (isLoading || !form) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
            Scene Settings
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">全局背景与天气</h1>
        </div>
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="h-[520px] rounded-[28px] border border-border bg-card/70 animate-pulse" />
          <div className="h-[520px] rounded-[28px] border border-border bg-card/70 animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-muted-foreground">
            Scene Settings
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">全局背景与天气</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
            统一管理背景图层、天气预设、滤镜和页面启用范围。当前第一版只正式启用
            <span className="mx-1 font-mono text-foreground">storm</span>
            风暴天气，但整体架构已经支持复用到首页与项目详情。
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => fileRef.current?.click()} disabled={uploading}>
            <MaterialSymbol icon="upload" size={18} />
            {uploading ? '上传中' : '上传背景图'}
          </Button>
          <Button onClick={handleSave} loading={saving}>
            <MaterialSymbol icon="save" size={18} />
            保存设置
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {success}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-[28px] border-white/8 bg-card/75 backdrop-blur-xl">
          <CardBody className="space-y-7">
            <SectionHeader
              icon="image"
              title="背景图片层"
              description="全局背景图资源，同时兼容旧 hero_bg 键回退。"
            />

            <div className="overflow-hidden rounded-[24px] border border-white/8 bg-black/30">
              <div
                className="relative aspect-[16/9] bg-muted"
                style={{
                  backgroundImage: form.image.url ? `url(${form.image.url})` : undefined,
                  backgroundSize: form.image.size,
                  backgroundPosition: form.image.position,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/60" />
                {!form.image.url ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <MaterialSymbol icon="wallpaper" size={28} />
                    <span className="text-sm">还没有设置场景背景图</span>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="背景位置">
                <input
                  value={form.image.position}
                  onChange={(event) =>
                    updateForm((current) => ({
                      ...current,
                      image: { ...current.image, position: event.target.value },
                    }))
                  }
                  className={INPUT_CLASS}
                />
              </Field>
              <Field label="背景尺寸">
                <input
                  value={form.image.size}
                  onChange={(event) =>
                    updateForm((current) => ({
                      ...current,
                      image: { ...current.image, size: event.target.value },
                    }))
                  }
                  className={INPUT_CLASS}
                />
              </Field>
              <SliderField
                label="图片透明度"
                value={form.image.opacity}
                onChange={(value) =>
                  updateForm((current) => ({
                    ...current,
                    image: { ...current.image, opacity: value },
                  }))
                }
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => fileRef.current?.click()} disabled={uploading}>
                <MaterialSymbol icon="image_arrow_up" size={18} />
                更换背景图
              </Button>
              <Button variant="ghost" onClick={handleClearImage} disabled={clearing || !form.image.url}>
                <MaterialSymbol icon="delete" size={18} />
                {clearing ? '清除中' : '清除背景图'}
              </Button>
            </div>

            <SectionHeader
              icon="thunderstorm"
              title="天气层"
              description="第一版预设 storm，支持调节强度与启用页面。"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="天气预设">
                <select
                  value={form.weather.preset}
                  onChange={(event) =>
                    updateForm((current) => ({
                      ...current,
                      weather: {
                        ...current.weather,
                        preset: event.target.value as BackgroundSceneSettings['weather']['preset'],
                      },
                    }))
                  }
                  className={INPUT_CLASS}
                >
                  <option value="none">none</option>
                  <option value="storm">storm</option>
                </select>
              </Field>
              <SliderField
                label="天气强度"
                value={form.weather.intensity}
                onChange={(value) =>
                  updateForm((current) => ({
                    ...current,
                    weather: { ...current.weather, intensity: value },
                  }))
                }
              />
            </div>

            <div className="grid gap-3">
              {ENABLED_PAGES.map((page) => {
                const checked = form.weather.enabledPages.includes(page.key)
                return (
                  <label
                    key={page.key}
                    className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        updateForm((current) => ({
                          ...current,
                          weather: {
                            ...current.weather,
                            enabledPages: checked
                              ? current.weather.enabledPages.filter((item) => item !== page.key)
                              : [...current.weather.enabledPages, page.key],
                          },
                        }))
                      }
                      className="mt-1 h-4 w-4 rounded border-border bg-background"
                    />
                    <span>
                      <span className="block text-sm font-medium text-foreground">{page.label}</span>
                      <span className="block text-sm leading-6 text-muted-foreground">{page.description}</span>
                    </span>
                  </label>
                )
              })}
            </div>

            <SectionHeader
              icon="filter"
              title="滤镜层"
              description="统一控制暗度、渐变、噪点、模糊和边缘压暗。"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <SliderField
                label="叠层浓度"
                value={form.filter.overlay}
                onChange={(value) =>
                  updateForm((current) => ({
                    ...current,
                    filter: { ...current.filter, overlay: value },
                  }))
                }
              />
              <SliderField
                label="渐变强度"
                value={form.filter.gradient}
                onChange={(value) =>
                  updateForm((current) => ({
                    ...current,
                    filter: { ...current.filter, gradient: value },
                  }))
                }
              />
              <SliderField
                label="模糊半径"
                value={form.filter.blur}
                max={24}
                step={1}
                onChange={(value) =>
                  updateForm((current) => ({
                    ...current,
                    filter: { ...current.filter, blur: value },
                  }))
                }
              />
              <SliderField
                label="噪点强度"
                value={form.filter.noise}
                onChange={(value) =>
                  updateForm((current) => ({
                    ...current,
                    filter: { ...current.filter, noise: value },
                  }))
                }
              />
              <SliderField
                label="边缘压暗"
                value={form.filter.vignette}
                onChange={(value) =>
                  updateForm((current) => ({
                    ...current,
                    filter: { ...current.filter, vignette: value },
                  }))
                }
              />
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              onChange={handleUpload}
            />
          </CardBody>
        </Card>

        <Card className="rounded-[28px] border-white/8 bg-card/75 backdrop-blur-xl">
          <CardBody className="space-y-6">
            <SectionHeader
              icon="preview"
              title="实时预览"
              description="预览当前保存前的场景参数组合。"
            />

            <div className="overflow-hidden rounded-[26px] border border-white/8 bg-[#020617]">
              <div
                className="relative aspect-[4/5]"
                style={{
                  backgroundImage: form.image.url
                    ? `linear-gradient(180deg, rgba(2,6,23,${form.filter.overlay}) 0%, rgba(2,6,23,${Math.min(0.9, form.filter.overlay + form.filter.gradient * 0.24)}) 100%), url(${form.image.url})`
                    : 'radial-gradient(circle at top, rgba(56,189,248,0.16), transparent 40%)',
                  backgroundPosition: form.image.position,
                  backgroundSize: form.image.size,
                  opacity: form.image.opacity,
                }}
              >
                <div className="absolute inset-0 scene-terminal-grid opacity-[0.04]" />
                <div className="absolute inset-0 scene-noise" style={{ opacity: form.filter.noise }} />
                <div
                  className="absolute inset-0"
                  style={{
                    boxShadow: `inset 0 0 160px rgba(2, 6, 23, ${form.filter.vignette})`,
                    backdropFilter: `blur(${form.filter.blur}px)`,
                    WebkitBackdropFilter: `blur(${form.filter.blur}px)`,
                  }}
                />
                <div className="absolute inset-x-0 top-0 p-5">
                  <div className="rounded-2xl border border-sky-300/15 bg-black/25 px-4 py-3 backdrop-blur-lg">
                    <p className="text-[11px] font-mono uppercase tracking-[0.24em] text-sky-100/65">
                      Layer Stack
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {['Image', form.weather.preset, 'Filter'].map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-sky-300/15 bg-sky-400/10 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.18em] text-sky-100/80"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <div className="rounded-[24px] border border-white/10 bg-black/30 p-5 backdrop-blur-lg">
                    <p className="text-lg font-semibold text-white">Storm Archive Preview</p>
                    <p className="mt-2 text-sm leading-7 text-slate-200/78">
                      当前启用页面：
                      <span className="ml-2 font-mono text-sky-100/80">
                        {form.weather.enabledPages.join(', ') || 'none'}
                      </span>
                    </p>
                    <p className="mt-3 text-sm leading-7 text-slate-300/70">
                      强度 {form.weather.intensity.toFixed(2)} · 模糊 {form.filter.blur}px · 噪点 {form.filter.noise.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
              <p className="text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
                Notes
              </p>
              <ul className="mt-3 space-y-2 text-sm leading-7 text-muted-foreground">
                <li>建议背景图宽度至少 1920px，风暴天气会在图片上叠加雨滴、闪电与暗场滤镜。</li>
                <li>如果只想保留背景图和滤镜，把天气预设改为 <span className="font-mono text-foreground">none</span> 即可。</li>
                <li>当前 `hero_bg` 兼容键会自动镜像为同一张图，旧页面不会断。</li>
              </ul>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: string
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-ember/12 text-ember">
        <MaterialSymbol icon={icon} size={20} />
      </span>
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-1 text-sm leading-7 text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  )
}

function SliderField({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
}) {
  return (
    <Field label={label}>
      <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
        <div className="flex items-center justify-between text-sm text-foreground">
          <span>{value.toFixed(step >= 1 ? 0 : 2)}</span>
          <span className="text-xs text-muted-foreground">
            {min} - {max}
          </span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="mt-3 w-full accent-[hsl(var(--ember))]"
        />
      </div>
    </Field>
  )
}

const INPUT_CLASS =
  'h-11 w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 text-sm text-foreground placeholder:text-muted-foreground/45 focus:outline-none focus:ring-2 focus:ring-ocean/40'

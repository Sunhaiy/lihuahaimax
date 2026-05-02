'use client'

import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import useSWR from 'swr'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'
import { toRgba } from '@/lib/scene-color'
import type { SiteProfile } from '@/types/site'
import type { BackgroundSceneSettings, SceneEnabledPage } from '@/types/work'

const fetcher = (url: string) => fetch(url).then((response) => response.json())

const ENABLED_PAGES: Array<{ key: SceneEnabledPage; label: string; description: string }> = [
  {
    key: 'all',
    label: '全部公开页',
    description: '用于记录全站统一背景策略，当前前台不会实际渲染固定 scene 背景。',
  },
  {
    key: 'home',
    label: '首页 Hero',
    description: '当前前台只会在首页 Hero 使用背景图，这个开关最接近真实生效范围。',
  },
  {
    key: 'moments',
    label: 'Moments',
    description: '先保留配置能力，等下一轮再决定 moments 是否重新接入气氛层。',
  },
  {
    key: 'works-detail',
    label: '项目详情',
    description: '项目详情页的 scene 范围先保留数据，不在这轮前台渲染。',
  },
]

function readApiError(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== 'object') return fallback

  const source = payload as {
    error?: string | { fieldErrors?: Record<string, string[]>; formErrors?: string[] }
  }

  if (typeof source.error === 'string' && source.error.trim()) return source.error

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

async function saveScene(scene: BackgroundSceneSettings) {
  const response = await fetch('/api/settings/background-scene', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scene),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(readApiError(error, '保存场景设置失败'))
  }

  return response.json()
}

async function uploadSceneImage(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/settings/background-scene', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(readApiError(error, '上传背景图失败'))
  }

  return response.json()
}

async function clearSceneImage() {
  const response = await fetch('/api/settings/background-scene', { method: 'DELETE' })

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(readApiError(error, '清除背景图失败'))
  }

  return response.json()
}

async function saveSiteProfile(profile: SiteProfile) {
  const response = await fetch('/api/settings/site-profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(readApiError(error, '保存站点资料失败'))
  }

  return response.json()
}

async function uploadImage(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/upload/image', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(readApiError(error, '上传图片失败'))
  }

  return response.json() as Promise<{ url: string }>
}

export default function SettingsPage() {
  const sceneRequest = useSWR<BackgroundSceneSettings>('/api/settings/background-scene', fetcher)
  const profileRequest = useSWR<SiteProfile>('/api/settings/site-profile', fetcher)

  const [sceneForm, setSceneForm] = useState<BackgroundSceneSettings | null>(null)
  const [profileForm, setProfileForm] = useState<SiteProfile | null>(null)
  const [savingScene, setSavingScene] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [uploadingScene, setUploadingScene] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [clearingScene, setClearingScene] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const sceneFileRef = useRef<HTMLInputElement>(null)
  const avatarFileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (sceneRequest.data) setSceneForm(sceneRequest.data)
  }, [sceneRequest.data])

  useEffect(() => {
    if (profileRequest.data) setProfileForm(profileRequest.data)
  }, [profileRequest.data])

  function resetNotice() {
    setError('')
    setSuccess('')
  }

  function updateScene(updater: (current: BackgroundSceneSettings) => BackgroundSceneSettings) {
    setSceneForm((current) => (current ? updater(current) : current))
  }

  function updateProfile<Key extends keyof SiteProfile>(key: Key, value: SiteProfile[Key]) {
    setProfileForm((current) => (current ? { ...current, [key]: value } : current))
  }

  async function handleSaveScene() {
    if (!sceneForm) return
    setSavingScene(true)
    resetNotice()

    try {
      const next = await saveScene(sceneForm)
      sceneRequest.mutate(next, false)
      setSuccess('场景设置已保存')
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存场景设置失败')
    } finally {
      setSavingScene(false)
    }
  }

  async function handleSaveProfile() {
    if (!profileForm) return
    setSavingProfile(true)
    resetNotice()

    try {
      const next = await saveSiteProfile(profileForm)
      profileRequest.mutate(next, false)
      setSuccess('站点资料已保存')
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存站点资料失败')
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleSceneUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingScene(true)
    resetNotice()

    try {
      const next = await uploadSceneImage(file)
      sceneRequest.mutate(next, false)
      setSceneForm(next)
      setSuccess('背景图已更新')
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传背景图失败')
    } finally {
      setUploadingScene(false)
      if (sceneFileRef.current) sceneFileRef.current.value = ''
    }
  }

  async function handleAvatarUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)
    resetNotice()

    try {
      const result = await uploadImage(file)
      setProfileForm((current) => (current ? { ...current, avatarUrl: result.url } : current))
      setSuccess('头像已上传，记得保存站点资料')
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传头像失败')
    } finally {
      setUploadingAvatar(false)
      if (avatarFileRef.current) avatarFileRef.current.value = ''
    }
  }

  async function handleClearSceneImage() {
    setClearingScene(true)
    resetNotice()

    try {
      const next = await clearSceneImage()
      sceneRequest.mutate(next, false)
      setSceneForm(next)
      setSuccess('背景图已清除')
    } catch (err) {
      setError(err instanceof Error ? err.message : '清除背景图失败')
    } finally {
      setClearingScene(false)
    }
  }

  if (!sceneForm || !profileForm) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-muted-foreground">
            Site Console
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">站点设置中心</h1>
        </div>
        <div className="h-[220px] animate-pulse rounded-[28px] border border-border bg-card/70" />
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="h-[680px] animate-pulse rounded-[28px] border border-border bg-card/70" />
          <div className="h-[680px] animate-pulse rounded-[28px] border border-border bg-card/70" />
        </div>
      </div>
    )
  }

  const previewBackground = sceneForm.image.url
    ? `linear-gradient(180deg, rgba(0,0,0,${sceneForm.filter.overlay}) 0%, rgba(0,0,0,${Math.min(0.92, sceneForm.filter.overlay + sceneForm.filter.gradient * 0.22)}) 100%), url(${sceneForm.image.url})`
    : `radial-gradient(circle at top, ${toRgba(sceneForm.filter.tintColor, 0.18)}, transparent 38%)`

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-muted-foreground">
            Site Console
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">站点设置中心</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
            统一管理站点资料与前台背景资源。当前公开前台已经切成“只有首页 Hero 使用背景图”的策略，天气层与固定 scene 背景先保留配置，不在这一轮前台生效。
          </p>
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

      <Card className="rounded-[28px] border-white/8 bg-card/75 backdrop-blur-xl">
        <CardBody className="space-y-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <SectionHeader
              icon="badge"
              title="站点基础资料"
              description="设置导航品牌、头像、简介、角色说明和页脚文案。"
            />
            <Button onClick={handleSaveProfile} loading={savingProfile}>
              <MaterialSymbol icon="save" size={18} />
              保存站点资料
            </Button>
          </div>

          <div className="grid gap-6 xl:grid-cols-[260px_1fr]">
            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
              <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
                Avatar
              </p>
              <button
                type="button"
                onClick={() => avatarFileRef.current?.click()}
                className="group mt-4 block w-full rounded-[24px] border border-dashed border-white/12 bg-black/20 p-4 text-left transition-colors hover:border-ember/30 hover:bg-black/30"
              >
                <div className="flex justify-center">
                  <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-gradient-to-br from-ember/40 to-ember/10">
                    {profileForm.avatarUrl ? (
                      <img
                        src={profileForm.avatarUrl}
                        alt={profileForm.ownerName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl font-bold text-ember">
                        {profileForm.ownerInitial || '站'}
                      </span>
                    )}
                  </div>
                </div>
                <p className="mt-4 text-center text-sm font-medium text-foreground">
                  {uploadingAvatar ? '上传中…' : '点击上传头像'}
                </p>
                <p className="mt-2 text-center text-xs leading-6 text-muted-foreground">
                  导航、首页资料卡、关于页和 moments 作者信息会复用这张头像。
                </p>
              </button>

              <div className="mt-4 space-y-2">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => avatarFileRef.current?.click()}
                  disabled={uploadingAvatar}
                >
                  <MaterialSymbol icon="image_arrow_up" size={18} />
                  {uploadingAvatar ? '上传中…' : '更换头像'}
                </Button>
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={() => updateProfile('avatarUrl', null)}
                  disabled={!profileForm.avatarUrl}
                >
                  <MaterialSymbol icon="delete" size={18} />
                  清空头像
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="站点名称">
                <input
                  value={profileForm.siteName}
                  onChange={(event) => updateProfile('siteName', event.target.value)}
                  className={INPUT_CLASS}
                />
              </Field>
              <Field label="英文副标">
                <input
                  value={profileForm.siteNameEn}
                  onChange={(event) => updateProfile('siteNameEn', event.target.value)}
                  className={INPUT_CLASS}
                />
              </Field>
              <Field label="博主名称">
                <input
                  value={profileForm.ownerName}
                  onChange={(event) => updateProfile('ownerName', event.target.value)}
                  className={INPUT_CLASS}
                />
              </Field>
              <Field label="头像缩写">
                <input
                  value={profileForm.ownerInitial}
                  onChange={(event) => updateProfile('ownerInitial', event.target.value)}
                  className={INPUT_CLASS}
                />
              </Field>
              <Field label="站点标语" fullWidth>
                <input
                  value={profileForm.slogan}
                  onChange={(event) => updateProfile('slogan', event.target.value)}
                  className={INPUT_CLASS}
                />
              </Field>
              <Field label="角色说明" fullWidth>
                <input
                  value={profileForm.roleLine}
                  onChange={(event) => updateProfile('roleLine', event.target.value)}
                  className={INPUT_CLASS}
                />
              </Field>
              <Field label="GitHub 链接">
                <input
                  value={profileForm.githubUrl}
                  onChange={(event) => updateProfile('githubUrl', event.target.value)}
                  className={INPUT_CLASS}
                  placeholder="https://github.com/your-name"
                />
              </Field>
              <Field label="联系邮箱">
                <input
                  value={profileForm.email}
                  onChange={(event) => updateProfile('email', event.target.value)}
                  className={INPUT_CLASS}
                  placeholder="hello@example.com"
                />
              </Field>
              <Field label="页脚文案" fullWidth>
                <input
                  value={profileForm.footerText}
                  onChange={(event) => updateProfile('footerText', event.target.value)}
                  className={INPUT_CLASS}
                />
              </Field>
              <Field label="个人简介" fullWidth>
                <textarea
                  value={profileForm.bio}
                  onChange={(event) => updateProfile('bio', event.target.value)}
                  className={TEXTAREA_CLASS}
                  rows={5}
                />
              </Field>
            </div>
          </div>

          <input
            ref={avatarFileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
        </CardBody>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-[28px] border-white/8 bg-card/75 backdrop-blur-xl">
          <CardBody className="space-y-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <SectionHeader
                icon="image"
                title="前台背景与 Hero"
                description="保留 scene 数据结构，但当前前台只消费首页 Hero 背景图。"
              />
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  onClick={() => sceneFileRef.current?.click()}
                  disabled={uploadingScene}
                >
                  <MaterialSymbol icon="upload" size={18} />
                  {uploadingScene ? '上传中…' : '上传背景图'}
                </Button>
                <Button onClick={handleSaveScene} loading={savingScene}>
                  <MaterialSymbol icon="save" size={18} />
                  保存场景设置
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/8 px-4 py-3 text-sm leading-6 text-emerald-200">
              当前公开站点只在首页 Hero 使用背景图。天气层、全站固定 scene 背景和页面勾选先保留数据，前台暂时不渲染。
            </div>

            <div className="overflow-hidden rounded-[24px] border border-white/8 bg-black/30">
              <div
                className="relative aspect-[16/9] bg-muted"
                style={{
                  backgroundImage: sceneForm.image.url ? `url(${sceneForm.image.url})` : undefined,
                  backgroundSize: sceneForm.image.size,
                  backgroundPosition: sceneForm.image.position,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/60" />
                {!sceneForm.image.url ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <MaterialSymbol icon="wallpaper" size={28} />
                    <span className="text-sm">还没有设置背景图</span>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="背景位置">
                <input
                  value={sceneForm.image.position}
                  onChange={(event) =>
                    updateScene((current) => ({
                      ...current,
                      image: { ...current.image, position: event.target.value },
                    }))
                  }
                  className={INPUT_CLASS}
                />
              </Field>
              <Field label="背景尺寸">
                <input
                  value={sceneForm.image.size}
                  onChange={(event) =>
                    updateScene((current) => ({
                      ...current,
                      image: { ...current.image, size: event.target.value },
                    }))
                  }
                  className={INPUT_CLASS}
                />
              </Field>
              <SliderField
                label="图片透明度"
                value={sceneForm.image.opacity}
                onChange={(value) =>
                  updateScene((current) => ({
                    ...current,
                    image: { ...current.image, opacity: value },
                  }))
                }
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="secondary"
                onClick={() => sceneFileRef.current?.click()}
                disabled={uploadingScene}
              >
                <MaterialSymbol icon="image_arrow_up" size={18} />
                更换背景图
              </Button>
              <Button
                variant="ghost"
                onClick={handleClearSceneImage}
                disabled={clearingScene || !sceneForm.image.url}
              >
                <MaterialSymbol icon="delete" size={18} />
                {clearingScene ? '清除中…' : '清除背景图'}
              </Button>
            </div>

            <SectionHeader
              icon="thunderstorm"
              title="天气层"
              description="继续保留天气 preset 和范围配置，方便后面重新接回前台。"
            />

            <p className="text-xs leading-6 text-muted-foreground">
              提示：当前这些天气配置仍会保存，但公开前台暂不渲染雨滴、闪电和固定背景气氛层。
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="天气预设">
                <select
                  value={sceneForm.weather.preset}
                  onChange={(event) =>
                    updateScene((current) => ({
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
                value={sceneForm.weather.intensity}
                onChange={(value) =>
                  updateScene((current) => ({
                    ...current,
                    weather: { ...current.weather, intensity: value },
                  }))
                }
              />
            </div>

            <div className="grid gap-3">
              {ENABLED_PAGES.map((page) => {
                const checked = sceneForm.weather.enabledPages.includes(page.key)
                return (
                  <label
                    key={page.key}
                    className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        updateScene((current) => ({
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
                      <span className="block text-sm leading-6 text-muted-foreground">
                        {page.description}
                      </span>
                    </span>
                  </label>
                )
              })}
            </div>

            <SectionHeader
              icon="filter"
              title="滤镜层"
              description="这些值仍会保存，当前主要影响首页 Hero 以及后台预览。"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <ColorField
                label="氛围色"
                value={sceneForm.filter.tintColor}
                onChange={(value) =>
                  updateScene((current) => ({
                    ...current,
                    filter: { ...current.filter, tintColor: value },
                  }))
                }
              />
              <SliderField
                label="叠层浓度"
                value={sceneForm.filter.overlay}
                onChange={(value) =>
                  updateScene((current) => ({
                    ...current,
                    filter: { ...current.filter, overlay: value },
                  }))
                }
              />
              <SliderField
                label="渐变强度"
                value={sceneForm.filter.gradient}
                onChange={(value) =>
                  updateScene((current) => ({
                    ...current,
                    filter: { ...current.filter, gradient: value },
                  }))
                }
              />
              <SliderField
                label="模糊半径"
                value={sceneForm.filter.blur}
                max={24}
                step={1}
                onChange={(value) =>
                  updateScene((current) => ({
                    ...current,
                    filter: { ...current.filter, blur: value },
                  }))
                }
              />
              <SliderField
                label="噪点强度"
                value={sceneForm.filter.noise}
                onChange={(value) =>
                  updateScene((current) => ({
                    ...current,
                    filter: { ...current.filter, noise: value },
                  }))
                }
              />
              <SliderField
                label="边缘压暗"
                value={sceneForm.filter.vignette}
                onChange={(value) =>
                  updateScene((current) => ({
                    ...current,
                    filter: { ...current.filter, vignette: value },
                  }))
                }
              />
            </div>

            <input
              ref={sceneFileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              onChange={handleSceneUpload}
            />
          </CardBody>
        </Card>

        <Card className="rounded-[28px] border-white/8 bg-card/75 backdrop-blur-xl">
          <CardBody className="space-y-6">
            <SectionHeader
              icon="preview"
              title="实时预览"
              description="预览站点资料和场景参数组合后的首页 Hero 气质。"
            />

            <div className="overflow-hidden rounded-[26px] border border-white/8 bg-[#020617]">
              <div
                className="relative aspect-[4/5]"
                style={{
                  backgroundImage: previewBackground,
                  backgroundPosition: sceneForm.image.position,
                  backgroundSize: sceneForm.image.size,
                  opacity: sceneForm.image.opacity,
                }}
              >
                <div className="scene-terminal-grid absolute inset-0 opacity-[0.04]" />
                <div
                  className="scene-noise absolute inset-0"
                  style={{ opacity: sceneForm.filter.noise }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(circle at top, ${toRgba(
                      sceneForm.filter.tintColor,
                      sceneForm.filter.gradient * 0.18
                    )} 0%, transparent 42%)`,
                  }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    boxShadow: `inset 0 0 160px rgba(2, 6, 23, ${sceneForm.filter.vignette})`,
                    backdropFilter: `blur(${sceneForm.filter.blur}px)`,
                    WebkitBackdropFilter: `blur(${sceneForm.filter.blur}px)`,
                  }}
                />

                <div className="absolute inset-x-0 top-0 p-5">
                  <div className="rounded-2xl border border-primary/15 bg-black/25 px-4 py-3 backdrop-blur-lg">
                    <p className="text-[11px] font-mono uppercase tracking-[0.24em] text-primary/70">
                      Homepage Hero
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-ember/15">
                        {profileForm.avatarUrl ? (
                          <img
                            src={profileForm.avatarUrl}
                            alt={profileForm.ownerName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-semibold text-ember">
                            {profileForm.ownerInitial}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{profileForm.ownerName}</p>
                        <p className="text-xs text-white/68">{profileForm.roleLine}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-5">
                  <div className="rounded-[24px] border border-white/10 bg-black/30 p-5 backdrop-blur-lg">
                    <p className="text-lg font-semibold text-white">{profileForm.siteName}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-200/78">{profileForm.bio}</p>
                    <p className="mt-3 text-sm leading-7 text-slate-300/70">
                      背景透明度 {sceneForm.image.opacity.toFixed(2)} · 天气 {sceneForm.weather.preset}
                      {' · '}模糊 {sceneForm.filter.blur}px
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
                <li>站点资料保存后，导航、首页、关于页和 moments 作者信息会同步刷新。</li>
                <li>如果只想保留静态背景图，把天气预设保持在 `none` 即可。</li>
                <li>觉得首屏太灰时，优先降低“叠层浓度”和“渐变强度”。</li>
                <li>建议背景图宽度至少 1920px，这样首页 Hero 更稳。</li>
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

function Field({
  label,
  children,
  fullWidth = false,
}: {
  label: string
  children: React.ReactNode
  fullWidth?: boolean
}) {
  return (
    <label className={`block space-y-2 ${fullWidth ? 'md:col-span-2' : ''}`}>
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

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-14 cursor-pointer rounded-xl border border-white/8 bg-transparent p-1"
        />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${INPUT_CLASS} h-11 flex-1`}
        />
      </div>
    </Field>
  )
}

const INPUT_CLASS =
  'h-11 w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 text-sm text-foreground placeholder:text-muted-foreground/45 focus:outline-none focus:ring-2 focus:ring-ring/40'

const TEXTAREA_CLASS =
  'w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/45 focus:outline-none focus:ring-2 focus:ring-ring/40'

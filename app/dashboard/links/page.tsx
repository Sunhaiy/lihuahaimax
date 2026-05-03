'use client'

import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import useSWR from 'swr'
import {
  AdminEmptyState,
  AdminField,
  AdminNotice,
  AdminPageHeader,
  AdminPanel,
  AdminSection,
  AdminStatusBadge,
  ADMIN_INPUT_CLASS,
  ADMIN_MUTED_PANEL_CLASS,
  ADMIN_TEXTAREA_CLASS,
} from '@/components/admin/AdminPrimitives'
import { MediaLibraryPicker } from '@/components/admin/MediaLibraryPicker'
import { Button } from '@/components/ui/Button'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'
import type {
  LinkCategory,
  LinkRow,
  LinkSubmissionRow,
  LinkSubmissionStatus,
} from '@/types/link'
import type { SiteProfile } from '@/types/site'

const fetcher = (url: string) => fetch(url).then((response) => response.json())

type LinkFormState = {
  id: number | null
  name: string
  url: string
  description: string
  avatarUrl: string
  category: LinkCategory
  sortOrder: number
  isActive: boolean
}

const EMPTY_FORM: LinkFormState = {
  id: null,
  name: '',
  url: '',
  description: '',
  avatarUrl: '',
  category: 'friend',
  sortOrder: 0,
  isActive: true,
}

const CATEGORY_LABELS: Record<LinkCategory, string> = {
  friend: '友情链接',
  tool: '常用工具',
  resource: '学习资源',
  inspire: '灵感来源',
  other: '其他',
}

const SUBMISSION_STATUS_LABELS: Record<LinkSubmissionStatus, string> = {
  pending: '待处理',
  approved: '已采纳',
  rejected: '已忽略',
}

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

function toFormState(link?: LinkRow | null): LinkFormState {
  if (!link) return EMPTY_FORM

  return {
    id: link.id,
    name: link.name,
    url: link.url,
    description: link.description ?? '',
    avatarUrl: link.avatar_url ?? '',
    category: link.category,
    sortOrder: link.sort_order,
    isActive: link.is_active,
  }
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
    throw new Error(readApiError(error, '图片上传失败'))
  }

  return response.json() as Promise<{ url: string }>
}

async function saveSiteProfile(profile: SiteProfile) {
  const response = await fetch('/api/settings/site-profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(readApiError(error, '保存友链页资料失败'))
  }

  return response.json() as Promise<SiteProfile>
}

function toneForSubmissionStatus(status: LinkSubmissionStatus) {
  if (status === 'approved') return 'success' as const
  if (status === 'rejected') return 'danger' as const
  return 'warning' as const
}

export default function DashboardLinksPage() {
  const linksRequest = useSWR<LinkRow[]>('/api/links?admin=true', fetcher)
  const profileRequest = useSWR<SiteProfile>('/api/settings/site-profile', fetcher)
  const submissionsRequest = useSWR<LinkSubmissionRow[]>('/api/link-submissions', fetcher)

  const [form, setForm] = useState<LinkFormState>(EMPTY_FORM)
  const [profileForm, setProfileForm] = useState<SiteProfile | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadingProfileAvatar, setUploadingProfileAvatar] = useState(false)
  const [submissionSavingId, setSubmissionSavingId] = useState<number | null>(null)
  const [submissionNotes, setSubmissionNotes] = useState<Record<number, string>>({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fileRef = useRef<HTMLInputElement>(null)
  const profileAvatarRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!linksRequest.data?.length || selectedId == null) return
    const current = linksRequest.data.find((item) => item.id === selectedId)
    if (current) setForm(toFormState(current))
  }, [linksRequest.data, selectedId])

  useEffect(() => {
    if (profileRequest.data) setProfileForm(profileRequest.data)
  }, [profileRequest.data])

  useEffect(() => {
    const submissions = submissionsRequest.data
    if (!submissions) return
    setSubmissionNotes((current) => {
      const next = { ...current }
      for (const item of submissions) {
        if (next[item.id] === undefined) {
          next[item.id] = item.admin_note ?? ''
        }
      }
      return next
    })
  }, [submissionsRequest.data])

  function clearNotice() {
    setError('')
    setSuccess('')
  }

  function updateProfile<Key extends keyof SiteProfile>(key: Key, value: SiteProfile[Key]) {
    setProfileForm((current) => (current ? { ...current, [key]: value } : current))
  }

  function startNew() {
    setSelectedId(null)
    setForm(EMPTY_FORM)
    clearNotice()
  }

  async function handleSave() {
    if (!form.name.trim() || !form.url.trim()) {
      setError('站点名称和链接是必填项。')
      return
    }

    setSaving(true)
    clearNotice()

    try {
      const response = await fetch(form.id ? `/api/links/${form.id}` : '/api/links', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          url: form.url.trim(),
          description: form.description.trim() || undefined,
          avatarUrl: form.avatarUrl.trim() || undefined,
          category: form.category,
          sortOrder: form.sortOrder,
          isActive: form.isActive,
        }),
      })

      const payload = response.status === 204 ? null : await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(readApiError(payload, form.id ? '更新失败' : '创建失败'))
      }

      await linksRequest.mutate()

      if (payload?.id) {
        setSelectedId(payload.id)
        setForm(toFormState(payload))
      } else {
        startNew()
      }

      setSuccess(form.id ? '友链已更新。' : '友链已创建。')
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('确定删除这条友链吗？')) return

    setDeletingId(id)
    clearNotice()

    try {
      const response = await fetch(`/api/links/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(readApiError(payload, '删除失败'))
      }

      await linksRequest.mutate()
      if (selectedId === id) startNew()
      setSuccess('友链已删除。')
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败')
    } finally {
      setDeletingId(null)
    }
  }

  async function handleAvatarUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    clearNotice()

    try {
      const result = await uploadImage(file)
      setForm((current) => ({ ...current, avatarUrl: result.url }))
      setSuccess('友链头像已上传，记得保存这条友链。')
    } catch (err) {
      setError(err instanceof Error ? err.message : '头像上传失败')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleProfileAvatarUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file || !profileForm) return

    setUploadingProfileAvatar(true)
    clearNotice()

    try {
      const result = await uploadImage(file)
      updateProfile('avatarUrl', result.url)
      setSuccess('站点头像已上传，记得保存友链页资料。')
    } catch (err) {
      setError(err instanceof Error ? err.message : '站点头像上传失败')
    } finally {
      setUploadingProfileAvatar(false)
      if (profileAvatarRef.current) profileAvatarRef.current.value = ''
    }
  }

  async function handleSaveProfile() {
    if (!profileForm) return

    setSavingProfile(true)
    clearNotice()

    try {
      const next = await saveSiteProfile(profileForm)
      profileRequest.mutate(next, false)
      setProfileForm(next)
      setSuccess('友链页资料已保存。')
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存友链页资料失败')
    } finally {
      setSavingProfile(false)
    }
  }

  async function updateSubmissionStatus(id: number, status: LinkSubmissionStatus) {
    setSubmissionSavingId(id)
    clearNotice()

    try {
      const response = await fetch(`/api/link-submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNote: submissionNotes[id] ?? '' }),
      })

      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(readApiError(payload, '更新申请状态失败'))
      }

      await submissionsRequest.mutate()
      setSuccess(`申请状态已更新为“${SUBMISSION_STATUS_LABELS[status]}”。`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新申请状态失败')
    } finally {
      setSubmissionSavingId(null)
    }
  }

  async function saveSubmissionNote(id: number) {
    setSubmissionSavingId(id)
    clearNotice()

    try {
      const response = await fetch(`/api/link-submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNote: submissionNotes[id] ?? '' }),
      })

      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(readApiError(payload, '保存备注失败'))
      }

      await submissionsRequest.mutate()
      setSuccess('申请备注已保存。')
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存备注失败')
    } finally {
      setSubmissionSavingId(null)
    }
  }

  function loadSubmissionIntoForm(submission: LinkSubmissionRow) {
    setForm({
      id: null,
      name: submission.site_name,
      url: submission.site_url,
      description: submission.site_description ?? '',
      avatarUrl: submission.site_avatar_url ?? '',
      category: 'friend',
      sortOrder: 0,
      isActive: true,
    })
    setSelectedId(null)
    setSuccess('已把申请信息带入右侧编辑器，可以直接补充后创建友链。')
  }

  const pendingCount =
    submissionsRequest.data?.filter((item) => item.status === 'pending').length ?? 0

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Links Directory"
        title="友情链接与申请"
        description="一边维护公开友链，一边配置前台资料卡和申请文案。申请表收到的数据也会直接落在这里。"
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" onClick={handleSaveProfile} loading={savingProfile}>
              <MaterialSymbol icon="settings" size={18} />
              保存页面资料
            </Button>
            <Button onClick={startNew}>
              <MaterialSymbol icon="add_link" size={18} />
              新建友链
            </Button>
          </div>
        }
        meta={
          <>
            <AdminStatusBadge tone="accent">{linksRequest.data?.length ?? 0} 条公开记录</AdminStatusBadge>
            <AdminStatusBadge tone={pendingCount > 0 ? 'warning' : 'neutral'}>
              {pendingCount} 条待处理申请
            </AdminStatusBadge>
          </>
        }
      />

      {error ? <AdminNotice tone="danger">{error}</AdminNotice> : null}
      {success ? <AdminNotice tone="success">{success}</AdminNotice> : null}

      {profileForm ? (
        <AdminPanel
          title="友链页资料"
          description="前台顶部的本站信息、申请说明和审核规则都在这里维护。"
          icon="badge"
        >
          <div className="space-y-6">
            <AdminSection
              title="本站卡片"
              description="这部分会直接出现在友情链接页最上面，给来访者一个清晰的交换对象。"
            >
              <div className="grid gap-5 xl:grid-cols-[220px_minmax(0,1fr)]">
                <div className={`${ADMIN_MUTED_PANEL_CLASS} p-5`}>
                  <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
                    Avatar
                  </p>
                  <button
                    type="button"
                    onClick={() => profileAvatarRef.current?.click()}
                    className="group mt-4 block w-full rounded-[24px] border border-dashed border-border/70 bg-background/36 p-4 text-left transition-colors hover:border-primary/18 hover:bg-background/48"
                  >
                    <div className="flex justify-center">
                      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[24px] border border-border/70 bg-background/50">
                        {profileForm.avatarUrl ? (
                          <img
                            src={profileForm.avatarUrl}
                            alt={profileForm.ownerName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-3xl font-semibold text-foreground">
                            {profileForm.ownerInitial}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="mt-4 text-center text-sm font-medium text-foreground">
                      {uploadingProfileAvatar ? '上传中…' : '点击上传站点头像'}
                    </p>
                  </button>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <MediaLibraryPicker
                      value={profileForm.avatarUrl}
                      onSelect={(url) => updateProfile('avatarUrl', url)}
                      buttonLabel="从相册选择"
                      dialogTitle="选择友情链接页头像"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => profileAvatarRef.current?.click()}
                      loading={uploadingProfileAvatar}
                    >
                      <MaterialSymbol icon="image_arrow_up" size={16} />
                      上传头像
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
                  <Field label="站点地址">
                    <input
                      value={profileForm.siteUrl}
                      onChange={(event) => updateProfile('siteUrl', event.target.value)}
                      className={INPUT_CLASS}
                      placeholder="https://lihuahai.dev"
                    />
                  </Field>
                  <Field label="RSS 链接">
                    <input
                      value={profileForm.rssUrl}
                      onChange={(event) => updateProfile('rssUrl', event.target.value)}
                      className={INPUT_CLASS}
                      placeholder="/rss.xml"
                    />
                  </Field>
                  <Field label="友链页简介" fullWidth>
                    <textarea
                      value={profileForm.friendLinkIntro}
                      onChange={(event) => updateProfile('friendLinkIntro', event.target.value)}
                      className={TEXTAREA_CLASS}
                      rows={4}
                    />
                  </Field>
                </div>
              </div>
            </AdminSection>

            <AdminSection
              title="申请规则"
              description="前台申请卡片会直接读取这里的文案。建议每条一行，节奏会更干净。"
            >
              <div className="grid gap-4">
                <Field label="申请要求" fullWidth>
                  <textarea
                    value={profileForm.friendLinkRequirements}
                    onChange={(event) =>
                      updateProfile('friendLinkRequirements', event.target.value)
                    }
                    className={TEXTAREA_CLASS}
                    rows={6}
                    placeholder={'1. 站点可稳定访问\n2. 有持续更新内容\n3. 简介尽量简洁'}
                  />
                </Field>
              </div>
            </AdminSection>
          </div>

          <input
            ref={profileAvatarRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleProfileAvatarUpload}
          />
        </AdminPanel>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <AdminPanel
          title="友链列表"
          description="选中左侧条目后在右侧编辑，列表只保留必要信息，浏览更轻。"
          icon="link"
          bodyClassName="space-y-3"
        >
          {linksRequest.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-24 animate-pulse rounded-[22px] border border-border/70 bg-background/38"
                />
              ))}
            </div>
          ) : !linksRequest.data?.length ? (
            <AdminEmptyState
              icon="link"
              title="还没有友链"
              description="先录入第一条公开链接，后面整页的节奏就会自然起来。"
              action={
                <Button size="sm" onClick={startNew}>
                  新建第一条
                </Button>
              }
            />
          ) : (
            linksRequest.data.map((link) => {
              const active = selectedId === link.id

              return (
                <div
                  key={link.id}
                  className={`rounded-[22px] border px-4 py-3 transition-colors ${
                    active
                      ? 'border-primary/18 bg-primary/10'
                      : 'border-border/70 bg-background/38 hover:border-border hover:bg-background/46'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedId(link.id)
                        setForm(toFormState(link))
                        clearNotice()
                      }}
                      className="flex min-w-0 flex-1 items-start gap-3 text-left"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[18px] border border-border/70 bg-background/46">
                        {link.avatar_url ? (
                          <img src={link.avatar_url} alt={link.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-sm font-semibold text-foreground">
                            {link.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-medium text-foreground">{link.name}</p>
                          <AdminStatusBadge tone="neutral">{CATEGORY_LABELS[link.category]}</AdminStatusBadge>
                          {!link.is_active ? <AdminStatusBadge tone="warning">隐藏</AdminStatusBadge> : null}
                        </div>
                        {link.description ? (
                          <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                            {link.description}
                          </p>
                        ) : null}
                        <p className="mt-2 truncate text-[11px] font-mono text-muted-foreground/75">
                          sort {link.sort_order} · {link.url}
                        </p>
                      </div>
                    </button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(link.id)}
                      disabled={deletingId === link.id}
                      className="text-red-400 hover:text-red-300"
                    >
                      删除
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </AdminPanel>

        <AdminPanel
          title={form.id ? '编辑友链' : '新建友链'}
          description="右侧只保留友链本身需要的字段，提交申请的数据可以一键带进来。"
          icon="edit_square"
          actions={
            <div className="flex flex-wrap items-center gap-3">
              {form.id ? (
                <Button variant="ghost" onClick={startNew}>
                  <MaterialSymbol icon="add" size={18} />
                  切到新建
                </Button>
              ) : null}
              <Button onClick={handleSave} loading={saving}>
                <MaterialSymbol icon="save" size={18} />
                {form.id ? '保存修改' : '创建友链'}
              </Button>
            </div>
          }
          bodyClassName="space-y-6"
        >
          <AdminSection
            title="头像与基础信息"
            description="头像、名称和链接决定了前台卡片的第一印象。"
          >
            <div className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)]">
              <div className={`${ADMIN_MUTED_PANEL_CLASS} p-5`}>
                <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
                  Avatar
                </p>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="group mt-4 block w-full rounded-[24px] border border-dashed border-border/70 bg-background/36 p-4 text-left transition-colors hover:border-primary/18 hover:bg-background/48"
                >
                  <div className="flex justify-center">
                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[26px] border border-border/70 bg-background/50">
                      {form.avatarUrl ? (
                        <img
                          src={form.avatarUrl}
                          alt={form.name || 'avatar preview'}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl font-semibold text-foreground">
                          {(form.name.trim().charAt(0) || '友').toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="mt-4 text-center text-sm font-medium text-foreground">
                    {uploading ? '上传中…' : '点击上传头像'}
                  </p>
                </button>

                <div className="mt-4 flex flex-wrap gap-2">
                  <MediaLibraryPicker
                    value={form.avatarUrl}
                    onSelect={(url) => setForm((current) => ({ ...current, avatarUrl: url }))}
                    buttonLabel="从相册选择"
                    dialogTitle="选择友链头像"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => fileRef.current?.click()}
                    loading={uploading}
                  >
                    <MaterialSymbol icon="image_arrow_up" size={16} />
                    上传头像
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setForm((current) => ({ ...current, avatarUrl: '' }))}
                    disabled={!form.avatarUrl}
                  >
                    <MaterialSymbol icon="delete" size={16} />
                    清空
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="站点名称" hint="展示名称建议控制在 12 个字以内。">
                  <input
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    className={INPUT_CLASS}
                    placeholder="例如：某某的博客"
                  />
                </Field>
                <Field label="友链分类">
                  <select
                    value={form.category}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        category: event.target.value as LinkCategory,
                      }))
                    }
                    className={INPUT_CLASS}
                  >
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="站点链接" fullWidth hint="前台卡片和跳转按钮都会直接使用它。">
                  <input
                    value={form.url}
                    onChange={(event) => setForm((current) => ({ ...current, url: event.target.value }))}
                    className={INPUT_CLASS}
                    placeholder="https://example.com"
                  />
                </Field>
                <Field label="头像链接" fullWidth>
                  <input
                    value={form.avatarUrl}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, avatarUrl: event.target.value }))
                    }
                    className={INPUT_CLASS}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </Field>
              </div>
            </div>
          </AdminSection>

          <AdminSection
            title="简介与排序"
            description="简介尽量一句话说清楚，排序值越小越靠前。"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="一句话简介" fullWidth>
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, description: event.target.value }))
                  }
                  className={TEXTAREA_CLASS}
                  rows={4}
                  placeholder="这个站点适合什么人逛，为什么值得放进友情链接。"
                />
              </Field>
              <Field label="排序值" hint="默认 0，数值越小越靠前。">
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      sortOrder: Number(event.target.value || 0),
                    }))
                  }
                  className={INPUT_CLASS}
                />
              </Field>
              <div className="block space-y-2.5">
                <span className="text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
                  发布状态
                </span>
                <label className="flex items-start gap-3 rounded-[22px] border border-border/70 bg-background/38 px-4 py-4">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, isActive: event.target.checked }))
                    }
                    className="mt-1 h-4 w-4 rounded border-border bg-background"
                  />
                  <span>
                    <span className="block text-sm font-medium text-foreground">公开显示</span>
                    <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                      关闭后只保留在后台，不会在前台友情链接页展示。
                    </span>
                  </span>
                </label>
              </div>
            </div>
          </AdminSection>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
        </AdminPanel>
      </div>

      <AdminPanel
        title="友链申请"
        description="前台申请表提交的数据会直接落在这里。可以快速标记状态，也可以一键带入右侧编辑器。"
        icon="inbox"
      >
        {!submissionsRequest.data?.length ? (
          <AdminEmptyState
            icon="mark_email_unread"
            title="还没有新的友链申请"
            description="当前前台申请箱是空的，后面有提交时会自动出现在这里。"
          />
        ) : (
          <div className="space-y-4">
            {submissionsRequest.data.map((submission) => (
              <div
                key={submission.id}
                className="rounded-[24px] border border-border/70 bg-background/34 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold text-foreground">{submission.site_name}</p>
                      <AdminStatusBadge tone={toneForSubmissionStatus(submission.status)}>
                        {SUBMISSION_STATUS_LABELS[submission.status]}
                      </AdminStatusBadge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{submission.site_url}</p>
                    {submission.site_description ? (
                      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
                        {submission.site_description}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => loadSubmissionIntoForm(submission)}
                    >
                      <MaterialSymbol icon="south_west" size={16} />
                      带入编辑器
                    </Button>
                    <Button
                      size="sm"
                      loading={submissionSavingId === submission.id}
                      onClick={() => updateSubmissionStatus(submission.id, 'approved')}
                    >
                      <MaterialSymbol icon="check" size={16} />
                      采纳
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      loading={submissionSavingId === submission.id}
                      onClick={() => updateSubmissionStatus(submission.id, 'rejected')}
                    >
                      <MaterialSymbol icon="close" size={16} />
                      忽略
                    </Button>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 rounded-[20px] border border-border/70 bg-background/40 p-4 text-sm text-muted-foreground">
                    <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground/70">
                      Submission
                    </p>
                    <p>邮箱：{submission.contact_email}</p>
                    {submission.site_rss_url ? <p>RSS：{submission.site_rss_url}</p> : null}
                    {submission.site_avatar_url ? <p>头像：{submission.site_avatar_url}</p> : null}
                    {submission.contact_note ? <p>备注：{submission.contact_note}</p> : null}
                  </div>

                  <div className="space-y-2">
                    <Field label="后台备注">
                      <textarea
                        value={submissionNotes[submission.id] ?? ''}
                        onChange={(event) =>
                          setSubmissionNotes((current) => ({
                            ...current,
                            [submission.id]: event.target.value,
                          }))
                        }
                        className={TEXTAREA_CLASS}
                        rows={4}
                        placeholder="记录回访情况、是否已互链、后续要跟进的内容。"
                      />
                    </Field>
                    <div className="flex justify-end">
                      <Button
                        variant="secondary"
                        size="sm"
                        loading={submissionSavingId === submission.id}
                        onClick={() => saveSubmissionNote(submission.id)}
                      >
                        <MaterialSymbol icon="save" size={16} />
                        保存备注
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminPanel>
    </div>
  )
}

function Field({
  label,
  hint,
  children,
  fullWidth = false,
}: {
  label: string
  hint?: string
  children: React.ReactNode
  fullWidth?: boolean
}) {
  return (
    <AdminField label={label} hint={hint} fullWidth={fullWidth}>
      {children}
    </AdminField>
  )
}

const INPUT_CLASS = ADMIN_INPUT_CLASS
const TEXTAREA_CLASS = ADMIN_TEXTAREA_CLASS

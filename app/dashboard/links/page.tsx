'use client'

import { useEffect, useRef, useState } from 'react'
import useSWR from 'swr'
import {
  AdminField,
  ADMIN_INPUT_CLASS,
  ADMIN_MUTED_PANEL_CLASS,
  ADMIN_TEXTAREA_CLASS,
} from '@/components/admin/AdminPrimitives'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'
import type { LinkCategory, LinkRow } from '@/types/link'

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

async function uploadAvatar(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch('/api/upload/image', {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => null)
    throw new Error(readApiError(error, '头像上传失败'))
  }

  return res.json() as Promise<{ url: string }>
}

export default function DashboardLinksPage() {
  const { data, isLoading, mutate } = useSWR<LinkRow[]>('/api/links?admin=true', fetcher)
  const [form, setForm] = useState<LinkFormState>(EMPTY_FORM)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!data?.length) return

    if (selectedId == null) return

    const current = data.find((item) => item.id === selectedId)
    if (current) setForm(toFormState(current))
  }, [data, selectedId])

  function resetNotice() {
    setError('')
    setSuccess('')
  }

  function startNew() {
    setSelectedId(null)
    setForm(EMPTY_FORM)
    resetNotice()
  }

  async function handleSave() {
    if (!form.name.trim() || !form.url.trim()) {
      setError('站点名称和链接是必填项。')
      return
    }

    setSaving(true)
    resetNotice()

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

      await mutate()
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
    if (!confirm('确定删除这个友链吗？')) return

    setDeleting(true)
    resetNotice()

    try {
      const response = await fetch(`/api/links/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(readApiError(payload, '删除失败'))
      }

      await mutate()
      if (selectedId === id) startNew()
      setSuccess('友链已删除。')
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败')
    } finally {
      setDeleting(false)
    }
  }

  async function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    resetNotice()

    try {
      const result = await uploadAvatar(file)
      setForm((current) => ({ ...current, avatarUrl: result.url }))
      setSuccess('头像已上传，记得保存友链。')
    } catch (err) {
      setError(err instanceof Error ? err.message : '头像上传失败')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
            Links Directory
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">友情链接</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
            这里不仅能新增友链，也能随时编辑头像、分类、排序和显隐状态。头像预览区可以直接点击上传，
            不需要再跑去右上角找按钮。
          </p>
        </div>
        <Button onClick={startNew}>
          <MaterialSymbol icon="add_link" size={18} />
          新建友链
        </Button>
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

      <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
        <Card className="rounded-[28px] border border-border/75 bg-card/76 backdrop-blur-xl">
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">友链列表</h2>
              <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
                {data?.length ?? 0} items
              </span>
            </div>

            <div className="space-y-3">
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-24 animate-pulse rounded-[22px] border border-border bg-background/60"
                    />
                  ))}
                </div>
              ) : !data?.length ? (
                <div className="rounded-[22px] border border-border/70 bg-background/36 px-5 py-12 text-center text-sm text-muted-foreground">
                  还没有友链，先新建一个吧。
                </div>
              ) : (
                data.map((link) => (
                  <div
                    key={link.id}
                    className={`rounded-[22px] border px-4 py-4 transition-all duration-200 ${
                      selectedId === link.id
                        ? 'border-primary/20 bg-primary/10'
                        : 'border-border/70 bg-background/38 hover:border-border hover:bg-background/48'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedId(link.id)
                          setForm(toFormState(link))
                        }}
                        className="flex min-w-0 flex-1 items-start gap-3 text-left"
                      >
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
                          {link.avatar_url ? (
                            <img
                              src={link.avatar_url}
                              alt={link.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-base font-semibold text-foreground">
                              {link.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-medium text-foreground">{link.name}</p>
                            <span className="rounded-full border border-border/70 bg-background/50 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                              {CATEGORY_LABELS[link.category]}
                            </span>
                            {!link.is_active ? (
                              <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.18em] text-amber-300">
                                hidden
                              </span>
                            ) : null}
                          </div>
                          {link.description ? (
                            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
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
                        className="text-red-400 hover:text-red-300"
                        onClick={() => handleDelete(link.id)}
                        disabled={deleting}
                      >
                        删除
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardBody>
        </Card>

        <Card className="rounded-[28px] border border-border/75 bg-card/76 backdrop-blur-xl">
          <CardBody className="space-y-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-foreground">
                  {form.id ? '编辑友链' : '新建友链'}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  点击左侧列表切换编辑对象，或直接新建一条新的友链记录。
                </p>
              </div>
              <div className="flex items-center gap-3">
                {form.id ? (
                  <Button variant="ghost" onClick={startNew}>
                    <MaterialSymbol icon="refresh" size={18} />
                    切换到新建
                  </Button>
                ) : null}
                <Button onClick={handleSave} loading={saving}>
                  <MaterialSymbol icon="save" size={18} />
                  {form.id ? '保存修改' : '创建友链'}
                </Button>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[220px_1fr]">
              <div className={`${ADMIN_MUTED_PANEL_CLASS} p-5`}>
                <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
                  Avatar
                </p>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="group mt-4 block w-full rounded-[24px] border border-dashed border-border/70 bg-background/34 p-4 text-left transition-colors hover:border-primary/24 hover:bg-background/48"
                >
                  <div className="flex justify-center">
                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border border-border/70 bg-background/45">
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
                    {uploading ? '上传中...' : '点击头像上传'}
                  </p>
                  <p className="mt-2 text-center text-xs leading-6 text-muted-foreground">
                    头像、首字母预览和最终前台卡片会同步更新。
                  </p>
                </button>

                <div className="mt-4 space-y-2">
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                  >
                    <MaterialSymbol icon="image_arrow_up" size={18} />
                    {uploading ? '上传中' : '更换头像'}
                  </Button>
                  <Button
                    variant="ghost"
                    fullWidth
                    onClick={() => setForm((current) => ({ ...current, avatarUrl: '' }))}
                    disabled={!form.avatarUrl}
                  >
                    <MaterialSymbol icon="delete" size={18} />
                    清空头像
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="站点名称">
                  <input
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    className={INPUT_CLASS}
                    placeholder="例如：即刻、Hoppscotch、某某的博客"
                  />
                </Field>
                <Field label="站点链接">
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
                    placeholder="https://example.com/avatar.jpg 或 /uploads/images/..."
                  />
                </Field>
                <Field label="一句话简介" fullWidth>
                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, description: event.target.value }))
                    }
                    className={TEXTAREA_CLASS}
                    rows={4}
                    placeholder="这个站点适合什么人逛，和你为什么想把它放进友链。"
                  />
                </Field>
                <Field label="分类">
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
                <Field label="排序值">
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
                <label className="md:col-span-2 flex items-center gap-3 rounded-[22px] border border-border/70 bg-background/38 px-4 py-4">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, isActive: event.target.checked }))
                    }
                    className="h-4 w-4 rounded border-border bg-background"
                  />
                  <span>
                    <span className="block text-sm font-medium text-foreground">公开显示</span>
                    <span className="block text-sm text-muted-foreground">
                      关闭后只在后台保留记录，不在前台友情链接页展示。
                    </span>
                  </span>
                </label>
              </div>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </CardBody>
        </Card>
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
    <AdminField label={label} fullWidth={fullWidth}>
      {children}
    </AdminField>
  )
}

const INPUT_CLASS = ADMIN_INPUT_CLASS

const TEXTAREA_CLASS = ADMIN_TEXTAREA_CLASS

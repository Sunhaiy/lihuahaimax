'use client'

import { useRef, useState } from 'react'
import useSWR from 'swr'
import { Button } from '@/components/ui/Button'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'
import type { LinkRow } from '@/types/link'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type LinkFormState = {
  name: string
  url: string
  description: string
  avatarUrl: string
}

const EMPTY_FORM: LinkFormState = {
  name: '',
  url: '',
  description: '',
  avatarUrl: '',
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

async function uploadAvatar(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch('/api/upload/image', {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => null)
    throw new Error(typeof error?.error === 'string' ? error.error : '头像上传失败')
  }

  return res.json() as Promise<{ url: string }>
}

export default function DashboardLinksPage() {
  const { data, isLoading, mutate } = useSWR<LinkRow[]>('/api/links?admin=true', fetcher)
  const [form, setForm] = useState<LinkFormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleAdd() {
    if (!form.name.trim() || !form.url.trim()) return

    setSaving(true)
    setError('')

    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          url: form.url.trim(),
          description: form.description.trim() || undefined,
          avatarUrl: form.avatarUrl.trim() || undefined,
        }),
      })

      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(readApiError(payload, '添加失败'))
      }

      setForm(EMPTY_FORM)
      mutate()
    } catch (err) {
      setError(err instanceof Error ? err.message : '添加失败')
    } finally {
      setSaving(false)
    }
  }

  async function handleAvatarUpload(file: File) {
    setUploading(true)
    setError('')

    try {
      const result = await uploadAvatar(file)
      setForm((current) => ({ ...current, avatarUrl: result.url }))
    } catch (err) {
      setError(err instanceof Error ? err.message : '头像上传失败')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('确定删除这个友链吗？')) return
    await fetch(`/api/links/${id}`, { method: 'DELETE' })
    mutate()
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
          Links Directory
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">友情链接</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
          现在可以直接填写头像链接，也可以本地上传头像后自动回填到友链记录。
        </p>
      </div>

      <div className="rounded-[28px] border border-white/8 bg-card/75 p-6 backdrop-blur-xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-foreground">添加友链</p>
            <p className="mt-1 text-sm text-muted-foreground">
              支持站点名称、链接、简介，以及头像 URL 或本地上传。
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) handleAvatarUpload(file)
              }}
            />
            <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
              <MaterialSymbol icon="upload" size={18} />
              {uploading ? '上传中' : '上传头像'}
            </Button>
            <Button size="sm" loading={saving} onClick={handleAdd}>
              <MaterialSymbol icon="add_link" size={18} />
              添加
            </Button>
          </div>
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        <div className="mt-6 grid gap-5 xl:grid-cols-[132px_1fr]">
          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
            <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
              Avatar Preview
            </p>
            <div className="mt-4 flex justify-center">
              {form.avatarUrl ? (
                <img
                  src={form.avatarUrl}
                  alt={form.name || 'avatar preview'}
                  className="h-20 w-20 rounded-3xl border border-white/10 object-cover shadow-[0_12px_30px_rgba(15,23,42,0.25)]"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-dashed border-white/10 bg-black/20 text-lg font-semibold text-muted-foreground">
                  {(form.name.trim().charAt(0) || '友').toUpperCase()}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setForm((current) => ({ ...current, avatarUrl: '' }))}
              className="mt-4 w-full rounded-2xl border border-white/8 px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
              disabled={!form.avatarUrl}
            >
              清空头像
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="站点名称">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="站点名称"
                className={INPUT_CLASS}
              />
            </Field>
            <Field label="站点链接">
              <input
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://example.com"
                className={INPUT_CLASS}
              />
            </Field>
            <Field label="头像链接">
              <input
                value={form.avatarUrl}
                onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
                placeholder="https://example.com/avatar.jpg 或 /uploads/images/..."
                className={INPUT_CLASS}
              />
            </Field>
            <Field label="简短描述">
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="可选的一句话介绍"
                className={INPUT_CLASS}
              />
            </Field>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="rounded-[24px] border border-white/8 bg-card/70 px-5 py-10 text-center text-sm text-muted-foreground">
            加载中…
          </div>
        ) : !data?.length ? (
          <div className="rounded-[24px] border border-white/8 bg-card/70 px-5 py-10 text-center text-sm text-muted-foreground">
            还没有友链。
          </div>
        ) : (
          data.map((link) => (
            <div
              key={link.id}
              className="flex items-center gap-4 rounded-[24px] border border-white/8 bg-card/75 px-5 py-4 backdrop-blur-xl"
            >
              {link.avatar_url ? (
                <img
                  src={link.avatar_url}
                  alt={link.name}
                  className="h-14 w-14 rounded-2xl border border-white/10 object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.04] text-base font-semibold text-foreground">
                  {link.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-foreground transition-colors hover:text-ember"
                  >
                    {link.name}
                  </a>
                  <span className="rounded-full border border-white/8 bg-white/[0.04] px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                    {link.category}
                  </span>
                  {!link.is_active ? (
                    <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.18em] text-amber-300">
                      hidden
                    </span>
                  ) : null}
                </div>
                {link.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">{link.description}</p>
                ) : null}
                <p className="mt-1 truncate text-[11px] font-mono text-muted-foreground/75">{link.url}</p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-300"
                onClick={() => handleDelete(link.id)}
              >
                删除
              </Button>
            </div>
          ))
        )}
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

const INPUT_CLASS =
  'h-12 w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 text-sm text-foreground placeholder:text-muted-foreground/45 focus:outline-none focus:ring-2 focus:ring-ocean/35'

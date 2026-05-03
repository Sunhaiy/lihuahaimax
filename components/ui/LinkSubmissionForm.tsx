'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'

type FormState = {
  siteName: string
  siteUrl: string
  siteDescription: string
  siteAvatarUrl: string
  siteRssUrl: string
  contactEmail: string
  contactNote: string
}

const EMPTY_FORM: FormState = {
  siteName: '',
  siteUrl: '',
  siteDescription: '',
  siteAvatarUrl: '',
  siteRssUrl: '',
  contactEmail: '',
  contactNote: '',
}

export function LinkSubmissionForm() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)
    setError('')
    setSuccess('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/link-submissions/avatar', {
        method: 'POST',
        body: formData,
      })

      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(
          typeof payload?.error === 'string' ? payload.error : '头像上传失败，请稍后再试。'
        )
      }

      setForm((current) => ({ ...current, siteAvatarUrl: String(payload?.url ?? '') }))
      setSuccess('头像上传完成，已自动填入头像链接。')
    } catch (err) {
      setError(err instanceof Error ? err.message : '头像上传失败，请稍后再试。')
    } finally {
      setUploadingAvatar(false)
      if (fileRef.current) {
        fileRef.current.value = ''
      }
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/link-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteName: form.siteName.trim(),
          siteUrl: form.siteUrl.trim(),
          siteDescription: form.siteDescription.trim() || undefined,
          siteAvatarUrl: form.siteAvatarUrl.trim() || undefined,
          siteRssUrl: form.siteRssUrl.trim() || undefined,
          contactEmail: form.contactEmail.trim(),
          contactNote: form.contactNote.trim() || undefined,
        }),
      })

      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        const fallback = '提交失败，请检查信息后再试。'
        const message =
          typeof payload?.error === 'string'
            ? payload.error
            : payload?.error?.formErrors?.[0] ||
              Object.values(payload?.error?.fieldErrors ?? {}).flat()[0] ||
              fallback
        throw new Error(message)
      }

      setForm(EMPTY_FORM)
      setSuccess('申请已经收到，我会尽快回访你的站点。')
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失败，请稍后再试。')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="站点名称" required>
          <input
            value={form.siteName}
            onChange={(event) => setForm((current) => ({ ...current, siteName: event.target.value }))}
            className={INPUT_CLASS}
            placeholder="例如：某某的博客"
            required
          />
        </Field>
        <Field label="联系邮箱" required>
          <input
            type="email"
            value={form.contactEmail}
            onChange={(event) =>
              setForm((current) => ({ ...current, contactEmail: event.target.value }))
            }
            className={INPUT_CLASS}
            placeholder="hello@example.com"
            required
          />
        </Field>
      </div>

      <Field label="站点链接" required>
        <input
          type="url"
          value={form.siteUrl}
          onChange={(event) => setForm((current) => ({ ...current, siteUrl: event.target.value }))}
          className={INPUT_CLASS}
          placeholder="https://example.com"
          required
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="头像链接" hint="可直接粘贴图片链接，或点击右侧上传图片。">
          <div className="flex items-center gap-2">
            <input
              value={form.siteAvatarUrl}
              onChange={(event) =>
                setForm((current) => ({ ...current, siteAvatarUrl: event.target.value }))
              }
              className={INPUT_CLASS}
              placeholder="https://example.com/avatar.jpg"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="shrink-0"
              onClick={() => fileRef.current?.click()}
              loading={uploadingAvatar}
            >
              <MaterialSymbol icon="image_arrow_up" size={16} />
              上传
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>
        </Field>
        <Field label="RSS 链接" hint="选填，没有的话可以留空。">
          <input
            value={form.siteRssUrl}
            onChange={(event) => setForm((current) => ({ ...current, siteRssUrl: event.target.value }))}
            className={INPUT_CLASS}
            placeholder="https://example.com/rss.xml"
          />
        </Field>
      </div>

      <Field label="站点简介">
        <textarea
          value={form.siteDescription}
          onChange={(event) =>
            setForm((current) => ({ ...current, siteDescription: event.target.value }))
          }
          className={TEXTAREA_CLASS}
          rows={4}
          placeholder="简单介绍一下你的站点和内容方向。"
        />
      </Field>

      <Field label="补充说明">
        <textarea
          value={form.contactNote}
          onChange={(event) => setForm((current) => ({ ...current, contactNote: event.target.value }))}
          className={TEXTAREA_CLASS}
          rows={3}
          placeholder="例如：已经添加本站、更新频率，或你想补充的说明。"
        />
      </Field>

      {error ? (
        <div className="rounded-[18px] border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-[18px] border border-primary/18 bg-primary/10 px-4 py-3 text-sm text-white/82">
          {success}
        </div>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" loading={submitting}>
          <MaterialSymbol icon="send" size={16} />
          提交友链申请
        </Button>
      </div>
    </form>
  )
}

function Field({
  label,
  children,
  required = false,
  hint,
}: {
  label: string
  children: React.ReactNode
  required?: boolean
  hint?: string
}) {
  return (
    <label className="block space-y-2">
      <span className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-white/46">
        <span>
          {label}
          {required ? ' *' : ''}
        </span>
        {hint ? <span className="normal-case tracking-normal text-white/28">{hint}</span> : null}
      </span>
      {children}
    </label>
  )
}

const INPUT_CLASS =
  'h-11 w-full rounded-[18px] border border-white/10 bg-white/[0.04] px-4 text-sm text-white placeholder:text-white/24 transition-colors focus:border-white/18 focus:outline-none focus:ring-2 focus:ring-white/8'

const TEXTAREA_CLASS =
  'w-full rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-white placeholder:text-white/24 transition-colors focus:border-white/18 focus:outline-none focus:ring-2 focus:ring-white/8'

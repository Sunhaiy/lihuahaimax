'use client'

import { useEffect, useState } from 'react'
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
  ADMIN_TEXTAREA_CLASS,
} from '@/components/admin/AdminPrimitives'
import { Button } from '@/components/ui/Button'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'
import type { WorkDetail } from '@/types/work'

const fetcher = (url: string) => fetch(url).then((response) => response.json())

type WorkForm = WorkDetail

function createEmptyWork(): WorkForm {
  return {
    id: 0,
    slug: '',
    title: '',
    subtitle: '',
    summary: '',
    description: '',
    content: '',
    cover_url: '',
    hero_image_url: '',
    seal: '',
    status_text: '',
    progress_text: '',
    version_text: '',
    price: '',
    original_price: '',
    tags: [],
    url: '',
    github_url: '',
    primary_url: '',
    primary_label: '项目官网',
    secondary_url: '',
    secondary_label: 'GitHub',
    year: new Date().getFullYear(),
    sort_order: 0,
    is_published: true,
    contributors: [],
    milestones: [],
    gallery: [],
    created_at: '',
    updated_at: '',
  }
}

export default function DashboardWorksPage() {
  const { data, isLoading, mutate } = useSWR<WorkDetail[]>('/api/works?admin=true', fetcher)
  const [form, setForm] = useState<WorkForm>(createEmptyWork())
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!data?.length || selectedId == null) return
    const current = data.find((item) => item.id === selectedId)
    if (current) setForm(current)
  }, [data, selectedId])

  function updateField<Key extends keyof WorkForm>(key: Key, value: WorkForm[Key]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function resetNotice() {
    setError('')
    setSuccess('')
  }

  function startNew() {
    setSelectedId(null)
    setForm(createEmptyWork())
    resetNotice()
  }

  async function handleSave() {
    if (!form.title.trim()) {
      setError('项目标题不能为空。')
      return
    }

    setSaving(true)
    resetNotice()

    const payload = {
      title: form.title,
      slug: form.slug || undefined,
      subtitle: form.subtitle || null,
      summary: form.summary || null,
      description: form.description || null,
      cover_url: form.cover_url || '',
      tags: form.tags.filter(Boolean),
      url: form.url || null,
      github_url: form.github_url || null,
      primary_url: form.primary_url || form.url || null,
      primary_label: form.primary_label || '项目官网',
      secondary_url: form.secondary_url || form.github_url || null,
      secondary_label: form.secondary_label || 'GitHub',
      year: form.year || null,
      sort_order: form.sort_order || 0,
      is_published: form.is_published,
    }

    try {
      const response = await fetch(form.id ? `/api/works/${form.id}` : '/api/works', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = response.status === 204 ? null : await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(result?.error || '保存失败')
      }

      await mutate()
      if (result?.id) {
        setSelectedId(result.id)
        setForm(result)
      }
      setSuccess(form.id ? '项目已更新。' : '项目已创建。')
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!form.id) return
    if (!confirm(`确定删除「${form.title}」吗？`)) return

    setDeleting(true)
    resetNotice()

    try {
      const response = await fetch(`/api/works/${form.id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('删除失败')
      await mutate()
      startNew()
      setSuccess('项目已删除。')
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Works Manager"
        title="项目管理"
        description="维护项目票根正反两面的内容：正面展示标题与封面，背面展示简介、官网和 GitHub。"
        actions={
          <Button onClick={startNew}>
            <MaterialSymbol icon="add" size={18} />
            新建项目
          </Button>
        }
        meta={
          <>
            <AdminStatusBadge tone="accent">{data?.length ?? 0} 个项目</AdminStatusBadge>
            <AdminStatusBadge tone="neutral">票根翻转</AdminStatusBadge>
          </>
        }
      />

      {error ? <AdminNotice tone="danger">{error}</AdminNotice> : null}
      {success ? <AdminNotice tone="success">{success}</AdminNotice> : null}

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <AdminPanel
          title="项目列表"
          description="左侧快速切换，右侧集中编辑。"
          icon="deployed_code"
          bodyClassName="space-y-3"
        >
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-24 animate-pulse rounded-[22px] border border-border/70 bg-background/38"
                />
              ))}
            </div>
          ) : !data?.length ? (
            <AdminEmptyState
              icon="deployed_code"
              title="还没有项目"
              description="先创建一个项目，前台项目页就会立刻读取到。"
              action={
                <Button size="sm" onClick={startNew}>
                  新建第一个
                </Button>
              }
            />
          ) : (
            data.map((item) => {
              const active = selectedId === item.id
              const hasOfficialLink = Boolean(item.primary_url || item.url)
              const hasGithubLink = Boolean(item.github_url || item.secondary_url)
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(item.id)
                    setForm(item)
                    resetNotice()
                  }}
                  className={`w-full rounded-[22px] border px-4 py-3 text-left transition-colors ${
                    active
                      ? 'border-primary/18 bg-primary/10'
                      : 'border-border/70 bg-background/38 hover:border-border hover:bg-background/46'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                        <AdminStatusBadge tone={item.is_published ? 'accent' : 'neutral'}>
                          {item.is_published ? '已发布' : '草稿'}
                        </AdminStatusBadge>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {item.summary || item.subtitle || '还没有摘要。'}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <AdminStatusBadge tone={hasOfficialLink ? 'accent' : 'neutral'}>
                          {hasOfficialLink ? '有官网' : '无官网'}
                        </AdminStatusBadge>
                        <AdminStatusBadge tone={hasGithubLink ? 'accent' : 'neutral'}>
                          {hasGithubLink ? '有 GitHub' : '无 GitHub'}
                        </AdminStatusBadge>
                      </div>
                      <p className="mt-2 truncate text-[11px] font-mono text-muted-foreground/75">
                        {item.slug || 'untitled'} · sort {item.sort_order}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </AdminPanel>

        <AdminPanel
          title={form.id ? '编辑项目' : '新建项目'}
          description="这些字段会同步到前台项目票根，尤其是悬停翻面后的简介和外链。"
          icon="edit_square"
          bodyClassName="space-y-6"
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
                {form.id ? '保存修改' : '创建项目'}
              </Button>
            </div>
          }
        >
          <AdminSection title="基础信息" description="标题、摘要和标签会进入前台项目票根；摘要会优先显示在翻转背面。">
            <div className="grid gap-4 md:grid-cols-2">
              <AdminField label="标题">
                <input
                  value={form.title}
                  onChange={(event) => updateField('title', event.target.value)}
                  className={ADMIN_INPUT_CLASS}
                  placeholder="项目名称"
                />
              </AdminField>

              <AdminField label="Slug">
                <input
                  value={form.slug}
                  onChange={(event) => updateField('slug', event.target.value)}
                  className={ADMIN_INPUT_CLASS}
                  placeholder="my-project"
                />
              </AdminField>

              <AdminField label="副标题" fullWidth>
                <input
                  value={form.subtitle ?? ''}
                  onChange={(event) => updateField('subtitle', event.target.value)}
                  className={ADMIN_INPUT_CLASS}
                  placeholder="一句简短补充"
                />
              </AdminField>

              <AdminField label="翻面简介" fullWidth>
                <textarea
                  value={form.summary ?? ''}
                  onChange={(event) => updateField('summary', event.target.value)}
                  className={ADMIN_TEXTAREA_CLASS}
                  rows={4}
                  placeholder="鼠标悬停翻转卡片后显示的一段简短介绍"
                />
              </AdminField>

              <AdminField label="标签" fullWidth>
                <input
                  value={form.tags.join(', ')}
                  onChange={(event) =>
                    updateField(
                      'tags',
                      event.target.value
                        .split(',')
                        .map((item) => item.trim())
                        .filter(Boolean)
                    )
                  }
                  className={ADMIN_INPUT_CLASS}
                  placeholder="Next.js, TypeScript, PostgreSQL"
                />
              </AdminField>
            </div>
          </AdminSection>

          <AdminSection title="封面与背面链接" description="封面显示在票根正面；官网和 GitHub 会显示在翻转背面。">
            <div className="grid gap-4 md:grid-cols-2">
              <AdminField label="封面 URL" fullWidth>
                <input
                  value={form.cover_url}
                  onChange={(event) => updateField('cover_url', event.target.value)}
                  className={ADMIN_INPUT_CLASS}
                  placeholder="https://example.com/cover.jpg"
                />
              </AdminField>

              <AdminField label="年份">
                <input
                  type="number"
                  value={form.year ?? ''}
                  onChange={(event) =>
                    updateField('year', event.target.value ? Number(event.target.value) : null)
                  }
                  className={ADMIN_INPUT_CLASS}
                  placeholder="2026"
                />
              </AdminField>

              <AdminField label="官网链接">
                <input
                  value={form.primary_url ?? form.url ?? ''}
                  onChange={(event) => updateField('primary_url', event.target.value)}
                  className={ADMIN_INPUT_CLASS}
                  placeholder="https://example.com"
                />
              </AdminField>

              <AdminField label="官网按钮文案">
                <input
                  value={form.primary_label ?? ''}
                  onChange={(event) => updateField('primary_label', event.target.value)}
                  className={ADMIN_INPUT_CLASS}
                  placeholder="项目官网"
                />
              </AdminField>

              <AdminField label="GitHub 链接">
                <input
                  value={form.github_url ?? form.secondary_url ?? ''}
                  onChange={(event) => {
                    updateField('github_url', event.target.value)
                    if (!form.secondary_url) updateField('secondary_url', event.target.value)
                  }}
                  className={ADMIN_INPUT_CLASS}
                  placeholder="https://github.com/owner/repo"
                />
              </AdminField>

              <AdminField label="GitHub 按钮文案">
                <input
                  value={form.secondary_label ?? ''}
                  onChange={(event) => updateField('secondary_label', event.target.value)}
                  className={ADMIN_INPUT_CLASS}
                  placeholder="GitHub"
                />
              </AdminField>
            </div>
          </AdminSection>

          <AdminSection title="发布设置" description="控制排序和前台是否可见。">
            <div className="grid gap-4 md:grid-cols-2">
              <AdminField label="排序">
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(event) => updateField('sort_order', Number(event.target.value) || 0)}
                  className={ADMIN_INPUT_CLASS}
                  placeholder="0"
                />
              </AdminField>

              <AdminField label="发布状态">
                <label className="flex h-11 items-center gap-3 rounded-[18px] border border-border/70 bg-background/55 px-4 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={(event) => updateField('is_published', event.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
                  />
                  <span>{form.is_published ? '前台可见' : '暂不公开'}</span>
                </label>
              </AdminField>
            </div>
          </AdminSection>

          {form.id ? (
            <div className="flex justify-end">
              <Button variant="danger" onClick={handleDelete} loading={deleting}>
                <MaterialSymbol icon="delete" size={18} />
                删除项目
              </Button>
            </div>
          ) : null}
        </AdminPanel>
      </div>
    </div>
  )
}

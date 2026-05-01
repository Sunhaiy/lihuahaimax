'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'
import type { WorkContributor, WorkDetail, WorkMilestone } from '@/types/work'

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
    primary_label: '',
    secondary_url: '',
    secondary_label: '',
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

function emptyContributor(): WorkContributor {
  return {
    name: '',
    role: '',
    avatar_url: '',
  }
}

function emptyMilestone(): WorkMilestone {
  return {
    date: '',
    title: '',
    desc: '',
    link: '',
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
    if (!data?.length) return
    if (selectedId == null) {
      setSelectedId(data[0].id)
      setForm(data[0])
      return
    }

    const current = data.find((item) => item.id === selectedId)
    if (current) setForm(current)
  }, [data, selectedId])

  function updateField<Key extends keyof WorkForm>(key: Key, value: WorkForm[Key]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function startNew() {
    setSelectedId(null)
    setForm(createEmptyWork())
    setError('')
    setSuccess('')
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    setSuccess('')

    const payload = {
      ...form,
      subtitle: form.subtitle || null,
      summary: form.summary || null,
      description: form.description || null,
      content: form.content || null,
      seal: form.seal || null,
      status_text: form.status_text || null,
      progress_text: form.progress_text || null,
      version_text: form.version_text || null,
      price: form.price || null,
      original_price: form.original_price || null,
      url: form.url || null,
      github_url: form.github_url || null,
      primary_url: form.primary_url || null,
      primary_label: form.primary_label || null,
      secondary_url: form.secondary_url || null,
      secondary_label: form.secondary_label || null,
      year: form.year || null,
      tags: form.tags.filter(Boolean),
      gallery: form.gallery.filter(Boolean),
      contributors: form.contributors.filter((item) => item.name.trim().length > 0),
      milestones: form.milestones.filter((item) => item.title.trim().length > 0),
    }

    try {
      const response = await fetch(form.id ? `/api/works/${form.id}` : '/api/works', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = response.status === 204 ? null : await response.json()
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
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/works/${form.id}`, { method: 'DELETE' })
      if (!response.ok) {
        throw new Error('删除失败')
      }

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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-muted-foreground">
            Works Manager
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">作品 / 项目管理</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
            这里统一管理作品列表、详情页字段、招募按钮、里程碑和贡献者。当前模型已经升级为完整项目实体，
            前台 `/works` 和 `/works/[slug]` 会直接消费这里的内容。
          </p>
        </div>
        <Button onClick={startNew}>
          <MaterialSymbol icon="add" size={18} />
          新建项目
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
        <Card className="rounded-[28px] border-white/8 bg-card/75 backdrop-blur-xl">
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">项目列表</h2>
              <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
                {data?.length ?? 0} items
              </span>
            </div>

            <div className="space-y-3">
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-24 rounded-[22px] border border-border bg-background/60 animate-pulse" />
                  ))}
                </div>
              ) : !data?.length ? (
                <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-5 py-12 text-center text-sm text-muted-foreground">
                  还没有项目，先新建一个吧。
                </div>
              ) : (
                data.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(item.id)
                      setForm(item)
                    }}
                    className={`w-full rounded-[22px] border px-4 py-4 text-left transition-all duration-200 ${
                      selectedId === item.id
                        ? 'border-ember/30 bg-ember/10 shadow-[0_0_0_1px_rgba(255,138,107,0.12)]'
                        : 'border-white/8 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                        <p className="mt-1 line-clamp-2 text-xs leading-6 text-muted-foreground">
                          {item.summary || item.subtitle || '暂无摘要'}
                        </p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.16em] ${
                        item.is_published
                          ? 'bg-emerald-500/12 text-emerald-300'
                          : 'bg-zinc-500/16 text-zinc-300'
                      }`}>
                        {item.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
                      <span>{item.slug}</span>
                      <span>·</span>
                      <span>sort {item.sort_order}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </CardBody>
        </Card>

        <div className="space-y-6">
          <SectionCard title="基础信息" icon="info">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="标题">
                <input value={form.title} onChange={(event) => updateField('title', event.target.value)} className={INPUT_CLASS} />
              </Field>
              <Field label="Slug">
                <input value={form.slug} onChange={(event) => updateField('slug', event.target.value)} className={INPUT_CLASS} />
              </Field>
              <Field label="副标题" fullWidth>
                <input value={form.subtitle ?? ''} onChange={(event) => updateField('subtitle', event.target.value)} className={INPUT_CLASS} />
              </Field>
              <Field label="标签（逗号分隔）" fullWidth>
                <input
                  value={form.tags.join(', ')}
                  onChange={(event) =>
                    updateField(
                      'tags',
                      event.target.value.split(',').map((item) => item.trim()).filter(Boolean)
                    )
                  }
                  className={INPUT_CLASS}
                />
              </Field>
              <Field label="列表摘要" fullWidth>
                <textarea value={form.summary ?? ''} onChange={(event) => updateField('summary', event.target.value)} className={TEXTAREA_CLASS} rows={3} />
              </Field>
              <Field label="短描述" fullWidth>
                <textarea value={form.description ?? ''} onChange={(event) => updateField('description', event.target.value)} className={TEXTAREA_CLASS} rows={4} />
              </Field>
            </div>
          </SectionCard>

          <SectionCard title="视觉资源" icon="image">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="列表封面 URL">
                <input value={form.cover_url} onChange={(event) => updateField('cover_url', event.target.value)} className={INPUT_CLASS} />
              </Field>
              <Field label="详情头图 URL">
                <input value={form.hero_image_url} onChange={(event) => updateField('hero_image_url', event.target.value)} className={INPUT_CLASS} />
              </Field>
              <Field label="Seal / 角标">
                <input value={form.seal ?? ''} onChange={(event) => updateField('seal', event.target.value)} className={INPUT_CLASS} />
              </Field>
              <Field label="画廊（每行一个 URL）" fullWidth>
                <textarea
                  value={form.gallery.join('\n')}
                  onChange={(event) =>
                    updateField(
                      'gallery',
                      event.target.value.split('\n').map((item) => item.trim()).filter(Boolean)
                    )
                  }
                  className={TEXTAREA_CLASS}
                  rows={4}
                />
              </Field>
            </div>
          </SectionCard>

          <SectionCard title="链接与 CTA" icon="link">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="旧展示链接 URL">
                <input value={form.url ?? ''} onChange={(event) => updateField('url', event.target.value)} className={INPUT_CLASS} />
              </Field>
              <Field label="GitHub URL">
                <input value={form.github_url ?? ''} onChange={(event) => updateField('github_url', event.target.value)} className={INPUT_CLASS} />
              </Field>
              <Field label="主按钮 URL">
                <input value={form.primary_url ?? ''} onChange={(event) => updateField('primary_url', event.target.value)} className={INPUT_CLASS} />
              </Field>
              <Field label="主按钮文案">
                <input value={form.primary_label ?? ''} onChange={(event) => updateField('primary_label', event.target.value)} className={INPUT_CLASS} />
              </Field>
              <Field label="次按钮 URL">
                <input value={form.secondary_url ?? ''} onChange={(event) => updateField('secondary_url', event.target.value)} className={INPUT_CLASS} />
              </Field>
              <Field label="次按钮文案">
                <input value={form.secondary_label ?? ''} onChange={(event) => updateField('secondary_label', event.target.value)} className={INPUT_CLASS} />
              </Field>
            </div>
          </SectionCard>

          <SectionCard title="状态 / 版本 / 价格" icon="monitoring">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Field label="状态文案">
                <input value={form.status_text ?? ''} onChange={(event) => updateField('status_text', event.target.value)} className={INPUT_CLASS} />
              </Field>
              <Field label="进度文案">
                <input value={form.progress_text ?? ''} onChange={(event) => updateField('progress_text', event.target.value)} className={INPUT_CLASS} />
              </Field>
              <Field label="版本号">
                <input value={form.version_text ?? ''} onChange={(event) => updateField('version_text', event.target.value)} className={INPUT_CLASS} />
              </Field>
              <Field label="现价">
                <input value={form.price ?? ''} onChange={(event) => updateField('price', event.target.value)} className={INPUT_CLASS} />
              </Field>
              <Field label="原价">
                <input value={form.original_price ?? ''} onChange={(event) => updateField('original_price', event.target.value)} className={INPUT_CLASS} />
              </Field>
              <Field label="年份">
                <input
                  type="number"
                  value={form.year ?? ''}
                  onChange={(event) => updateField('year', event.target.value ? Number(event.target.value) : null)}
                  className={INPUT_CLASS}
                />
              </Field>
            </div>
          </SectionCard>

          <SectionCard title="贡献者" icon="group">
            <div className="space-y-4">
              {form.contributors.map((item, index) => (
                <div key={index} className="grid gap-3 rounded-[22px] border border-white/8 bg-white/[0.03] p-4 md:grid-cols-[1fr_1fr_1fr_auto]">
                  <input
                    value={item.name}
                    onChange={(event) =>
                      updateField(
                        'contributors',
                        form.contributors.map((entry, entryIndex) =>
                          entryIndex === index ? { ...entry, name: event.target.value } : entry
                        )
                      )
                    }
                    placeholder="姓名"
                    className={INPUT_CLASS}
                  />
                  <input
                    value={item.role ?? ''}
                    onChange={(event) =>
                      updateField(
                        'contributors',
                        form.contributors.map((entry, entryIndex) =>
                          entryIndex === index ? { ...entry, role: event.target.value } : entry
                        )
                      )
                    }
                    placeholder="角色"
                    className={INPUT_CLASS}
                  />
                  <input
                    value={item.avatar_url ?? ''}
                    onChange={(event) =>
                      updateField(
                        'contributors',
                        form.contributors.map((entry, entryIndex) =>
                          entryIndex === index ? { ...entry, avatar_url: event.target.value } : entry
                        )
                      )
                    }
                    placeholder="头像 URL"
                    className={INPUT_CLASS}
                  />
                  <Button
                    variant="ghost"
                    className="self-start text-red-300 hover:text-red-200"
                    onClick={() =>
                      updateField(
                        'contributors',
                        form.contributors.filter((_, entryIndex) => entryIndex !== index)
                      )
                    }
                  >
                    <MaterialSymbol icon="delete" size={18} />
                  </Button>
                </div>
              ))}
              <Button variant="secondary" onClick={() => updateField('contributors', [...form.contributors, emptyContributor()])}>
                <MaterialSymbol icon="person_add" size={18} />
                添加贡献者
              </Button>
            </div>
          </SectionCard>

          <SectionCard title="里程碑" icon="timeline">
            <div className="space-y-4">
              {form.milestones.map((item, index) => (
                <div key={index} className="space-y-3 rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                  <div className="grid gap-3 md:grid-cols-[180px_1fr_auto]">
                    <input
                      value={item.date}
                      onChange={(event) =>
                        updateField(
                          'milestones',
                          form.milestones.map((entry, entryIndex) =>
                            entryIndex === index ? { ...entry, date: event.target.value } : entry
                          )
                        )
                      }
                      placeholder="2026-04 / Apr 2026"
                      className={INPUT_CLASS}
                    />
                    <input
                      value={item.title}
                      onChange={(event) =>
                        updateField(
                          'milestones',
                          form.milestones.map((entry, entryIndex) =>
                            entryIndex === index ? { ...entry, title: event.target.value } : entry
                          )
                        )
                      }
                      placeholder="里程碑标题"
                      className={INPUT_CLASS}
                    />
                    <Button
                      variant="ghost"
                      className="self-start text-red-300 hover:text-red-200"
                      onClick={() =>
                        updateField(
                          'milestones',
                          form.milestones.filter((_, entryIndex) => entryIndex !== index)
                        )
                      }
                    >
                      <MaterialSymbol icon="delete" size={18} />
                    </Button>
                  </div>
                  <input
                    value={item.link ?? ''}
                    onChange={(event) =>
                      updateField(
                        'milestones',
                        form.milestones.map((entry, entryIndex) =>
                          entryIndex === index ? { ...entry, link: event.target.value } : entry
                        )
                      )
                    }
                    placeholder="可选跳转链接"
                    className={INPUT_CLASS}
                  />
                  <textarea
                    value={item.desc}
                    onChange={(event) =>
                      updateField(
                        'milestones',
                        form.milestones.map((entry, entryIndex) =>
                          entryIndex === index ? { ...entry, desc: event.target.value } : entry
                        )
                      )
                    }
                    placeholder="里程碑描述"
                    className={TEXTAREA_CLASS}
                    rows={3}
                  />
                </div>
              ))}
              <Button variant="secondary" onClick={() => updateField('milestones', [...form.milestones, emptyMilestone()])}>
                <MaterialSymbol icon="add_chart" size={18} />
                添加里程碑
              </Button>
            </div>
          </SectionCard>

          <SectionCard title="详情正文" icon="description">
            <Field label="详情长文">
              <textarea value={form.content ?? ''} onChange={(event) => updateField('content', event.target.value)} className={TEXTAREA_CLASS} rows={12} />
            </Field>
          </SectionCard>

          <SectionCard title="发布与排序" icon="checklist">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="排序值">
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(event) => updateField('sort_order', Number(event.target.value || 0))}
                  className={INPUT_CLASS}
                />
              </Field>
              <label className="flex items-center gap-3 rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(event) => updateField('is_published', event.target.checked)}
                  className="h-4 w-4 rounded border-border bg-background"
                />
                <span>
                  <span className="block text-sm font-medium text-foreground">公开发布</span>
                  <span className="block text-sm text-muted-foreground">关闭后只在后台可见。</span>
                </span>
              </label>
            </div>
          </SectionCard>

          <div className="flex flex-wrap justify-between gap-3">
            <div className="text-xs text-muted-foreground">
              {form.id ? `当前编辑 ID: ${form.id}` : '正在创建新项目'}
            </div>
            <div className="flex items-center gap-3">
              {form.id ? (
                <Button variant="ghost" onClick={handleDelete} disabled={deleting}>
                  <MaterialSymbol icon="delete" size={18} />
                  {deleting ? '删除中' : '删除'}
                </Button>
              ) : null}
              <Button onClick={handleSave} loading={saving}>
                <MaterialSymbol icon="save" size={18} />
                {form.id ? '保存修改' : '创建项目'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string
  icon: string
  children: React.ReactNode
}) {
  return (
    <Card className="rounded-[28px] border-white/8 bg-card/75 backdrop-blur-xl">
      <CardBody className="space-y-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ember/12 text-ember">
            <MaterialSymbol icon={icon} size={20} />
          </span>
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        {children}
      </CardBody>
    </Card>
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

const INPUT_CLASS =
  'h-11 w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 text-sm text-foreground placeholder:text-muted-foreground/45 focus:outline-none focus:ring-2 focus:ring-ocean/40'

const TEXTAREA_CLASS =
  'w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/45 focus:outline-none focus:ring-2 focus:ring-ocean/40'

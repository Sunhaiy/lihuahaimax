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
  ADMIN_MUTED_PANEL_CLASS,
  ADMIN_TEXTAREA_CLASS,
} from '@/components/admin/AdminPrimitives'
import { Button } from '@/components/ui/Button'
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
  return { name: '', role: '', avatar_url: '' }
}

function emptyMilestone(): WorkMilestone {
  return { date: '', title: '', desc: '', link: '' }
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
    if (selectedId == null) return

    const current = data.find((item) => item.id === selectedId)
    if (current) setForm(current)
  }, [data, selectedId])

  function updateField<Key extends keyof WorkForm>(key: Key, value: WorkForm[Key]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function clearNotice() {
    setError('')
    setSuccess('')
  }

  function startNew() {
    setSelectedId(null)
    setForm(createEmptyWork())
    clearNotice()
  }

  async function handleSave() {
    if (!form.title.trim()) {
      setError('项目标题不能为空。')
      return
    }

    setSaving(true)
    clearNotice()

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

      const result = response.status === 204 ? null : await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(result?.error || '保存失败')
      }

      await mutate()
      if (result?.id) {
        setSelectedId(result.id)
        setForm(result)
      }

      setSuccess(form.id ? '作品已更新。' : '作品已创建。')
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
    clearNotice()

    try {
      const response = await fetch(`/api/works/${form.id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('删除失败')

      await mutate()
      startNew()
      setSuccess('作品已删除。')
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
        title="作品管理"
        description="把项目资料、展示图片、CTA、成员和里程碑统一放在一套更安静的编辑器里，减少旧卡片式后台的零碎感。"
        actions={
          <Button onClick={startNew}>
            <MaterialSymbol icon="add" size={18} />
            新建作品
          </Button>
        }
        meta={
          <>
            <AdminStatusBadge tone="accent">{data?.length ?? 0} 个作品</AdminStatusBadge>
            <AdminStatusBadge tone="neutral">项目与作品</AdminStatusBadge>
          </>
        }
      />

      {error ? <AdminNotice tone="danger">{error}</AdminNotice> : null}
      {success ? <AdminNotice tone="success">{success}</AdminNotice> : null}

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <AdminPanel
          title="作品列表"
          description="左侧快速切换，右侧专注编辑。"
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
              title="还没有作品"
              description="先创建一个项目，后面这页就能完整维护展示信息。"
              action={
                <Button size="sm" onClick={startNew}>
                  新建第一项
                </Button>
              }
            />
          ) : (
            data.map((item) => {
              const active = selectedId === item.id

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(item.id)
                    setForm(item)
                    clearNotice()
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
                        {item.summary || item.subtitle || '还没有摘要，可以在右侧补一段简短说明。'}
                      </p>
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

        <div className="space-y-6">
          <AdminPanel
            title={form.id ? '编辑作品' : '新建作品'}
            description="把主信息、视觉资产和行动按钮拆成清楚的段落，编辑时不会像一堵输入墙。"
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
                  {form.id ? '保存修改' : '创建作品'}
                </Button>
              </div>
            }
            bodyClassName="space-y-6"
          >
            <AdminSection title="基础信息" description="标题、slug、标签和摘要用于构建列表与详情页的第一层信息。">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="标题">
                  <input
                    value={form.title}
                    onChange={(event) => updateField('title', event.target.value)}
                    className={INPUT_CLASS}
                    placeholder="项目名称"
                  />
                </Field>
                <Field label="Slug" hint="用于详情页路由，建议使用英文短词。">
                  <input
                    value={form.slug}
                    onChange={(event) => updateField('slug', event.target.value)}
                    className={INPUT_CLASS}
                    placeholder="my-project"
                  />
                </Field>
                <Field label="副标题" fullWidth>
                  <input
                    value={form.subtitle ?? ''}
                    onChange={(event) => updateField('subtitle', event.target.value)}
                    className={INPUT_CLASS}
                    placeholder="一句更轻的补充说明"
                  />
                </Field>
                <Field label="标签" fullWidth hint="使用逗号分隔，会映射到前台标签组。">
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
                    className={INPUT_CLASS}
                    placeholder="TypeScript, Electron, CMS"
                  />
                </Field>
                <Field label="列表摘要" fullWidth>
                  <textarea
                    value={form.summary ?? ''}
                    onChange={(event) => updateField('summary', event.target.value)}
                    className={TEXTAREA_CLASS}
                    rows={3}
                    placeholder="用于卡片和列表页的短摘要。"
                  />
                </Field>
                <Field label="补充描述" fullWidth>
                  <textarea
                    value={form.description ?? ''}
                    onChange={(event) => updateField('description', event.target.value)}
                    className={TEXTAREA_CLASS}
                    rows={4}
                    placeholder="可用于详情页开头或后台备注。"
                  />
                </Field>
              </div>
            </AdminSection>

            <AdminSection title="视觉资产" description="前台卡片、作品页首屏和补充图集都从这里取数。">
              <div className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)]">
                <div className={`${ADMIN_MUTED_PANEL_CLASS} p-5`}>
                  <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
                    Preview
                  </p>
                  <div className="mt-4 overflow-hidden rounded-[24px] border border-border/70 bg-background/44">
                    {form.cover_url ? (
                      <img
                        src={form.cover_url}
                        alt={form.title || 'cover preview'}
                        className="h-44 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-44 items-center justify-center px-6 text-center text-sm text-muted-foreground">
                        封面会先显示在这里，帮助你确认作品的第一视觉。
                      </div>
                    )}
                  </div>
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    这块只做预览，不在这里承担复杂编辑，保证操作足够轻。
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="列表封面 URL">
                    <input
                      value={form.cover_url}
                      onChange={(event) => updateField('cover_url', event.target.value)}
                      className={INPUT_CLASS}
                      placeholder="https://example.com/cover.jpg"
                    />
                  </Field>
                  <Field label="详情头图 URL">
                    <input
                      value={form.hero_image_url}
                      onChange={(event) => updateField('hero_image_url', event.target.value)}
                      className={INPUT_CLASS}
                      placeholder="https://example.com/hero.jpg"
                    />
                  </Field>
                  <Field label="角标 / Seal">
                    <input
                      value={form.seal ?? ''}
                      onChange={(event) => updateField('seal', event.target.value)}
                      className={INPUT_CLASS}
                      placeholder="例如：新作、更新中"
                    />
                  </Field>
                  <Field label="图集" fullWidth hint="每行一条图片 URL，按顺序展示。">
                    <textarea
                      value={form.gallery.join('\n')}
                      onChange={(event) =>
                        updateField(
                          'gallery',
                          event.target.value
                            .split('\n')
                            .map((item) => item.trim())
                            .filter(Boolean)
                        )
                      }
                      className={TEXTAREA_CLASS}
                      rows={5}
                      placeholder="https://example.com/1.jpg"
                    />
                  </Field>
                </div>
              </div>
            </AdminSection>

            <AdminSection title="链接与按钮" description="把跳转入口放清楚，前台行动按钮会更稳定。">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="旧展示链接">
                  <input
                    value={form.url ?? ''}
                    onChange={(event) => updateField('url', event.target.value)}
                    className={INPUT_CLASS}
                    placeholder="历史展示页或旧链接"
                  />
                </Field>
                <Field label="GitHub URL">
                  <input
                    value={form.github_url ?? ''}
                    onChange={(event) => updateField('github_url', event.target.value)}
                    className={INPUT_CLASS}
                    placeholder="https://github.com/..."
                  />
                </Field>
                <Field label="主按钮 URL">
                  <input
                    value={form.primary_url ?? ''}
                    onChange={(event) => updateField('primary_url', event.target.value)}
                    className={INPUT_CLASS}
                    placeholder="https://example.com"
                  />
                </Field>
                <Field label="主按钮文案">
                  <input
                    value={form.primary_label ?? ''}
                    onChange={(event) => updateField('primary_label', event.target.value)}
                    className={INPUT_CLASS}
                    placeholder="立即体验"
                  />
                </Field>
                <Field label="次按钮 URL">
                  <input
                    value={form.secondary_url ?? ''}
                    onChange={(event) => updateField('secondary_url', event.target.value)}
                    className={INPUT_CLASS}
                    placeholder="https://example.com/docs"
                  />
                </Field>
                <Field label="次按钮文案">
                  <input
                    value={form.secondary_label ?? ''}
                    onChange={(event) => updateField('secondary_label', event.target.value)}
                    className={INPUT_CLASS}
                    placeholder="查看细节"
                  />
                </Field>
              </div>
            </AdminSection>

            <AdminSection title="状态与价格" description="状态文案、版本和价格信息由这里统一生成。">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Field label="状态文案">
                  <input
                    value={form.status_text ?? ''}
                    onChange={(event) => updateField('status_text', event.target.value)}
                    className={INPUT_CLASS}
                    placeholder="开发中 / 已上线 / 维护中"
                  />
                </Field>
                <Field label="进度文案">
                  <input
                    value={form.progress_text ?? ''}
                    onChange={(event) => updateField('progress_text', event.target.value)}
                    className={INPUT_CLASS}
                    placeholder="MVP 完成 80%"
                  />
                </Field>
                <Field label="版本号">
                  <input
                    value={form.version_text ?? ''}
                    onChange={(event) => updateField('version_text', event.target.value)}
                    className={INPUT_CLASS}
                    placeholder="v1.2.0"
                  />
                </Field>
                <Field label="现价">
                  <input
                    value={form.price ?? ''}
                    onChange={(event) => updateField('price', event.target.value)}
                    className={INPUT_CLASS}
                    placeholder="¥99"
                  />
                </Field>
                <Field label="原价">
                  <input
                    value={form.original_price ?? ''}
                    onChange={(event) => updateField('original_price', event.target.value)}
                    className={INPUT_CLASS}
                    placeholder="¥199"
                  />
                </Field>
                <Field label="年份">
                  <input
                    type="number"
                    value={form.year ?? ''}
                    onChange={(event) =>
                      updateField('year', event.target.value ? Number(event.target.value) : null)
                    }
                    className={INPUT_CLASS}
                    placeholder="2026"
                  />
                </Field>
              </div>
            </AdminSection>

            <AdminSection title="成员" description="只保留必要字段，避免成员列表变成复杂表格。">
              <div className="space-y-4">
                {form.contributors.length === 0 ? (
                  <AdminEmptyState
                    icon="group"
                    title="还没有成员"
                    description="成员信息不是必填，但录入后前台展示会更完整。"
                    action={
                      <Button size="sm" variant="secondary" onClick={() => updateField('contributors', [emptyContributor()])}>
                        添加第一位成员
                      </Button>
                    }
                  />
                ) : (
                  form.contributors.map((item, index) => (
                    <div
                      key={index}
                      className="grid gap-3 rounded-[22px] border border-border/70 bg-background/38 p-4 md:grid-cols-[1fr_1fr_1fr_auto]"
                    >
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
                  ))
                )}

                {form.contributors.length > 0 ? (
                  <Button
                    variant="secondary"
                    onClick={() => updateField('contributors', [...form.contributors, emptyContributor()])}
                  >
                    <MaterialSymbol icon="person_add" size={18} />
                    添加成员
                  </Button>
                ) : null}
              </div>
            </AdminSection>

            <AdminSection title="里程碑" description="按时间记录关键节点，方便前台构建作品轨迹。">
              <div className="space-y-4">
                {form.milestones.length === 0 ? (
                  <AdminEmptyState
                    icon="timeline"
                    title="还没有里程碑"
                    description="可以先空着，之后有版本推进再补。"
                    action={
                      <Button size="sm" variant="secondary" onClick={() => updateField('milestones', [emptyMilestone()])}>
                        添加第一条
                      </Button>
                    }
                  />
                ) : (
                  form.milestones.map((item, index) => (
                    <div key={index} className="space-y-3 rounded-[22px] border border-border/70 bg-background/38 p-4">
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
                        placeholder="可选链接"
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
                        placeholder="里程碑说明"
                        className={TEXTAREA_CLASS}
                        rows={3}
                      />
                    </div>
                  ))
                )}

                {form.milestones.length > 0 ? (
                  <Button
                    variant="secondary"
                    onClick={() => updateField('milestones', [...form.milestones, emptyMilestone()])}
                  >
                    <MaterialSymbol icon="add_chart" size={18} />
                    添加里程碑
                  </Button>
                ) : null}
              </div>
            </AdminSection>

            <AdminSection title="详情正文" description="长文区域留给完整项目说明，避免和上面的摘要重复。">
              <Field label="正文" fullWidth>
                <textarea
                  value={form.content ?? ''}
                  onChange={(event) => updateField('content', event.target.value)}
                  className={TEXTAREA_CLASS}
                  rows={12}
                  placeholder="项目背景、设计思路、技术方案、成果与复盘。"
                />
              </Field>
            </AdminSection>

            <AdminSection title="发布与排序" description="最后确认可见性和前台排序。">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="排序值" hint="数值越小越靠前。">
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(event) => updateField('sort_order', Number(event.target.value || 0))}
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
                      checked={form.is_published}
                      onChange={(event) => updateField('is_published', event.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-border bg-background"
                    />
                    <span>
                      <span className="block text-sm font-medium text-foreground">公开发布</span>
                      <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                        关闭后这条作品只保留在后台，不会出现在前台作品页。
                      </span>
                    </span>
                  </label>
                </div>
              </div>
            </AdminSection>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                {form.id ? `当前编辑 ID：${form.id}` : '正在创建新的作品记录'}
              </p>
              <div className="flex items-center gap-3">
                {form.id ? (
                  <Button variant="ghost" onClick={handleDelete} disabled={deleting}>
                    <MaterialSymbol icon="delete" size={18} />
                    {deleting ? '删除中' : '删除作品'}
                  </Button>
                ) : null}
                <Button onClick={handleSave} loading={saving}>
                  <MaterialSymbol icon="save" size={18} />
                  {form.id ? '保存修改' : '创建作品'}
                </Button>
              </div>
            </div>
          </AdminPanel>
        </div>
      </div>
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

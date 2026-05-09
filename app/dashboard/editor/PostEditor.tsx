'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { JSONContent } from '@tiptap/core'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AdminField,
  AdminStatusBadge,
  ADMIN_INPUT_CLASS,
  ADMIN_MUTED_PANEL_CLASS,
  ADMIN_TEXTAREA_CLASS,
} from '@/components/admin/AdminPrimitives'
import { MediaLibraryPicker } from '@/components/admin/MediaLibraryPicker'
import { Button } from '@/components/ui/Button'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'
import { TiptapEditor, type EditorStats } from '@/features/editor/TiptapEditor'
import { createPost, updatePost } from '@/features/posts/api'
import type { PostRow, PostStatus } from '@/types/post'

interface PostEditorProps {
  post?: PostRow
}

type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error'
type SaveTarget = 'draft' | 'published' | 'archived' | 'auto' | null

const DEFAULT_STATS: EditorStats = {
  characters: 0,
  words: 0,
  readingMinutes: 1,
}

const POST_STATUS_OPTIONS: PostStatus[] = ['draft', 'published', 'archived']

const POST_STATUS_META: Record<
  PostStatus,
  {
    label: string
    tone: 'neutral' | 'success' | 'warning'
    description: string
    detail: string
  }
> = {
  draft: {
    label: '草稿',
    tone: 'neutral',
    description: '继续在后台编辑，前台不会显示。',
    detail: '适合还没写完、还在校对，或者只想先存一版的时候。',
  },
  published: {
    label: '已发布',
    tone: 'success',
    description: '文章会出现在前台文章列表和详情页。',
    detail: '保存后会继续保持公开状态，前台用户可以直接访问。',
  },
  archived: {
    label: '已归档',
    tone: 'warning',
    description: '从前台撤下，但后台会继续保留这篇文章。',
    detail: '适合下线旧内容、临时隐藏，或者保留历史记录不对外展示。',
  },
}

function splitTags(input: string) {
  return input
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function formatDateTime(value: string | null) {
  if (!value) return '未记录'
  return new Date(value).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function hasContent(input: {
  title: string
  excerpt: string
  tags: string
  coverUrl: string
  seoTitle: string
  seoDescription: string
  content: JSONContent
}) {
  if (input.title.trim()) return true
  if (input.excerpt.trim()) return true
  if (input.tags.trim()) return true
  if (input.coverUrl.trim()) return true
  if (input.seoTitle.trim()) return true
  if (input.seoDescription.trim()) return true

  const contentString = JSON.stringify(input.content ?? {})
  return contentString !== '{}' && contentString !== '{"type":"doc","content":[{"type":"paragraph"}]}'
}

export function PostEditor({ post }: PostEditorProps) {
  const router = useRouter()
  const coverInputRef = useRef<HTMLInputElement>(null)
  const initializedRef = useRef(false)
  const suppressDirtyRef = useRef(true)
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const slugFallbackRef = useRef(`post-${Date.now()}`)

  const [postId, setPostId] = useState<number | null>(post?.id ?? null)
  const [title, setTitle] = useState(post?.title ?? '')
  const [slug, setSlug] = useState(post?.slug ?? '')
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '')
  const [tags, setTags] = useState((post?.tags ?? []).join(', '))
  const [category, setCategory] = useState(post?.category ?? '未分类')
  const [existingCategories, setExistingCategories] = useState<string[]>([])
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [coverUrl, setCoverUrl] = useState(post?.cover_url ?? '')
  const [coverAlt, setCoverAlt] = useState(post?.cover_alt ?? '')
  const [seoTitle, setSeoTitle] = useState(post?.seo_title ?? '')
  const [seoDescription, setSeoDescription] = useState(post?.seo_description ?? '')
  const [isFeatured, setIsFeatured] = useState(post?.is_featured ?? false)
  const [content, setContent] = useState<JSONContent>((post?.content as JSONContent) ?? {})
  const [stats, setStats] = useState<EditorStats>(DEFAULT_STATS)
  const [status, setStatus] = useState<PostStatus>(post?.status ?? 'draft')
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(
    post?.updated_at ? new Date(post.updated_at).toISOString() : null
  )
  const [publishedAt, setPublishedAt] = useState<string | null>(
    post?.published_at ? new Date(post.published_at).toISOString() : null
  )
  const [saving, setSaving] = useState(false)
  const [saveTarget, setSaveTarget] = useState<SaveTarget>(null)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [coverUploading, setCoverUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/categories')
      .then((response) => response.json())
      .then((data: { category: string }[]) => setExistingCategories(data.map((item) => item.category)))
      .catch(() => {})
  }, [])

  function autoSlug(input: string) {
    const latin = input
      .toLowerCase()
      .replace(/[\u4e00-\u9fa5]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    return latin || slugFallbackRef.current
  }

  function markDirty() {
    if (suppressDirtyRef.current) return
    setSaveState((current) => (current === 'saving' ? current : 'dirty'))
    if (error) setError('')
  }

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true
      suppressDirtyRef.current = false
      return
    }
    markDirty()
  }, [title, slug, excerpt, tags, category, coverUrl, coverAlt, seoTitle, seoDescription, isFeatured, content, status])

  const resolvedSlug = useMemo(() => slug || autoSlug(title), [slug, title])
  const tagsList = useMemo(() => splitTags(tags), [tags])
  const previewHref = postId && resolvedSlug ? `/posts/${resolvedSlug}?preview=1` : null
  const canAutosave =
    saveState === 'dirty' &&
    !saving &&
    hasContent({ title, excerpt, tags, coverUrl, seoTitle, seoDescription, content })

  async function persist(targetStatus: PostStatus, source: 'manual' | 'auto') {
    if (!title.trim()) {
      setError('标题不能为空')
      setSaveState('error')
      return
    }

    const nextCategory = category.trim() || '未分类'
    const nextSaveTarget: SaveTarget = source === 'auto' ? 'auto' : targetStatus

    setSaving(true)
    setSaveTarget(nextSaveTarget)
    setSaveState('saving')
    setError('')

    const payload = {
      title,
      slug: resolvedSlug,
      content,
      excerpt: excerpt.trim() || undefined,
      coverUrl: coverUrl.trim() || undefined,
      coverAlt: coverAlt.trim() || undefined,
      seoTitle: seoTitle.trim() || undefined,
      seoDescription: seoDescription.trim() || undefined,
      isFeatured,
      status: targetStatus,
      tags: tagsList,
      category: nextCategory,
    }

    try {
      const saved = postId ? await updatePost(postId, payload) : await createPost(payload)

      suppressDirtyRef.current = true
      setPostId(saved.id)
      setStatus(saved.status)
      setPublishedAt(saved.published_at ? new Date(saved.published_at).toISOString() : null)
      setLastSavedAt(saved.updated_at ? new Date(saved.updated_at).toISOString() : new Date().toISOString())
      setSaveState('saved')
      setCategory(saved.category || nextCategory)
      setCreatingCategory(false)

      if (!existingCategories.includes(nextCategory)) {
        setExistingCategories((current) => [...current, nextCategory])
      }

      if (!postId) {
        router.replace(`/dashboard/editor/${saved.id}`)
      }

      window.setTimeout(() => {
        setSaveState((current) => (current === 'saved' ? 'idle' : current))
        suppressDirtyRef.current = false
      }, 120)

      if (source === 'manual' && targetStatus === 'published') {
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败')
      setSaveState('error')
      suppressDirtyRef.current = false
    } finally {
      setSaving(false)
      setSaveTarget(null)
    }
  }

  useEffect(() => {
    if (!canAutosave) return

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    autoSaveTimerRef.current = setTimeout(() => {
      void persist(status, 'auto')
    }, 1400)

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    }
  }, [canAutosave, title, slug, excerpt, tags, category, coverUrl, coverAlt, seoTitle, seoDescription, isFeatured, content, status])

  async function handleCoverUpload(file: File) {
    setCoverUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch('/api/upload/cover', { method: 'POST', body: formData })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(typeof payload?.error === 'string' ? payload.error : '封面上传失败')
      }

      const { url } = await response.json()
      setCoverUrl(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : '封面上传失败')
    } finally {
      setCoverUploading(false)
    }
  }

  function removeTag(tag: string) {
    setTags(tagsList.filter((item) => item !== tag).join(', '))
  }

  return (
    <div className="-m-4 flex min-h-full flex-col sm:-m-6 lg:-m-8">
      <div className="sticky top-0 z-30 border-b border-border/70 bg-background/88 px-4 backdrop-blur-2xl sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-16 max-w-[1560px] flex-wrap items-center gap-3 py-3">
          <Link
            href="/dashboard/posts"
            className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/55 px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <MaterialSymbol icon="arrow_back" size={16} />
            返回文章列表
          </Link>

          <EditorStatusBadge saveState={saveState} status={status} />

          <div className="flex flex-wrap items-center gap-2">
            <AdminStatusBadge tone="neutral">字数 {stats.words}</AdminStatusBadge>
            <AdminStatusBadge tone="neutral">阅读 {stats.readingMinutes} 分钟</AdminStatusBadge>
            {isFeatured ? <AdminStatusBadge tone="accent">推荐文章</AdminStatusBadge> : null}
          </div>

          {error ? <span className="max-w-[320px] truncate text-xs text-red-300">{error}</span> : null}

          <div className="ml-auto flex flex-wrap items-center gap-2">
            {previewHref ? (
              <a
                href={previewHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/55 px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <MaterialSymbol icon="preview" size={16} />
                预览
              </a>
            ) : null}

            <Button
              variant="secondary"
              size="sm"
              loading={saving && (saveTarget === 'draft' || saveTarget === 'auto')}
              onClick={() => void persist('draft', 'manual')}
            >
              <MaterialSymbol icon="save" size={16} />
              保存草稿
            </Button>

            <Button
              size="sm"
              loading={saving && saveTarget === 'published'}
              onClick={() => void persist('published', 'manual')}
            >
              <MaterialSymbol icon="send" size={16} />
              {status === 'published' ? '更新发布' : '发布文章'}
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto flex min-h-0 w-full max-w-[1560px] flex-1 flex-col xl:flex-row">
        <section className="min-w-0 flex-1 px-4 py-6 sm:px-6 xl:px-8">
          <div className="space-y-6">
            <div className="rounded-[30px] border border-border/75 bg-card/78 p-6 backdrop-blur-2xl sm:p-8">
              <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-muted-foreground">
                Article Header
              </p>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="在这里输入文章标题"
                className="mt-4 w-full bg-transparent text-[2.2rem] font-semibold leading-tight tracking-[-0.04em] text-foreground outline-none placeholder:text-foreground/18"
              />
              <div className="mt-4 flex items-center gap-2 rounded-[20px] border border-border/70 bg-background/55 px-4 py-3 text-xs font-mono text-muted-foreground">
                <MaterialSymbol icon="link" size={15} />
                <span>/posts/</span>
                <span className="truncate text-foreground/72">{resolvedSlug || 'url-slug'}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                正文区保持沉浸式写作，发布信息、SEO 和封面都收进右侧面板，让编辑节奏更专注。
              </p>
            </div>

            <TiptapEditor
              initialContent={content}
              onChange={setContent}
              onStatsChange={setStats}
              placeholder="从这里开始写作，工具栏会在不打断节奏的前提下补齐常用 CMS 能力。"
              className="pb-10"
            />
          </div>
        </section>

        <aside className="w-full shrink-0 border-t border-border/70 bg-card/70 backdrop-blur-2xl xl:w-[400px] xl:border-l xl:border-t-0">
          <div className="sticky top-20 max-h-[calc(100vh-5rem)] overflow-y-auto px-4 py-6 sm:px-6">
            <div className="space-y-6 rounded-[30px] border border-border/70 bg-background/30 p-5">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-muted-foreground">
                  Publish Panel
                </p>
                <h2 className="mt-2 text-lg font-semibold text-foreground">发布信息</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  分类、标签、摘要、封面和 SEO 全部集中在这里，写作和发布被拆成更清晰的两条线。
                </p>
              </div>

              <section className="space-y-4 border-t border-border/65 pt-5">
                <AdminField label="URL Slug" hint="不填写时会根据标题自动生成。">
                  <input
                    type="text"
                    value={slug}
                    onChange={(event) => setSlug(event.target.value)}
                    placeholder={resolvedSlug || 'url-slug'}
                    className={`${ADMIN_INPUT_CLASS} font-mono text-xs`}
                  />
                </AdminField>

                <AdminField label="分类" hint="可以选择已有分类，也可以直接在这里补一个新分类。">
                  {creatingCategory ? (
                    <div className="flex gap-2">
                      <input
                        autoFocus
                        type="text"
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                        placeholder="输入新分类名称"
                        className={`${ADMIN_INPUT_CLASS} flex-1`}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault()
                            setCreatingCategory(false)
                          }
                          if (event.key === 'Escape') {
                            setCreatingCategory(false)
                          }
                        }}
                      />
                      <Button variant="secondary" size="sm" onClick={() => setCreatingCategory(false)}>
                        完成
                      </Button>
                    </div>
                  ) : (
                    <>
                      <select
                        value={existingCategories.includes(category) ? category : '__other__'}
                        onChange={(event) => {
                          if (event.target.value === '__new__') {
                            setCategory('')
                            setCreatingCategory(true)
                            return
                          }
                          if (event.target.value !== '__other__') {
                            setCategory(event.target.value)
                          }
                        }}
                        className={ADMIN_INPUT_CLASS}
                      >
                        {existingCategories.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                        {!existingCategories.includes(category) ? (
                          <option value="__other__">{category || '未分类'}</option>
                        ) : null}
                        <option value="__new__">+ 新建分类</option>
                      </select>
                      <p className="mt-2 text-xs text-muted-foreground">
                        当前分类：<span className="text-foreground">{category || '未分类'}</span>
                      </p>
                    </>
                  )}
                </AdminField>

                <AdminField label="标签" hint="使用逗号分隔，也可以在下方逐个移除。">
                  <input
                    type="text"
                    value={tags}
                    onChange={(event) => setTags(event.target.value)}
                    placeholder="键盘, DIY, 生活"
                    className={ADMIN_INPUT_CLASS}
                  />
                  {tagsList.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {tagsList.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-mono text-primary"
                        >
                          {tag}
                          <MaterialSymbol icon="close" size={14} />
                        </button>
                      ))}
                    </div>
                  ) : null}
                </AdminField>

                <AdminField label="摘要" hint="建议控制在 120 到 160 字，列表和 SEO 都会用到。">
                  <textarea
                    value={excerpt}
                    onChange={(event) => setExcerpt(event.target.value)}
                    placeholder="写一段简洁的文章摘要。"
                    rows={5}
                    className={`${ADMIN_TEXTAREA_CLASS} min-h-[132px] resize-none`}
                  />
                </AdminField>
              </section>

              <section className="space-y-4 border-t border-border/65 pt-5">
                <AdminField label="封面图" hint="支持上传、替换和清空，封面会影响前台列表和文章首屏。">
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) void handleCoverUpload(file)
                      event.target.value = ''
                    }}
                  />

                  <div className={`${ADMIN_MUTED_PANEL_CLASS} overflow-hidden`}>
                    <div className="aspect-[16/10] bg-background/40">
                      {coverUrl ? (
                        <img src={coverUrl} alt="封面预览" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                          暂无封面
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 p-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={coverUploading}
                        onClick={() => coverInputRef.current?.click()}
                      >
                        <MaterialSymbol icon="image_arrow_up" size={16} />
                        {coverUploading ? '上传中' : coverUrl ? '替换封面' : '上传封面'}
                      </Button>
                      <MediaLibraryPicker
                        value={coverUrl}
                        onSelect={setCoverUrl}
                        category="artwork"
                        buttonLabel="从相册选择"
                        dialogTitle="选择文章封面"
                        description="可以直接复用已经上传到相册里的图片，也可以在弹窗里继续上传新图。"
                      />
                      <Button variant="ghost" size="sm" disabled={!coverUrl} onClick={() => setCoverUrl('')}>
                        <MaterialSymbol icon="delete" size={16} />
                        清空封面
                      </Button>
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-6 text-muted-foreground">
                    如果这里留空，前台会自动回退到全局设置里的默认文章封面。
                  </p>
                </AdminField>

                <AdminField label="封面 Alt" hint="给前台图片语义和 SEO 使用。">
                  <input
                    type="text"
                    value={coverAlt}
                    onChange={(event) => setCoverAlt(event.target.value)}
                    placeholder="例如：工作台上的定制键盘特写"
                    className={ADMIN_INPUT_CLASS}
                  />
                </AdminField>

                <label className="flex items-start gap-3 rounded-[22px] border border-border/70 bg-background/38 px-4 py-4">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(event) => setIsFeatured(event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-border bg-background"
                  />
                  <span>
                    <span className="block text-sm font-medium text-foreground">推荐文章</span>
                    <span className="block text-sm text-muted-foreground">
                      打开后会在后台列表里优先显示，也为前台推荐位保留明确的数据标记。
                    </span>
                  </span>
                </label>
              </section>

              <section className="space-y-4 border-t border-border/65 pt-5">
                <div>
                  <p className="text-sm font-semibold text-foreground">SEO 信息</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    这组字段和正文分开维护，写作时不会被打断，但后续前台承接 SEO 会更顺。
                  </p>
                </div>

                <AdminField label="SEO 标题" hint="默认会回落到文章标题。">
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(event) => setSeoTitle(event.target.value)}
                    placeholder={title || '建议控制在 60 字以内'}
                    className={ADMIN_INPUT_CLASS}
                  />
                </AdminField>

                <AdminField label="SEO 描述" hint="默认会回落到摘要。">
                  <textarea
                    value={seoDescription}
                    onChange={(event) => setSeoDescription(event.target.value)}
                    placeholder={excerpt || '建议控制在 140 到 160 字'}
                    rows={4}
                    className={`${ADMIN_TEXTAREA_CLASS} resize-none`}
                  />
                </AdminField>
              </section>

              <section className="space-y-4 border-t border-border/65 pt-5">
                <div>
                  <p className="text-sm font-semibold text-foreground">内容状态</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    保存状态、发布时间和内容体量都汇总在这里，写完一眼就知道文章现在处于什么阶段。
                  </p>
                </div>

                <div className="space-y-3">
                  {POST_STATUS_OPTIONS.map((option) => {
                    const meta = POST_STATUS_META[option]
                    const active = status === option

                    return (
                      <div
                        key={option}
                        className={`rounded-[20px] border px-4 py-4 transition-colors ${
                          active
                            ? 'border-primary/24 bg-primary/10'
                            : 'border-border/70 bg-background/42'
                        }`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-foreground">{meta.label}</p>
                              <AdminStatusBadge tone={active ? meta.tone : 'neutral'}>
                                {active ? '当前状态' : meta.label}
                              </AdminStatusBadge>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                              {meta.description}
                            </p>
                            <p className="mt-2 text-xs leading-5 text-muted-foreground">
                              {meta.detail}
                            </p>
                          </div>

                          {active ? null : (
                            <Button
                              variant="secondary"
                              size="sm"
                              loading={saving && saveTarget === option}
                              onClick={() => void persist(option, 'manual')}
                            >
                              <MaterialSymbol
                                icon={
                                  option === 'published'
                                    ? 'send'
                                    : option === 'archived'
                                      ? 'inventory_2'
                                      : 'draft'
                                }
                                size={16}
                              />
                              {option === 'published'
                                ? '公开发布'
                                : option === 'archived'
                                  ? '归档隐藏'
                                  : '切回草稿'}
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <StatCard label="字数" value={String(stats.words)} hint={`${stats.characters} 字符`} />
                  <StatCard label="阅读时长" value={`${stats.readingMinutes} 分钟`} hint="按正文长度估算" />
                  <StatCard label="最近保存" value={formatDateTime(lastSavedAt)} hint="自动保存和手动保存都会记录" />
                  <StatCard
                    label="发布时间"
                    value={formatDateTime(publishedAt)}
                    hint={status === 'published' ? '已公开' : '尚未发布'}
                  />
                </div>
              </section>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function EditorStatusBadge({
  saveState,
  status,
}: {
  saveState: SaveState
  status: PostStatus
}) {
  if (saveState === 'saving') {
    return <AdminStatusBadge tone="accent">保存中</AdminStatusBadge>
  }

  if (saveState === 'dirty') {
    return <AdminStatusBadge tone="warning">未保存</AdminStatusBadge>
  }

  if (saveState === 'saved') {
    return <AdminStatusBadge tone="success">已保存</AdminStatusBadge>
  }

  if (saveState === 'error') {
    return <AdminStatusBadge tone="danger">保存失败</AdminStatusBadge>
  }

  const meta = {
    draft: { label: '草稿', tone: 'neutral' as const },
    published: { label: '已发布', tone: 'success' as const },
    archived: { label: '已归档', tone: 'warning' as const },
  }

  const current = meta[status]
  return <AdminStatusBadge tone={current.tone}>{current.label}</AdminStatusBadge>
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint: string
}) {
  return (
    <div className="rounded-[20px] border border-border/70 bg-background/42 px-4 py-4">
      <p className="text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
      <p className="mt-3 text-sm font-medium text-foreground">{value}</p>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{hint}</p>
    </div>
  )
}

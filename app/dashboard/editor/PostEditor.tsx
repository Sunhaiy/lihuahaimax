'use client'

import type { JSONContent } from '@tiptap/core'
import { useEffect, useMemo, useRef, useState } from 'react'
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
import { ArticleEditorV2, type ArticleEditorStats } from '@/features/editor/ArticleEditorV2'
import { createPost, updatePost } from '@/features/posts/api'
import {
  EMPTY_ARTICLE_DOC,
  ensureArticleDocV2,
  isArticleDocV2,
  sanitizeArticleDocV2,
} from '@/lib/articles/document'
import type { PostRow, PostStatus } from '@/types/post'

interface PostEditorProps {
  post?: PostRow
}

type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error'
type SaveTarget = 'draft' | 'published' | 'archived' | 'auto' | null

const DEFAULT_STATS: ArticleEditorStats = {
  characters: 0,
  words: 0,
  readingMinutes: 1,
  headings: [],
  activeBlockLabel: '段落',
}

const POST_STATUS_OPTIONS: Array<{
  value: PostStatus
  label: string
  tone: 'neutral' | 'success' | 'warning'
  description: string
}> = [
  {
    value: 'draft',
    label: '草稿',
    tone: 'neutral',
    description: '只在后台可见，适合慢慢写、慢慢改。',
  },
  {
    value: 'published',
    label: '已发布',
    tone: 'success',
    description: '前台会直接展示，适合已经校对完成的文章。',
  },
  {
    value: 'archived',
    label: '已归档',
    tone: 'warning',
    description: '从前台撤下，但内容会继续保留在后台。',
  },
]

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

function toDateTimeLocalValue(value: string | null) {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const pad = (input: number) => String(input).padStart(2, '0')

  return [
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  ].join('T')
}

function hasContent(input: {
  title: string
  excerpt: string
  tags: string
  coverUrl: string
  seoTitle: string
  seoDescription: string
  content: JSONContent
  publishedAt: string
}) {
  if (input.title.trim()) return true
  if (input.excerpt.trim()) return true
  if (input.tags.trim()) return true
  if (input.coverUrl.trim()) return true
  if (input.seoTitle.trim()) return true
  if (input.seoDescription.trim()) return true
  if (input.publishedAt.trim()) return true

  return JSON.stringify(input.content) !== JSON.stringify(EMPTY_ARTICLE_DOC)
}

export function PostEditor({ post }: PostEditorProps) {
  const router = useRouter()
  const coverInputRef = useRef<HTMLInputElement>(null)
  const initializedRef = useRef(false)
  const suppressDirtyRef = useRef(true)
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const slugFallbackRef = useRef(`post-${Date.now()}`)

  const legacyContentDetected = post ? !isArticleDocV2(post.content) : false

  const [postId, setPostId] = useState<number | null>(post?.id ?? null)
  const [title, setTitle] = useState(post?.title ?? '')
  const [slug, setSlug] = useState(post?.slug ?? '')
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '')
  const [tags, setTags] = useState((post?.tags ?? []).join(', '))
  const [category, setCategory] = useState(post?.category ?? '未分类')
  const [existingCategories, setExistingCategories] = useState<string[]>([])
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [draftCategoryName, setDraftCategoryName] = useState('')
  const [coverUrl, setCoverUrl] = useState(post?.cover_url ?? '')
  const [coverAlt, setCoverAlt] = useState(post?.cover_alt ?? '')
  const [seoTitle, setSeoTitle] = useState(post?.seo_title ?? '')
  const [seoDescription, setSeoDescription] = useState(post?.seo_description ?? '')
  const [isFeatured, setIsFeatured] = useState(post?.is_featured ?? false)
  const [content, setContent] = useState<JSONContent>(ensureArticleDocV2(post?.content) as JSONContent)
  const [stats, setStats] = useState<ArticleEditorStats>(DEFAULT_STATS)
  const [status, setStatus] = useState<PostStatus>(legacyContentDetected ? 'draft' : (post?.status ?? 'draft'))
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(
    post?.updated_at ? new Date(post.updated_at).toISOString() : null
  )
  const [publishedAt, setPublishedAt] = useState<string>(
    toDateTimeLocalValue(post?.published_at ? new Date(post.published_at).toISOString() : null)
  )
  const [saving, setSaving] = useState(false)
  const [saveTarget, setSaveTarget] = useState<SaveTarget>(null)
  const [saveState, setSaveState] = useState<SaveState>(legacyContentDetected ? 'dirty' : 'idle')
  const [coverUploading, setCoverUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/categories')
      .then((response) => response.json())
      .then((data: Array<{ category: string }>) => {
        setExistingCategories(
          Array.from(
            new Set(
              data
                .map((item) => item.category?.trim())
                .filter((item): item is string => Boolean(item))
            )
          )
        )
      })
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
  }, [title, slug, excerpt, tags, category, coverUrl, coverAlt, seoTitle, seoDescription, isFeatured, content, status, publishedAt])

  const resolvedSlug = useMemo(() => slug || autoSlug(title), [slug, title])
  const tagsList = useMemo(() => splitTags(tags), [tags])
  const categoryOptions = useMemo(
    () =>
      Array.from(
        new Set(
          existingCategories
            .map((item) => item.trim())
            .filter(Boolean)
        )
      ),
    [existingCategories]
  )
  const previewHref = postId && resolvedSlug ? `/posts/${resolvedSlug}?preview=1` : null
  const canAutosave =
    saveState === 'dirty' &&
    !saving &&
    hasContent({ title, excerpt, tags, coverUrl, seoTitle, seoDescription, content, publishedAt })

  function commitNewCategory() {
    const nextCategory = draftCategoryName.trim()

    if (!nextCategory) {
      setDraftCategoryName('')
      setCreatingCategory(false)
      return
    }

    setCategory(nextCategory)
    setExistingCategories((current) => Array.from(new Set([...current, nextCategory])))
    setDraftCategoryName('')
    setCreatingCategory(false)
  }

  function cancelNewCategory() {
    setDraftCategoryName('')
    setCreatingCategory(false)
  }

  async function persist(targetStatus: PostStatus, source: 'manual' | 'auto') {
    if (!title.trim()) {
      setError('标题不能为空。')
      setSaveState('error')
      return
    }

    const nextCategory = category.trim() || '未分类'
    const payload = {
      title,
      slug: resolvedSlug,
      content: sanitizeArticleDocV2(content),
      excerpt: excerpt.trim() || undefined,
      coverUrl: coverUrl.trim() || null,
      coverAlt: coverAlt.trim() || null,
      seoTitle: seoTitle.trim() || title.trim() || null,
      seoDescription: seoDescription.trim() || excerpt.trim() || null,
      isFeatured,
      status: targetStatus,
      tags: tagsList,
      category: nextCategory,
      publishedAt: publishedAt ? new Date(publishedAt).toISOString() : null,
    }

    setSaving(true)
    setSaveTarget(source === 'auto' ? 'auto' : targetStatus)
    setSaveState('saving')
    setError('')

    try {
      const saved = postId ? await updatePost(postId, payload) : await createPost(payload)

      suppressDirtyRef.current = true
      setPostId(saved.id)
      setStatus(saved.status)
      setCategory(saved.category || nextCategory)
      setPublishedAt(
        toDateTimeLocalValue(saved.published_at ? new Date(saved.published_at).toISOString() : null)
      )
      setLastSavedAt(saved.updated_at ? new Date(saved.updated_at).toISOString() : new Date().toISOString())
      setSaveState('saved')

      if (!categoryOptions.includes(nextCategory)) {
        setExistingCategories((current) => Array.from(new Set([...current, nextCategory])))
      }

      if (!postId) {
        router.replace(`/dashboard/editor/${saved.id}`)
      }

      window.setTimeout(() => {
        suppressDirtyRef.current = false
        setSaveState((current) => (current === 'saved' ? 'idle' : current))
      }, 120)

      if (source === 'manual' && targetStatus === 'published') {
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败。')
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
  }, [canAutosave, title, slug, excerpt, tags, category, coverUrl, coverAlt, seoTitle, seoDescription, isFeatured, content, status, publishedAt])

  async function handleCoverUpload(file: File) {
    setCoverUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload/cover', {
        method: 'POST',
        body: formData,
      })

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
    <div className="-mx-4 -mt-4 flex min-h-full flex-col pb-8 sm:-mx-6 sm:-mt-6 sm:pb-10 lg:-mx-8 lg:-mt-8 lg:pb-12">
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
          <AdminStatusBadge tone="neutral">字数 {stats.words}</AdminStatusBadge>
          <AdminStatusBadge tone="neutral">阅读 {stats.readingMinutes} 分钟</AdminStatusBadge>
          <AdminStatusBadge tone="neutral">当前块 {stats.activeBlockLabel}</AdminStatusBadge>
          {isFeatured ? <AdminStatusBadge tone="accent">推荐文章</AdminStatusBadge> : null}
          {legacyContentDetected ? <AdminStatusBadge tone="warning">旧正文已重置为 V2 草稿</AdminStatusBadge> : null}
          {error ? <span className="max-w-[360px] truncate text-xs text-red-300">{error}</span> : null}

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
                正文编辑区只负责创作，发布、SEO、封面、分类和目录都收进右侧检查器，保持写作节奏更干净。
              </p>
            </div>

            <ArticleEditorV2
              initialContent={content}
              onChange={setContent}
              onStatsChange={setStats}
              placeholder="从这里开始写文章正文。输入 / 可以插入提示块、FAQ、时间线、文件树、终端演示和图片卡片。"
              className="pb-10"
            />
          </div>
        </section>

        <aside className="w-full shrink-0 border-t border-border/70 bg-card/70 backdrop-blur-2xl xl:w-[420px] xl:border-l xl:border-t-0">
          <div className="sticky top-20 max-h-[calc(100vh-5rem)] overflow-y-auto px-4 py-6 sm:px-6">
            <div className="space-y-6 rounded-[30px] border border-border/70 bg-background/30 p-5">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-muted-foreground">
                  Article Inspector
                </p>
                <h2 className="mt-2 text-lg font-semibold text-foreground">发布与检查器</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  这里集中处理目录、slug、分类、封面、SEO 和状态，写作和发布不会再互相打断。
                </p>
              </div>

              <section className="space-y-4 border-t border-border/65 pt-5">
                <div>
                  <p className="text-sm font-semibold text-foreground">文档结构</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    跟随正文实时更新，方便你随时看结构有没有写散。
                  </p>
                </div>
                <div className="rounded-[22px] border border-border/70 bg-background/42 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">当前聚焦块</p>
                    <AdminStatusBadge tone="neutral">{stats.activeBlockLabel}</AdminStatusBadge>
                  </div>
                  <div className="mt-4 space-y-2">
                    {stats.headings.length > 0 ? (
                      stats.headings.map((heading, index) => (
                        <div
                          key={`${heading.id}-${index}`}
                          className="rounded-2xl border border-border/60 bg-background/55 px-3 py-2 text-sm text-foreground/82"
                          style={{ marginLeft: `${Math.max(0, heading.level - 1) * 12}px` }}
                        >
                          {heading.text}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">还没有标题，建议先用 H1-H6 把结构立起来。</p>
                    )}
                  </div>
                </div>
              </section>

              <section className="space-y-4 border-t border-border/65 pt-5">
                <AdminField label="URL Slug" hint="不填时会根据标题自动生成。">
                  <input
                    type="text"
                    value={slug}
                    onChange={(event) => setSlug(event.target.value)}
                    placeholder={resolvedSlug || 'url-slug'}
                    className={`${ADMIN_INPUT_CLASS} font-mono text-xs`}
                  />
                </AdminField>

                <AdminField label="分类" hint="可以选已有分类，也可以临时新建。">
                  {creatingCategory ? (
                    <div className="flex gap-2">
                      <input
                        autoFocus
                        type="text"
                        value={draftCategoryName}
                        onChange={(event) => setDraftCategoryName(event.target.value)}
                        placeholder="输入新分类名"
                        className={`${ADMIN_INPUT_CLASS} flex-1`}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault()
                            commitNewCategory()
                          }
                          if (event.key === 'Escape') {
                            cancelNewCategory()
                          }
                        }}
                      />
                      <Button variant="secondary" size="sm" onClick={commitNewCategory}>
                        完成
                      </Button>
                    </div>
                  ) : (
                    <>
                      <select
                        value={categoryOptions.includes(category) ? category : '__other__'}
                        onChange={(event) => {
                          if (event.target.value === '__new__') {
                            setDraftCategoryName('')
                            setCreatingCategory(true)
                            return
                          }
                          if (event.target.value !== '__other__') {
                            setCategory(event.target.value)
                          }
                        }}
                        className={ADMIN_INPUT_CLASS}
                      >
                        {categoryOptions.map((item, index) => (
                          <option key={`${item}-${index}`} value={item}>
                            {item}
                          </option>
                        ))}
                        {!categoryOptions.includes(category) ? (
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

                <AdminField label="标签" hint="多个标签用英文逗号分隔。">
                  <input
                    type="text"
                    value={tags}
                    onChange={(event) => setTags(event.target.value)}
                    placeholder="LLM, 教程, AI, Python"
                    className={ADMIN_INPUT_CLASS}
                  />
                  {tagsList.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {tagsList.map((tag, index) => (
                        <button
                          key={`${tag}-${index}`}
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

                <AdminField label="摘要" hint="建议控制在 120 到 160 字。">
                  <textarea
                    value={excerpt}
                    onChange={(event) => setExcerpt(event.target.value)}
                    placeholder="写一段能概括全文核心收益的摘要。"
                    rows={5}
                    className={`${ADMIN_TEXTAREA_CLASS} min-h-[132px] resize-none`}
                  />
                </AdminField>
              </section>

              <section className="space-y-4 border-t border-border/65 pt-5">
                <AdminField label="封面图" hint="支持上传、替换、清空，也可以从相册里复用。">
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
                        清空
                      </Button>
                    </div>
                  </div>
                </AdminField>

                <AdminField label="封面 Alt" hint="给前台语义化和 SEO 使用。">
                  <input
                    type="text"
                    value={coverAlt}
                    onChange={(event) => setCoverAlt(event.target.value)}
                    placeholder="例如：桌面上的机械键盘特写"
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
                    <span className="mt-1 block text-sm text-muted-foreground">
                      打开后会优先进入前台推荐位，也方便后台筛出重点内容。
                    </span>
                  </span>
                </label>
              </section>

              <section className="space-y-4 border-t border-border/65 pt-5">
                <div>
                  <p className="text-sm font-semibold text-foreground">SEO 信息</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    这组字段和正文分开维护，读者看不见，但搜索结果和社交分享会用到。
                  </p>
                </div>

                <AdminField label="SEO 标题" hint="为空时默认回落到文章标题。">
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(event) => setSeoTitle(event.target.value)}
                    placeholder={title || '建议控制在 60 字以内'}
                    className={ADMIN_INPUT_CLASS}
                  />
                </AdminField>

                <AdminField label="SEO 描述" hint="为空时默认回落到文章摘要。">
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
                    保存状态、发布时间和正文体量都集中在这里，一眼就知道文章当前处于什么阶段。
                  </p>
                </div>

                <div className="space-y-3">
                  {POST_STATUS_OPTIONS.map((item) => {
                    const active = item.value === status
                    return (
                      <div
                        key={item.value}
                        className={cn(
                          'rounded-[22px] border px-4 py-4 transition-colors',
                          active ? 'border-primary/24 bg-primary/10' : 'border-border/70 bg-background/42'
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-foreground">{item.label}</p>
                              <AdminStatusBadge tone={active ? item.tone : 'neutral'}>
                                {active ? '当前状态' : item.label}
                              </AdminStatusBadge>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                              {item.description}
                            </p>
                          </div>
                          {!active ? (
                            <Button
                              variant="secondary"
                              size="sm"
                              loading={saving && saveTarget === item.value}
                              onClick={() => void persist(item.value, 'manual')}
                            >
                              <MaterialSymbol
                                icon={
                                  item.value === 'published'
                                    ? 'send'
                                    : item.value === 'archived'
                                      ? 'inventory_2'
                                      : 'draft'
                                }
                                size={16}
                              />
                              切换
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <AdminField label="发布时间" hint="可以手动调整文章对外显示的发布时间。">
                  <div className="flex gap-2">
                    <input
                      type="datetime-local"
                      value={publishedAt}
                      onChange={(event) => setPublishedAt(event.target.value)}
                      className={`${ADMIN_INPUT_CLASS} flex-1`}
                    />
                    <Button variant="ghost" size="sm" disabled={!publishedAt} onClick={() => setPublishedAt('')}>
                      <MaterialSymbol icon="event_busy" size={16} />
                      清空
                    </Button>
                  </div>
                </AdminField>

                <div className="grid gap-3 sm:grid-cols-2">
                  <StatCard label="字数" value={String(stats.words)} hint={`${stats.characters} 个有效字符`} />
                  <StatCard label="阅读时长" value={`${stats.readingMinutes} 分钟`} hint="按正文长度动态估算" />
                  <StatCard label="最近保存" value={formatDateTime(lastSavedAt)} hint="自动保存和手动保存都会更新" />
                  <StatCard
                    label="发布时间"
                    value={formatDateTime(publishedAt ? new Date(publishedAt).toISOString() : null)}
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

  const current = POST_STATUS_OPTIONS.find((item) => item.value === status)
  return <AdminStatusBadge tone={current?.tone ?? 'neutral'}>{current?.label ?? '草稿'}</AdminStatusBadge>
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

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}

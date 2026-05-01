'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { JSONContent } from '@tiptap/core'
import { Button } from '@/components/ui/Button'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'
import { TiptapEditor } from '@/features/editor/TiptapEditor'
import { createPost, updatePost } from '@/features/posts/api'
import type { PostRow } from '@/types/post'

interface PostEditorProps {
  post?: PostRow
}

export function PostEditor({ post }: PostEditorProps) {
  const router = useRouter()
  const coverInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState(post?.title ?? '')
  const [slug, setSlug] = useState(post?.slug ?? '')
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '')
  const [tags, setTags] = useState((post?.tags ?? []).join(', '))
  const [category, setCategory] = useState(post?.category ?? '未分类')
  const [existingCategories, setExistingCategories] = useState<string[]>([])
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [coverUrl, setCoverUrl] = useState(post?.cover_url ?? '')
  const [content, setContent] = useState<JSONContent>((post?.content as JSONContent) ?? {})
  const [saving, setSaving] = useState(false)
  const [savedStatus, setSavedStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
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

    return latin || `post-${Date.now()}`
  }

  async function handleCoverUpload(file: File) {
    setCoverUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload/cover', { method: 'POST', body: formData })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(typeof data?.error === 'string' ? data.error : '封面上传失败')
      }

      const { url } = await res.json()
      setCoverUrl(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : '封面上传失败')
    } finally {
      setCoverUploading(false)
    }
  }

  async function handleSave(targetStatus: 'draft' | 'published') {
    setSaving(true)
    setSavedStatus('saving')
    setError('')

    try {
      const payload = {
        title,
        slug: slug || autoSlug(title),
        content,
        excerpt: excerpt || undefined,
        coverUrl: coverUrl || undefined,
        status: targetStatus,
        tags: tags
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        category: category.trim() || '未分类',
      }

      if (post) {
        await updatePost(post.id, payload)
      } else {
        await createPost(payload)
      }

      setSavedStatus('saved')
      setTimeout(() => setSavedStatus('idle'), 2200)

      if (targetStatus === 'published') {
        router.push('/dashboard/posts')
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败')
      setSavedStatus('idle')
    } finally {
      setSaving(false)
    }
  }

  const resolvedSlug = slug || autoSlug(title)

  return (
    <div className="-m-4 flex min-h-[calc(100vh-4rem)] flex-col bg-[radial-gradient(circle_at_top,rgba(255,138,107,0.06),transparent_30%)] sm:-m-6 lg:-m-8">
      <div className="sticky top-16 z-30 border-b border-border/70 bg-background/88 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3">
          <Link
            href="/dashboard/posts"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5"
          >
            <MaterialSymbol icon="arrow_back" size={16} />
            文章列表
          </Link>

          <div className="h-4 w-px bg-border" />
          <StatusBadge status={post?.status ?? 'draft'} saved={savedStatus} />

          <div className="ml-auto flex items-center gap-2">
            {error ? (
              <span className="hidden max-w-[260px] truncate text-xs text-red-400 lg:block">{error}</span>
            ) : null}

            {(slug || post?.slug) ? (
              <a
                href={`/posts/${slug || post?.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5"
              >
                <MaterialSymbol icon="preview" size={16} />
                预览
              </a>
            ) : null}

            <Button variant="secondary" size="sm" loading={saving} onClick={() => handleSave('draft')}>
              <MaterialSymbol icon="save" size={16} />
              保存草稿
            </Button>
            <Button size="sm" loading={saving} onClick={() => handleSave('published')}>
              <MaterialSymbol icon="send" size={16} />
              {post?.status === 'published' ? '更新发布' : '发布文章'}
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col xl:flex-row">
        <section className="min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 xl:px-8">
          <div className="space-y-6">
            <div className="rounded-[32px] border border-white/8 bg-card/78 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-8">
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
              <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-xs font-mono text-muted-foreground">
                <MaterialSymbol icon="link" size={15} />
                <span>/posts/</span>
                <span className="truncate text-foreground/70">{resolvedSlug || 'url-slug'}</span>
              </div>
            </div>

            <TiptapEditor
              initialContent={content}
              onChange={setContent}
              placeholder="从这里开始写作，正文会自动落在更舒展的纸面上。"
              className="pb-10"
            />
          </div>
        </section>

        <aside className="w-full shrink-0 border-t border-border/70 bg-card/68 backdrop-blur-xl xl:w-[340px] xl:border-l xl:border-t-0">
          <div className="sticky top-32 max-h-[calc(100vh-8rem)] overflow-y-auto px-4 py-6 sm:px-6">
            <div className="space-y-6">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-muted-foreground">
                  Article Metadata
                </p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  这边只放元信息，不再和正文抢视觉焦点。
                </p>
              </div>

              <MetaField icon={<MaterialSymbol icon="link" size={16} />} label="URL Slug">
                <input
                  type="text"
                  value={slug}
                  onChange={(event) => setSlug(event.target.value)}
                  placeholder={resolvedSlug || 'url-slug'}
                  className={`${INPUT_CLASS} font-mono text-xs`}
                />
              </MetaField>

              <MetaField icon={<MaterialSymbol icon="folder" size={16} />} label="分类">
                {creatingCategory ? (
                  <div className="flex gap-2">
                    <input
                      autoFocus
                      type="text"
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                      placeholder="输入新分类"
                      className={`${INPUT_CLASS} flex-1`}
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
                      className={INPUT_CLASS}
                    >
                      {existingCategories.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                      {!existingCategories.includes(category) ? <option value="__other__">{category}</option> : null}
                      <option value="__new__">+ 新建分类</option>
                    </select>
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      当前分类: <span className="text-foreground">{category}</span>
                    </p>
                  </>
                )}
              </MetaField>

              <MetaField icon={<MaterialSymbol icon="sell" size={16} />} label="标签">
                <input
                  type="text"
                  value={tags}
                  onChange={(event) => setTags(event.target.value)}
                  placeholder="键盘, DIY, 生活"
                  className={INPUT_CLASS}
                />
                {tags ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tags
                      .split(',')
                      .map((item) => item.trim())
                      .filter(Boolean)
                      .map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-ember/18 bg-ember/10 px-2 py-1 text-[11px] font-mono text-ember"
                        >
                          {tag}
                        </span>
                      ))}
                  </div>
                ) : null}
              </MetaField>

              <MetaField icon={<MaterialSymbol icon="notes" size={16} />} label="摘要">
                <textarea
                  value={excerpt}
                  onChange={(event) => setExcerpt(event.target.value)}
                  placeholder="写一段 120-160 字以内的摘要。"
                  rows={5}
                  className={`${INPUT_CLASS} min-h-[132px] resize-none py-3 leading-7`}
                />
              </MetaField>

              <MetaField icon={<MaterialSymbol icon="image" size={16} />} label="封面图">
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) handleCoverUpload(file)
                    event.target.value = ''
                  }}
                />

                {coverUrl ? (
                  <div className="overflow-hidden rounded-[24px] border border-white/8 bg-white/[0.03]">
                    <div className="relative aspect-[16/10]">
                      <img src={coverUrl} alt="封面预览" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setCoverUrl('')}
                        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition-opacity hover:opacity-85"
                        title="移除封面"
                      >
                        <MaterialSymbol icon="close" size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={coverUploading}
                    onClick={() => coverInputRef.current?.click()}
                    className="flex h-28 w-full flex-col items-center justify-center gap-2 rounded-[24px] border border-dashed border-white/10 bg-white/[0.03] text-sm text-muted-foreground transition-colors hover:border-foreground/25 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {coverUploading ? (
                      <>
                        <MaterialSymbol icon="progress_activity" size={18} className="animate-spin" />
                        <span>上传中…</span>
                      </>
                    ) : (
                      <>
                        <MaterialSymbol icon="upload" size={18} />
                        <span>点击上传封面</span>
                      </>
                    )}
                  </button>
                )}
              </MetaField>

              <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4 text-[11px] font-mono text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>标题长度</span>
                  <span>{title.trim().length}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span>标签数量</span>
                  <span>{tags.split(',').map((item) => item.trim()).filter(Boolean).length}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span>摘要字数</span>
                  <span>{excerpt.trim().length}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function MetaField({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
        <span className="text-muted-foreground/70">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  )
}

function StatusBadge({
  status,
  saved,
}: {
  status: string
  saved: 'idle' | 'saving' | 'saved'
}) {
  if (saved === 'saving') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <MaterialSymbol icon="progress_activity" size={14} className="animate-spin" />
        保存中…
      </span>
    )
  }

  if (saved === 'saved') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        已保存
      </span>
    )
  }

  const map: Record<string, [string, string]> = {
    draft: ['草稿', 'text-muted-foreground'],
    published: ['已发布', 'text-emerald-400'],
    archived: ['已归档', 'text-muted-foreground/80'],
  }

  const [label, cls] = map[status] ?? ['未知', 'text-muted-foreground']

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${cls}`}>
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === 'published' ? 'bg-emerald-400' : 'bg-muted-foreground/35'
        }`}
      />
      {label}
    </span>
  )
}

const INPUT_CLASS =
  'h-12 w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 font-sans text-sm text-foreground placeholder:text-muted-foreground/45 focus:outline-none focus:ring-2 focus:ring-ocean/35'

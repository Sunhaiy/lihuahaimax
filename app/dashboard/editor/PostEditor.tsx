/**
 * app/dashboard/editor/PostEditor.tsx
 *
 * 文章编辑器主体 — 粘性顶栏 + 全幅写作区 + 右侧元数据栏。
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TiptapEditor } from '@/features/editor/TiptapEditor'
import { createPost, updatePost } from '@/features/posts/api'
import { Button } from '@/components/ui/Button'
import {
  RiArrowLeftLine,
  RiEyeLine,
  RiSaveLine,
  RiSendPlaneLine,
  RiPriceTag3Line,
  RiFolderLine,
  RiLink,
  RiFileTextLine,
  RiImageLine,
  RiLoader4Line,
  RiCloseLine,
} from '@remixicon/react'
import type { JSONContent } from '@tiptap/core'
import type { PostRow } from '@/types/post'


interface PostEditorProps {
  post?: PostRow
}

export function PostEditor({ post }: PostEditorProps) {
  const router = useRouter()

  const [title, setTitle] = useState(post?.title ?? '')
  const [slug, setSlug] = useState(post?.slug ?? '')
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '')
  const [tags, setTags] = useState((post?.tags ?? []).join(', '))
  const [category, setCategory] = useState(post?.category ?? '未分类')
  const [existingCategories, setExistingCategories] = useState<string[]>([])
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [coverUrl, setCoverUrl] = useState(post?.cover_url ?? '')
  const [content, setContent] = useState<JSONContent>(
    (post?.content as JSONContent) ?? {}
  )
  const [saving, setSaving] = useState(false)
  const [savedStatus, setSavedStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  // 拉取已有分类列表
  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data: { category: string }[]) =>
        setExistingCategories(data.map((d) => d.category))
      )
      .catch(() => {})
  }, [])
  const [error, setError] = useState('')
  const [coverUploading, setCoverUploading] = useState(false)
  const coverInputRef = useRef<HTMLInputElement>(null)

  async function handleCoverUpload(file: File) {
    setCoverUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload/cover', { method: 'POST', body: fd })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d?.error ?? '上传失败')
      }
      const { url } = await res.json()
      setCoverUrl(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : '封面上传失败')
    } finally {
      setCoverUploading(false)
    }
  }

  function autoSlug(t: string) {
    const latin = t
      .toLowerCase()
      .replace(/[\u4e00-\u9fa5]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    // 纯中文标题时用时间戳生成合法 slug
    return latin || `post-${Date.now()}`
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
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        category: category.trim() || '未分类',
      }

      if (post) {
        await updatePost(post.id, payload)
      } else {
        await createPost(payload)
      }

      setSavedStatus('saved')
      setTimeout(() => setSavedStatus('idle'), 2500)
      if (targetStatus === 'published') {
        router.push('/dashboard/posts')
        router.refresh()
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存失败')
      setSavedStatus('idle')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="-m-6 flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 65px)' }}>
      {/* ══════════════════════════════════════════════════════
          顶栏：返回 / 状态指示 / 操作按钮
      ══════════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-30 flex items-center gap-3 px-5 h-13
                      border-b border-border
                      bg-background/95 backdrop-blur-xl">
        {/* 返回 */}
        <Link
          href="/dashboard/posts"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground
                     transition-colors px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/5"
        >
          <RiArrowLeftLine size={14} />
          文章列表
        </Link>

        <div className="w-px h-4 bg-foreground/10" />

        {/* 状态指示 */}
        <StatusBadge status={post?.status ?? 'draft'} saved={savedStatus} />

        <div className="flex-1" />

        {/* 错误提示 */}
        {error && (
          <span className="text-xs text-red-400 max-w-[200px] truncate">{error}</span>
        )}

        {/* 预览 */}
        {(slug || post?.slug) && (
          <a
            href={`/posts/${slug || post?.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-ember
                       transition-colors px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/5"
          >
            <RiEyeLine size={14} />
            预览
          </a>
        )}

        {/* 保存草稿 */}
        <button
          type="button"
          disabled={saving}
          onClick={() => handleSave('draft')}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground
                     px-3 py-1.5 rounded border border-border hover:border-foreground/20
                     bg-transparent hover:bg-black/5 dark:hover:bg-white/5 transition-all disabled:opacity-50"
        >
          {saving ? <RiLoader4Line size={13} className="animate-spin" /> : <RiSaveLine size={13} />}
          保存草稿
        </button>

        {/* 发布 */}
        <button
          type="button"
          disabled={saving}
          onClick={() => handleSave('published')}
          className="flex items-center gap-1.5 text-xs text-white font-medium
                     px-3 py-1.5 rounded
                     bg-ember hover:bg-ember-600 transition-all
                     [box-shadow:0_0_0_1px_rgba(255,138,107,0.25)]
                     hover:[box-shadow:0_0_16px_rgba(255,138,107,0.4),0_0_0_1px_rgba(255,138,107,0.35)]
                     disabled:opacity-50"
        >
          <RiSendPlaneLine size={13} />
          {post?.status === 'published' ? '更新发布' : '立即发布'}
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════
          主体：编辑区 + 右侧元数据栏
      ══════════════════════════════════════════════════════ */}
      <div className="flex flex-1 min-h-0">

        {/* ── 左侧：标题 + 编辑器 ──────────────────────────── */}
        <div className="flex-1 min-w-0 overflow-y-auto">
          {/* 标题输入 */}
          <div className="px-10 pt-10 pb-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="文章标题"
              className="w-full text-[2rem] font-bold leading-tight
                         bg-transparent border-none outline-none
                         text-foreground placeholder:text-foreground/15
                         tracking-tight"
            />
            {/* Slug 预览行 */}
            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground font-mono">
              <RiLink size={12} />
              <span>/posts/</span>
              <span className="text-muted-foreground/70">{slug || autoSlug(title) || 'url-slug'}</span>
            </div>
          </div>

          {/* 分隔线 */}
          <div className="mx-10 border-t border-border mb-2" />

          {/* Tiptap 编辑器（含内置粘性工具栏） */}
          <TiptapEditor
            initialContent={content}
            onChange={setContent}
            placeholder="在此开始你的写作…"
            className="min-h-[600px]"
          />
        </div>

        {/* ── 右侧：元数据面板 ─────────────────────────────── */}
        <aside className="w-[260px] flex-shrink-0 border-l border-border
                          sticky top-[3.25rem] self-start h-[calc(100vh-3.25rem)]
                          overflow-y-auto bg-card">
          <div className="px-5 py-6 space-y-6">

            {/* 区块标题 */}
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              文章元数据
            </p>

            {/* Slug */}
            <Field icon={<RiLink size={13} />} label="URL Slug">
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder={autoSlug(title) || 'url-slug'}
                className={inputCls + ' font-mono text-xs'}
              />
            </Field>

            {/* 分类 */}
            <Field icon={<RiFolderLine size={13} />} label="分类">
              {creatingCategory ? (
                <div className="flex gap-1.5">
                  <input
                    autoFocus
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="输入新分类名…"
                    className={inputCls + ' flex-1'}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); setCreatingCategory(false) }
                      if (e.key === 'Escape') { setCreatingCategory(false) }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setCreatingCategory(false)}
                    className="text-[10px] px-2 py-1 rounded border border-border text-muted-foreground hover:text-foreground transition-colors"
                  >
                    确定
                  </button>
                </div>
              ) : (
                <div className="flex gap-1.5">
                  <select
                    value={existingCategories.includes(category) ? category : '__other__'}
                    onChange={(e) => {
                      if (e.target.value === '__new__') {
                        setCategory('')
                        setCreatingCategory(true)
                      } else if (e.target.value !== '__other__') {
                        setCategory(e.target.value)
                      }
                    }}
                    className={inputCls + ' flex-1 pr-2'}
                  >
                    {existingCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    {/* 当前值不在列表中时显示 */}
                    {!existingCategories.includes(category) && (
                      <option value="__other__">{category}</option>
                    )}
                    <option value="__new__">＋ 新建分类…</option>
                  </select>
                </div>
              )}
              {/* 当前分类预览（选择器模式） */}
              {!creatingCategory && (
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  当前：<span className="text-foreground">{category}</span>
                </p>
              )}
            </Field>

            {/* 标签 */}
            <Field icon={<RiPriceTag3Line size={13} />} label="标签（逗号分隔）">
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="ESP32, 物联网, 生活"
                className={inputCls}
              />
              {/* 标签预览 */}
              {tags && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {tags.split(',').map((t) => t.trim()).filter(Boolean).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-1.5 py-0.5 rounded
                                 bg-ember/10 text-ember border border-ember/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Field>

            {/* 摘要 */}
            <Field icon={<RiFileTextLine size={13} />} label="摘要">
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="150 字以内的文章简介…"
                rows={4}
                className={inputCls + ' resize-none leading-relaxed'}
              />
            </Field>

            {/* 封面图 */}
            <Field icon={<RiImageLine size={13} />} label="封面图">
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleCoverUpload(file)
                  e.target.value = ''
                }}
              />
              {coverUrl ? (
                <div className="relative group rounded-base overflow-hidden border border-border">
                  <img src={coverUrl} alt="封面预览" className="w-full h-28 object-cover" />
                  <button
                    type="button"
                    onClick={() => setCoverUrl('')}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white
                               flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="移除封面"
                  >
                    <RiCloseLine size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={coverUploading}
                  onClick={() => coverInputRef.current?.click()}
                  className="w-full h-20 rounded-base border border-dashed border-border
                             text-muted-foreground text-xs hover:border-foreground/30 hover:text-foreground/50
                             transition-colors flex flex-col items-center justify-center gap-1
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {coverUploading
                    ? <><RiLoader4Line size={18} className="animate-spin" /><span>上传中…</span></>
                    : <><RiImageLine size={18} /><span>点击上传封面</span></>
                  }
                </button>
              )}
            </Field>

            {/* 字数统计（示意） */}
            <div className="pt-2 border-t border-border text-[10px] text-muted-foreground font-mono space-y-1">
              <div className="flex justify-between">
                <span>段落</span>
                <span>—</span>
              </div>
              <div className="flex justify-between">
                <span>代码块</span>
                <span>—</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

// ── 子组件 ────────────────────────────────────────────────────────────

const inputCls = `
  w-full px-3 py-2 rounded-base text-sm
  bg-background border border-border
  text-foreground placeholder:text-muted-foreground
  focus:outline-none focus:border-[rgba(14,165,233,0.5)] focus:bg-card
  transition-colors
`.trim()

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <span className="text-muted-foreground/60">{icon}</span>
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
  if (saved === 'saving')
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <RiLoader4Line size={12} className="animate-spin" />
        保存中…
      </span>
    )

  if (saved === 'saved')
    return (
      <span className="flex items-center gap-1.5 text-xs text-green-400/70">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
        已保存
      </span>
    )

  const map: Record<string, [string, string]> = {
    draft: ['草稿', 'text-muted-foreground'],
    published: ['已发布', 'text-green-400/60'],
    archived: ['已存档', 'text-muted-foreground/60'],
  }
  const [label, cls] = map[status] ?? ['未知', 'text-muted-foreground/60']

  return (
    <span className={`flex items-center gap-1.5 text-xs ${cls}`}>
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === 'published' ? 'bg-green-400' : 'bg-muted-foreground/30'
        }`}
      />
      {label}
    </span>
  )
}

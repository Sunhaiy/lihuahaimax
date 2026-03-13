/**
 * components/ui/PostsFilter.tsx
 *
 * 文章筛选栏 — 分类单选 + 标签多选（可折叠）。
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  categories: { category: string; count: number }[]
  tags: { tag: string; count: number }[]
  currentCategory: string
  currentTags: string[]
  totalPublished: number
}

const TAGS_LIMIT = 10

export function PostsFilter({ categories, tags, currentCategory, currentTags, totalPublished }: Props) {
  const router = useRouter()
  const [showAllTags, setShowAllTags] = useState(false)

  function buildUrl(cat: string, selectedTags: string[]) {
    const params = new URLSearchParams()
    if (cat) params.set('category', cat)
    if (selectedTags.length) params.set('tags', selectedTags.join(','))
    const qs = params.toString()
    return `/posts${qs ? `?${qs}` : ''}`
  }

  function toggleCategory(cat: string) {
    const next = cat === currentCategory ? '' : cat
    router.push(buildUrl(next, currentTags))
  }

  function toggleTag(t: string) {
    const next = currentTags.includes(t)
      ? currentTags.filter(x => x !== t)
      : [...currentTags, t]
    router.push(buildUrl(currentCategory, next))
  }

  const visibleTags = showAllTags ? tags : tags.slice(0, TAGS_LIMIT)
  const hiddenCount = tags.length - TAGS_LIMIT
  const isFiltered = Boolean(currentCategory || currentTags.length)

  return (
    <div className="mb-8 space-y-2.5">
      {/* ── 分类行 ── */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] text-muted-foreground font-mono w-8 flex-shrink-0">分类</span>
        <button
          onClick={() => router.push('/posts')}
          className={`text-xs px-3 py-1 rounded-full border transition-colors
            ${!currentCategory && !currentTags.length
              ? 'bg-foreground text-background border-foreground'
              : 'border-border text-muted-foreground hover:border-ember/40 hover:text-ember'}`}
        >
          全部 {totalPublished}
        </button>
        {categories.map(({ category: cat, count }) => (
          <button
            key={cat}
            onClick={() => toggleCategory(cat)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors
              ${cat === currentCategory
                ? 'bg-foreground text-background border-foreground'
                : 'border-border text-muted-foreground hover:border-ember/40 hover:text-ember'}`}
          >
            {cat} {count}
          </button>
        ))}
      </div>

      {/* ── 标签行 ── */}
      <div className="flex items-start gap-1.5">
        <span className="text-[10px] text-muted-foreground font-mono w-8 flex-shrink-0 pt-1">标签</span>
        <div className="flex flex-wrap gap-1.5 flex-1">
          {visibleTags.map(({ tag: t, count }) => (
            <button
              key={t}
              onClick={() => toggleTag(t)}
              className={`text-xs px-2.5 py-0.5 rounded-full border transition-colors
                ${currentTags.includes(t)
                  ? 'bg-ember/15 text-ember border-ember/50'
                  : 'border-border text-muted-foreground hover:border-ember/40 hover:text-ember'}`}
            >
              {t}
              {currentTags.includes(t) && <span className="ml-1 opacity-60">×</span>}
              {!currentTags.includes(t) && <span className="ml-1 text-[10px] opacity-40">{count}</span>}
            </button>
          ))}

          {hiddenCount > 0 && (
            <button
              onClick={() => setShowAllTags(v => !v)}
              className="text-xs px-2.5 py-0.5 rounded-full border border-dashed
                         border-border text-muted-foreground hover:text-ember hover:border-ember/40 transition-colors"
            >
              {showAllTags ? '收起' : `+${hiddenCount} 更多`}
            </button>
          )}

          {currentTags.length > 0 && (
            <button
              onClick={() => router.push(buildUrl(currentCategory, []))}
              className="text-xs px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground
                         hover:text-foreground transition-colors"
            >
              清除标签
            </button>
          )}
        </div>
      </div>

      {/* ── 当前筛选状态提示 ── */}
      {isFiltered && (
        <p className="text-[11px] text-muted-foreground font-mono pl-9">
          {[
            currentCategory && `分类：${currentCategory}`,
            currentTags.length && `标签：${currentTags.join(' + ')}`,
          ].filter(Boolean).join('　')}
        </p>
      )}
    </div>
  )
}

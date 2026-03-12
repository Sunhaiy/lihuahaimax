/**
 * app/dashboard/categories/page.tsx
 *
 * 分类管理 — 重命名 / 删除分类（批量更新关联文章）。
 */

'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'

interface CategoryItem {
  category: string
  count: number
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingName, setEditingName] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/categories')
    const data = await res.json()
    setCategories(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (editingName !== null) inputRef.current?.focus()
  }, [editingName])

  async function handleRename(oldName: string) {
    const newName = editValue.trim()
    if (!newName || newName === oldName) { setEditingName(null); return }
    setBusy(true)
    setError('')
    const res = await fetch('/api/categories', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldName, newName }),
    })
    if (res.ok) {
      setEditingName(null)
      await load()
    } else {
      setError('重命名失败')
    }
    setBusy(false)
  }

  async function handleDelete(name: string) {
    if (!confirm(`确定要删除分类「${name}」吗？该分类下的文章将重置为"未分类"。`)) return
    setBusy(true)
    setError('')
    const res = await fetch('/api/categories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    if (res.ok) {
      await load()
    } else {
      setError('删除失败')
    }
    setBusy(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">分类管理</h1>
        <Link
          href="/dashboard/posts"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ← 返回文章管理
        </Link>
      </div>

      {error && (
        <p className="text-sm text-red-400 mb-4">{error}</p>
      )}

      {loading ? (
        <div className="text-center py-20 text-muted-foreground text-sm">加载中…</div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground text-sm">
          暂无分类。发布文章时会自动创建分类。
        </div>
      ) : (
        <div className="rounded-card border border-border overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto] text-xs text-muted-foreground
                          px-5 py-3 border-b border-border font-medium
                          bg-black/[0.02] dark:bg-white/[0.02]">
            <span>分类名称</span>
            <span className="pr-10">文章数</span>
            <span>操作</span>
          </div>

          {categories.map(({ category, count }) => (
            <div
              key={category}
              className="grid grid-cols-[1fr_auto_auto] items-center
                         px-5 py-3.5 border-b last:border-b-0 border-border
                         hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors"
            >
              {/* 分类名 / 内联编辑 */}
              {editingName === category ? (
                <div className="flex items-center gap-2 pr-4">
                  <input
                    ref={inputRef}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename(category)
                      if (e.key === 'Escape') setEditingName(null)
                    }}
                    className="flex-1 text-sm px-2 py-1 rounded border border-ember/50 bg-background
                               focus:outline-none focus:ring-1 focus:ring-ember/50"
                    disabled={busy}
                  />
                  <button
                    onClick={() => handleRename(category)}
                    disabled={busy}
                    className="text-[11px] px-2 py-1 rounded bg-ember text-white
                               hover:bg-ember/90 transition-colors disabled:opacity-50"
                  >
                    确定
                  </button>
                  <button
                    onClick={() => setEditingName(null)}
                    disabled={busy}
                    className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 pr-4 min-w-0">
                  <span className="text-sm font-medium text-foreground truncate">
                    {category}
                  </span>
                  {category === '未分类' && (
                    <span className="text-[10px] text-muted-foreground font-mono">（默认）</span>
                  )}
                </div>
              )}

              {/* 文章数 */}
              <span className="text-sm text-muted-foreground font-mono pr-10 text-right">
                {count}
              </span>

              {/* 操作 */}
              {editingName === category ? null : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setEditingName(category); setEditValue(category) }}
                    disabled={busy}
                    className="text-[11px] px-2.5 py-1 rounded border border-border
                               text-muted-foreground hover:text-foreground hover:border-ember/40
                               transition-colors disabled:opacity-50"
                  >
                    重命名
                  </button>
                  {category !== '未分类' && (
                    <button
                      onClick={() => handleDelete(category)}
                      disabled={busy}
                      className="text-[11px] px-2.5 py-1 rounded border border-red-500/20
                                 text-red-400 hover:bg-red-400/10 transition-colors
                                 disabled:opacity-50"
                    >
                      删除
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-6">
        删除分类不会删除文章，该分类下的文章会自动归入"未分类"。
      </p>
    </div>
  )
}

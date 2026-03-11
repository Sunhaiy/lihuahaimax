/**
 * app/dashboard/links/page.tsx
 *
 * 友情链接管理。
 */

'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Button } from '@/components/ui/Button'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function DashboardLinksPage() {
  const { data, isLoading, mutate } = useSWR('/api/links?admin=true', fetcher)
  const [form, setForm] = useState({ name: '', url: '', description: '' })
  const [saving, setSaving] = useState(false)

  async function handleAdd() {
    if (!form.name || !form.url) return
    setSaving(true)
    await fetch('/api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setForm({ name: '', url: '', description: '' })
    setSaving(false)
    mutate()
  }

  async function handleDelete(id: number) {
    if (!confirm('删除友链？')) return
    await fetch(`/api/links/${id}`, { method: 'DELETE' })
    mutate()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">友情链接</h1>

      {/* 添加表单 */}
      <div className="rounded-card border border-white/5 p-5 mb-8 space-y-4">
        <p className="text-sm font-medium">添加友链</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="站点名称"
            className="h-9 px-3 rounded-base bg-white/5 border border-white/10 text-sm text-foreground
                       placeholder:text-muted-foreground/40 focus:outline-none focus:border-ocean/50 transition-colors"
          />
          <input
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="https://example.com"
            className="h-9 px-3 rounded-base bg-white/5 border border-white/10 text-sm text-foreground
                       placeholder:text-muted-foreground/40 focus:outline-none focus:border-ocean/50 transition-colors"
          />
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="简短描述（可选）"
            className="h-9 px-3 rounded-base bg-white/5 border border-white/10 text-sm text-foreground
                       placeholder:text-muted-foreground/40 focus:outline-none focus:border-ocean/50 transition-colors"
          />
        </div>
        <div className="flex justify-end">
          <Button size="sm" loading={saving} onClick={handleAdd}>添加</Button>
        </div>
      </div>

      {/* 友链列表 */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-muted-foreground text-sm">加载中…</div>
        ) : !data?.length ? (
          <div className="text-center py-16 text-muted-foreground text-sm">暂无友链。</div>
        ) : (
          data.map((link: { id: number; name: string; url: string; description: string | null; is_active: boolean }) => (
            <div
              key={link.id}
              className="flex items-center gap-4 p-4 rounded-card border border-white/5"
            >
              <div className="flex-1 min-w-0">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-foreground hover:text-ocean transition-colors"
                >
                  {link.name}
                </a>
                {link.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{link.description}</p>
                )}
                <p className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate">{link.url}</p>
              </div>
              <div className="flex items-center gap-2">
                {!link.is_active && (
                  <span className="text-[10px] text-ember">已隐藏</span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300"
                  onClick={() => handleDelete(link.id)}
                >
                  删除
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

/**
 * app/dashboard/moments/page.tsx
 *
 * 瞬间管理 — 列表 + 快速发布表单。
 */

'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Button } from '@/components/ui/Button'
import { MomentSkeleton } from '@/components/ui/Skeleton'
import { createMoment, deleteMoment } from '@/features/moments/api'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function DashboardMomentsPage() {
  const { data, isLoading, mutate } = useSWR('/api/moments?publicOnly=false', fetcher)
  const [text, setText] = useState('')
  const [posting, setPosting] = useState(false)

  async function handlePost() {
    if (!text.trim()) return
    setPosting(true)
    await createMoment({ type: 'text', content: text })
    setText('')
    setPosting(false)
    mutate()
  }

  async function handleDelete(id: number) {
    if (!confirm('确定要删除这条瞬间吗？')) return
    await deleteMoment(id)
    mutate()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">瞬间管理</h1>

      {/* 快速发布 */}
      <div className="rounded-card border border-white/5 p-5 mb-8 space-y-3">
        <p className="text-sm font-medium">快速发布瞬间</p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="此刻在想什么…"
          rows={3}
          className="w-full px-3 py-2 rounded-base bg-white/5 border border-white/10
                     text-sm text-foreground placeholder:text-muted-foreground/40 resize-none
                     focus:outline-none focus:border-ocean/50 transition-colors"
        />
        <div className="flex justify-end">
          <Button size="sm" loading={posting} onClick={handlePost}>
            发布
          </Button>
        </div>
      </div>

      {/* 列表 */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <MomentSkeleton key={i} />)
        ) : data?.data?.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">暂无瞬间。</div>
        ) : (
          data?.data?.map((m: { id: number; content: string | null; type: string; created_at: string; is_public: boolean }) => (
            <div
              key={m.id}
              className="flex items-start gap-4 p-4 rounded-card border border-white/5 hover:bg-white/[0.02]"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono text-muted-foreground">{m.type}</span>
                  <time className="text-[10px] text-muted-foreground font-mono">
                    {new Date(m.created_at).toLocaleString('zh-CN')}
                  </time>
                  {!m.is_public && (
                    <span className="text-[10px] text-ember">私密</span>
                  )}
                </div>
                <p className="text-sm text-foreground">{m.content ?? '（无文字内容）'}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-300 flex-shrink-0"
                onClick={() => handleDelete(m.id)}
              >
                删除
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

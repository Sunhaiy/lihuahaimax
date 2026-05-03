'use client'

import { useState } from 'react'
import useSWR from 'swr'
import {
  AdminEmptyState,
  AdminPageHeader,
  AdminPanel,
  AdminStatusBadge,
  ADMIN_TEXTAREA_CLASS,
} from '@/components/admin/AdminPrimitives'
import { Button } from '@/components/ui/Button'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'
import { createMoment, deleteMoment } from '@/features/moments/api'

const fetcher = (url: string) => fetch(url).then((response) => response.json())

export default function DashboardMomentsPage() {
  const { data, isLoading, mutate } = useSWR('/api/moments?publicOnly=false', fetcher)
  const [text, setText] = useState('')
  const [posting, setPosting] = useState(false)

  const moments = data?.data ?? []

  async function handlePost() {
    if (!text.trim()) return
    setPosting(true)
    await createMoment({ type: 'text', content: text })
    setText('')
    setPosting(false)
    mutate()
  }

  async function handleDelete(id: number) {
    if (!confirm('确认删除这条瞬间吗？')) return
    await deleteMoment(id)
    mutate()
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Content"
        title="瞬间管理"
        description="把快速发布、公开状态和历史记录放到一条顺手的工作流里。写完就发，发完就能马上核对。"
        meta={
          <>
            <AdminStatusBadge tone="accent">{moments.length} 条记录</AdminStatusBadge>
            <AdminStatusBadge>{moments.filter((item: { is_public: boolean }) => item.is_public).length} 条公开</AdminStatusBadge>
          </>
        }
      />

      <AdminPanel
        title="快速发布"
        description="适合发一句状态、想法或短记录。保持轻量，但把反馈和状态做清楚。"
        icon="edit"
        actions={
          <Button onClick={handlePost} loading={posting} disabled={!text.trim()}>
            <MaterialSymbol icon="send" size={18} />
            发布瞬间
          </Button>
        }
      >
        <div className="space-y-3">
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="此刻想记录什么？"
            rows={4}
            className={`${ADMIN_TEXTAREA_CLASS} min-h-[132px] resize-none`}
          />
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>支持纯文本快速记录，发出后会立刻回到下方列表。</span>
            <span className="font-mono">{text.trim().length} chars</span>
          </div>
        </div>
      </AdminPanel>

      <AdminPanel
        title="历史记录"
        description="按时间倒序查看最近的瞬间，删除动作固定在右侧，减少误触。"
        icon="history"
      >
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-24 animate-pulse rounded-[22px] border border-border/70 bg-background/36"
              />
            ))}
          </div>
        ) : moments.length === 0 ? (
          <AdminEmptyState
            icon="ink_pen"
            title="还没有瞬间"
            description="先发布第一条记录，后台会在这里接住它。"
          />
        ) : (
          <div className="space-y-3">
            {moments.map(
              (moment: {
                id: number
                content: string | null
                type: string
                created_at: string
                is_public: boolean
              }) => (
                <div
                  key={moment.id}
                  className="flex flex-col gap-4 rounded-[22px] border border-border/70 bg-background/36 px-4 py-4 transition-colors hover:bg-background/48 sm:flex-row sm:items-start"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <AdminStatusBadge>{moment.type}</AdminStatusBadge>
                      {moment.is_public ? (
                        <AdminStatusBadge tone="success">公开</AdminStatusBadge>
                      ) : (
                        <AdminStatusBadge tone="warning">私密</AdminStatusBadge>
                      )}
                      <span className="font-mono">
                        {new Date(moment.created_at).toLocaleString('zh-CN')}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-foreground">
                      {moment.content ?? '（无文字内容）'}
                    </p>
                  </div>

                  <Button variant="ghost" size="sm" onClick={() => handleDelete(moment.id)}>
                    <MaterialSymbol icon="delete" size={16} />
                    删除
                  </Button>
                </div>
              )
            )}
          </div>
        )}
      </AdminPanel>
    </div>
  )
}

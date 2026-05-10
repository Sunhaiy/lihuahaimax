'use client'

import { useMemo, useState } from 'react'
import type { JSONContent } from '@tiptap/core'
import {
  AdminEmptyState,
  AdminPageHeader,
  AdminPanel,
  AdminStatusBadge,
} from '@/components/admin/AdminPrimitives'
import { Button } from '@/components/ui/Button'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'
import { TiptapEditor } from '@/features/editor/TiptapEditor'
import { useCreateMoment, useDeleteMoment, useMoments, useUpdateMoment } from '@/features/moments/hooks'
import { extractPlainTextFromRichContent } from '@/lib/utils/extractHeadings'
import type { MomentRow, MomentType } from '@/types/moment'

const EMPTY_DOC: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
}

type EditableMoment = Pick<
  MomentRow,
  'id' | 'type' | 'content' | 'content_json' | 'is_public' | 'created_at' | 'mood' | 'location' | 'weather'
>

export default function DashboardMomentsPage() {
  const { data, isLoading, mutate } = useMoments({ pageSize: 40 })
  const { trigger: createMoment, isMutating: creating } = useCreateMoment()
  const { trigger: deleteMoment } = useDeleteMoment()
  const [activeMoment, setActiveMoment] = useState<EditableMoment | null>(null)
  const { trigger: updateMoment, isMutating: updating } = useUpdateMoment(activeMoment?.id ?? 0)

  const [type, setType] = useState<MomentType>('text')
  const [isPublic, setIsPublic] = useState(true)
  const [weather, setWeather] = useState('')
  const [location, setLocation] = useState('')
  const [mood, setMood] = useState('')
  const [content, setContent] = useState<JSONContent>(EMPTY_DOC)
  const [error, setError] = useState('')

  const moments = (data?.data ?? []) as MomentRow[]
  const saving = creating || updating
  const plainText = useMemo(() => extractPlainTextFromRichContent(content), [content])

  function resetComposer() {
    setActiveMoment(null)
    setType('text')
    setIsPublic(true)
    setWeather('')
    setLocation('')
    setMood('')
    setContent(EMPTY_DOC)
    setError('')
  }

  function hydrateComposer(moment: EditableMoment) {
    setActiveMoment(moment)
    setType(moment.type)
    setIsPublic(moment.is_public)
    setWeather(moment.weather ?? '')
    setLocation(moment.location ?? '')
    setMood(moment.mood ?? '')
    setContent(moment.content_json ?? buildFallbackMomentDoc(moment.content))
    setError('')
  }

  async function handleSave() {
    const payload = {
      type,
      contentJson: content,
      mood: mood.trim() || undefined,
      weather: weather.trim() || undefined,
      location: location.trim() || undefined,
      isPublic,
    }

    if (!plainText.trim()) {
      setError('瞬间内容不能为空')
      return
    }

    setError('')

    try {
      if (activeMoment) {
        await updateMoment(payload)
      } else {
        await createMoment(payload)
      }
      await mutate()
      resetComposer()
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存瞬间失败')
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('确认删除这条瞬间吗？')) return

    try {
      await deleteMoment(id)
      await mutate()
      if (activeMoment?.id === id) resetComposer()
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除瞬间失败')
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Content"
        title="瞬间管理"
        description="保持轻量，只写内容、设置可见状态，其余交给前台干净展示。"
        meta={
          <>
            <AdminStatusBadge tone="accent">{moments.length} 条记录</AdminStatusBadge>
            <AdminStatusBadge>{moments.filter((item) => item.is_public).length} 条公开</AdminStatusBadge>
          </>
        }
      />

      <AdminPanel
        title={activeMoment ? '编辑瞬间' : '新建瞬间'}
        description="写下这一刻，然后选择是否公开。"
        icon="edit_square"
        actions={
          <div className="flex items-center gap-2">
            {activeMoment ? (
              <Button variant="ghost" size="sm" onClick={resetComposer}>
                <MaterialSymbol icon="close" size={16} />
                取消编辑
              </Button>
            ) : null}
            <Button onClick={() => void handleSave()} loading={saving} disabled={!plainText.trim()}>
              <MaterialSymbol icon="send" size={18} />
              {activeMoment ? '更新瞬间' : '发布瞬间'}
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="flex flex-col gap-3 rounded-[18px] border border-border/70 bg-background/36 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">可见状态</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {isPublic ? '公开显示在前台瞬间页。' : '只保留在后台，不对访客展示。'}
              </p>
            </div>

            <div className="inline-flex w-fit rounded-full border border-border/70 bg-card/70 p-1">
              {[
                { label: '公开', value: true },
                { label: '私密', value: false },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setIsPublic(item.value)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                    isPublic === item.value
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <TiptapEditor
            key={activeMoment ? `moment-${activeMoment.id}` : 'moment-new'}
            initialContent={content}
            onChange={setContent}
            toolbarPreset="lite"
            placeholder="把这一刻写下来：可以是几句完整的话，也可以是带图片、列表或代码的小记录。"
            className="max-w-none"
          />
          {activeMoment ? <AdminStatusBadge tone="accent">正在编辑已有瞬间</AdminStatusBadge> : null}

          {error ? (
            <div className="rounded-[20px] border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          ) : null}
        </div>
      </AdminPanel>

      <AdminPanel
        title="历史记录"
        description="简洁查看、编辑或删除已有瞬间。"
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
            description="先发布第一条记录，后台就会在这里接住它。"
          />
        ) : (
          <div className="space-y-3">
            {moments.map((moment) => {
              const preview =
                moment.content_json ? extractPlainTextFromRichContent(moment.content_json) : moment.content ?? ''
              const active = activeMoment?.id === moment.id

              return (
                <div
                  key={moment.id}
                  className={`rounded-[22px] border px-4 py-4 transition-colors ${
                    active
                      ? 'border-primary/26 bg-primary/8'
                      : 'border-border/70 bg-background/36 hover:bg-background/48'
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {moment.is_public ? (
                          <AdminStatusBadge tone="success">公开</AdminStatusBadge>
                        ) : (
                          <AdminStatusBadge tone="warning">私密</AdminStatusBadge>
                        )}
                        <span className="font-mono">{new Date(moment.created_at).toLocaleString('zh-CN')}</span>
                      </div>

                      <p className="mt-3 line-clamp-3 text-sm leading-7 text-foreground">
                        {preview || '（无可预览内容）'}
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <Button variant="secondary" size="sm" onClick={() => hydrateComposer(moment)}>
                        <MaterialSymbol icon="edit" size={16} />
                        编辑
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => void handleDelete(moment.id)}>
                        <MaterialSymbol icon="delete" size={16} />
                        删除
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </AdminPanel>
    </div>
  )
}

function buildFallbackMomentDoc(content: string | null): JSONContent {
  if (!content?.trim()) return EMPTY_DOC

  return {
    type: 'doc',
    content: content
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
      .map((paragraph) => ({
        type: 'paragraph',
        content: [{ type: 'text', text: paragraph }],
      })),
  }
}

'use client'

import { useMemo, useState } from 'react'
import type { JSONContent } from '@tiptap/core'
import {
  AdminEmptyState,
  AdminPageHeader,
  AdminPanel,
  AdminStatusBadge,
  ADMIN_INPUT_CLASS,
  ADMIN_SELECT_CLASS,
} from '@/components/admin/AdminPrimitives'
import { Button } from '@/components/ui/Button'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'
import { TiptapEditor, type EditorStats } from '@/features/editor/TiptapEditor'
import { useCreateMoment, useDeleteMoment, useMoments, useUpdateMoment } from '@/features/moments/hooks'
import { extractPlainTextFromRichContent } from '@/lib/utils/extractHeadings'
import type { MomentRow, MomentType } from '@/types/moment'

const EMPTY_DOC: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
}

const DEFAULT_STATS: EditorStats = {
  characters: 0,
  words: 0,
  readingMinutes: 1,
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
  const [stats, setStats] = useState<EditorStats>(DEFAULT_STATS)
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
    setStats(DEFAULT_STATS)
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
        description="现在这里支持富文本瞬间：可以写更完整的记录，也可以继续保持短促的发布节奏。旧的纯文本瞬间会继续兼容。"
        meta={
          <>
            <AdminStatusBadge tone="accent">{moments.length} 条记录</AdminStatusBadge>
            <AdminStatusBadge>{moments.filter((item) => item.is_public).length} 条公开</AdminStatusBadge>
          </>
        }
      />

      <AdminPanel
        title={activeMoment ? '编辑瞬间' : '新建瞬间'}
        description="轻量但完整的富文本工作台。支持标题层级、列表、引用、代码、链接和图片。"
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
          <div className="grid gap-4 lg:grid-cols-4">
            <label className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
                类型
              </span>
              <select
                value={type}
                onChange={(event) => setType(event.target.value as MomentType)}
                className={ADMIN_SELECT_CLASS}
              >
                <option value="text">随记</option>
                <option value="mood">心情</option>
                <option value="image">照片</option>
                <option value="link">分享</option>
                <option value="sleep">睡眠</option>
                <option value="steps">步数</option>
                <option value="heartrate">心率</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
                天气
              </span>
              <input
                value={weather}
                onChange={(event) => setWeather(event.target.value)}
                className={ADMIN_INPUT_CLASS}
                placeholder="比如：雷阵雨"
              />
            </label>

            <label className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
                地点
              </span>
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className={ADMIN_INPUT_CLASS}
                placeholder="比如：静安寺"
              />
            </label>

            <label className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
                心情
              </span>
              <input
                value={mood}
                onChange={(event) => setMood(event.target.value)}
                className={ADMIN_INPUT_CLASS}
                placeholder="比如：平静、雀跃"
              />
            </label>
          </div>

          <label className="flex items-start gap-3 rounded-[22px] border border-border/70 bg-background/38 px-4 py-4">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(event) => setIsPublic(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border bg-background"
            />
            <span>
              <span className="block text-sm font-medium text-foreground">公开显示</span>
              <span className="block text-sm text-muted-foreground">
                关闭后，这条瞬间只保留在后台，不会出现在公开 moments 页面。
              </span>
            </span>
          </label>

          <TiptapEditor
            key={activeMoment ? `moment-${activeMoment.id}` : 'moment-new'}
            initialContent={content}
            onChange={setContent}
            onStatsChange={setStats}
            toolbarPreset="lite"
            placeholder="把这一刻写下来：可以是几句完整的话，也可以是带图片、列表或代码的小记录。"
            className="max-w-none"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-border/70 bg-background/36 px-4 py-3">
            <div className="flex flex-wrap gap-2">
              <AdminStatusBadge tone="neutral">字符 {stats.characters}</AdminStatusBadge>
              <AdminStatusBadge tone="neutral">词数 {stats.words}</AdminStatusBadge>
              <AdminStatusBadge tone="neutral">阅读 {stats.readingMinutes} 分钟</AdminStatusBadge>
              {activeMoment ? <AdminStatusBadge tone="accent">编辑中</AdminStatusBadge> : null}
            </div>
            <p className="text-xs text-muted-foreground">旧瞬间没有富文本内容时，会自动回退成普通文本展示。</p>
          </div>

          {error ? (
            <div className="rounded-[20px] border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          ) : null}
        </div>
      </AdminPanel>

      <AdminPanel
        title="历史记录"
        description="可以直接继续编辑已有瞬间，也能快速确认它当前是公开还是私密。"
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
                        <AdminStatusBadge>{formatMomentType(moment.type)}</AdminStatusBadge>
                        {moment.is_public ? (
                          <AdminStatusBadge tone="success">公开</AdminStatusBadge>
                        ) : (
                          <AdminStatusBadge tone="warning">私密</AdminStatusBadge>
                        )}
                        {moment.content_json ? (
                          <AdminStatusBadge tone="accent">富文本</AdminStatusBadge>
                        ) : (
                          <AdminStatusBadge tone="neutral">旧文本</AdminStatusBadge>
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

function formatMomentType(type: MomentType) {
  switch (type) {
    case 'image':
      return '照片'
    case 'sleep':
      return '睡眠'
    case 'steps':
      return '步数'
    case 'heartrate':
      return '心率'
    case 'mood':
      return '心情'
    case 'link':
      return '分享'
    default:
      return '随记'
  }
}

'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'
import type { AnimeStatus, AnimeType, GamePlatform, GameStatus } from '@/types/acg'

const fetcher = (url: string) => fetch(url).then((response) => response.json())

type AnimeRecord = {
  id: number
  title: string
  title_cn: string | null
  cover_url: string | null
  type: AnimeType
  episodes_total: number | null
  episodes_watched: number
  status: AnimeStatus
  rating: number | null
  short_review: string | null
  start_season: string | null
  mal_id: number | null
}

type GameRecord = {
  id: number
  title: string
  cover_url: string | null
  cartridge_image_url: string | null
  platform: GamePlatform
  status: GameStatus
  play_hours: number | null
  rating: number | null
  short_review: string | null
  completed_at: string | null
}

type AnimeFormState = {
  id: number | null
  title: string
  titleCn: string
  coverUrl: string
  type: AnimeType
  episodesTotal: string
  episodesWatched: string
  status: AnimeStatus
  rating: string
  shortReview: string
  startSeason: string
  malId: string
}

type GameFormState = {
  id: number | null
  title: string
  coverUrl: string
  cartridgeImageUrl: string
  platform: GamePlatform
  status: GameStatus
  playHours: string
  rating: string
  shortReview: string
  completedAt: string
}

const EMPTY_ANIME: AnimeFormState = {
  id: null,
  title: '',
  titleCn: '',
  coverUrl: '',
  type: 'tv',
  episodesTotal: '',
  episodesWatched: '0',
  status: 'plan_to_watch',
  rating: '',
  shortReview: '',
  startSeason: '',
  malId: '',
}

const EMPTY_GAME: GameFormState = {
  id: null,
  title: '',
  coverUrl: '',
  cartridgeImageUrl: '',
  platform: 'pc',
  status: 'plan_to_play',
  playHours: '',
  rating: '',
  shortReview: '',
  completedAt: '',
}

const ANIME_STATUS_LABELS: Record<AnimeStatus, string> = {
  watching: '在看',
  completed: '已看完',
  on_hold: '搁置中',
  dropped: '弃坑',
  plan_to_watch: '计划看',
}

const GAME_STATUS_LABELS: Record<GameStatus, string> = {
  playing: '游玩中',
  completed: '已通关',
  abandoned: '弃坑',
  plan_to_play: '计划玩',
  platinum: '白金',
}

const PLATFORM_LABELS: Record<GamePlatform, string> = {
  pc: 'PC',
  ps5: 'PS5',
  ps4: 'PS4',
  switch: 'Switch',
  xbox: 'Xbox',
  mobile: 'Mobile',
  other: 'Other',
}

function readApiError(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== 'object') return fallback

  const source = payload as {
    error?: string | { fieldErrors?: Record<string, string[]>; formErrors?: string[] }
  }

  if (typeof source.error === 'string' && source.error.trim()) {
    return source.error
  }

  if (source.error && typeof source.error === 'object') {
    const formError = source.error.formErrors?.find(Boolean)
    if (formError) return formError

    const fieldError = Object.values(source.error.fieldErrors ?? {})
      .flat()
      .find(Boolean)
    if (fieldError) return fieldError
  }

  return fallback
}

function toAnimeForm(anime?: AnimeRecord | null): AnimeFormState {
  if (!anime) return EMPTY_ANIME

  return {
    id: anime.id,
    title: anime.title,
    titleCn: anime.title_cn ?? '',
    coverUrl: anime.cover_url ?? '',
    type: anime.type,
    episodesTotal: anime.episodes_total == null ? '' : String(anime.episodes_total),
    episodesWatched: String(anime.episodes_watched),
    status: anime.status,
    rating: anime.rating == null ? '' : String(anime.rating),
    shortReview: anime.short_review ?? '',
    startSeason: anime.start_season ?? '',
    malId: anime.mal_id == null ? '' : String(anime.mal_id),
  }
}

function toGameForm(game?: GameRecord | null): GameFormState {
  if (!game) return EMPTY_GAME

  return {
    id: game.id,
    title: game.title,
    coverUrl: game.cover_url ?? '',
    cartridgeImageUrl: game.cartridge_image_url ?? '',
    platform: game.platform,
    status: game.status,
    playHours: game.play_hours == null ? '' : String(game.play_hours),
    rating: game.rating == null ? '' : String(game.rating),
    shortReview: game.short_review ?? '',
    completedAt: game.completed_at ? game.completed_at.slice(0, 10) : '',
  }
}

async function uploadImage(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch('/api/upload/image', {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => null)
    throw new Error(readApiError(error, '图片上传失败'))
  }

  return res.json() as Promise<{ url: string }>
}

function parseOptionalInt(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  const next = Number.parseInt(trimmed, 10)
  return Number.isFinite(next) ? next : undefined
}

function parseOptionalFloat(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  const next = Number.parseFloat(trimmed)
  return Number.isFinite(next) ? next : undefined
}

export default function DashboardAcgPage() {
  const [tab, setTab] = useState<'anime' | 'game'>('anime')

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-white/8 bg-card/75 p-6 backdrop-blur-xl">
        <p className="text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
          ACG Library
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">动漫 / 游戏管理</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
          这一页负责把追番和游戏收藏真正管理起来，不再只是“输个标题就结束”的演示表单。
          项目字段已经由独立的 <code>/dashboard/works</code> 完整管理，这里聚焦把 ACG 链路补全。
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {(['anime', 'game'] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                tab === item
                  ? 'border-ember/30 bg-ember/12 text-ember'
                  : 'border-white/8 text-muted-foreground hover:text-foreground'
              }`}
            >
              {item === 'anime' ? '动漫' : '游戏'}
            </button>
          ))}

          <Button variant="secondary" className="ml-auto" asChild>
            <Link href="/dashboard/works">
              <MaterialSymbol icon="deployed_code" size={18} />
              打开项目管理
            </Link>
          </Button>
        </div>
      </div>

      {tab === 'anime' ? <AnimeManager /> : <GameManager />}
    </div>
  )
}

function AnimeManager() {
  const { data, isLoading, mutate } = useSWR<{ data: AnimeRecord[]; total: number }>(
    '/api/acg/anime?pageSize=200',
    fetcher
  )
  const [form, setForm] = useState<AnimeFormState>(EMPTY_ANIME)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const coverInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!data?.data.length || selectedId == null) return
    const current = data.data.find((item) => item.id === selectedId)
    if (current) setForm(toAnimeForm(current))
  }, [data, selectedId])

  function resetNotice() {
    setError('')
    setSuccess('')
  }

  function startNew() {
    setSelectedId(null)
    setForm(EMPTY_ANIME)
    resetNotice()
  }

  async function handleSave() {
    if (!form.title.trim()) {
      setError('动漫标题不能为空。')
      return
    }

    setSaving(true)
    resetNotice()

    try {
      const response = await fetch(form.id ? `/api/acg/anime/${form.id}` : '/api/acg/anime', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          titleCn: form.titleCn.trim() || undefined,
          coverUrl: form.coverUrl.trim() || undefined,
          type: form.type,
          episodesTotal: parseOptionalInt(form.episodesTotal),
          episodesWatched: parseOptionalInt(form.episodesWatched) ?? 0,
          status: form.status,
          rating: parseOptionalFloat(form.rating),
          shortReview: form.shortReview.trim() || undefined,
          startSeason: form.startSeason.trim() || undefined,
          malId: parseOptionalInt(form.malId),
        }),
      })

      const payload = response.status === 204 ? null : await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(readApiError(payload, form.id ? '更新失败' : '创建失败'))
      }

      await mutate()
      if (payload?.id) {
        setSelectedId(payload.id)
        setForm(toAnimeForm(payload))
      }
      setSuccess(form.id ? '动漫已更新。' : '动漫已创建。')
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!form.id) return
    if (!confirm('确定删除这条动漫记录吗？')) return

    setDeleting(true)
    resetNotice()

    try {
      const response = await fetch(`/api/acg/anime/${form.id}`, { method: 'DELETE' })
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(readApiError(payload, '删除失败'))
      }

      await mutate()
      startNew()
      setSuccess('动漫记录已删除。')
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败')
    } finally {
      setDeleting(false)
    }
  }

  async function handleCoverUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    resetNotice()

    try {
      const result = await uploadImage(file)
      setForm((current) => ({ ...current, coverUrl: result.url }))
      setSuccess('封面已上传，记得保存动漫记录。')
    } catch (err) {
      setError(err instanceof Error ? err.message : '图片上传失败')
    } finally {
      setUploading(false)
      if (coverInputRef.current) coverInputRef.current.value = ''
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
      <LibraryListCard
        title="动漫列表"
        count={data?.total ?? 0}
        isLoading={isLoading}
        emptyText="还没有动漫记录，先新建一条吧。"
      >
        {data?.data.map((anime) => (
          <SelectableListItem
            key={anime.id}
            active={selectedId === anime.id}
            imageUrl={anime.cover_url}
            title={anime.title_cn ?? anime.title}
            subtitle={`${ANIME_STATUS_LABELS[anime.status]} · ${anime.type.toUpperCase()}`}
            meta={
              anime.episodes_total
                ? `${anime.episodes_watched} / ${anime.episodes_total} 话`
                : `${anime.episodes_watched} 话已记录`
            }
            onClick={() => {
              setSelectedId(anime.id)
              setForm(toAnimeForm(anime))
            }}
          />
        ))}
      </LibraryListCard>

      <EditorCard
        title={form.id ? '编辑动漫' : '新建动漫'}
        description="把追番状态、集数、评分、简评和封面都补齐，前台列表就能直接用。"
        onReset={form.id ? startNew : undefined}
        onSave={handleSave}
        saveLabel={form.id ? '保存修改' : '创建动漫'}
        saving={saving}
        onDelete={form.id ? handleDelete : undefined}
        deleting={deleting}
        error={error}
        success={success}
      >
        <div className="grid gap-6 xl:grid-cols-[220px_1fr]">
          <ImageUploadPanel
            label="封面"
            imageUrl={form.coverUrl}
            fallback={form.titleCn || form.title || '番'}
            uploading={uploading}
            onUpload={() => coverInputRef.current?.click()}
            onClear={() => setForm((current) => ({ ...current, coverUrl: '' }))}
            note="点击封面上传，支持直接保存本地上传后的图片地址。"
          />

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="原始标题">
              <input
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                className={INPUT_CLASS}
              />
            </Field>
            <Field label="中文标题">
              <input
                value={form.titleCn}
                onChange={(event) => setForm((current) => ({ ...current, titleCn: event.target.value }))}
                className={INPUT_CLASS}
              />
            </Field>
            <Field label="番剧类型">
              <select
                value={form.type}
                onChange={(event) =>
                  setForm((current) => ({ ...current, type: event.target.value as AnimeType }))
                }
                className={INPUT_CLASS}
              >
                {['tv', 'movie', 'ova', 'special'].map((item) => (
                  <option key={item} value={item}>
                    {item.toUpperCase()}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="追番状态">
              <select
                value={form.status}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    status: event.target.value as AnimeStatus,
                  }))
                }
                className={INPUT_CLASS}
              >
                {Object.entries(ANIME_STATUS_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="总集数">
              <input
                type="number"
                value={form.episodesTotal}
                onChange={(event) =>
                  setForm((current) => ({ ...current, episodesTotal: event.target.value }))
                }
                className={INPUT_CLASS}
              />
            </Field>
            <Field label="已看集数">
              <input
                type="number"
                value={form.episodesWatched}
                onChange={(event) =>
                  setForm((current) => ({ ...current, episodesWatched: event.target.value }))
                }
                className={INPUT_CLASS}
              />
            </Field>
            <Field label="评分">
              <input
                type="number"
                min="1"
                max="10"
                step="0.1"
                value={form.rating}
                onChange={(event) => setForm((current) => ({ ...current, rating: event.target.value }))}
                className={INPUT_CLASS}
              />
            </Field>
            <Field label="季度 / 开始时间">
              <input
                value={form.startSeason}
                onChange={(event) =>
                  setForm((current) => ({ ...current, startSeason: event.target.value }))
                }
                className={INPUT_CLASS}
                placeholder="2025 春 / 2025-04"
              />
            </Field>
            <Field label="MyAnimeList ID">
              <input
                type="number"
                value={form.malId}
                onChange={(event) => setForm((current) => ({ ...current, malId: event.target.value }))}
                className={INPUT_CLASS}
              />
            </Field>
            <Field label="封面链接" fullWidth>
              <input
                value={form.coverUrl}
                onChange={(event) =>
                  setForm((current) => ({ ...current, coverUrl: event.target.value }))
                }
                className={INPUT_CLASS}
                placeholder="https://example.com/cover.jpg 或 /uploads/images/..."
              />
            </Field>
            <Field label="简评" fullWidth>
              <textarea
                value={form.shortReview}
                onChange={(event) =>
                  setForm((current) => ({ ...current, shortReview: event.target.value }))
                }
                className={TEXTAREA_CLASS}
                rows={5}
              />
            </Field>
          </div>
        </div>

        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleCoverUpload}
        />
      </EditorCard>
    </div>
  )
}

function GameManager() {
  const { data, isLoading, mutate } = useSWR<{ data: GameRecord[]; total: number }>(
    '/api/acg/game?pageSize=200',
    fetcher
  )
  const [form, setForm] = useState<GameFormState>(EMPTY_GAME)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploadingField, setUploadingField] = useState<'cover' | 'cartridge' | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const coverInputRef = useRef<HTMLInputElement>(null)
  const cartridgeInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!data?.data.length || selectedId == null) return
    const current = data.data.find((item) => item.id === selectedId)
    if (current) setForm(toGameForm(current))
  }, [data, selectedId])

  function resetNotice() {
    setError('')
    setSuccess('')
  }

  function startNew() {
    setSelectedId(null)
    setForm(EMPTY_GAME)
    resetNotice()
  }

  async function handleSave() {
    if (!form.title.trim()) {
      setError('游戏标题不能为空。')
      return
    }

    setSaving(true)
    resetNotice()

    try {
      const response = await fetch(form.id ? `/api/acg/game/${form.id}` : '/api/acg/game', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          coverUrl: form.coverUrl.trim() || undefined,
          cartridgeImageUrl: form.cartridgeImageUrl.trim() || undefined,
          platform: form.platform,
          status: form.status,
          playHours: parseOptionalFloat(form.playHours),
          rating: parseOptionalFloat(form.rating),
          shortReview: form.shortReview.trim() || undefined,
          completedAt: form.completedAt ? new Date(form.completedAt).toISOString() : undefined,
        }),
      })

      const payload = response.status === 204 ? null : await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(readApiError(payload, form.id ? '更新失败' : '创建失败'))
      }

      await mutate()
      if (payload?.id) {
        setSelectedId(payload.id)
        setForm(toGameForm(payload))
      }
      setSuccess(form.id ? '游戏已更新。' : '游戏已创建。')
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!form.id) return
    if (!confirm('确定删除这条游戏记录吗？')) return

    setDeleting(true)
    resetNotice()

    try {
      const response = await fetch(`/api/acg/game/${form.id}`, { method: 'DELETE' })
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(readApiError(payload, '删除失败'))
      }

      await mutate()
      startNew()
      setSuccess('游戏记录已删除。')
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败')
    } finally {
      setDeleting(false)
    }
  }

  async function handleImageUpload(
    event: React.ChangeEvent<HTMLInputElement>,
    field: 'cover' | 'cartridge'
  ) {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingField(field)
    resetNotice()

    try {
      const result = await uploadImage(file)
      setForm((current) => ({
        ...current,
        coverUrl: field === 'cover' ? result.url : current.coverUrl,
        cartridgeImageUrl: field === 'cartridge' ? result.url : current.cartridgeImageUrl,
      }))
      setSuccess('图片已上传，记得保存游戏记录。')
    } catch (err) {
      setError(err instanceof Error ? err.message : '图片上传失败')
    } finally {
      setUploadingField(null)
      if (field === 'cover' && coverInputRef.current) coverInputRef.current.value = ''
      if (field === 'cartridge' && cartridgeInputRef.current) cartridgeInputRef.current.value = ''
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
      <LibraryListCard
        title="游戏列表"
        count={data?.total ?? 0}
        isLoading={isLoading}
        emptyText="还没有游戏记录，先新建一条吧。"
      >
        {data?.data.map((game) => (
          <SelectableListItem
            key={game.id}
            active={selectedId === game.id}
            imageUrl={game.cover_url}
            title={game.title}
            subtitle={`${PLATFORM_LABELS[game.platform]} · ${GAME_STATUS_LABELS[game.status]}`}
            meta={
              game.play_hours != null
                ? `${game.play_hours}h · ${game.rating ?? '-'} 分`
                : `${game.rating ?? '-'} 分`
            }
            onClick={() => {
              setSelectedId(game.id)
              setForm(toGameForm(game))
            }}
          />
        ))}
      </LibraryListCard>

      <EditorCard
        title={form.id ? '编辑游戏' : '新建游戏'}
        description="把平台、时长、白金/通关状态、卡带图和简评一起管理起来。"
        onReset={form.id ? startNew : undefined}
        onSave={handleSave}
        saveLabel={form.id ? '保存修改' : '创建游戏'}
        saving={saving}
        onDelete={form.id ? handleDelete : undefined}
        deleting={deleting}
        error={error}
        success={success}
      >
        <div className="grid gap-6 xl:grid-cols-[240px_1fr]">
          <div className="space-y-4">
            <ImageUploadPanel
              label="封面"
              imageUrl={form.coverUrl}
              fallback={form.title || '游'}
              uploading={uploadingField === 'cover'}
              onUpload={() => coverInputRef.current?.click()}
              onClear={() => setForm((current) => ({ ...current, coverUrl: '' }))}
              note="游戏列表和前台翻转卡片会直接使用这张封面。"
            />
            <ImageUploadPanel
              label="卡带 / 副图"
              imageUrl={form.cartridgeImageUrl}
              fallback="副图"
              uploading={uploadingField === 'cartridge'}
              onUpload={() => cartridgeInputRef.current?.click()}
              onClear={() => setForm((current) => ({ ...current, cartridgeImageUrl: '' }))}
              note="用于更丰富的项目展示，比如卡带图、包装图或另一张宣传图。"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="游戏名称">
              <input
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                className={INPUT_CLASS}
              />
            </Field>
            <Field label="平台">
              <select
                value={form.platform}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    platform: event.target.value as GamePlatform,
                  }))
                }
                className={INPUT_CLASS}
              >
                {Object.entries(PLATFORM_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="状态">
              <select
                value={form.status}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    status: event.target.value as GameStatus,
                  }))
                }
                className={INPUT_CLASS}
              >
                {Object.entries(GAME_STATUS_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="游玩时长">
              <input
                type="number"
                min="0"
                step="0.5"
                value={form.playHours}
                onChange={(event) =>
                  setForm((current) => ({ ...current, playHours: event.target.value }))
                }
                className={INPUT_CLASS}
                placeholder="例如 42.5"
              />
            </Field>
            <Field label="评分">
              <input
                type="number"
                min="1"
                max="10"
                step="0.1"
                value={form.rating}
                onChange={(event) => setForm((current) => ({ ...current, rating: event.target.value }))}
                className={INPUT_CLASS}
              />
            </Field>
            <Field label="完成日期">
              <input
                type="date"
                value={form.completedAt}
                onChange={(event) =>
                  setForm((current) => ({ ...current, completedAt: event.target.value }))
                }
                className={INPUT_CLASS}
              />
            </Field>
            <Field label="封面链接" fullWidth>
              <input
                value={form.coverUrl}
                onChange={(event) =>
                  setForm((current) => ({ ...current, coverUrl: event.target.value }))
                }
                className={INPUT_CLASS}
                placeholder="https://example.com/cover.jpg 或 /uploads/images/..."
              />
            </Field>
            <Field label="卡带 / 副图链接" fullWidth>
              <input
                value={form.cartridgeImageUrl}
                onChange={(event) =>
                  setForm((current) => ({ ...current, cartridgeImageUrl: event.target.value }))
                }
                className={INPUT_CLASS}
                placeholder="https://example.com/alt.jpg 或 /uploads/images/..."
              />
            </Field>
            <Field label="简评" fullWidth>
              <textarea
                value={form.shortReview}
                onChange={(event) =>
                  setForm((current) => ({ ...current, shortReview: event.target.value }))
                }
                className={TEXTAREA_CLASS}
                rows={5}
              />
            </Field>
          </div>
        </div>

        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => handleImageUpload(event, 'cover')}
        />
        <input
          ref={cartridgeInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => handleImageUpload(event, 'cartridge')}
        />
      </EditorCard>
    </div>
  )
}

function LibraryListCard({
  title,
  count,
  isLoading,
  emptyText,
  children,
}: {
  title: string
  count: number
  isLoading: boolean
  emptyText: string
  children: React.ReactNode
}) {
  return (
    <Card className="rounded-[28px] border-white/8 bg-card/75 backdrop-blur-xl">
      <CardBody className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
            {count} items
          </span>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-24 animate-pulse rounded-[22px] border border-border bg-background/60"
                />
              ))}
            </div>
          ) : count === 0 ? (
            <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-5 py-12 text-center text-sm text-muted-foreground">
              {emptyText}
            </div>
          ) : (
            children
          )}
        </div>
      </CardBody>
    </Card>
  )
}

function SelectableListItem({
  active,
  imageUrl,
  title,
  subtitle,
  meta,
  onClick,
}: {
  active: boolean
  imageUrl: string | null
  title: string
  subtitle: string
  meta: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-[22px] border px-4 py-4 text-left transition-all duration-200 ${
        active
          ? 'border-ember/30 bg-ember/10 shadow-[0_0_0_1px_rgba(255,138,107,0.12)]'
          : 'border-white/8 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.05]'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-16 w-12 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
          {imageUrl ? (
            <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
          ) : (
            <span className="p-2 text-center text-xs text-muted-foreground">{title}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
          <p className="mt-2 text-[11px] font-mono text-muted-foreground/75">{meta}</p>
        </div>
      </div>
    </button>
  )
}

function EditorCard({
  title,
  description,
  onReset,
  onSave,
  saveLabel,
  saving,
  onDelete,
  deleting,
  error,
  success,
  children,
}: {
  title: string
  description: string
  onReset?: () => void
  onSave: () => void
  saveLabel: string
  saving: boolean
  onDelete?: () => void
  deleting: boolean
  error: string
  success: string
  children: React.ReactNode
}) {
  return (
    <Card className="rounded-[28px] border-white/8 bg-card/75 backdrop-blur-xl">
      <CardBody className="space-y-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-foreground">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="flex items-center gap-3">
            {onReset ? (
              <Button variant="ghost" onClick={onReset}>
                <MaterialSymbol icon="refresh" size={18} />
                切换到新建
              </Button>
            ) : null}
            <Button onClick={onSave} loading={saving}>
              <MaterialSymbol icon="save" size={18} />
              {saveLabel}
            </Button>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {success}
          </div>
        ) : null}

        {children}

        {onDelete ? (
          <div className="flex justify-end">
            <Button variant="ghost" onClick={onDelete} disabled={deleting}>
              <MaterialSymbol icon="delete" size={18} />
              {deleting ? '删除中' : '删除记录'}
            </Button>
          </div>
        ) : null}
      </CardBody>
    </Card>
  )
}

function ImageUploadPanel({
  label,
  imageUrl,
  fallback,
  uploading,
  onUpload,
  onClear,
  note,
}: {
  label: string
  imageUrl: string
  fallback: string
  uploading: boolean
  onUpload: () => void
  onClear: () => void
  note: string
}) {
  return (
    <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
      <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </p>
      <button
        type="button"
        onClick={onUpload}
        className="group mt-4 block w-full rounded-[24px] border border-dashed border-white/12 bg-black/20 p-4 text-left transition-colors hover:border-ember/30 hover:bg-black/30"
      >
        <div className="flex justify-center">
          <div className="flex h-32 w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
            {imageUrl ? (
              <img src={imageUrl} alt={label} className="h-full w-full object-cover" />
            ) : (
              <span className="px-4 text-center text-sm text-muted-foreground">{fallback}</span>
            )}
          </div>
        </div>
        <p className="mt-4 text-center text-sm font-medium text-foreground">
          {uploading ? '上传中...' : '点击上传图片'}
        </p>
        <p className="mt-2 text-center text-xs leading-6 text-muted-foreground">{note}</p>
      </button>

      <div className="mt-4 space-y-2">
        <Button variant="secondary" fullWidth onClick={onUpload} disabled={uploading}>
          <MaterialSymbol icon="image_arrow_up" size={18} />
          {uploading ? '上传中' : '更换图片'}
        </Button>
        <Button variant="ghost" fullWidth onClick={onClear} disabled={!imageUrl}>
          <MaterialSymbol icon="delete" size={18} />
          清空图片
        </Button>
      </div>
    </div>
  )
}

function Field({
  label,
  children,
  fullWidth = false,
}: {
  label: string
  children: React.ReactNode
  fullWidth?: boolean
}) {
  return (
    <label className={`block space-y-2 ${fullWidth ? 'md:col-span-2' : ''}`}>
      <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  )
}

const INPUT_CLASS =
  'h-11 w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 text-sm text-foreground placeholder:text-muted-foreground/45 focus:outline-none focus:ring-2 focus:ring-ocean/40'

const TEXTAREA_CLASS =
  'w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/45 focus:outline-none focus:ring-2 focus:ring-ocean/40'

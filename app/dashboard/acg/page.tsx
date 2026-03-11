/**
 * app/dashboard/acg/page.tsx
 *
 * ACG 陈列室管理 — 动漫 & 游戏 CRUD。
 * 使用 Tab 切换动漫/游戏两个面板。
 */

'use client'

import { useState } from 'react'
import { useAnimes, useGames, useCreateAnime, useCreateGame, useDeleteAnime, useDeleteGame } from '@/features/acg/hooks'
import { Button } from '@/components/ui/Button'
import { AnimeCardSkeleton, GameCardSkeleton } from '@/components/ui/Skeleton'

export default function DashboardAcgPage() {
  const [tab, setTab] = useState<'anime' | 'game'>('anime')

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">ACG 陈列室管理</h1>

      {/* Tab 切换 */}
      <div className="flex gap-2 mb-8">
        {(['anime', 'game'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-sm rounded-base border transition-colors
              ${tab === t
                ? 'bg-ocean text-white border-ocean'
                : 'border-white/10 text-muted-foreground hover:text-foreground'
              }`}
          >
            {t === 'anime' ? '动漫' : '游戏'}
          </button>
        ))}
      </div>

      {tab === 'anime' ? <AnimePanel /> : <GamePanel />}
    </div>
  )
}

// ── 动漫面板 ─────────────────────────────────────────────────

function AnimePanel() {
  const { data, isLoading, mutate } = useAnimes()
  const { trigger: create, isMutating } = useCreateAnime()
  const { trigger: remove } = useDeleteAnime()
  const [title, setTitle] = useState('')

  async function handleAdd() {
    if (!title.trim()) return
    await create({ title })
    setTitle('')
    mutate()
  }

  async function handleDelete(id: number) {
    if (!confirm('确定删除？')) return
    await remove(id)
    mutate()
  }

  return (
    <div>
      {/* 快速添加 */}
      <div className="flex gap-3 mb-6">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="动漫标题（先快速添加，再去编辑细节）"
          className="flex-1 h-9 px-3 rounded-base bg-white/5 border border-white/10
                     text-sm text-foreground placeholder:text-muted-foreground/40
                     focus:outline-none focus:border-ocean/50 transition-colors"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <Button size="sm" loading={isMutating} onClick={handleAdd}>添加</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {isLoading ? (
          Array.from({ length: 12 }).map((_, i) => <AnimeCardSkeleton key={i} />)
        ) : (
          data?.data?.map((anime: { id: number; cover_url: string | null; title: string; title_cn: string | null; status: string; rating: number | null }) => (
            <div key={anime.id} className="group relative rounded-card border border-white/5 overflow-hidden">
              <div className="aspect-[2/3] bg-white/5">
                {anime.cover_url && (
                  <img src={anime.cover_url} alt={anime.title} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="p-2">
                <p className="text-xs font-medium truncate">{anime.title_cn ?? anime.title}</p>
                <p className="text-[10px] text-muted-foreground">{anime.status}</p>
              </div>
              <button
                onClick={() => handleDelete(anime.id)}
                className="absolute top-1 right-1 w-5 h-5 rounded flex items-center justify-center
                           bg-red-500/80 text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
              >×</button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ── 游戏面板 ─────────────────────────────────────────────────

function GamePanel() {
  const { data, isLoading, mutate } = useGames()
  const { trigger: create, isMutating } = useCreateGame()
  const { trigger: remove } = useDeleteGame()
  const [title, setTitle] = useState('')

  async function handleAdd() {
    if (!title.trim()) return
    await create({ title })
    setTitle('')
    mutate()
  }

  async function handleDelete(id: number) {
    if (!confirm('确定删除？')) return
    await remove(id)
    mutate()
  }

  return (
    <div>
      <div className="flex gap-3 mb-6">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="游戏名称"
          className="flex-1 h-9 px-3 rounded-base bg-white/5 border border-white/10
                     text-sm text-foreground placeholder:text-muted-foreground/40
                     focus:outline-none focus:border-ocean/50 transition-colors"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <Button size="sm" loading={isMutating} onClick={handleAdd}>添加</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {isLoading ? (
          Array.from({ length: 10 }).map((_, i) => <GameCardSkeleton key={i} />)
        ) : (
          data?.data?.map((game: { id: number; cover_url: string | null; title: string; platform: string; status: string }) => (
            <div key={game.id} className="group relative rounded-card border border-white/5 overflow-hidden">
              <div className="aspect-square bg-white/5">
                {game.cover_url && (
                  <img src={game.cover_url} alt={game.title} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="p-2">
                <p className="text-xs font-medium truncate">{game.title}</p>
                <p className="text-[10px] text-muted-foreground">{game.platform} · {game.status}</p>
              </div>
              <button
                onClick={() => handleDelete(game.id)}
                className="absolute top-1 right-1 w-5 h-5 rounded flex items-center justify-center
                           bg-red-500/80 text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
              >×</button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

import type { Anime, Game, CreateAnimeInput, UpdateAnimeInput, CreateGameInput, UpdateGameInput } from './types'

export async function fetchAnimes(params: { status?: string; page?: number } = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
  )
  const res = await fetch(`/api/acg/anime?${qs}`)
  if (!res.ok) throw new Error('Failed to fetch animes')
  return res.json() as Promise<{ data: Anime[]; total: number }>
}

export async function createAnime(input: CreateAnimeInput): Promise<Anime> {
  const res = await fetch('/api/acg/anime', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to create anime')
  return res.json()
}

export async function updateAnime(id: number, input: UpdateAnimeInput): Promise<Anime> {
  const res = await fetch(`/api/acg/anime/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to update anime')
  return res.json()
}

export async function deleteAnime(id: number): Promise<void> {
  const res = await fetch(`/api/acg/anime/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete anime')
}

export async function fetchGames(params: { status?: string; platform?: string; page?: number } = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
  )
  const res = await fetch(`/api/acg/game?${qs}`)
  if (!res.ok) throw new Error('Failed to fetch games')
  return res.json() as Promise<{ data: Game[]; total: number }>
}

export async function createGame(input: CreateGameInput): Promise<Game> {
  const res = await fetch('/api/acg/game', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to create game')
  return res.json()
}

export async function updateGame(id: number, input: UpdateGameInput): Promise<Game> {
  const res = await fetch(`/api/acg/game/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to update game')
  return res.json()
}

export async function deleteGame(id: number): Promise<void> {
  const res = await fetch(`/api/acg/game/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete game')
}

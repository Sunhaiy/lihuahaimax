'use client'

import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import { createAnime, updateAnime, deleteAnime, createGame, updateGame, deleteGame } from './api'
import type { CreateAnimeInput, UpdateAnimeInput, CreateGameInput, UpdateGameInput } from './types'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useAnimes(params: { status?: string; page?: number } = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
  )
  return useSWR(`/api/acg/anime?${qs}`, fetcher)
}

export function useCreateAnime() {
  return useSWRMutation('/api/acg/anime', (_url: string, { arg }: { arg: CreateAnimeInput }) =>
    createAnime(arg)
  )
}

export function useUpdateAnime(id: number) {
  return useSWRMutation(`/api/acg/anime/${id}`, (_url: string, { arg }: { arg: UpdateAnimeInput }) =>
    updateAnime(id, arg)
  )
}

export function useDeleteAnime() {
  return useSWRMutation('/api/acg/anime', (_url: string, { arg }: { arg: number }) =>
    deleteAnime(arg)
  )
}

export function useGames(params: { status?: string; platform?: string; page?: number } = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
  )
  return useSWR(`/api/acg/game?${qs}`, fetcher)
}

export function useCreateGame() {
  return useSWRMutation('/api/acg/game', (_url: string, { arg }: { arg: CreateGameInput }) =>
    createGame(arg)
  )
}

export function useUpdateGame(id: number) {
  return useSWRMutation(`/api/acg/game/${id}`, (_url: string, { arg }: { arg: UpdateGameInput }) =>
    updateGame(id, arg)
  )
}

export function useDeleteGame() {
  return useSWRMutation('/api/acg/game', (_url: string, { arg }: { arg: number }) =>
    deleteGame(arg)
  )
}

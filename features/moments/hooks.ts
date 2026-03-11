'use client'

import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import { createMoment, updateMoment, deleteMoment } from './api'
import type { CreateMomentInput, UpdateMomentInput } from './types'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useMoments(params: { page?: number; pageSize?: number; type?: string } = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
  )
  return useSWR(`/api/moments?${qs}`, fetcher)
}

export function useCreateMoment() {
  return useSWRMutation('/api/moments', (_url: string, { arg }: { arg: CreateMomentInput }) =>
    createMoment(arg)
  )
}

export function useUpdateMoment(id: number) {
  return useSWRMutation(`/api/moments/${id}`, (_url: string, { arg }: { arg: UpdateMomentInput }) =>
    updateMoment(id, arg)
  )
}

export function useDeleteMoment() {
  return useSWRMutation('/api/moments', (_url: string, { arg }: { arg: number }) =>
    deleteMoment(arg)
  )
}

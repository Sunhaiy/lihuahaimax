'use client'

import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import { updateGalleryItem, deleteGalleryItem, uploadGalleryImage } from './api'
import type { UpdateGalleryItemInput } from './types'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useGalleryItems(params: { page?: number; pageSize?: number; category?: string; tag?: string } = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
  )
  return useSWR(`/api/gallery?${qs}`, fetcher)
}

export function useUploadImage() {
  return useSWRMutation(
    '/api/upload',
    (_url: string, { arg }: { arg: { file: File; meta?: Parameters<typeof uploadGalleryImage>[1] } }) =>
      uploadGalleryImage(arg.file, arg.meta)
  )
}

export function useUpdateGalleryItem(id: number) {
  return useSWRMutation(
    `/api/gallery/${id}`,
    (_url: string, { arg }: { arg: UpdateGalleryItemInput }) =>
      updateGalleryItem(id, arg)
  )
}

export function useDeleteGalleryItem() {
  return useSWRMutation('/api/gallery', (_url: string, { arg }: { arg: number }) =>
    deleteGalleryItem(arg)
  )
}

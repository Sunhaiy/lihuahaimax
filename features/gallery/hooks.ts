'use client'

import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import {
  createGalleryAlbum,
  deleteGalleryItem,
  fetchGalleryAlbums,
  updateGalleryItem,
  uploadGalleryImage,
} from './api'
import type { CreateGalleryAlbumInput, UpdateGalleryItemInput } from './types'

const fetcher = (url: string) => fetch(url).then((response) => response.json())

export function useGalleryItems(params: {
  page?: number
  pageSize?: number
  category?: string
  tag?: string
  albumId?: number
} = {}) {
  const qs = new URLSearchParams(
    Object.entries(params)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, String(value)])
  )

  return useSWR(`/api/gallery?${qs}`, fetcher)
}

export function useGalleryAlbums() {
  return useSWR('/api/gallery/albums', fetchGalleryAlbums)
}

export function useCreateGalleryAlbum() {
  return useSWRMutation('/api/gallery/albums', (_url: string, { arg }: { arg: CreateGalleryAlbumInput }) =>
    createGalleryAlbum(arg)
  )
}

export function useUploadImage() {
  return useSWRMutation(
    '/api/upload',
    (_url: string, { arg }: { arg: { file: File; meta?: Parameters<typeof uploadGalleryImage>[1] } }) =>
      uploadGalleryImage(arg.file, arg.meta)
  )
}

export function useUpdateGalleryItem(id: number) {
  return useSWRMutation(`/api/gallery/${id}`, (_url: string, { arg }: { arg: UpdateGalleryItemInput }) =>
    updateGalleryItem(id, arg)
  )
}

export function useDeleteGalleryItem() {
  return useSWRMutation('/api/gallery', (_url: string, { arg }: { arg: number }) => deleteGalleryItem(arg))
}

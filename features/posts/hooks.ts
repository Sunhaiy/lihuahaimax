/**
 * features/posts/hooks.ts
 *
 * 文章模块 SWR 数据获取 Hooks。
 * 禁止在 Hook 内直接写 SQL，统一通过 api.ts 对接后端接口。
 */

'use client'

import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import { fetchPosts, fetchPostBySlug, createPost, updatePost, deletePost } from './api'
import type { PostQueryParams, CreatePostInput, UpdatePostInput } from './types'

const fetcher = (key: string) => fetch(key).then((r) => r.json())

export function usePosts(params: PostQueryParams = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
  )
  return useSWR(`/api/posts?${qs}`, fetcher)
}

export function usePost(slug: string | null) {
  return useSWR(slug ? `/api/posts/${slug}` : null, fetcher)
}

export function useCreatePost() {
  return useSWRMutation('/api/posts', (_url: string, { arg }: { arg: CreatePostInput }) =>
    createPost(arg)
  )
}

export function useUpdatePost(id: number) {
  return useSWRMutation(`/api/posts/${id}`, (_url: string, { arg }: { arg: UpdatePostInput }) =>
    updatePost(id, arg)
  )
}

export function useDeletePost() {
  return useSWRMutation('/api/posts', (_url: string, { arg }: { arg: number }) =>
    deletePost(arg)
  )
}

// 公开导出方便 Server Components 直接调用
export { fetchPosts, fetchPostBySlug }

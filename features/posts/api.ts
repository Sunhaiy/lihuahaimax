/**
 * features/posts/api.ts
 *
 * 文章模块客户端 API 请求函数。
 * 对接 /api/posts/* 接口。
 */

import type { Post, PostListItem, PaginatedResult, PostQueryParams, CreatePostInput, UpdatePostInput } from './types'

const BASE = '/api/posts'

export async function fetchPosts(params: PostQueryParams = {}): Promise<PaginatedResult<PostListItem>> {
  const qs = new URLSearchParams()
  if (params.page) qs.set('page', String(params.page))
  if (params.pageSize) qs.set('pageSize', String(params.pageSize))
  if (params.status) qs.set('status', params.status)
  if (params.tag) qs.set('tag', params.tag)
  if (params.category) qs.set('category', params.category)
  if (params.keyword) qs.set('keyword', params.keyword)

  const res = await fetch(`${BASE}?${qs}`)
  if (!res.ok) throw new Error('Failed to fetch posts')
  return res.json()
}

export async function fetchPostBySlug(slug: string): Promise<Post> {
  const res = await fetch(`${BASE}/${slug}`)
  if (!res.ok) throw new Error(`Post not found: ${slug}`)
  return res.json()
}

export async function createPost(input: CreatePostInput): Promise<Post> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    const msg = typeof data?.error === 'string' ? data.error : JSON.stringify(data?.error ?? '创建失败')
    throw new Error(msg)
  }
  return res.json()
}

export async function updatePost(id: number, input: UpdatePostInput): Promise<Post> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    const msg = typeof data?.error === 'string' ? data.error : JSON.stringify(data?.error ?? '更新失败')
    throw new Error(msg)
  }
  return res.json()
}

export async function deletePost(id: number): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete post')
}

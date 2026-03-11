import type { Moment, CreateMomentInput, UpdateMomentInput } from './types'

const BASE = '/api/moments'

export async function fetchMoments(params: { page?: number; pageSize?: number; type?: string } = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
  )
  const res = await fetch(`${BASE}?${qs}`)
  if (!res.ok) throw new Error('Failed to fetch moments')
  return res.json() as Promise<{ data: Moment[]; total: number }>
}

export async function createMoment(input: CreateMomentInput): Promise<Moment> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to create moment')
  return res.json()
}

export async function updateMoment(id: number, input: UpdateMomentInput): Promise<Moment> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to update moment')
  return res.json()
}

export async function deleteMoment(id: number): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete moment')
}

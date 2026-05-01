/**
 * lib/db/dao/worksDao.ts
 *
 * 作品 / 项目数据访问层。
 */

import { query } from '@/lib/db'
import { slugify } from '@/lib/slugify'
import type {
  WorkContributor,
  WorkDetail,
  WorkInput,
  WorkListItem,
  WorkMilestone,
} from '@/types/work'

interface WorkDbRow {
  id: number
  slug: string
  title: string
  subtitle: string | null
  summary: string | null
  description: string | null
  content: string | null
  cover_url: string
  hero_image_url: string
  seal: string | null
  status_text: string | null
  progress_text: string | null
  version_text: string | null
  price: string | null
  original_price: string | null
  tags: string[] | null
  url: string | null
  github_url: string | null
  primary_url: string | null
  primary_label: string | null
  secondary_url: string | null
  secondary_label: string | null
  year: number | null
  sort_order: number
  is_published: boolean
  contributors_json: WorkContributor[] | null
  milestones_json: WorkMilestone[] | null
  gallery_json: string[] | null
  created_at: Date | string
  updated_at: Date | string
}

function toIsoString(value: Date | string) {
  return value instanceof Date ? value.toISOString() : value
}

function normalizeContributors(value: WorkContributor[] | null | undefined): WorkContributor[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item) => item && typeof item === 'object')
    .map((item) => ({
      name: typeof item.name === 'string' ? item.name : '',
      role: typeof item.role === 'string' ? item.role : 'Member',
      avatar_url: typeof item.avatar_url === 'string' ? item.avatar_url : null,
    }))
    .filter((item) => item.name.trim().length > 0)
}

function normalizeMilestones(value: WorkMilestone[] | null | undefined): WorkMilestone[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item) => item && typeof item === 'object')
    .map((item) => ({
      date: typeof item.date === 'string' ? item.date : '',
      title: typeof item.title === 'string' ? item.title : '',
      desc: typeof item.desc === 'string' ? item.desc : '',
      link: typeof item.link === 'string' ? item.link : null,
    }))
    .filter((item) => item.title.trim().length > 0)
}

function normalizeGallery(value: string[] | null | undefined): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item) => typeof item === 'string' && item.trim().length > 0)
}

function mapWorkRow(row: WorkDbRow): WorkDetail {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    summary: row.summary,
    description: row.description,
    content: row.content,
    cover_url: row.cover_url,
    hero_image_url: row.hero_image_url || row.cover_url,
    seal: row.seal,
    status_text: row.status_text,
    progress_text: row.progress_text,
    version_text: row.version_text,
    price: row.price,
    original_price: row.original_price,
    tags: row.tags ?? [],
    url: row.url,
    github_url: row.github_url,
    primary_url: row.primary_url,
    primary_label: row.primary_label,
    secondary_url: row.secondary_url,
    secondary_label: row.secondary_label,
    year: row.year,
    sort_order: row.sort_order,
    is_published: row.is_published,
    contributors: normalizeContributors(row.contributors_json),
    milestones: normalizeMilestones(row.milestones_json),
    gallery: normalizeGallery(row.gallery_json),
    created_at: toIsoString(row.created_at),
    updated_at: toIsoString(row.updated_at),
  }
}

function toWorkListItem(work: WorkDetail): WorkListItem {
  return {
    id: work.id,
    slug: work.slug,
    title: work.title,
    subtitle: work.subtitle,
    summary: work.summary,
    description: work.description,
    cover_url: work.cover_url,
    hero_image_url: work.hero_image_url,
    tags: work.tags,
    url: work.url,
    github_url: work.github_url,
    primary_url: work.primary_url,
    primary_label: work.primary_label,
    secondary_url: work.secondary_url,
    secondary_label: work.secondary_label,
    year: work.year,
    sort_order: work.sort_order,
    is_published: work.is_published,
    created_at: work.created_at,
    updated_at: work.updated_at,
  }
}

function buildInsertPayload(input: WorkInput) {
  const coverUrl = input.cover_url ?? ''
  const primaryUrl = input.primary_url ?? input.url ?? null
  const secondaryUrl = input.secondary_url ?? input.github_url ?? null

  return {
    slug: slugify(input.slug ?? input.title),
    title: input.title,
    subtitle: input.subtitle ?? null,
    summary: input.summary ?? input.description ?? null,
    description: input.description ?? null,
    content: input.content ?? null,
    cover_url: coverUrl,
    hero_image_url: input.hero_image_url ?? coverUrl,
    seal: input.seal ?? null,
    status_text: input.status_text ?? null,
    progress_text: input.progress_text ?? null,
    version_text: input.version_text ?? null,
    price: input.price ?? null,
    original_price: input.original_price ?? null,
    tags: input.tags ?? [],
    url: input.url ?? null,
    github_url: input.github_url ?? null,
    primary_url: primaryUrl,
    primary_label: input.primary_label ?? (primaryUrl ? '查看详情' : null),
    secondary_url: secondaryUrl,
    secondary_label: input.secondary_label ?? (secondaryUrl ? '源码 / 外链' : null),
    year: input.year ?? null,
    sort_order: input.sort_order ?? 0,
    is_published: input.is_published ?? true,
    contributors: normalizeContributors(input.contributors),
    milestones: normalizeMilestones(input.milestones),
    gallery: normalizeGallery(input.gallery),
  }
}

export async function findWorks(options?: { includeUnpublished?: boolean }): Promise<WorkListItem[]> {
  const includeUnpublished = options?.includeUnpublished ?? false
  const result = await query<WorkDbRow>(
    `SELECT * FROM works
     ${includeUnpublished ? '' : 'WHERE is_published = TRUE'}
     ORDER BY sort_order ASC, created_at DESC`
  )

  return result.rows.map((row) => toWorkListItem(mapWorkRow(row)))
}

export async function findWorkDetails(options?: { includeUnpublished?: boolean }): Promise<WorkDetail[]> {
  const includeUnpublished = options?.includeUnpublished ?? false
  const result = await query<WorkDbRow>(
    `SELECT * FROM works
     ${includeUnpublished ? '' : 'WHERE is_published = TRUE'}
     ORDER BY sort_order ASC, created_at DESC`
  )

  return result.rows.map(mapWorkRow)
}

export async function findWorkById(id: number): Promise<WorkDetail | null> {
  const result = await query<WorkDbRow>(
    `SELECT * FROM works WHERE id = $1`,
    [id]
  )
  return result.rows[0] ? mapWorkRow(result.rows[0]) : null
}

export async function findWorkBySlug(
  slug: string,
  options?: { includeUnpublished?: boolean }
): Promise<WorkDetail | null> {
  const includeUnpublished = options?.includeUnpublished ?? false
  const result = await query<WorkDbRow>(
    `SELECT * FROM works
     WHERE slug = $1
       ${includeUnpublished ? '' : 'AND is_published = TRUE'}
     LIMIT 1`,
    [slug]
  )
  return result.rows[0] ? mapWorkRow(result.rows[0]) : null
}

export async function insertWork(input: WorkInput): Promise<WorkDetail> {
  const payload = buildInsertPayload(input)
  const result = await query<WorkDbRow>(
    `INSERT INTO works (
      slug, title, subtitle, summary, description, content, cover_url, hero_image_url,
      seal, status_text, progress_text, version_text, price, original_price,
      tags, url, github_url, primary_url, primary_label, secondary_url, secondary_label,
      year, sort_order, is_published, contributors_json, milestones_json, gallery_json
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8,
      $9, $10, $11, $12, $13, $14,
      $15, $16, $17, $18, $19, $20, $21,
      $22, $23, $24, $25, $26, $27
    )
    RETURNING *`,
    [
      payload.slug,
      payload.title,
      payload.subtitle,
      payload.summary,
      payload.description,
      payload.content,
      payload.cover_url,
      payload.hero_image_url,
      payload.seal,
      payload.status_text,
      payload.progress_text,
      payload.version_text,
      payload.price,
      payload.original_price,
      payload.tags,
      payload.url,
      payload.github_url,
      payload.primary_url,
      payload.primary_label,
      payload.secondary_url,
      payload.secondary_label,
      payload.year,
      payload.sort_order,
      payload.is_published,
      JSON.stringify(payload.contributors),
      JSON.stringify(payload.milestones),
      JSON.stringify(payload.gallery),
    ]
  )
  return mapWorkRow(result.rows[0])
}

export async function updateWork(id: number, input: Partial<WorkInput>): Promise<WorkDetail | null> {
  const setClauses: string[] = []
  const values: unknown[] = []
  let index = 1

  function setField(column: string, value: unknown) {
    setClauses.push(`${column} = $${index++}`)
    values.push(value)
  }

  if (input.slug !== undefined) setField('slug', slugify(input.slug || 'work'))
  if (input.title !== undefined) setField('title', input.title)
  if (input.subtitle !== undefined) setField('subtitle', input.subtitle ?? null)
  if (input.summary !== undefined) setField('summary', input.summary ?? null)
  if (input.description !== undefined) setField('description', input.description ?? null)
  if (input.content !== undefined) setField('content', input.content ?? null)
  if (input.cover_url !== undefined) setField('cover_url', input.cover_url)
  if (input.hero_image_url !== undefined) setField('hero_image_url', input.hero_image_url)
  if (input.seal !== undefined) setField('seal', input.seal ?? null)
  if (input.status_text !== undefined) setField('status_text', input.status_text ?? null)
  if (input.progress_text !== undefined) setField('progress_text', input.progress_text ?? null)
  if (input.version_text !== undefined) setField('version_text', input.version_text ?? null)
  if (input.price !== undefined) setField('price', input.price ?? null)
  if (input.original_price !== undefined) setField('original_price', input.original_price ?? null)
  if (input.tags !== undefined) setField('tags', input.tags ?? [])
  if (input.url !== undefined) setField('url', input.url ?? null)
  if (input.github_url !== undefined) setField('github_url', input.github_url ?? null)
  if (input.primary_url !== undefined) setField('primary_url', input.primary_url ?? null)
  if (input.primary_label !== undefined) setField('primary_label', input.primary_label ?? null)
  if (input.secondary_url !== undefined) setField('secondary_url', input.secondary_url ?? null)
  if (input.secondary_label !== undefined) setField('secondary_label', input.secondary_label ?? null)
  if (input.year !== undefined) setField('year', input.year ?? null)
  if (input.sort_order !== undefined) setField('sort_order', input.sort_order ?? 0)
  if (input.is_published !== undefined) setField('is_published', input.is_published)
  if (input.contributors !== undefined) {
    setField('contributors_json', JSON.stringify(normalizeContributors(input.contributors)))
  }
  if (input.milestones !== undefined) {
    setField('milestones_json', JSON.stringify(normalizeMilestones(input.milestones)))
  }
  if (input.gallery !== undefined) {
    setField('gallery_json', JSON.stringify(normalizeGallery(input.gallery)))
  }

  if (setClauses.length === 0) {
    return findWorkById(id)
  }

  values.push(id)
  const result = await query<WorkDbRow>(
    `UPDATE works
     SET ${setClauses.join(', ')}
     WHERE id = $${index}
     RETURNING *`,
    values
  )

  return result.rows[0] ? mapWorkRow(result.rows[0]) : null
}

export async function deleteWork(id: number): Promise<boolean> {
  const result = await query(
    `DELETE FROM works WHERE id = $1`,
    [id]
  )
  return (result.rowCount ?? 0) > 0
}

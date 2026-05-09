import { revalidateTag } from 'next/cache'
import { query, withTransaction } from '@/lib/db'
import type { LinkCategoryRow } from '@/types/link'

const LINKS_TAG = 'links'
const DEFAULT_LINK_CATEGORY = 'friend'

type LinkCategoryInsert = {
  label: string
  slug?: string
  description?: string
  icon?: string
}

function slugifyCategory(value: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalized || 'group'
}

async function createUniqueSlug(baseValue: string) {
  const base = slugifyCategory(baseValue)
  let slug = base
  let suffix = 2

  while (true) {
    const result = await query<{ slug: string }>(
      'SELECT slug FROM link_categories WHERE slug = $1',
      [slug]
    )
    if (!result.rowCount) return slug

    slug = `${base}-${suffix++}`
  }
}

export async function findLinkCategories(): Promise<LinkCategoryRow[]> {
  const result = await query<LinkCategoryRow>(
    `SELECT
       category.slug,
       category.label,
       category.description,
       category.icon,
       category.sort_order,
       category.is_default,
       category.created_at,
       COUNT(link.id)::int AS link_count
     FROM link_categories category
     LEFT JOIN links link ON link.category = category.slug
     GROUP BY
       category.slug,
       category.label,
       category.description,
       category.icon,
       category.sort_order,
       category.is_default,
       category.created_at
     ORDER BY category.sort_order ASC, category.created_at ASC, category.label ASC`
  )

  return result.rows
}

export async function insertLinkCategory(input: LinkCategoryInsert): Promise<LinkCategoryRow> {
  const label = input.label.trim()
  const slug = await createUniqueSlug(input.slug || label)
  const sortResult = await query<{ next_sort: number }>(
    'SELECT COALESCE(MAX(sort_order), 0) + 10 AS next_sort FROM link_categories'
  )
  const nextSort = Number(sortResult.rows[0]?.next_sort ?? 10)

  const result = await query<LinkCategoryRow>(
    `INSERT INTO link_categories (slug, label, description, icon, sort_order)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING
       slug,
       label,
       description,
       icon,
       sort_order,
       is_default,
       created_at,
       0::int AS link_count`,
    [
      slug,
      label,
      input.description?.trim() || null,
      input.icon?.trim() || 'link',
      nextSort,
    ]
  )

  revalidateTag(LINKS_TAG)
  return result.rows[0]
}

export async function deleteLinkCategory(
  slug: string
): Promise<{ deleted: boolean; moved: number }> {
  if (slug === DEFAULT_LINK_CATEGORY) return { deleted: false, moved: 0 }

  const result = await withTransaction(async (client) => {
    const categoryResult = await client.query<{ is_default: boolean }>(
      'SELECT is_default FROM link_categories WHERE slug = $1',
      [slug]
    )
    const category = categoryResult.rows[0]
    if (!category || category.is_default) return { deleted: false, moved: 0 }

    const movedResult = await client.query(
      'UPDATE links SET category = $1 WHERE category = $2',
      [DEFAULT_LINK_CATEGORY, slug]
    )
    const deletedResult = await client.query(
      'DELETE FROM link_categories WHERE slug = $1',
      [slug]
    )

    return {
      deleted: (deletedResult.rowCount ?? 0) > 0,
      moved: movedResult.rowCount ?? 0,
    }
  })

  revalidateTag(LINKS_TAG)
  return result
}

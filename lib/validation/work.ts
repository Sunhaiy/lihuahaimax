import { z } from 'zod'

function isUrl(value: string | null | undefined) {
  if (!value) return true
  if (value.startsWith('/')) return true
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

const contributorSchema = z.object({
  name: z.string().trim().min(1).max(80),
  role: z.string().trim().max(80).optional().nullable().transform((value) => value ?? null),
  avatar_url: z.string().trim().optional().nullable().transform((value) => value ?? null),
})

const milestoneSchema = z.object({
  date: z.string().trim().max(40).optional().default(''),
  title: z.string().trim().min(1).max(120),
  desc: z.string().trim().max(500).optional().default(''),
  link: z.string().trim().optional().nullable().transform((value) => value ?? null),
})

const workSchemaBase = z.object({
  slug: z.string().trim().min(1).max(140).optional(),
  title: z.string().trim().min(1).max(140),
  subtitle: z.string().trim().max(200).optional().nullable(),
  summary: z.string().trim().max(600).optional().nullable(),
  description: z.string().trim().max(1200).optional().nullable(),
  content: z.string().trim().max(12000).optional().nullable(),
  cover_url: z.string().trim().optional().default(''),
  hero_image_url: z.string().trim().optional().default(''),
  seal: z.string().trim().max(40).optional().nullable(),
  status_text: z.string().trim().max(80).optional().nullable(),
  progress_text: z.string().trim().max(80).optional().nullable(),
  version_text: z.string().trim().max(80).optional().nullable(),
  price: z.string().trim().max(40).optional().nullable(),
  original_price: z.string().trim().max(40).optional().nullable(),
  tags: z.array(z.string().trim().min(1).max(40)).optional().default([]),
  url: z.string().trim().optional().nullable(),
  github_url: z.string().trim().optional().nullable(),
  primary_url: z.string().trim().optional().nullable(),
  primary_label: z.string().trim().max(40).optional().nullable(),
  secondary_url: z.string().trim().optional().nullable(),
  secondary_label: z.string().trim().max(40).optional().nullable(),
  year: z.number().int().min(2000).max(2100).optional().nullable(),
  sort_order: z.number().int().min(0).max(9999).optional().default(0),
  is_published: z.boolean().optional().default(true),
  contributors: z.array(contributorSchema).optional().default([]),
  milestones: z.array(milestoneSchema).optional().default([]),
  gallery: z.array(z.string().trim()).optional().default([]),
})

function validateUrls(
  value: Partial<z.infer<typeof workSchemaBase>>,
  ctx: z.RefinementCtx
) {
  const urlFields = [
    ['cover_url', value.cover_url],
    ['hero_image_url', value.hero_image_url],
    ['url', value.url],
    ['github_url', value.github_url],
    ['primary_url', value.primary_url],
    ['secondary_url', value.secondary_url],
    ...(value.contributors ?? []).map((item, index) => [`contributors.${index}.avatar_url`, item.avatar_url] as const),
    ...(value.milestones ?? []).map((item, index) => [`milestones.${index}.link`, item.link] as const),
    ...(value.gallery ?? []).map((item, index) => [`gallery.${index}`, item] as const),
  ]

  for (const [field, raw] of urlFields) {
    if (!field) continue
    if (!isUrl(raw)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${field} must be a valid URL`,
        path: field.split('.'),
      })
    }
  }
}

export const workSchema = workSchemaBase.superRefine(validateUrls)
export const updateWorkSchema = workSchemaBase.partial().superRefine(validateUrls)

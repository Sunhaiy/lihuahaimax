import { z } from 'zod'

function isAbsoluteUrl(value: string) {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

function isUploadOrAbsoluteUrl(value: string) {
  if (value.startsWith('/')) return true
  return isAbsoluteUrl(value)
}

const emailSchema = z.string().email()

export const siteProfileSchema = z.object({
  siteName: z.string().trim().min(1).max(80),
  siteNameEn: z.string().trim().max(120).default(''),
  ownerName: z.string().trim().min(1).max(80),
  ownerInitial: z.string().trim().max(8).default(''),
  themeColor: z
    .string()
    .trim()
    .regex(/^#([0-9a-fA-F]{6})$/, 'Invalid theme color')
    .default('#10b981'),
  slogan: z.string().trim().max(120).default(''),
  roleLine: z.string().trim().max(120).default(''),
  bio: z.string().trim().max(400).default(''),
  avatarUrl: z
    .string()
    .trim()
    .refine((value) => !value || isUploadOrAbsoluteUrl(value), 'Invalid avatar URL')
    .nullable()
    .optional(),
  defaultPostCoverUrl: z
    .string()
    .trim()
    .refine((value) => !value || isUploadOrAbsoluteUrl(value), 'Invalid default post cover URL')
    .nullable()
    .optional(),
  gamesHeroImageUrl: z
    .string()
    .trim()
    .refine((value) => !value || isUploadOrAbsoluteUrl(value), 'Invalid games hero image URL')
    .nullable()
    .optional(),
  siteUrl: z
    .string()
    .trim()
    .refine((value) => !value || isAbsoluteUrl(value), 'Invalid site URL')
    .default(''),
  rssUrl: z
    .string()
    .trim()
    .refine((value) => !value || isUploadOrAbsoluteUrl(value), 'Invalid RSS URL')
    .default(''),
  friendLinkIntro: z.string().trim().max(260).default(''),
  friendLinkRequirements: z.string().trim().max(1000).default(''),
  githubUrl: z
    .string()
    .trim()
    .refine((value) => !value || isAbsoluteUrl(value), 'Invalid GitHub URL')
    .default(''),
  email: z
    .string()
    .trim()
    .refine((value) => !value || emailSchema.safeParse(value).success, 'Invalid email')
    .default(''),
  footerText: z.string().trim().max(140).default(''),
})

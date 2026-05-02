import { cache } from 'react'
import { SETTINGS_KEYS } from '@/lib/constants/settings'
import { getSettings, setSetting } from '@/lib/db/dao/settingsDao'
import type { SiteProfile } from '@/types/site'

export const DEFAULT_SITE_PROFILE: SiteProfile = {
  siteName: '梨花海',
  siteNameEn: 'LIHUA HAI',
  ownerName: '梨花海',
  ownerInitial: '梨',
  slogan: '极客视角的个人数字中枢',
  roleLine: '极客 · 二次元 · 代码诗人',
  bio: '热爱 coding，追番打游戏，记录凌晨 3 点的一切。',
  avatarUrl: null,
  githubUrl: 'https://github.com',
  email: 'hello@lihuahai.dev',
  footerText: '用代码记录生活',
}

function cleanText(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function cleanOptionalUrl(value: unknown) {
  const next = cleanText(value)
  return next || null
}

function firstCharacter(value: string) {
  return Array.from(value.trim())[0] ?? DEFAULT_SITE_PROFILE.ownerInitial
}

function looksAsciiLabel(value: string) {
  return /^[\x00-\x7F]+$/.test(value)
}

export function normalizeSiteProfile(input?: Partial<SiteProfile> | null): SiteProfile {
  const source = input ?? {}
  const siteName = cleanText(source.siteName) || DEFAULT_SITE_PROFILE.siteName
  const ownerName = cleanText(source.ownerName) || siteName || DEFAULT_SITE_PROFILE.ownerName
  const ownerInitial = cleanText(source.ownerInitial) || firstCharacter(ownerName || siteName)

  return {
    siteName,
    siteNameEn: cleanText(source.siteNameEn) || DEFAULT_SITE_PROFILE.siteNameEn,
    ownerName,
    ownerInitial,
    slogan: cleanText(source.slogan) || DEFAULT_SITE_PROFILE.slogan,
    roleLine: cleanText(source.roleLine) || DEFAULT_SITE_PROFILE.roleLine,
    bio: cleanText(source.bio) || DEFAULT_SITE_PROFILE.bio,
    avatarUrl: cleanOptionalUrl(source.avatarUrl),
    githubUrl: cleanText(source.githubUrl) || DEFAULT_SITE_PROFILE.githubUrl,
    email: cleanText(source.email) || DEFAULT_SITE_PROFILE.email,
    footerText: cleanText(source.footerText) || DEFAULT_SITE_PROFILE.footerText,
  }
}

function fromLegacySettings(legacyName: string, legacyValues: Partial<SiteProfile>): Partial<SiteProfile> {
  const trimmedName = legacyName.trim()

  if (!trimmedName) {
    return legacyValues
  }

  if (looksAsciiLabel(trimmedName)) {
    return {
      ...legacyValues,
      siteName: DEFAULT_SITE_PROFILE.siteName,
      siteNameEn: legacyValues.siteNameEn || trimmedName,
      ownerName: legacyValues.ownerName || DEFAULT_SITE_PROFILE.ownerName,
    }
  }

  return {
    ...legacyValues,
    siteName: legacyValues.siteName || trimmedName,
    ownerName: legacyValues.ownerName || trimmedName,
  }
}

export const getSiteProfile = cache(async (): Promise<SiteProfile> => {
  const settings = await getSettings<Partial<SiteProfile> | string | null>([
    SETTINGS_KEYS.SITE_PROFILE,
    SETTINGS_KEYS.SITE_NAME,
    SETTINGS_KEYS.SITE_SLOGAN,
    SETTINGS_KEYS.SITE_BIO,
    SETTINGS_KEYS.SITE_AVATAR,
    SETTINGS_KEYS.SITE_GITHUB,
    SETTINGS_KEYS.SITE_EMAIL,
  ])

  const profileSetting = settings[SETTINGS_KEYS.SITE_PROFILE] as Partial<SiteProfile> | null
  const siteName = settings[SETTINGS_KEYS.SITE_NAME]
  const slogan = settings[SETTINGS_KEYS.SITE_SLOGAN]
  const bio = settings[SETTINGS_KEYS.SITE_BIO]
  const avatar = settings[SETTINGS_KEYS.SITE_AVATAR]
  const github = settings[SETTINGS_KEYS.SITE_GITHUB]
  const email = settings[SETTINGS_KEYS.SITE_EMAIL]

  const legacyValues = fromLegacySettings(cleanText(siteName), {
    slogan: cleanText(slogan),
    bio: cleanText(bio),
    avatarUrl: cleanText(avatar ?? ''),
    githubUrl: cleanText(github),
    email: cleanText(email),
  })

  return normalizeSiteProfile({
    ...legacyValues,
    ...(profileSetting ?? {}),
  })
})

export async function persistSiteProfile(profile: SiteProfile) {
  const normalized = normalizeSiteProfile(profile)

  await Promise.all([
    setSetting(SETTINGS_KEYS.SITE_PROFILE, normalized, 'Global site profile settings'),
    setSetting(SETTINGS_KEYS.SITE_NAME, normalized.siteName, 'Site name'),
    setSetting(SETTINGS_KEYS.SITE_SLOGAN, normalized.slogan, 'Site slogan'),
    setSetting(SETTINGS_KEYS.SITE_BIO, normalized.bio, 'Short biography'),
    setSetting(SETTINGS_KEYS.SITE_AVATAR, normalized.avatarUrl, 'Avatar URL'),
    setSetting(SETTINGS_KEYS.SITE_GITHUB, normalized.githubUrl, 'GitHub profile URL'),
    setSetting(SETTINGS_KEYS.SITE_EMAIL, normalized.email, 'Contact email'),
  ])

  return normalized
}

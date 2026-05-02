/**
 * lib/constants/settings.ts
 *
 * 应用设置键常量 — 禁止硬编码字符串。
 */

export const SETTINGS_KEYS = {
  SITE_NAME: 'site.name',
  SITE_SLOGAN: 'site.slogan',
  SITE_BIO: 'site.bio',
  SITE_AVATAR: 'site.avatar',
  SITE_GITHUB: 'site.github',
  SITE_EMAIL: 'site.email',
  SITE_PROFILE: 'site.profile',
  HERO_BG: 'site.hero_bg',
  BACKGROUND_SCENE: 'site.background_scene',
} as const

export type SettingsKey = typeof SETTINGS_KEYS[keyof typeof SETTINGS_KEYS]

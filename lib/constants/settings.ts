/**
 * 应用设置键常量。
 * 统一从这里引用，避免在业务代码里散落硬编码字符串。
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
  ADMIN_CREDENTIALS: 'auth.admin_credentials',
  DEEPSEEK_CONFIG: 'ai.deepseek_config',
} as const

export type SettingsKey = typeof SETTINGS_KEYS[keyof typeof SETTINGS_KEYS]

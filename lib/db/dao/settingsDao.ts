/**
 * lib/db/dao/settingsDao.ts
 *
 * 设置数据访问层 — Hero 背景图等站点配置。
 */

import { query } from '@/lib/db'

export interface SettingsRecord<T = unknown> {
  key: string
  value: T
  description: string | null
  updated_at: string
}

export async function getSetting<T = Record<string, unknown>>(key: string): Promise<T | null> {
  const result = await query<SettingsRecord<T>>('SELECT value FROM settings WHERE key = $1', [key])
  return result.rows[0]?.value ?? null
}

export async function setSetting<T>(
  key: string,
  value: T,
  description?: string
): Promise<SettingsRecord<T>> {
  const result = await query<SettingsRecord<T>>(
    `INSERT INTO settings (key, value, description, updated_at)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (key) DO UPDATE
     SET value = $2, description = COALESCE($3, settings.description), updated_at = NOW()
     RETURNING *`,
    [key, JSON.stringify(value), description ?? null]
  )
  return result.rows[0]
}

export async function deleteSetting(key: string): Promise<boolean> {
  const result = await query('DELETE FROM settings WHERE key = $1', [key])
  return (result.rowCount ?? 0) > 0
}

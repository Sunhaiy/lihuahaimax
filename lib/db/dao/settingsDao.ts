/**
 * lib/db/dao/settingsDao.ts
 *
 * 设置数据访问层 — Hero 背景图等站点配置。
 */

import { query } from '@/lib/db'

export interface SettingsRecord {
  key: string
  value: Record<string, unknown>
  description: string | null
  updated_at: string
}

export async function getSetting(key: string): Promise<Record<string, unknown> | null> {
  const result = await query<SettingsRecord>('SELECT value FROM settings WHERE key = $1', [key])
  return result.rows[0]?.value ?? null
}

export async function setSetting(
  key: string,
  value: Record<string, unknown>,
  description?: string
): Promise<SettingsRecord> {
  const result = await query<SettingsRecord>(
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

import { revalidateTag, unstable_cache } from 'next/cache'
import { query } from '@/lib/db'

const SETTINGS_TAG = 'settings'
let settingsAllMemory: Promise<Record<string, unknown | null>> | null = null
const settingsSingleMemory = new Map<string, Promise<unknown | null>>()
const settingsBatchMemory = new Map<string, Promise<Record<string, unknown | null>>>()

export interface SettingsRecord<T = unknown> {
  key: string
  value: T
  description: string | null
  updated_at: string
}

const getAllSettingsCached = unstable_cache(
  async (): Promise<Record<string, unknown | null>> => {
    const result = await query<{ key: string; value: unknown }>(
      'SELECT key, value FROM settings'
    )

    return Object.fromEntries(result.rows.map((row) => [row.key, row.value ?? null]))
  },
  ['settings-all'],
  {
    revalidate: 300,
    tags: [SETTINGS_TAG],
  }
)

async function getAllSettingsSnapshot() {
  if (!settingsAllMemory) {
    settingsAllMemory = getAllSettingsCached()
  }

  return settingsAllMemory
}

export async function getSetting<T = Record<string, unknown>>(key: string): Promise<T | null> {
  if (!settingsSingleMemory.has(key)) {
    settingsSingleMemory.set(
      key,
      getAllSettingsSnapshot().then((settings) => (settings[key] ?? null) as T | null)
    )
  }

  return settingsSingleMemory.get(key)! as Promise<T | null>
}

export async function getSettings<T = unknown>(keys: string[]): Promise<Record<string, T | null>> {
  const serializedKeys = JSON.stringify([...keys].sort())

  if (!settingsBatchMemory.has(serializedKeys)) {
    settingsBatchMemory.set(
      serializedKeys,
      getAllSettingsSnapshot().then((settings) => {
        const result = Object.fromEntries(
          keys.map((key) => [key, (settings[key] ?? null) as T | null])
        ) as Record<string, T | null>
        return result
      })
    )
  }

  return settingsBatchMemory.get(serializedKeys)! as Promise<Record<string, T | null>>
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

  revalidateTag(SETTINGS_TAG)
  settingsAllMemory = null
  settingsSingleMemory.clear()
  settingsBatchMemory.clear()
  return result.rows[0]
}

export async function deleteSetting(key: string): Promise<boolean> {
  const result = await query('DELETE FROM settings WHERE key = $1', [key])
  revalidateTag(SETTINGS_TAG)
  settingsAllMemory = null
  settingsSingleMemory.clear()
  settingsBatchMemory.clear()
  return (result.rowCount ?? 0) > 0
}

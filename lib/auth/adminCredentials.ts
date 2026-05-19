import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'
import { z } from 'zod'
import { getSetting, setSetting } from '@/lib/db/dao/settingsDao'
import { SETTINGS_KEYS } from '@/lib/constants/settings'

const storedAdminCredentialsSchema = z.object({
  email: z.string().email(),
  passwordHash: z.string().min(1),
  passwordSalt: z.string().min(1),
  passwordUpdatedAt: z.string().datetime(),
})

type StoredAdminCredentials = z.infer<typeof storedAdminCredentialsSchema>

export type AdminCredentialsProfile = {
  email: string
  source: 'database' | 'env'
}

function hashPassword(password: string, salt: string) {
  return scryptSync(password, salt, 64).toString('hex')
}

function verifyPassword(password: string, passwordHash: string, passwordSalt: string) {
  const computed = Buffer.from(hashPassword(password, passwordSalt), 'hex')
  const stored = Buffer.from(passwordHash, 'hex')

  if (computed.length !== stored.length) return false
  return timingSafeEqual(computed, stored)
}

function buildStoredCredentials(email: string, password: string): StoredAdminCredentials {
  const passwordSalt = randomBytes(16).toString('hex')
  return {
    email,
    passwordSalt,
    passwordHash: hashPassword(password, passwordSalt),
    passwordUpdatedAt: new Date().toISOString(),
  }
}

async function readStoredCredentials() {
  const raw = await getSetting<unknown>(SETTINGS_KEYS.ADMIN_CREDENTIALS)
  const parsed = storedAdminCredentialsSchema.safeParse(raw)
  return parsed.success ? parsed.data : null
}

function readEnvCredentials() {
  const email = process.env.ADMIN_EMAIL?.trim()
  const password = process.env.ADMIN_PASSWORD

  if (!email || !password) return null

  return {
    email,
    password,
  }
}

export async function getAdminCredentialsProfile(): Promise<AdminCredentialsProfile | null> {
  const stored = await readStoredCredentials()
  if (stored) {
    return {
      email: stored.email,
      source: 'database',
    }
  }

  const envCredentials = readEnvCredentials()
  if (!envCredentials) return null

  return {
    email: envCredentials.email,
    source: 'env',
  }
}

export async function authenticateAdmin(email: string, password: string) {
  const stored = await readStoredCredentials()

  if (stored) {
    if (email !== stored.email) return null
    if (!verifyPassword(password, stored.passwordHash, stored.passwordSalt)) return null

    return {
      id: 'admin',
      name: '素心管理员',
      email: stored.email,
    }
  }

  const envCredentials = readEnvCredentials()
  if (!envCredentials) {
    console.error('[Auth] Neither database admin credentials nor ADMIN_EMAIL/ADMIN_PASSWORD are available')
    return null
  }

  if (email !== envCredentials.email || password !== envCredentials.password) return null

  return {
    id: 'admin',
    name: '素心管理员',
    email: envCredentials.email,
  }
}

export async function verifyCurrentAdminPassword(password: string) {
  const stored = await readStoredCredentials()
  if (stored) {
    return verifyPassword(password, stored.passwordHash, stored.passwordSalt)
  }

  const envCredentials = readEnvCredentials()
  if (!envCredentials) return false

  return password === envCredentials.password
}

export async function saveAdminCredentials(input: {
  email: string
  currentPassword: string
  newPassword?: string | null
}) {
  const email = input.email.trim()
  const currentPassword = input.currentPassword
  const nextPassword = input.newPassword?.trim() || null

  const validCurrentPassword = await verifyCurrentAdminPassword(currentPassword)
  if (!validCurrentPassword) {
    throw new Error('当前密码不正确')
  }

  const stored = await readStoredCredentials()
  const envCredentials = readEnvCredentials()

  let nextStoredCredentials: StoredAdminCredentials

  if (stored && !nextPassword) {
    nextStoredCredentials = {
      ...stored,
      email,
    }
  } else {
    const passwordToPersist = nextPassword ?? currentPassword ?? envCredentials?.password

    if (!passwordToPersist) {
      throw new Error('无法确定需要保存的新密码')
    }

    nextStoredCredentials = buildStoredCredentials(email, passwordToPersist)
  }

  await setSetting(
    SETTINGS_KEYS.ADMIN_CREDENTIALS,
    nextStoredCredentials,
    '管理员登录凭据，后台优先读取，环境变量作为兜底来源'
  )

  return {
    email: nextStoredCredentials.email,
    source: 'database' as const,
    passwordUpdatedAt: nextStoredCredentials.passwordUpdatedAt,
  }
}

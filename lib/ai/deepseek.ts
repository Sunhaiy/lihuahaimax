import { SETTINGS_KEYS } from '@/lib/constants/settings'
import { getSetting } from '@/lib/db/dao/settingsDao'

type DeepSeekMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

type DeepSeekJsonCompletionOptions = {
  messages: DeepSeekMessage[]
  temperature?: number
  model?: string
}

type DeepSeekChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | null
    }
  }>
  error?: {
    message?: string
  }
}

export type DeepSeekStoredConfig = {
  apiKey?: string | null
  baseUrl?: string | null
  model?: string | null
}

export type DeepSeekPublicStatus = {
  enabled: boolean
  hasApiKey: boolean
  apiKeyPreview: string | null
  baseUrl: string
  model: string
  source: 'database' | 'env' | 'database+env'
}

type DeepSeekResolvedConfig = DeepSeekPublicStatus & {
  apiKey: string | null
}

const DEFAULT_BASE_URL = 'https://api.deepseek.com'
const DEFAULT_MODEL = 'deepseek-chat'

function cleanValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeBaseUrl(value: string) {
  return value.replace(/\/+$/, '')
}

function maskApiKey(value: string | null) {
  if (!value) return null
  if (value.length <= 8) return `${value.slice(0, 2)}***`
  return `${value.slice(0, 4)}...${value.slice(-4)}`
}

function readDeepSeekError(payload: unknown) {
  if (!payload || typeof payload !== 'object') return 'DeepSeek request failed'

  const source = payload as {
    error?: { message?: string }
  }

  return source.error?.message?.trim() || 'DeepSeek request failed'
}

export async function getDeepSeekConfig(): Promise<DeepSeekResolvedConfig> {
  const stored = (await getSetting<DeepSeekStoredConfig>(SETTINGS_KEYS.DEEPSEEK_CONFIG)) ?? {}

  const envApiKey = cleanValue(process.env.DEEPSEEK_API_KEY)
  const envBaseUrl = normalizeBaseUrl(cleanValue(process.env.DEEPSEEK_BASE_URL) || DEFAULT_BASE_URL)
  const envModel = cleanValue(process.env.DEEPSEEK_MODEL) || DEFAULT_MODEL

  const storedApiKey = cleanValue(stored.apiKey)
  const storedBaseUrl = cleanValue(stored.baseUrl)
  const storedModel = cleanValue(stored.model)

  const apiKey = storedApiKey || envApiKey || null
  const baseUrl = normalizeBaseUrl(storedBaseUrl || envBaseUrl)
  const model = storedModel || envModel

  const usesDatabase = Boolean(storedApiKey || storedBaseUrl || storedModel)
  const usesEnvFallback =
    (!storedApiKey && Boolean(envApiKey)) ||
    (!storedBaseUrl && Boolean(cleanValue(process.env.DEEPSEEK_BASE_URL))) ||
    (!storedModel && Boolean(cleanValue(process.env.DEEPSEEK_MODEL)))

  const source: DeepSeekPublicStatus['source'] = usesDatabase
    ? usesEnvFallback
      ? 'database+env'
      : 'database'
    : 'env'

  return {
    enabled: Boolean(apiKey),
    hasApiKey: Boolean(apiKey),
    apiKeyPreview: maskApiKey(storedApiKey || envApiKey || null),
    apiKey,
    baseUrl,
    model,
    source,
  }
}

export async function getDeepSeekPublicStatus(): Promise<DeepSeekPublicStatus> {
  const config = await getDeepSeekConfig()
  return {
    enabled: config.enabled,
    hasApiKey: config.hasApiKey,
    apiKeyPreview: config.apiKeyPreview,
    baseUrl: config.baseUrl,
    model: config.model,
    source: config.source,
  }
}

export async function createDeepSeekJsonCompletion<T>({
  messages,
  temperature = 0.6,
  model,
}: DeepSeekJsonCompletionOptions): Promise<T> {
  const config = await getDeepSeekConfig()
  if (!config.apiKey) {
    throw new Error('DeepSeek API Key is not configured')
  }

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: model || config.model,
      messages,
      temperature,
      response_format: { type: 'json_object' },
      thinking: { type: 'disabled' },
    }),
    cache: 'no-store',
  })

  const payload = (await response.json().catch(() => null)) as DeepSeekChatCompletionResponse | null
  if (!response.ok) {
    throw new Error(readDeepSeekError(payload))
  }

  const content = payload?.choices?.[0]?.message?.content
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('DeepSeek returned an empty response')
  }

  try {
    return JSON.parse(content) as T
  } catch {
    throw new Error('DeepSeek did not return valid JSON')
  }
}

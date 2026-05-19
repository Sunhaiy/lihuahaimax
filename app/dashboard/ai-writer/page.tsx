'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ADMIN_INPUT_CLASS,
  ADMIN_TEXTAREA_CLASS,
  AdminField,
  AdminNotice,
  AdminPageHeader,
  AdminPanel,
  AdminStatusBadge,
} from '@/components/admin/AdminPrimitives'
import { Button } from '@/components/ui/Button'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'

type DeepSeekStatus = {
  enabled: boolean
  hasApiKey: boolean
  apiKeyPreview: string | null
  baseUrl: string
  model: string
  source: 'database' | 'env' | 'database+env'
}

const DEFAULT_BASE_URL = 'https://api.deepseek.com'
const DEFAULT_MODEL = 'deepseek-chat'

function readError(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== 'object') return fallback
  const source = payload as { error?: unknown }

  if (typeof source.error === 'string' && source.error.trim()) {
    return source.error
  }

  return fallback
}

export default function AiWriterPage() {
  const router = useRouter()
  const [materials, setMaterials] = useState('')
  const [configStatus, setConfigStatus] = useState<DeepSeekStatus | null>(null)
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL)
  const [model, setModel] = useState(DEFAULT_MODEL)
  const [apiKey, setApiKey] = useState('')
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [savingConfig, setSavingConfig] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [configNotice, setConfigNotice] = useState<string | null>(null)
  const [configError, setConfigError] = useState<string | null>(null)
  const [generateError, setGenerateError] = useState<string | null>(null)

  async function loadStatus() {
    setLoadingStatus(true)
    setConfigError(null)

    try {
      const response = await fetch('/api/settings/deepseek', {
        method: 'GET',
        cache: 'no-store',
      })
      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(readError(payload, '读取 DeepSeek 配置失败'))
      }

      setConfigStatus(payload as DeepSeekStatus)
      setBaseUrl((payload as DeepSeekStatus).baseUrl || DEFAULT_BASE_URL)
      setModel((payload as DeepSeekStatus).model || DEFAULT_MODEL)
      setApiKey('')
    } catch (error) {
      setConfigError(error instanceof Error ? error.message : '读取 DeepSeek 配置失败')
    } finally {
      setLoadingStatus(false)
    }
  }

  useEffect(() => {
    void loadStatus()
  }, [])

  const canGenerate = useMemo(() => {
    return Boolean(configStatus?.enabled) && materials.trim().length >= 20 && !generating
  }, [configStatus?.enabled, generating, materials])

  async function handleSaveConfig() {
    setSavingConfig(true)
    setConfigError(null)
    setConfigNotice(null)

    try {
      const response = await fetch('/api/settings/deepseek', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: apiKey.trim() || undefined,
          baseUrl: baseUrl.trim() || undefined,
          model: model.trim() || undefined,
        }),
      })
      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(readError(payload, '保存 DeepSeek 配置失败'))
      }

      setConfigStatus(payload as DeepSeekStatus)
      setBaseUrl((payload as DeepSeekStatus).baseUrl || DEFAULT_BASE_URL)
      setModel((payload as DeepSeekStatus).model || DEFAULT_MODEL)
      setApiKey('')
      setConfigNotice('DeepSeek 配置已保存。后续生成会直接使用这套模型配置。')
    } catch (error) {
      setConfigError(error instanceof Error ? error.message : '保存 DeepSeek 配置失败')
    } finally {
      setSavingConfig(false)
    }
  }

  async function handleResetToEnv() {
    setSavingConfig(true)
    setConfigError(null)
    setConfigNotice(null)

    try {
      const response = await fetch('/api/settings/deepseek', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToEnv: true }),
      })
      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(readError(payload, '恢复环境变量失败'))
      }

      setConfigStatus(payload as DeepSeekStatus)
      setBaseUrl((payload as DeepSeekStatus).baseUrl || DEFAULT_BASE_URL)
      setModel((payload as DeepSeekStatus).model || DEFAULT_MODEL)
      setApiKey('')
      setConfigNotice('已恢复为环境变量配置。')
    } catch (error) {
      setConfigError(error instanceof Error ? error.message : '恢复环境变量失败')
    } finally {
      setSavingConfig(false)
    }
  }

  async function handleGenerateDraft() {
    setGenerating(true)
    setGenerateError(null)

    try {
      const response = await fetch('/api/ai/write-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materials: materials.trim(),
          status: 'draft',
        }),
      })
      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(readError(payload, '生成文章失败'))
      }

      const postId = Number((payload as { post?: { id?: number } }).post?.id)
      if (!Number.isInteger(postId) || postId <= 0) {
        throw new Error('AI 已生成结果，但没有拿到可编辑的文章 ID')
      }

      router.push(`/dashboard/editor/${postId}`)
    } catch (error) {
      setGenerateError(error instanceof Error ? error.message : '生成文章失败')
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="AI Writer"
        title="投喂资料，自动生成草稿"
        description="这里只保留一个资料输入框。标题、摘要、SEO、分类、标签和随机封面会自动处理；生成完成后直接跳转到正式文章编辑页，你只负责最后检查和发布。"
        meta={
          <>
            <AdminStatusBadge tone={configStatus?.enabled ? 'success' : 'warning'}>
              {loadingStatus
                ? '读取配置中'
                : configStatus?.enabled
                  ? 'DeepSeek 已连接'
                  : 'DeepSeek 未配置'}
            </AdminStatusBadge>
            {configStatus ? (
              <>
                <AdminStatusBadge tone="neutral">{configStatus.model}</AdminStatusBadge>
                <AdminStatusBadge tone="neutral">
                  来源：{configStatus.source === 'database+env'
                    ? '后台 + 环境变量'
                    : configStatus.source === 'database'
                      ? '后台配置'
                      : '环境变量'}
                </AdminStatusBadge>
              </>
            ) : null}
          </>
        }
        actions={
          <Button
            onClick={handleGenerateDraft}
            loading={generating}
            disabled={!canGenerate}
            size="lg"
          >
            <MaterialSymbol icon="auto_awesome" size={18} className="mr-1" />
            生成草稿并前往编辑器
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_380px]">
        <AdminPanel
          icon="edit_note"
          title="资料输入"
          description="把原始资料、你的想法、参考提纲、碎片笔记、链接摘要直接丢进来就行。建议尽量给全一点，AI 写出来会稳很多。"
          className="h-fit"
        >
          <div className="space-y-5">
            <AdminNotice tone="accent">
              AI 会自动完成：标题、简介、SEO 标题、SEO 描述、分类、标签，以及文章随机封面池匹配。
            </AdminNotice>

            {generateError ? <AdminNotice tone="danger">{generateError}</AdminNotice> : null}

            <label className="block space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
                Materials
              </span>
              <textarea
                className={`${ADMIN_TEXTAREA_CLASS} min-h-[420px] resize-y`}
                value={materials}
                onChange={(event) => setMaterials(event.target.value)}
                placeholder="把资料直接贴在这里，比如：项目背景、原始记录、结构草稿、参考链接摘要、你希望强调的重点、不要遗漏的关键词。"
              />
            </label>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs leading-6 text-muted-foreground">
                至少输入 20 个字符。成功后会直接创建为草稿，并跳转到正常文章编辑器继续检查。
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{materials.trim().length} 字符</span>
                <span>·</span>
                <span>自动草稿</span>
              </div>
            </div>
          </div>
        </AdminPanel>

        <div className="space-y-6">
          <AdminPanel
            icon="tune"
            title="DeepSeek 配置"
            description="数据库配置优先，环境变量兜底。这里只保留最常用的三项：API Key、Base URL 和模型。"
            className="h-fit"
          >
            <div className="space-y-5">
              {configNotice ? <AdminNotice tone="accent">{configNotice}</AdminNotice> : null}
              {configError ? <AdminNotice tone="danger">{configError}</AdminNotice> : null}

              <div className="flex flex-wrap gap-2">
                <AdminStatusBadge tone={configStatus?.enabled ? 'success' : 'warning'}>
                  {configStatus?.enabled ? '当前可调用' : '尚未可用'}
                </AdminStatusBadge>
                {configStatus?.apiKeyPreview ? (
                  <AdminStatusBadge tone="neutral">密钥：{configStatus.apiKeyPreview}</AdminStatusBadge>
                ) : null}
              </div>

              <div className="space-y-4">
                <AdminField label="DeepSeek Base URL">
                  <input
                    className={ADMIN_INPUT_CLASS}
                    value={baseUrl}
                    onChange={(event) => setBaseUrl(event.target.value)}
                    placeholder={DEFAULT_BASE_URL}
                  />
                </AdminField>

                <AdminField label="默认模型">
                  <input
                    className={ADMIN_INPUT_CLASS}
                    value={model}
                    onChange={(event) => setModel(event.target.value)}
                    placeholder={DEFAULT_MODEL}
                  />
                </AdminField>

                <AdminField
                  label="API Key"
                  hint="留空不会覆盖当前密钥。想清空后台配置并回退环境变量，请用下面的恢复按钮。"
                >
                  <input
                    type="password"
                    className={ADMIN_INPUT_CLASS}
                    value={apiKey}
                    onChange={(event) => setApiKey(event.target.value)}
                    placeholder="sk-..."
                  />
                </AdminField>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button onClick={handleSaveConfig} loading={savingConfig}>
                  保存 DeepSeek 配置
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleResetToEnv}
                  disabled={savingConfig}
                >
                  恢复环境变量
                </Button>
              </div>
            </div>
          </AdminPanel>

          <AdminPanel
            icon="checklist"
            title="生成结果会怎么走"
            description="不再在这个页面堆预览。生成完成后，直接跳去正常文章编辑页做最后检查。"
            className="h-fit"
          >
            <ol className="space-y-3 text-sm leading-7 text-muted-foreground">
              <li className="flex gap-3">
                <span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border/70 text-[11px] font-mono text-foreground">
                  1
                </span>
                <span>把资料贴进左侧输入框。</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border/70 text-[11px] font-mono text-foreground">
                  2
                </span>
                <span>AI 自动生成标题、摘要、SEO、分类、标签和正文结构。</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border/70 text-[11px] font-mono text-foreground">
                  3
                </span>
                <span>系统直接创建草稿，并跳转到文章编辑器预览、微调、发布。</span>
              </li>
            </ol>
          </AdminPanel>
        </div>
      </div>
    </div>
  )
}

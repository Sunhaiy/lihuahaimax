/**
 * app/dashboard/settings/page.tsx
 *
 * 后台设置页 — 管理 Hero 背景图。
 */

'use client'

import { useRef, useState } from 'react'
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface HeroBgSettings {
  url: string | null
}

async function uploadHeroBg(file: File): Promise<{ url: string; message: string }> {
  const form = new FormData()
  form.append('file', file)

  const res = await fetch('/api/settings/hero-bg', { method: 'POST', body: form })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Upload failed')
  }
  return res.json()
}

async function deleteHeroBg(): Promise<void> {
  const res = await fetch('/api/settings/hero-bg', { method: 'DELETE' })
  if (!res.ok) throw new Error('Delete failed')
}

export default function SettingsPage() {
  const { data, isLoading, mutate } = useSWR<HeroBgSettings>('/api/settings/hero-bg', fetcher)
  const { trigger: upload, isMutating: uploading } = useSWRMutation('/api/settings/hero-bg', () => Promise.resolve())
  const { trigger: deleteImg, isMutating: deleting } = useSWRMutation('/api/settings/hero-bg', () => Promise.resolve())
  const fileRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    setSuccess('')

    try {
      await uploadHeroBg(file)
      setSuccess('背景图上传成功！')
      mutate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    }

    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleDelete() {
    if (!confirm('确定要删除背景图吗？')) return

    setError('')
    setSuccess('')

    try {
      await deleteHeroBg()
      setSuccess('背景图已删除')
      mutate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">设置</h1>

      {/* Hero 背景图卡片 */}
      <Card className="mb-8">
        <CardBody>
          <h2 className="text-lg font-semibold mb-6">Hero 背景图</h2>

          {/* 错误提示 */}
          {error && (
            <div className="mb-4 p-3 rounded-card bg-red-500/10 border border-red-500/30 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* 成功提示 */}
          {success && (
            <div className="mb-4 p-3 rounded-card bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-sm">
              {success}
            </div>
          )}

          {/* 当前背景图预览 */}
          {isLoading ? (
            <div className="aspect-video rounded-card bg-muted animate-pulse mb-6" />
          ) : data?.url ? (
            <div className="mb-6">
              <p className="text-xs text-muted-foreground mb-2">当前背景图：</p>
              <div className="aspect-video rounded-card overflow-hidden bg-muted mb-4">
                <img
                  src={data.url}
                  alt="Hero background"
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                size="sm"
                variant="danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? '删除中…' : '删除背景图'}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mb-6">未设置背景图，将使用默认渐变效果。</p>
          )}

          {/* 上传区 */}
          <div className="border-2 border-dashed border-border rounded-surface p-8 text-center
                          hover:border-ocean/30 transition-colors cursor-pointer"
               onClick={() => fileRef.current?.click()}>
            <p className="text-muted-foreground text-sm mb-1">
              点击或拖拽上传背景图
            </p>
            <p className="text-xs text-muted-foreground/60">
              支持 JPEG, PNG, WebP, AVIF（最小宽度 1920px，最大 50MB）
            </p>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={handleUpload}
          />

          {/* 上传按钮 */}
          <Button
            onClick={() => fileRef.current?.click()}
            disabled={uploading || isLoading}
            className="mt-4"
          >
            {uploading ? '上传中…' : '选择图片'}
          </Button>

          {/* 说明 */}
          <div className="mt-6 p-4 rounded-card bg-ocean/5 border border-ocean/20 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground mb-2">使用说明：</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>建议使用高分辨率图片（1920x1080 或更大）</li>
              <li>图片会被调整为 cover 模式铺满整个 Hero 区域</li>
              <li>可选择删除以恢复默认渐变背景</li>
            </ul>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

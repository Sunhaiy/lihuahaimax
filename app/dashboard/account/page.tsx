'use client'

import { useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import {
  AdminField,
  AdminNotice,
  AdminPageHeader,
  AdminPanel,
  AdminSection,
  AdminStatusBadge,
  ADMIN_INPUT_CLASS,
} from '@/components/admin/AdminPrimitives'
import { Button } from '@/components/ui/Button'

type AdminAccountProfile = {
  email: string
  source: 'database' | 'env'
}

const fetcher = async (url: string) => {
  const response = await fetch(url)
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(typeof payload?.error === 'string' ? payload.error : '读取管理员账号失败')
  }

  return payload as AdminAccountProfile
}

function readApiError(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== 'object') return fallback

  const source = payload as {
    error?: string | { fieldErrors?: Record<string, string[]>; formErrors?: string[] }
  }

  if (typeof source.error === 'string' && source.error.trim()) return source.error

  if (source.error && typeof source.error === 'object') {
    const formError = source.error.formErrors?.find(Boolean)
    if (formError) return formError

    const fieldError = Object.values(source.error.fieldErrors ?? {})
      .flat()
      .find(Boolean)
    if (fieldError) return fieldError
  }

  return fallback
}

export default function AdminAccountPage() {
  const accountRequest = useSWR<AdminAccountProfile>('/api/settings/admin-account', fetcher)

  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (accountRequest.data?.email) {
      setEmail(accountRequest.data.email)
    }
  }, [accountRequest.data?.email])

  const sourceLabel = useMemo(() => {
    if (!accountRequest.data) return '读取中'
    return accountRequest.data.source === 'database' ? '数据库管理' : '环境变量兜底'
  }, [accountRequest.data])

  async function handleSave() {
    setError('')
    setSuccess('')

    if (!email.trim()) {
      setError('管理员邮箱不能为空')
      return
    }

    if (!currentPassword.trim()) {
      setError('请输入当前密码')
      return
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError('两次输入的新密码不一致')
      return
    }

    setSaving(true)

    try {
      const response = await fetch('/api/settings/admin-account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          currentPassword,
          newPassword: newPassword.trim() || '',
        }),
      })

      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(readApiError(payload, '保存管理员账号失败'))
      }

      accountRequest.mutate(payload, false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setSuccess('管理员账号已更新。当前会话会继续保留，新账号密码会在下次登录时生效。')
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存管理员账号失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Account Security"
        title="账号安全"
        description="这里专门维护后台管理员的登录邮箱和密码。保存后无需改环境变量，下次登录会优先使用数据库里的新凭据。"
        meta={
          <>
            <AdminStatusBadge tone={accountRequest.data?.source === 'database' ? 'accent' : 'warning'}>
              {sourceLabel}
            </AdminStatusBadge>
            <AdminStatusBadge tone="neutral">仅管理员可见</AdminStatusBadge>
          </>
        }
        actions={
          <Button onClick={handleSave} disabled={saving || accountRequest.isLoading}>
            {saving ? '保存中...' : '保存账号设置'}
          </Button>
        }
      />

      {error ? <AdminNotice tone="danger">{error}</AdminNotice> : null}
      {success ? <AdminNotice tone="success">{success}</AdminNotice> : null}

      <AdminPanel
        icon="shield_lock"
        title="管理员登录凭据"
        description="建议先确认邮箱，再修改密码。如果这次只想改邮箱，新密码可以留空。"
      >
        <div className="space-y-6">
          <AdminSection
            title="登录身份"
            description="数据库里没有管理员凭据时，会先使用 .env 里的 ADMIN_EMAIL / ADMIN_PASSWORD 兜底。你第一次在这里保存后，就会切到数据库管理。"
            aside={
              <AdminStatusBadge tone={accountRequest.data?.source === 'database' ? 'accent' : 'warning'}>
                {sourceLabel}
              </AdminStatusBadge>
            }
          >
            <div className="grid gap-4 md:grid-cols-2">
              <AdminField label="管理员邮箱" hint="下次登录时使用的新邮箱地址。">
                <input
                  type="email"
                  className={ADMIN_INPUT_CLASS}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@example.com"
                  autoComplete="username"
                />
              </AdminField>

              <AdminField label="当前密码" hint="为了安全，保存前需要验证一次当前密码。">
                <input
                  type="password"
                  className={ADMIN_INPUT_CLASS}
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  placeholder="输入当前密码"
                  autoComplete="current-password"
                />
              </AdminField>
            </div>
          </AdminSection>

          <AdminSection
            title="修改密码"
            description="如果这次不打算换密码，可以把下面两个输入框留空。"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <AdminField label="新密码" hint="建议至少 8 位，并混合字母、数字和符号。">
                <input
                  type="password"
                  className={ADMIN_INPUT_CLASS}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="留空则保持原密码"
                  autoComplete="new-password"
                />
              </AdminField>

              <AdminField label="确认新密码" hint="用来避免手滑输错。">
                <input
                  type="password"
                  className={ADMIN_INPUT_CLASS}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="再次输入新密码"
                  autoComplete="new-password"
                />
              </AdminField>
            </div>
          </AdminSection>
        </div>
      </AdminPanel>
    </div>
  )
}

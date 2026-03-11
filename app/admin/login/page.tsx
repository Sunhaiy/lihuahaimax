/**
 * app/admin/login/page.tsx
 *
 * 管理员登录页（不受 middleware 保护）。
 */

'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('邮箱或密码错误，请重试。')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* 背景光晕 */}
      <div aria-hidden className="fixed inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[500px] h-[500px] rounded-full bg-ocean/6 blur-[120px]" />
      </div>

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-2xl font-bold text-foreground">梨花海</p>
          <p className="text-sm text-muted-foreground mt-1">后台中控台</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-surface border border-white/5 bg-card p-8 space-y-5"
        >
          {error && (
            <div className="rounded-base px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground" htmlFor="email">
              邮箱
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 px-3 rounded-base bg-white/5 border border-white/10
                         text-sm text-foreground placeholder:text-muted-foreground/50
                         focus:outline-none focus:border-ocean/50 transition-colors"
              placeholder="admin@lihuahai.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground" htmlFor="password">
              密码
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-10 px-3 rounded-base bg-white/5 border border-white/10
                         text-sm text-foreground placeholder:text-muted-foreground/50
                         focus:outline-none focus:border-ocean/50 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" fullWidth loading={loading}>
            登录后台
          </Button>
        </form>
      </div>
    </div>
  )
}

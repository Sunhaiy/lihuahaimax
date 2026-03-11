/**
 * lib/auth/config.ts
 *
 * NextAuth.js v5 (Auth.js) 配置。
 * 单人博主模式：使用 Credentials 凭据登录，
 * 管理员账号写在环境变量中，无需数据库用户表。
 */

import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const authConfig: NextAuthConfig = {
  // 使用 JWT 策略（无需数据库 session 表）
  session: { strategy: 'jwt' },

  pages: {
    signIn: '/admin/login',
  },

  callbacks: {
    // 保护所有 /dashboard/* 路由
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
      if (isOnDashboard) return isLoggedIn
      return true
    },

    jwt({ token, user }) {
      if (user) {
        token.role = 'admin'
        token.id = user.id
      }
      return token
    },

    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        // @ts-expect-error 自定义字段
        session.user.role = token.role
      }
      return session
    },
  },

  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        // 与环境变量中的管理员账号比对
        const adminEmail = process.env.ADMIN_EMAIL
        const adminPassword = process.env.ADMIN_PASSWORD

        if (!adminEmail || !adminPassword) {
          console.error('[Auth] ADMIN_EMAIL or ADMIN_PASSWORD not set in env')
          return null
        }

        if (email !== adminEmail || password !== adminPassword) {
          return null
        }

        return {
          id: 'admin',
          name: '梨花海管理员',
          email: adminEmail,
        }
      },
    }),
  ],
}

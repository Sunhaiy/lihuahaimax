/**
 * auth.ts (项目根目录)
 *
 * NextAuth.js v5 统一导出点。
 * middleware 和 API route 均从此文件导入。
 */

import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth/config'

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)

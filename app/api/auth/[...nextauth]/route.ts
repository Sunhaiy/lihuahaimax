/**
 * app/api/auth/[...nextauth]/route.ts
 *
 * NextAuth.js v5 路由处理器。
 */

import { handlers } from '@/auth'
export const { GET, POST } = handlers

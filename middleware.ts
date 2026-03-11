/**
 * middleware.ts
 *
 * Next.js 中间件 — 保护 /dashboard/* 路由。
 * 未登录时重定向到 /admin/login。
 */

export { auth as middleware } from '@/auth'

export const config = {
  matcher: ['/dashboard/:path*'],
}

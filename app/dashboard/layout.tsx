/**
 * app/dashboard/layout.tsx
 *
 * 后台仪表盘布局 — 侧边栏导航 + 内容区。
 * 此路由组受 middleware 保护，未登录用户自动跳转到 /admin/login。
 */

import Link from 'next/link'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const navItems = [
  { href: '/dashboard', label: '概览', icon: '⊞' },
  { href: '/dashboard/posts', label: '文章管理', icon: '✦' },
  { href: '/dashboard/editor', label: '新建文章', icon: '+' },
  { href: '/dashboard/moments', label: '瞬间管理', icon: '◎' },
  { href: '/dashboard/acg', label: 'ACG 陈列室', icon: '▣' },
  { href: '/dashboard/gallery', label: '相册管理', icon: '⊟' },
  { href: '/dashboard/links', label: '友链管理', icon: '⊕' },
  { href: '/dashboard/settings', label: '设置', icon: '⚙' },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  return (
    <div className="min-h-screen flex">
      {/* ── 侧边栏 ────────────────────────────────────── */}
      <aside className="w-56 flex-shrink-0 border-r border-border flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-border">
          <Link href="/dashboard" className="font-bold text-foreground hover:text-ember transition-colors">
            梨花海后台
          </Link>
        </div>

        {/* 导航 */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-base text-sm
                         text-muted-foreground hover:text-ember hover:bg-black/5 dark:hover:bg-white/5
                         transition-all duration-200"
            >
              <span className="w-4 text-center text-ember/70">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* 底部用户信息 */}
        <div className="border-t border-border p-4 space-y-2">
          <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
          <Link
            href="/api/auth/signout"
            className="text-xs text-muted-foreground hover:text-red-400 transition-colors"
          >
            退出登录
          </Link>
        </div>
      </aside>

      {/* ── 主内容区 ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶栏 */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6">
          <div />
          <ThemeToggle />
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

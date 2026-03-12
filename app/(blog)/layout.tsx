/**
 * app/(blog)/layout.tsx
 *
 * 前台公开布局 — 顶部导航 + 页脚。
 */

import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const navLinks = [
  { href: '/', label: '首页' },
  { href: '/posts', label: '文章' },
  { href: '/moments', label: '瞬间' },
  { href: '/acg', label: '陈列室' },
  { href: '/gallery', label: '光影' },
]

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ── 顶部导航 ─────────────────────────────────────── */}
      <header className="sticky top-0 z-50
                          border-b border-border
                          backdrop-blur-xl backdrop-saturate-150
                          bg-background/80">
        <nav className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-foreground hover:text-ember transition-colors"
          >
            梨花海
            <span className="ml-2 text-xs font-normal text-muted-foreground tracking-widest">
              LIHUA HAI
            </span>
          </Link>

          {/* 导航链接 */}
          <div className="hidden sm:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground
                           rounded-base hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* 右侧工具 */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {/* 移动端菜单按钮（预留） */}
            <button
              type="button"
              className="sm:hidden w-9 h-9 flex items-center justify-center rounded-base
                         text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
              aria-label="打开菜单"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M1 2.5h14M1 8h14M1 13.5h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </nav>
      </header>

      {/* ── 主内容 ───────────────────────────────────────── */}
      <main className="flex-1">
        {children}
      </main>

      {/* ── 页脚 ─────────────────────────────────────────── */}
      <footer className="border-t border-border py-8 mt-16">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} 梨花海 · 用代码记录生活
          </p>
          <div className="flex items-center gap-4">
            <Link href="/links" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              友情链接
            </Link>
            <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              后台
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

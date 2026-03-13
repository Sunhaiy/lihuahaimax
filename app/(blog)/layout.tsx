/**
 * app/(blog)/layout.tsx
 *
 * 前台公开布局 — 顶部导航 + 页脚。
 * NavBar 是客户端组件（含分类下拉菜单），分类数据由此服务端组件预取。
 */

import Link from 'next/link'
import { NavBar } from '@/components/ui/NavBar'
import { PageTransition } from '@/components/ui/PageTransition'
import { findCategories } from '@/lib/db/dao/postDao'

export default async function BlogLayout({ children }: { children: React.ReactNode }) {
  // 服务端预取分类列表，传给客户端 NavBar
  const categories = await findCategories().catch(() => [])

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── 顶部导航 ─────────────────────────────────────── */}
      <NavBar categories={categories} />

      {/* ── 主内容 ───────────────────────────────────────── */}
      <main className="flex-1 pt-16">
        <PageTransition>{children}</PageTransition>
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

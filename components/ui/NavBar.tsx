/**
 * components/ui/NavBar.tsx
 *
 * 博客顶部导航栏 — 客户端组件，支持分类二级下拉菜单。
 */

'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

interface Category {
  category: string
  count: number
}

interface NavBarProps {
  categories: Category[]
}

// 分类对应的 emoji 图标（无匹配时用默认）
const CATEGORY_ICONS: Record<string, string> = {
  技术笔记: '💻',
  项目实战: '🔧',
  生活随笔: '✍️',
  读书笔记: '📚',
  工具推荐: '🛠️',
  嵌入式: '🔌',
  物联网: '📡',
  前端: '🎨',
  后端: '⚙️',
  开源: '🌐',
  未分类: '📂',
}

function getCategoryIcon(name: string) {
  return CATEGORY_ICONS[name] ?? '📂'
}

export function NavBar({ categories }: NavBarProps) {
  const [postMenuOpen, setPostMenuOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function openMenu() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setPostMenuOpen(true)
  }

  function scheduleClose() {
    closeTimer.current = setTimeout(() => setPostMenuOpen(false), 120)
  }

  return (
    <header
      className="sticky top-0 z-50
                 border-b border-border
                 backdrop-blur-xl backdrop-saturate-150
                 bg-background/80"
    >
      <nav className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* ── Logo ──────────────────────────────────── */}
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-foreground hover:text-ember transition-colors"
        >
          梨花海
          <span className="ml-2 text-xs font-normal text-muted-foreground tracking-widest">
            LIHUA HAI
          </span>
        </Link>

        {/* ── 导航链接 ───────────────────────────────── */}
        <div className="hidden sm:flex items-center gap-1">

          <Link
            href="/"
            className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground
                       rounded-base hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200"
          >
            首页
          </Link>

          {/* 文章（带分类下拉） */}
          <div
            className="relative"
            onMouseEnter={openMenu}
            onMouseLeave={scheduleClose}
          >
            <Link
              href="/posts"
              className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-base
                          transition-all duration-200
                          ${postMenuOpen
                            ? 'text-foreground bg-black/5 dark:bg-white/5'
                            : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'
                          }`}
            >
              文章
              <svg
                width="10" height="10" viewBox="0 0 10 10" fill="currentColor"
                className={`transition-transform duration-200 ${postMenuOpen ? 'rotate-180' : ''}`}
              >
                <path d="M1 3l4 4 4-4" stroke="currentColor" strokeWidth="1.5"
                      strokeLinecap="round" fill="none" />
              </svg>
            </Link>

            {/* 下拉面板 */}
            {postMenuOpen && categories.length > 0 && (
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 pt-2"
                onMouseEnter={openMenu}
                onMouseLeave={scheduleClose}
              >
                {/* 透明桥接层，防止鼠标从触发区移到面板途中关闭 */}
                <div className="absolute -top-2 left-0 w-full h-2" />

                <div
                  className="relative rounded-xl border border-border shadow-xl
                              bg-card/95 backdrop-blur-xl
                              p-4 min-w-[280px]"
                >
                  <p className="text-[10px] font-mono uppercase tracking-widest
                                text-muted-foreground mb-3 select-none">
                    文章分类
                  </p>

                  <div className="grid grid-cols-2 gap-1">
                    {categories.map(({ category, count }) => (
                      <Link
                        key={category}
                        href={`/posts?category=${encodeURIComponent(category)}`}
                        onClick={() => setPostMenuOpen(false)}
                        className="group flex items-center gap-2.5 px-3 py-2 rounded-lg
                                   hover:bg-ember/10 transition-colors"
                      >
                        <span className="text-base leading-none select-none" aria-hidden>
                          {getCategoryIcon(category)}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-xs font-medium text-foreground
                                           group-hover:text-ember transition-colors truncate">
                            {category}
                          </span>
                          <span className="block text-[10px] text-muted-foreground font-mono">
                            {count} 篇
                          </span>
                        </span>
                      </Link>
                    ))}
                  </div>

                  <div className="mt-3 pt-3 border-t border-border">
                    <Link
                      href="/posts"
                      onClick={() => setPostMenuOpen(false)}
                      className="flex items-center justify-between text-xs
                                 text-muted-foreground hover:text-ember transition-colors"
                    >
                      <span>全部文章</span>
                      <span aria-hidden>→</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {[
            { href: '/moments', label: '瞬间' },
            { href: '/acg', label: '陈列室' },
            { href: '/gallery', label: '光影' },
          ].map((link) => (
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

        {/* ── 右侧工具 ───────────────────────────────── */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            className="sm:hidden w-9 h-9 flex items-center justify-center rounded-base
                       text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
            aria-label="打开菜单"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M1 2.5h14M1 8h14M1 13.5h14" stroke="currentColor"
                    strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

      </nav>
    </header>
  )
}

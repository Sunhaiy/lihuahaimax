/**
 * components/ui/NavBar.tsx
 *
 * 博客顶部导航栏 — 客户端组件，支持分类二级下拉菜单。
 *
 * 注意：下拉面板通过 createPortal 渲染到 document.body，
 * 以规避 header 的 backdrop-filter 创建新 stacking context
 * 导致子元素 backdrop-blur 失效的 CSS 规范限制。
 */

'use client'

import { useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import {
  RiCodeLine, RiToolsLine, RiEditLine, RiBookLine,
  RiCpuLine, RiWifiLine, RiLayoutLine, RiServerLine,
  RiGitBranchLine, RiFolderLine,
  RiFilmLine, RiGamepadLine, RiCameraLine,
  RiHome4Line, RiFileTextLine, RiFlashlightLine,
  RiStarLine, RiLinksLine, RiUser3Line,
  RiArchiveLine, RiPriceTag3Line, RiBriefcase4Line,
} from '@remixicon/react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

interface Category {
  category: string
  count: number
}

interface NavBarProps {
  categories: Category[]
}

type RemixIcon = React.ComponentType<{ size?: number | string; className?: string }>

const CATEGORY_ICONS: Record<string, RemixIcon> = {
  技术笔记: RiCodeLine,
  项目实战: RiToolsLine,
  生活随笔: RiEditLine,
  读书笔记: RiBookLine,
  工具推荐: RiToolsLine,
  嵌入式:   RiCpuLine,
  物联网:   RiWifiLine,
  前端:     RiLayoutLine,
  后端:     RiServerLine,
  开源:     RiGitBranchLine,
  未分类:   RiFolderLine,
}

function getCategoryIcon(name: string): RemixIcon {
  return CATEGORY_ICONS[name] ?? RiFolderLine
}

const COLLECTION_ITEMS = [
  { href: '/anime',   label: '动漫', Icon: RiFilmLine,    desc: '追番记录' },
  { href: '/games',   label: '游戏', Icon: RiGamepadLine, desc: '游玩足迹' },
  { href: '/gallery', label: '光影', Icon: RiCameraLine,  desc: '图片相册' },
]

const POST_SUB_PAGES = [
  { href: '/posts',            label: '全部文章', Icon: RiFileTextLine  },
  { href: '/posts/archive',    label: '归档',     Icon: RiArchiveLine   },
  { href: '/posts/categories', label: '分类',     Icon: RiFolderLine    },
  { href: '/posts/tags',       label: '标签',     Icon: RiPriceTag3Line },
]

/* 下拉面板共用毛玻璃样式（渲染到 body 层，backdrop-blur 正常生效） */
const PANEL_CLS = `rounded-xl border border-border
                   bg-background/80 backdrop-blur-xl backdrop-saturate-150`

interface MenuPos { centerX: number; bottom: number }

export function NavBar({ categories }: NavBarProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [postMenuOpen, setPostMenuOpen] = useState(false)
  const [collectionMenuOpen, setCollectionMenuOpen] = useState(false)
  const postTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const collectionTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const postTriggerRef = useRef<HTMLDivElement>(null)
  const collectionTriggerRef = useRef<HTMLDivElement>(null)
  const [postPos, setPostPos] = useState<MenuPos>({ centerX: 0, bottom: 0 })
  const [collectionPos, setCollectionPos] = useState<MenuPos>({ centerX: 0, bottom: 0 })

  function openMenu() {
    if (postTimer.current) clearTimeout(postTimer.current)
    if (postTriggerRef.current) {
      const r = postTriggerRef.current.getBoundingClientRect()
      setPostPos({ centerX: r.left + r.width / 2, bottom: r.bottom })
    }
    setPostMenuOpen(true)
  }
  function scheduleClose() {
    postTimer.current = setTimeout(() => setPostMenuOpen(false), 250)
  }

  function openCollection() {
    if (collectionTimer.current) clearTimeout(collectionTimer.current)
    if (collectionTriggerRef.current) {
      const r = collectionTriggerRef.current.getBoundingClientRect()
      setCollectionPos({ centerX: r.left + r.width / 2, bottom: r.bottom })
    }
    setCollectionMenuOpen(true)
  }
  function scheduleCloseCollection() {
    collectionTimer.current = setTimeout(() => setCollectionMenuOpen(false), 250)
  }

  return (
    <>
      <header
        className="fixed top-0 inset-x-0 z-50
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

            <Link href="/" className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground
                                      rounded-base hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200">
              <RiHome4Line size={14} />
              首页
            </Link>

            {/* 文章（带分类下拉） */}
            <div ref={postTriggerRef} className="relative" onMouseEnter={openMenu} onMouseLeave={scheduleClose}>
              <Link
                href="/posts"
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-base transition-all duration-200
                            ${postMenuOpen
                              ? 'text-foreground bg-black/5 dark:bg-white/5'
                              : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'}`}
              >
                <RiFileTextLine size={14} />
                文章
              </Link>
            </div>

            <Link href="/moments" className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground
                                             rounded-base hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200">
              <RiFlashlightLine size={14} />
              瞬间
            </Link>

            <Link href="/works" className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground
                                           rounded-base hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200">
              <RiBriefcase4Line size={14} />
              作品
            </Link>

            {/* 收藏（带二级菜单） */}
            <div ref={collectionTriggerRef} className="relative" onMouseEnter={openCollection} onMouseLeave={scheduleCloseCollection}>
              <button
                type="button"
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-base transition-all duration-200
                            ${collectionMenuOpen
                              ? 'text-foreground bg-black/5 dark:bg-white/5'
                              : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'}`}
              >
                <RiStarLine size={14} />
                收藏
              </button>
            </div>

            <Link href="/links" className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground
                                           rounded-base hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200">
              <RiLinksLine size={14} />
              友情链接
            </Link>

            <Link href="/about" className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground
                                           rounded-base hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200">
              <RiUser3Line size={14} />
              关于
            </Link>
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

      {/* ── 下拉面板 — Portal 到 body，脱离 header stacking context ── */}
      {mounted && postMenuOpen && createPortal(
        <div
          style={{
            position: 'fixed',
            top: postPos.bottom + 8,
            left: postPos.centerX,
            transform: 'translateX(-50%)',
            zIndex: 9999,
          }}
          onMouseEnter={openMenu}
          onMouseLeave={scheduleClose}
        >
          <div className={`${PANEL_CLS} p-3 min-w-[260px]`}>

            {/* 子页面快捷导航 */}
            <div className="grid grid-cols-4 gap-0.5 mb-1">
              {POST_SUB_PAGES.map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setPostMenuOpen(false)}
                  className="group flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg
                             hover:bg-ember/10 transition-colors"
                >
                  <span className="text-muted-foreground group-hover:text-ember transition-colors">
                    <Icon size={14} />
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground group-hover:text-ember
                                    transition-colors whitespace-nowrap">
                    {label}
                  </span>
                </Link>
              ))}
            </div>

            {/* 分类列表（有分类时显示） */}
            {categories.length > 0 && (
              <>
                <div className="border-t border-border my-2" />
                <p className="text-[10px] font-mono uppercase tracking-widest
                              text-muted-foreground mb-2 px-1 select-none">文章分类</p>
                <div className="grid grid-cols-2 gap-0.5">
                  {categories.map(({ category, count }) => {
                    const CatIcon = getCategoryIcon(category)
                    return (
                      <Link
                        key={category}
                        href={`/posts?category=${encodeURIComponent(category)}`}
                        onClick={() => setPostMenuOpen(false)}
                        className="group flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-ember/10 transition-colors"
                      >
                        <span className="text-muted-foreground group-hover:text-ember transition-colors flex-shrink-0">
                          <CatIcon size={13} />
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-xs font-medium text-foreground group-hover:text-ember transition-colors truncate">
                            {category}
                          </span>
                          <span className="block text-[10px] text-muted-foreground font-mono">{count} 篇</span>
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>,
        document.body
      )}

      {mounted && collectionMenuOpen && createPortal(
        <div
          style={{
            position: 'fixed',
            top: collectionPos.bottom + 8,
            left: collectionPos.centerX,
            transform: 'translateX(-50%)',
            zIndex: 9999,
          }}
          onMouseEnter={openCollection}
          onMouseLeave={scheduleCloseCollection}
        >
          <div className={`${PANEL_CLS} p-3 min-w-[180px]`}>
            <p className="text-[10px] font-mono uppercase tracking-widest
                          text-muted-foreground mb-2 px-1 select-none">收藏夹</p>
            <div className="flex flex-col gap-0.5">
              {COLLECTION_ITEMS.map(({ href, label, Icon, desc }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setCollectionMenuOpen(false)}
                  className="group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-ember/10 transition-colors"
                >
                  <span className="text-muted-foreground group-hover:text-ember transition-colors flex-shrink-0">
                    <Icon size={15} />
                  </span>
                  <span>
                    <span className="block text-xs font-medium text-foreground group-hover:text-ember transition-colors">
                      {label}
                    </span>
                    <span className="block text-[10px] text-muted-foreground">{desc}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

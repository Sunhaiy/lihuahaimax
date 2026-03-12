/**
 * app/(blog)/links/page.tsx
 *
 * 友情链接页面 — 展示所有已激活的外部链接。
 */

import type { Metadata } from 'next'
import { findLinks } from '@/lib/db/dao/linkDao'
import type { LinkRow, LinkCategory } from '@/types/link'

export const metadata: Metadata = { title: '友情链接 · 梨花海' }
export const revalidate = 3600

const CATEGORY_CONFIG: Record<LinkCategory, { label: string; icon: string }> = {
  friend:   { label: '友情链接', icon: '🤝' },
  tool:     { label: '常用工具', icon: '🛠️' },
  resource: { label: '学习资源', icon: '📚' },
  inspire:  { label: '灵感来源', icon: '✨' },
  other:    { label: '其他',     icon: '🔗' },
}

const CATEGORY_ORDER: LinkCategory[] = ['friend', 'tool', 'resource', 'inspire', 'other']

export default async function LinksPage() {
  const links = await findLinks(true)

  const grouped = CATEGORY_ORDER.reduce<Record<LinkCategory, LinkRow[]>>(
    (acc, cat) => {
      acc[cat] = links.filter((l) => l.category === cat)
      return acc
    },
    {} as Record<LinkCategory, LinkRow[]>,
  )

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* 页头 */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-foreground mb-2">友情链接</h1>
        <p className="text-muted-foreground text-sm">
          互联网上值得一去的角落，以及让我受益的工具与资源。
        </p>
      </div>

      {CATEGORY_ORDER.map((cat) => {
        const items = grouped[cat]
        if (!items || items.length === 0) return null
        const { label, icon } = CATEGORY_CONFIG[cat]

        return (
          <section key={cat} className="mb-12">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xl leading-none">{icon}</span>
              <h2 className="text-base font-semibold text-foreground">{label}</h2>
              <span className="text-xs text-muted-foreground font-mono ml-1">{items.length}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 p-4 rounded-xl border border-border
                             bg-card hover:border-ember/40 hover:bg-ember/5
                             transition-all duration-200"
                >
                  {/* 头像 / 首字母 */}
                  <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden
                                  bg-gradient-to-br from-ember/20 to-ember/5 border border-border">
                    {link.avatar_url ? (
                      <img
                        src={link.avatar_url}
                        alt={link.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center
                                      text-sm font-bold text-ember select-none">
                        {link.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* 文字 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground group-hover:text-ember
                                  transition-colors truncate">
                      {link.name}
                    </p>
                    {link.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {link.description}
                      </p>
                    )}
                  </div>

                  {/* 箭头 */}
                  <span className="text-muted-foreground group-hover:text-ember
                                   transition-colors flex-shrink-0 text-sm">
                    ↗
                  </span>
                </a>
              ))}
            </div>
          </section>
        )
      })}

      {links.length === 0 && (
        <p className="text-center text-muted-foreground py-20">暂无链接</p>
      )}
    </div>
  )
}

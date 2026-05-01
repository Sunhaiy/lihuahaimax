/**
 * app/(blog)/about/page.tsx
 *
 * 关于我 — 个人介绍页面。
 */

import type { Metadata } from 'next'

export const metadata: Metadata = { title: '关于 · 梨花海' }

const SKILLS = [
  { cat: '嵌入式 & 硬件', items: ['ESP32', 'STM32', 'MQTT', 'FreeRTOS', 'KiCad'] },
  { cat: '后端 & 基建',   items: ['Node.js', 'Next.js', 'PostgreSQL', 'Docker', 'Linux'] },
  { cat: '前端',          items: ['React', 'TypeScript', 'Tailwind CSS', 'Tiptap'] },
  { cat: '工具链',        items: ['Git', 'Neovim', 'Arch Linux', 'GitHub Actions'] },
]

const TIMELINE = [
  { year: '2025', event: '开始写作梨花海博客，记录代码与生活' },
  { year: '2023', event: '深入物联网方向，玩转 ESP32 & MQTT' },
  { year: '2021', event: '接触嵌入式开发，从 Arduino 一路踩坑' },
  { year: '2019', event: '写下第一行 Python，正式入坑编程' },
]

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* ── 头部 ── */}
      <div className="mb-16 flex flex-col sm:flex-row items-start sm:items-center gap-8">
        <div className="w-24 h-24 rounded-full flex-shrink-0
                        bg-gradient-to-br from-ember/40 to-ember/10
                        border-2 border-ember/25 flex items-center justify-center">
          <span className="text-4xl font-bold text-ember select-none">梨</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">梨花海</h1>
          <p className="mb-3 text-sm font-medium tracking-[0.08em] text-ember">
            极客 · 二次元 · 代码诗人
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-lg">
            热爱 coding，追番打游戏，记录凌晨 3 点的一切。
            这里是我的数字中枢——代码笔记、生活随想、ACG 收藏和光影相册。
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12">
        {/* ── 左栏：介绍 + 技能 ── */}
        <div className="space-y-12">
          {/* 关于我 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="text-ember">✦</span> 关于我
            </h2>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                一个在嵌入式和 Web 全栈之间横跳的程序员。
                白天写固件，晚上写博客，周末追番，深夜打游戏。
              </p>
              <p>
                相信工具驱动思维，喜欢用代码解决生活中遇到的问题，
                哪怕有时候这个"解决方案"比问题本身还复杂。
              </p>
              <p>
                这个博客是我的数字笔记本，记录我在技术、生活、二次元路上的所有探索。
                欢迎一起交流，也欢迎来友链区互换链接。
              </p>
            </div>
          </section>

          {/* 技能栈 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="text-ember">✦</span> 技能栈
            </h2>
            <div className="space-y-4">
              {SKILLS.map(({ cat, items }) => (
                <div key={cat}>
                  <p className="mb-2 text-xs font-medium text-ember">{cat}</p>
                  <div className="flex flex-wrap gap-2">
                    {items.map((item) => (
                      <span
                        key={item}
                        className="text-xs px-2.5 py-1 rounded-full border border-border
                                   bg-card text-muted-foreground"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ── 右栏：时间线 + 联系 ── */}
        <div className="space-y-10">
          {/* 时间线 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="text-ember">✦</span> 时间线
            </h2>
            <div className="space-y-4">
              {TIMELINE.map(({ year, event }) => (
                <div key={year} className="flex gap-4">
                  <span className="text-xs font-mono text-ember pt-0.5 w-10 flex-shrink-0">
                    {year}
                  </span>
                  <p className="text-sm text-muted-foreground leading-relaxed">{event}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 联系我 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="text-ember">✦</span> 联系我
            </h2>
            <div className="space-y-2">
              {[
                { label: 'GitHub', href: 'https://github.com', icon: '⌥' },
                { label: '友情链接', href: '/links', icon: '🤝' },
              ].map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="flex items-center gap-3 text-sm text-muted-foreground
                             hover:text-ember transition-colors"
                >
                  <span className="w-5 text-center">{icon}</span>
                  {label}
                </a>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

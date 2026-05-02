import type { Metadata } from 'next'
import { getSiteProfile } from '@/lib/site'

export const metadata: Metadata = { title: '关于' }

const SKILLS = [
  { cat: '嵌入式 & 硬件', items: ['ESP32', 'STM32', 'MQTT', 'FreeRTOS', 'KiCad'] },
  { cat: '后端 & 基建', items: ['Node.js', 'Next.js', 'PostgreSQL', 'Docker', 'Linux'] },
  { cat: '前端', items: ['React', 'TypeScript', 'Tailwind CSS', 'Tiptap'] },
  { cat: '工具链', items: ['Git', 'Neovim', 'Arch Linux', 'GitHub Actions'] },
]

const TIMELINE = [
  { year: '2025', event: '开始持续写博客，把代码、项目和生活并排记录下来。' },
  { year: '2023', event: '深入物联网方向，围着 ESP32、MQTT 和自动化折腾。' },
  { year: '2021', event: '从 Arduino 起步，正式扎进嵌入式和软硬件协作。' },
  { year: '2019', event: '写下第一行 Python，慢慢把兴趣变成长期能力。' },
]

export default async function AboutPage() {
  const siteProfile = await getSiteProfile()

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-16 flex flex-col items-start gap-8 sm:flex-row sm:items-center">
        <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-ember/25 bg-gradient-to-br from-ember/40 to-ember/10">
          {siteProfile.avatarUrl ? (
            <img
              src={siteProfile.avatarUrl}
              alt={siteProfile.ownerName}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="select-none text-4xl font-bold text-ember">
              {siteProfile.ownerInitial}
            </span>
          )}
        </div>
        <div>
          <h1 className="mb-1 text-3xl font-bold text-foreground">{siteProfile.ownerName}</h1>
          <p className="mb-3 text-sm font-medium tracking-[0.08em] text-ember">
            {siteProfile.roleLine}
          </p>
          <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
            {siteProfile.bio} 这里也是我整理文章、项目、收藏与生活轨迹的地方。
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_280px]">
        <div className="space-y-12">
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <span className="text-ember">+</span> 关于我
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                我习惯在嵌入式、Web 全栈和内容系统之间来回切换，喜欢把一个想法从硬件、接口、
                后台到前台一步一步做完整。
              </p>
              <p>
                这个站点不只是博客，也是一套长期使用的个人系统。文章、瞬间、动漫、游戏、项目、
                友链和图像内容会慢慢汇到同一个中枢里。
              </p>
              <p>
                如果你也喜欢把作品做成自己真正会用的系统，而不是只停留在演示稿上，那我们大概率聊得来。
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <span className="text-ember">+</span> 技能栈
            </h2>
            <div className="space-y-4">
              {SKILLS.map(({ cat, items }) => (
                <div key={cat}>
                  <p className="mb-2 text-xs font-medium text-ember">{cat}</p>
                  <div className="flex flex-wrap gap-2">
                    {items.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground"
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

        <div className="space-y-10">
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <span className="text-ember">+</span> 时间线
            </h2>
            <div className="space-y-4">
              {TIMELINE.map(({ year, event }) => (
                <div key={year} className="flex gap-4">
                  <span className="w-10 flex-shrink-0 pt-0.5 text-xs font-mono text-ember">
                    {year}
                  </span>
                  <p className="text-sm leading-relaxed text-muted-foreground">{event}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <span className="text-ember">+</span> 联系方式
            </h2>
            <div className="space-y-2">
              {siteProfile.githubUrl ? (
                <a
                  href={siteProfile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-ember"
                >
                  <span className="w-5 text-center">GitHub</span>
                  {siteProfile.githubUrl}
                </a>
              ) : null}
              {siteProfile.email ? (
                <a
                  href={`mailto:${siteProfile.email}`}
                  className="flex items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-ember"
                >
                  <span className="w-5 text-center">邮箱</span>
                  {siteProfile.email}
                </a>
              ) : null}
              <a
                href="/links"
                className="flex items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-ember"
              >
                <span className="w-5 text-center">友链</span>
                访问友情链接页
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

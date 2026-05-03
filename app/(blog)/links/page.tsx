import type { Metadata } from 'next'
import { LinkSiteProfileCard } from '@/components/ui/LinkSiteProfileCard'
import { LinkSubmissionDialog } from '@/components/ui/LinkSubmissionDialog'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'
import { findLinks } from '@/lib/db/dao/linkDao'
import { getSiteProfile } from '@/lib/site'
import type { LinkCategory, LinkRow } from '@/types/link'

export const metadata: Metadata = {
  title: '友情链接',
  description: '收藏一些值得停留的博客、工具和灵感来源，也开放友链申请。',
}

export const revalidate = 3600

const CATEGORY_CONFIG: Record<
  LinkCategory,
  { label: string; icon: string; description: string }
> = {
  friend: {
    label: '友情链接',
    icon: 'group',
    description: '认真写字、长期更新，也愿意把自己的角落打理得很舒服的人。',
  },
  tool: {
    label: '常用工具',
    icon: 'construction',
    description: '真正会被频繁打开的产品和效率工具，安静但很能打。',
  },
  resource: {
    label: '学习资源',
    icon: 'menu_book',
    description: '文档、教程和参考资料，遇到问题时很值得先回到这里。',
  },
  inspire: {
    label: '灵感来源',
    icon: 'auto_awesome',
    description: '能带来审美、表达和想法上的触动，适合慢慢逛。',
  },
  other: {
    label: '其他收藏',
    icon: 'interests',
    description: '不一定容易归类，但确实值得记住的一些地方。',
  },
}

const CATEGORY_ORDER: LinkCategory[] = ['friend', 'tool', 'resource', 'inspire', 'other']

function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

function groupLinks(links: LinkRow[]) {
  return CATEGORY_ORDER.reduce<Record<LinkCategory, LinkRow[]>>((acc, category) => {
    acc[category] = links.filter((item) => item.category === category)
    return acc
  }, {} as Record<LinkCategory, LinkRow[]>)
}

function splitRequirements(value: string) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

export default async function LinksPage() {
  const [links, siteProfile] = await Promise.all([findLinks(true), getSiteProfile()])
  const grouped = groupLinks(links)
  const activeCategories = CATEGORY_ORDER.filter((category) => grouped[category]?.length > 0)
  const requirements = splitRequirements(siteProfile.friendLinkRequirements)
  const rssUrl = siteProfile.rssUrl.startsWith('http')
    ? siteProfile.rssUrl
    : `${siteProfile.siteUrl.replace(/\/$/, '')}${siteProfile.rssUrl}`

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 sm:px-8">
      <div className="grid items-start gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <LinkSiteProfileCard
          siteProfile={siteProfile}
          rssUrl={rssUrl}
          stats={[
            { label: '总收录', value: `${links.length}` },
            { label: '分类数', value: `${activeCategories.length}` },
            { label: '博主', value: siteProfile.ownerName },
          ]}
        />

        <section className="relative self-start overflow-hidden rounded-[30px] border border-white/10 bg-[rgba(20,20,22,0.58)] px-6 py-7 backdrop-blur-2xl sm:px-7">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent_58%)]" />

          <div className="relative flex flex-col">
            <div className="flex items-center gap-2">
              <MaterialSymbol icon="add_link" size={18} className="text-white/62" />
              <p className="text-sm font-semibold text-white">申请友链信息</p>
            </div>

            <p className="mt-3 text-sm leading-7 text-white/66">
              如果你也在认真维护自己的站点，欢迎把信息留在这里。我会按顺序回访，合适的话会尽快补上链接。
            </p>

            {requirements.length > 0 ? (
              <div className="mt-5 rounded-[24px] border border-white/8 bg-white/[0.03] px-5 py-5">
                <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-white/42">
                  Requirements
                </p>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-white/72">
                  {requirements.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-[0.58rem] h-1.5 w-1.5 shrink-0 rounded-full bg-white/28" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-5">
              <div className="flex flex-col gap-4 rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-white/40">
                    <MaterialSymbol icon="schedule" size={14} className="text-white/40" />
                    <span>处理方式</span>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-white/78">收到后会按顺序回访</p>
                </div>

                <div className="flex justify-end">
                  <LinkSubmissionDialog />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-8 space-y-8">
        {activeCategories.map((category) => {
          const items = grouped[category]
          const config = CATEGORY_CONFIG[category]

          return (
            <section key={category} className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-1.5 backdrop-blur-md">
                    <MaterialSymbol icon={config.icon} size={15} className="text-white/58" />
                    <span className="text-xs font-mono uppercase tracking-[0.22em] text-white/72">
                      {config.label}
                    </span>
                    <span className="text-xs text-white/36">{items.length}</span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{config.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {items.map((link, index) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative h-full overflow-hidden rounded-[26px] border border-white/10 bg-[rgba(18,18,20,0.52)] p-5 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-white/16 hover:bg-[rgba(20,20,24,0.62)]"
                    style={{ transitionDelay: `${Math.min(index * 22, 160)}ms` }}
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent_48%)] opacity-60" />
                    <div className="relative flex h-full flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
                            {link.avatar_url ? (
                              <img
                                src={link.avatar_url}
                                alt={link.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-base font-semibold text-white/78">
                                {link.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-base font-semibold text-white transition-colors duration-200 group-hover:text-white">
                              {link.name}
                            </p>
                            <p className="mt-1 truncate text-[11px] font-mono uppercase tracking-[0.18em] text-white/38">
                              {getDomain(link.url)}
                            </p>
                          </div>
                        </div>

                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/38 transition-all duration-200 group-hover:border-white/16 group-hover:bg-white/[0.06] group-hover:text-white/78">
                          <MaterialSymbol icon="arrow_outward" size={15} />
                        </span>
                      </div>

                      <div className="mt-4 flex-1 rounded-[20px] border border-white/8 bg-black/12 px-4 py-4">
                        <p className="line-clamp-3 text-sm leading-7 text-white/72">
                          {link.description || '这个站点还没补充简介，但已经足够值得被放进收藏。'}
                        </p>
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-4 text-[11px] font-mono text-white/42">
                        <span className="inline-flex items-center gap-1.5">
                          <MaterialSymbol icon={config.icon} size={14} />
                          {config.label}
                        </span>
                        <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                          Visit
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )
        })}

        {links.length === 0 ? (
          <div className="rounded-[28px] border border-white/10 bg-[rgba(18,18,20,0.48)] px-6 py-20 text-center backdrop-blur-2xl">
            <p className="text-sm text-white/55">这里还没有公开链接。</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

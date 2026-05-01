import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'
import { findWorkBySlug } from '@/lib/db/dao/worksDao'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const work = await findWorkBySlug(slug)

  if (!work) {
    return { title: '项目不存在 · 梨花海' }
  }

  return {
    title: `${work.title} · 项目档案`,
    description: work.summary || work.description || undefined,
  }
}

export default async function WorkDetailPage({ params }: PageProps) {
  const { slug } = await params
  const work = await findWorkBySlug(slug)

  if (!work) notFound()

  const heroImage = work.hero_image_url || work.cover_url
  const gallery = work.gallery.length > 0
    ? work.gallery
    : heroImage
      ? [heroImage]
      : []

  return (
    <>
      <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-14 sm:px-6">
        <div className="pointer-events-none absolute bottom-0 right-0 hidden translate-y-8 select-none text-[180px] font-black tracking-[-0.08em] text-white/[0.03] xl:block">
          {work.slug.toUpperCase()}
        </div>

        <header className="relative z-10">
          <Link
            href="/works"
            className="inline-flex items-center gap-2 text-sm text-slate-300/68 hover:text-slate-100"
          >
            <MaterialSymbol icon="arrow_back" size={18} />
            返回作品列表
          </Link>

          <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-3xl">
              <p className="text-[11px] font-mono uppercase tracking-[0.35em] text-sky-100/56">
                Classified Archive
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl">
                {work.title}
              </h1>
              {work.subtitle ? (
                <p className="mt-3 text-lg text-slate-200/78">{work.subtitle}</p>
              ) : null}
              {work.summary || work.description ? (
                <p className="mt-5 max-w-2xl text-sm leading-8 text-slate-300/76">
                  {work.summary || work.description}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              {work.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-sky-300/12 bg-sky-300/10 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.18em] text-sky-100/82"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </header>

        <div className="relative z-10 mt-10 grid gap-8 xl:grid-cols-[1.25fr_0.75fr]">
          <section className="space-y-6">
            <div className="overflow-hidden rounded-[30px] border border-white/10 bg-black/30 shadow-[0_24px_100px_rgba(2,6,23,0.35)] backdrop-blur-xl">
              <div className="relative aspect-[16/10] overflow-hidden bg-black/30">
                {heroImage ? (
                  <img
                    src={heroImage}
                    alt={work.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-ember/20 via-card to-muted">
                    <span className="text-[120px] font-black tracking-[-0.08em] text-ember/20">
                      {work.title.charAt(0)}
                    </span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/12 to-transparent" />
                <div className="absolute left-5 top-5 rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.24em] text-slate-100/72">
                  {work.year ?? 'Archive'}
                </div>
                {work.seal ? (
                  <div className="absolute bottom-6 right-6 rounded-full bg-ember px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_36px_rgba(255,138,107,0.35)]">
                    {work.seal}
                  </div>
                ) : null}
              </div>

              {gallery.length > 1 ? (
                <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-4">
                  {gallery.slice(0, 4).map((image, index) => (
                    <div key={`${image}-${index}`} className="overflow-hidden rounded-[18px] border border-white/8 bg-black/20">
                      <img src={image} alt="" className="aspect-[4/3] w-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {work.milestones.length > 0 ? (
              <section className="rounded-[28px] border border-white/8 bg-black/24 p-6 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-400/10 text-sky-100">
                    <MaterialSymbol icon="timeline" size={20} />
                  </span>
                  <div>
                    <p className="text-[11px] font-mono uppercase tracking-[0.24em] text-slate-300/52">
                      Development Timeline
                    </p>
                    <h2 className="mt-1 text-xl font-semibold text-white">项目里程碑</h2>
                  </div>
                </div>

                <div className="mt-6 overflow-x-auto pb-2">
                  <div className="flex min-w-max gap-4">
                    {work.milestones.map((item, index) => (
                      <div
                        key={`${item.title}-${index}`}
                        className="w-[280px] rounded-[24px] border border-white/8 bg-white/[0.03] p-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-ember">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-slate-300/48">
                            {item.date}
                          </span>
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
                        <p className="mt-3 text-sm leading-7 text-slate-300/74">{item.desc}</p>
                        {item.link ? (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 inline-flex items-center gap-2 text-sm text-sky-100/82 hover:text-white"
                          >
                            <MaterialSymbol icon="open_in_new" size={16} />
                            查看关联节点
                          </a>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ) : null}

            {(work.content || work.description) ? (
              <section className="rounded-[28px] border border-white/8 bg-black/24 p-6 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ember/12 text-ember">
                    <MaterialSymbol icon="description" size={20} />
                  </span>
                  <div>
                    <p className="text-[11px] font-mono uppercase tracking-[0.24em] text-slate-300/52">
                      Product Specification
                    </p>
                    <h2 className="mt-1 text-xl font-semibold text-white">项目说明</h2>
                  </div>
                </div>

                <div className="mt-6 space-y-4 text-[15px] leading-8 text-slate-200/80">
                  {(work.content || work.description || '')
                    .split(/\n{2,}/)
                    .filter(Boolean)
                    .map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                </div>
              </section>
            ) : null}
          </section>

          <aside className="space-y-6">
            <section className="rounded-[28px] border border-white/8 bg-black/24 p-5 backdrop-blur-xl">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <StatCard label="状态" value={work.status_text || 'ACTIVE'} icon="data_alert" />
                <StatCard label="进度" value={work.progress_text || '0 / 0'} icon="monitoring" />
                <StatCard label="版本" value={work.version_text || 'v1.0.0'} icon="release_alert" />
                <StatCard label="年份" value={String(work.year ?? '2026')} icon="calendar_month" />
              </div>

              {(work.price || work.original_price) ? (
                <div className="mt-5 rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-slate-300/52">
                    Commercial / Join
                  </p>
                  <div className="mt-3 flex items-end gap-4">
                    {work.price ? (
                      <span className="text-2xl font-semibold text-white">¥ {work.price}</span>
                    ) : null}
                    {work.original_price ? (
                      <span className="text-sm text-slate-400 line-through">¥ {work.original_price}</span>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div className="mt-5 flex flex-col gap-3">
                {work.primary_url ? (
                  <Button asChild className="justify-center rounded-full">
                    <a href={work.primary_url} target="_blank" rel="noopener noreferrer">
                      <MaterialSymbol icon="rocket_launch" size={18} />
                      {work.primary_label || '访问项目'}
                    </a>
                  </Button>
                ) : null}

                {work.secondary_url || work.github_url ? (
                  <Button asChild variant="secondary" className="justify-center rounded-full">
                    <a
                      href={work.secondary_url || work.github_url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MaterialSymbol icon="open_in_new" size={18} />
                      {work.secondary_label || '查看外链 / 源码'}
                    </a>
                  </Button>
                ) : null}
              </div>
            </section>

            {work.contributors.length > 0 ? (
              <section className="rounded-[28px] border border-white/8 bg-black/24 p-5 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-400/10 text-sky-100">
                    <MaterialSymbol icon="group" size={20} />
                  </span>
                  <div>
                    <p className="text-[11px] font-mono uppercase tracking-[0.24em] text-slate-300/52">
                      Contributors
                    </p>
                    <h2 className="mt-1 text-xl font-semibold text-white">参与成员</h2>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {work.contributors.map((item, index) => (
                    <div
                      key={`${item.name}-${index}`}
                      className="flex items-center gap-3 rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4"
                    >
                      {item.avatar_url ? (
                        <img
                          src={item.avatar_url}
                          alt={item.name}
                          className="h-11 w-11 rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-sm font-semibold text-white">
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-white">{item.name}</p>
                        <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-slate-300/48">
                          {item.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </aside>
        </div>
      </div>
    </>
  )
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon: string
}) {
  return (
    <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
      <div className="flex items-center gap-2 text-slate-300/52">
        <MaterialSymbol icon={icon} size={16} />
        <span className="text-[11px] font-mono uppercase tracking-[0.18em]">{label}</span>
      </div>
      <p className="mt-3 text-lg font-semibold text-white">{value}</p>
    </div>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiEyeLine,
  RiTimeLine,
} from '@remixicon/react'
import { auth } from '@/auth'
import { TOC } from '@/components/ui/TOC'
import { resolveMediaUrl } from '@/lib/media'
import {
  findAdjacentPosts,
  findPostBySlug,
  findPosts,
  incrementViewCount,
} from '@/lib/db/dao/postDao'
import { getSiteProfile } from '@/lib/site'
import { extractHeadings, estimateReadTime } from '@/lib/utils/extractHeadings'
import { CommentSection } from './CommentSection'
import { PostContent } from './PostContent'

export const revalidate = 3600

export async function generateStaticParams() {
  const result = await findPosts({ status: 'published', pageSize: 100 })
  return result.data.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const [post, siteProfile] = await Promise.all([findPostBySlug(slug), getSiteProfile()])

  if (!post) {
    return { title: '文章不存在' }
  }

  const coverUrl = resolveMediaUrl(post.cover_url, siteProfile.defaultPostCoverUrl)

  return {
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt || undefined,
    openGraph: {
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt || undefined,
      images: coverUrl ? [coverUrl] : [],
      type: 'article',
      publishedTime: post.published_at?.toISOString(),
    },
  }
}

export default async function PostPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ preview?: string }>
}) {
  const { slug } = await params
  const { preview } = await searchParams
  const post = await findPostBySlug(slug)
  const session = await auth()
  const canPreviewDraft = preview === '1' && Boolean(session)

  if (!post || (post.status !== 'published' && !canPreviewDraft)) {
    notFound()
  }

  if (post.status === 'published') {
    incrementViewCount(post.id).catch(() => {})
  }

  const [adjacent, siteProfile] = await Promise.all([
    post.published_at
      ? findAdjacentPosts(post.published_at, post.id)
      : Promise.resolve({ prev: null, next: null }),
    getSiteProfile(),
  ])

  const headings = extractHeadings(post.content as object)
  const readTime = estimateReadTime(post.content as object)
  const coverUrl = resolveMediaUrl(post.cover_url, siteProfile.defaultPostCoverUrl)
  const hasCover = Boolean(coverUrl)

  return (
    <>
      <section className="relative overflow-hidden" style={{ minHeight: '420px' }}>
        {hasCover ? (
          <img
            src={coverUrl!}
            alt={post.cover_alt || post.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <>
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -left-16 -top-32 h-[480px] w-[480px] rounded-full bg-primary/12 blur-[120px]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-primary/8 blur-[80px]"
            />
          </>
        )}

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/82 via-black/34 to-black/10"
        />

        <div className="relative flex min-h-[420px] flex-col items-center justify-center px-6 pb-28 pt-16 text-center sm:px-20">
          {post.tags.length > 0 ? (
            <div className="mb-5 flex flex-wrap justify-center gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/posts?tags=${encodeURIComponent(tag)}`}
                  className="rounded-full border border-white/16 bg-white/10 px-3 py-1 text-xs font-medium text-white/82 backdrop-blur-sm transition-colors hover:bg-white/18"
                >
                  {tag}
                </Link>
              ))}
            </div>
          ) : null}

          <h1 className="max-w-3xl text-3xl font-bold leading-snug tracking-tight text-white sm:text-4xl lg:text-5xl">
            {post.title}
          </h1>

          {post.excerpt ? (
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/58 sm:text-base">
              {post.excerpt}
            </p>
          ) : null}
        </div>

        <div className="absolute inset-x-0 bottom-0 flex justify-center px-6 pb-6">
          <div className="flex items-center gap-0 overflow-hidden rounded-xl border border-white/10 bg-black/35 text-xs font-mono text-white/70 backdrop-blur-md divide-x divide-white/10">
            <div className="px-4 py-2.5 font-semibold text-white/90">{siteProfile.ownerName}</div>

            {post.published_at ? (
              <div className="flex items-center gap-1.5 px-4 py-2.5">
                <RiTimeLine size={12} className="shrink-0" />
                <time dateTime={post.published_at.toISOString()}>
                  {new Date(post.published_at).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  })}
                </time>
              </div>
            ) : null}

            <div className="flex items-center gap-1.5 px-4 py-2.5">
              <RiEyeLine size={12} className="shrink-0" />
              <span>{post.view_count}</span>
            </div>

            <div className="px-4 py-2.5">约 {readTime} 分钟</div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-3 py-10 sm:px-5">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_220px]">
          <article className="min-w-0">
            <PostContent content={post.content as object} />

            <div className="mb-8 mt-12 border-t border-border" />

            <div className="flex items-center gap-5 rounded-2xl border border-border bg-card p-6">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary/25 bg-gradient-to-br from-primary/30 to-primary/8">
                {siteProfile.avatarUrl ? (
                  <img
                    src={siteProfile.avatarUrl}
                    alt={siteProfile.ownerName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="select-none text-xl font-bold text-primary">
                    {siteProfile.ownerInitial}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="mb-0.5 text-sm font-semibold text-foreground">
                  {siteProfile.ownerName}
                </p>
                <p className="mb-2 text-[11px] font-medium tracking-[0.08em] text-primary">
                  {siteProfile.roleLine}
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">{siteProfile.bio}</p>
              </div>
            </div>

            {adjacent.prev || adjacent.next ? (
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {adjacent.prev ? (
                  <Link
                    href={`/posts/${adjacent.prev.slug}`}
                    className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30"
                  >
                    <RiArrowLeftSLine
                      size={18}
                      className="mt-0.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                    />
                    <div className="min-w-0">
                      <p className="mb-1 text-[10px] font-medium text-muted-foreground">上一篇</p>
                      <p className="line-clamp-2 text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                        {adjacent.prev.title}
                      </p>
                    </div>
                  </Link>
                ) : (
                  <div />
                )}

                {adjacent.next ? (
                  <Link
                    href={`/posts/${adjacent.next.slug}`}
                    className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-right transition-colors hover:border-primary/30 sm:flex-row-reverse"
                  >
                    <RiArrowRightSLine
                      size={18}
                      className="mt-0.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                    />
                    <div className="min-w-0">
                      <p className="mb-1 text-[10px] font-medium text-muted-foreground">下一篇</p>
                      <p className="line-clamp-2 text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                        {adjacent.next.title}
                      </p>
                    </div>
                  </Link>
                ) : (
                  <div />
                )}
              </div>
            ) : null}

            <CommentSection postId={post.id} />
          </article>

          <aside className="hidden lg:block">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-xl border border-border bg-card p-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <TOC headings={headings} />
              {headings.length === 0 ? (
                <p className="text-xs text-muted-foreground">本文暂无目录</p>
              ) : null}
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}

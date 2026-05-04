import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { WorkDetailShowcase } from '@/components/ui/WorkDetailShowcase'
import { findWorkBySlug, findWorks } from '@/lib/db/dao/worksDao'
import { getSiteProfile } from '@/lib/site'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const works = await findWorks()
  return works.map((work) => ({ slug: work.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const work = await findWorkBySlug(slug)

  if (!work) {
    return { title: '项目不存在' }
  }

  return {
    title: `${work.title} | 项目详情`,
    description: work.summary || work.description || undefined,
    openGraph: {
      title: work.title,
      description: work.summary || work.description || undefined,
      images: work.hero_image_url || work.cover_url ? [work.hero_image_url || work.cover_url] : [],
    },
  }
}

export default async function WorkDetailPage({ params }: PageProps) {
  const { slug } = await params
  const [work, works, siteProfile] = await Promise.all([
    findWorkBySlug(slug),
    findWorks(),
    getSiteProfile(),
  ])

  if (!work) notFound()

  return <WorkDetailShowcase work={work} works={works} siteUrl={siteProfile.siteUrl} />
}

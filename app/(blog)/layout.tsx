import Link from 'next/link'
import { auth } from '@/auth'
import { SceneShell } from '@/components/scene/SceneShell'
import { NavBar } from '@/components/ui/NavBar'
import { PageTransition } from '@/components/ui/PageTransition'
import { findCategories } from '@/lib/db/dao/postDao'
import { getBackgroundSceneSettings } from '@/lib/scene'

export default async function BlogLayout({ children }: { children: React.ReactNode }) {
  const [categories, scene, session] = await Promise.all([
    findCategories().catch(() => []),
    getBackgroundSceneSettings(),
    auth(),
  ])

  return (
    <SceneShell scene={scene} canEdit={Boolean(session)}>
      <div className="flex min-h-screen flex-col">
        <NavBar categories={categories} />

        <main className="flex-1 pt-16">
          <PageTransition>{children}</PageTransition>
        </main>

        <footer className="mt-16 border-t border-border py-8">
          <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              (c) {new Date().getFullYear()} 梨花海 · 用代码记录生活
            </p>
            <div className="flex items-center gap-4">
              <Link href="/links" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
                友情链接
              </Link>
              <Link href="/dashboard" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
                后台
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </SceneShell>
  )
}

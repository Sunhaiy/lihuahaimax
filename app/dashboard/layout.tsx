import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const navItems = [
  { href: '/dashboard', label: '概览', icon: 'dashboard' },
  { href: '/dashboard/posts', label: '文章管理', icon: 'article' },
  { href: '/dashboard/categories', label: '分类管理', icon: 'grid_view' },
  { href: '/dashboard/comments', label: '评论管理', icon: 'forum' },
  { href: '/dashboard/moments', label: '瞬间管理', icon: 'dynamic_feed' },
  { href: '/dashboard/works', label: '作品管理', icon: 'deployed_code' },
  { href: '/dashboard/acg', label: 'ACG 管理', icon: 'stadia_controller' },
  { href: '/dashboard/gallery', label: '相册管理', icon: 'photo_library' },
  { href: '/dashboard/links', label: '友链管理', icon: 'link' },
  { href: '/dashboard/settings', label: '场景设置', icon: 'wallpaper' },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-[280px] shrink-0 border-r border-border/80 bg-card/70 backdrop-blur-xl lg:flex lg:flex-col">
          <div className="border-b border-border/80 px-6 py-6">
            <Link href="/dashboard" className="inline-flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ember/15 text-ember">
                <MaterialSymbol icon="deployed_code" size={24} fill />
              </span>
              <span>
                <span className="block text-lg font-semibold">Lihua Console</span>
                <span className="block text-[11px] font-mono uppercase tracking-[0.26em] text-muted-foreground">
                  Unified Scene Panel
                </span>
              </span>
            </Link>
          </div>

          <nav className="flex-1 space-y-1 px-4 py-5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-muted-foreground transition-all duration-200 hover:bg-white/5 hover:text-foreground"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-background/70 text-ember/80 transition-colors group-hover:text-ember">
                  <MaterialSymbol icon={item.icon} size={20} />
                </span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="border-t border-border/80 px-5 py-4">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <MaterialSymbol icon="open_in_new" size={18} />
              访问前台
            </Link>
            <p className="mt-3 truncate text-xs text-muted-foreground">{session.user?.email}</p>
            <Link
              href="/api/auth/signout"
              className="mt-2 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-red-400"
            >
              <MaterialSymbol icon="logout" size={16} />
              退出登录
            </Link>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 px-4 backdrop-blur-xl sm:px-6">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-3 lg:hidden">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ember/15 text-ember">
                  <MaterialSymbol icon="deployed_code" size={22} fill />
                </span>
                <div>
                  <p className="text-sm font-semibold">Lihua Console</p>
                  <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
                    Scene System
                  </p>
                </div>
              </div>
              <div className="hidden lg:block" />
              <ThemeToggle />
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

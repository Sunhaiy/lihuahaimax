/**
 * components/ui/PageTransition.tsx
 *
 * 路由切换时，通过 key={pathname} 强制 React 卸载/重挂载包装层，
 * 使 animate-slide-up 每次导航都重新触发，实现页面进入动画。
 */

'use client'

import { usePathname } from 'next/navigation'

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div key={pathname} className="animate-slide-up">
      {children}
    </div>
  )
}

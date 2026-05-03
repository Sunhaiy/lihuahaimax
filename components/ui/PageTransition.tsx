'use client'

import { usePathname } from 'next/navigation'

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div key={pathname} className="animate-slide-up will-change-transform motion-reduce:animate-none">
      {children}
    </div>
  )
}

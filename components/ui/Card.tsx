/**
 * components/ui/Card.tsx
 *
 * 通用内容卡片。
 * 夜间主题原则：零 box-shadow，层级靠 border 颜色变化体现。
 * hover 时边框从 #27272A 过渡到橙红 / 海蓝微发光。
 */

interface CardProps {
  children: React.ReactNode
  className?: string
  hoverable?: boolean
  /** 悬浮发光色：ember（橙红）| ocean（海蓝）| none */
  glow?: 'ocean' | 'ember' | 'none'
  onClick?: () => void
}

export function Card({ children, className = '', hoverable = false, glow = 'none', onClick }: CardProps) {
  const glowCls = {
    ember: 'hover:[border-color:hsl(var(--ember)/0.5)] hover:[box-shadow:0_0_0_1px_hsl(var(--ember)/0.12)]',
    ocean: 'hover:[border-color:hsl(var(--primary)/0.5)] hover:[box-shadow:0_0_0_1px_hsl(var(--primary)/0.1)]',
    none:  '',
  }[glow]

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      className={[
        'rounded-card bg-card transition-all duration-200',
        'border border-border',
        hoverable ? 'cursor-pointer' : '',
        glow !== 'none' ? glowCls : hoverable ? 'hover:[border-color:rgba(0,0,0,0.12)] dark:hover:[border-color:rgba(255,255,255,0.08)]' : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}

/** 卡片内容区 */
export function CardBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-6 ${className}`}>{children}</div>
}

/** 卡片底部操作区 */
export function CardFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-4 border-t border-border ${className}`}>
      {children}
    </div>
  )
}

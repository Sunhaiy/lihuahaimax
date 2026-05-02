/**
 * components/ui/Button.tsx
 *
 * 通用按钮组件。
 * 支持 variant（primary / secondary / ghost / danger）和 size。
 * 图标通过 children 插槽传入，配合 Icon 组件使用。
 */

import { forwardRef, cloneElement, isValidElement, Children } from 'react'
import type { ButtonHTMLAttributes, ReactElement } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
  asChild?: boolean
}

const variantClasses: Record<Variant, string> = {
  // 主题强调色 #FF8A6B — 关键操作按钮，带珊瑚橙微发光
  primary:
    'bg-ember text-white hover:bg-ember-600' +
    ' [box-shadow:0_0_0_1px_hsl(var(--ember)/0.22)] hover:[box-shadow:0_0_16px_hsl(var(--ember)/0.32),0_0_0_1px_hsl(var(--ember)/0.3)]',
  // 次要按钮：zinc 边框，hover 时边框微亮
  secondary:
    'bg-transparent text-foreground border border-border hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]',
  ghost:
    'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5',
  danger:
    'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40',
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-7 px-3 text-xs gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-11 px-6 text-base gap-2.5',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, fullWidth = false, asChild = false, className = '', disabled, children, ...props }, ref) => {
    const cls = [
      'inline-flex items-center justify-center rounded-base font-sans font-medium',
      'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      variantClasses[variant],
      sizeClasses[size],
      fullWidth ? 'w-full' : '',
      className,
    ].join(' ')

    if (asChild && isValidElement(children)) {
      const child = Children.only(children) as ReactElement<{ className?: string }>
      return cloneElement(child, { className: [cls, child.props.className ?? ''].join(' ').trim() })
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cls}
        {...props}
      >
        {loading ? (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : null}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

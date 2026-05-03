import { Children, cloneElement, forwardRef, isValidElement } from 'react'
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
  primary:
    'border border-primary/20 bg-primary text-primary-foreground hover:border-primary/24 hover:bg-primary/92',
  secondary:
    'border border-border/80 bg-card/72 text-foreground hover:border-border hover:bg-background/55',
  ghost:
    'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5',
  danger:
    'border border-red-500/20 bg-red-500/10 text-red-400 hover:border-red-500/40 hover:bg-red-500/20',
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-6 text-base gap-2.5',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      asChild = false,
      className = '',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const cls = [
      'inline-flex items-center justify-center rounded-2xl font-sans font-medium',
      'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
      'disabled:cursor-not-allowed disabled:opacity-50',
      variantClasses[variant],
      sizeClasses[size],
      fullWidth ? 'w-full' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    if (asChild && isValidElement(children)) {
      const child = Children.only(children) as ReactElement<{ className?: string }>
      return cloneElement(child, { className: [cls, child.props.className ?? ''].join(' ').trim() })
    }

    return (
      <button ref={ref} disabled={disabled || loading} className={cls} {...props}>
        {loading ? (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

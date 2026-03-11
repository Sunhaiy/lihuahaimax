/**
 * components/ui/Icon.tsx
 *
 * Remix Icon 统一封装组件。
 * 全局图标系统的入口，确保样式（大小、颜色）统一。
 * 使用 @remixicon/react 包，禁止在其他地方直接引入 SVG 图标。
 *
 * 使用示例:
 *   <Icon icon={RiHome3Line} size={20} className="text-ocean" />
 */

import type { ComponentType } from 'react'
import type { RemixiconComponentType } from '@remixicon/react'

interface IconProps {
  icon: RemixiconComponentType | ComponentType<{ size?: number; className?: string }>
  size?: number
  className?: string
  'aria-hidden'?: boolean
  'aria-label'?: string
}

export function Icon({
  icon: IconComponent,
  size = 20,
  className = '',
  'aria-hidden': ariaHidden = true,
  'aria-label': ariaLabel,
}: IconProps) {
  return (
    <IconComponent
      size={size}
      className={className}
      aria-hidden={ariaHidden}
      aria-label={ariaLabel}
    />
  )
}

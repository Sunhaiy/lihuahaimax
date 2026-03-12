/**
 * features/moments/constants.ts
 *
 * 瞬间类型 UI 配置 — 集中管理所有标签、图标、颜色。
 * 这是单一真实来源 (SSOT)，禁止在其他地方重复定义。
 */

import type { RemixiconComponentType } from '@remixicon/react'
import {
  RiBarChart2Line,
  RiImageLine,
  RiBedLine,
  RiWalking2Line,
  RiHeartPulseLine,
  RiSmileLine,
  RiLinkM,
} from '@remixicon/react'

export type MomentTypeKey = 'text' | 'image' | 'sleep' | 'steps' | 'heartrate' | 'mood' | 'link'

/**
 * 瞬间类型 UI 配置
 * 包含：中文标签、Remix Icon、样式类名
 */
export const MOMENT_TYPE_CONFIG: Record<
  MomentTypeKey,
  {
    label: string
    icon: RemixiconComponentType
    textColor: string
    bgColor: string
  }
> = {
  text: {
    label: '随想',
    icon: RiBarChart2Line,
    textColor: 'text-muted-foreground',
    bgColor: 'bg-black/[0.06] dark:bg-white/5',
  },
  image: {
    label: '图片',
    icon: RiImageLine,
    textColor: 'text-ocean',
    bgColor: 'bg-ocean/10',
  },
  sleep: {
    label: '睡眠',
    icon: RiBedLine,
    textColor: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
  },
  steps: {
    label: '步数',
    icon: RiWalking2Line,
    textColor: 'text-green-400',
    bgColor: 'bg-green-400/10',
  },
  heartrate: {
    label: '心率',
    icon: RiHeartPulseLine,
    textColor: 'text-red-400',
    bgColor: 'bg-red-400/10',
  },
  mood: {
    label: '心情',
    icon: RiSmileLine,
    textColor: 'text-ember',
    bgColor: 'bg-ember/10',
  },
  link: {
    label: '链接',
    icon: RiLinkM,
    textColor: 'text-ocean',
    bgColor: 'bg-ocean/10',
  },
}

/**
 * 快速获取瞬间类型标签
 */
export function getMomentTypeLabel(type: string): string {
  return (MOMENT_TYPE_CONFIG as Record<string, any>)[type]?.label ?? type
}

/**
 * 快速获取瞬间类型图标
 */
export function getMomentTypeIcon(type: string): RemixiconComponentType {
  return (MOMENT_TYPE_CONFIG as Record<string, any>)[type]?.icon ?? RiBarChart2Line
}

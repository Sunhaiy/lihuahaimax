/**
 * lib/styles.ts
 *
 * 跨组件复用的 Tailwind className 常量。
 * 引入方式：import { SHIMMER } from '@/lib/styles'
 */

/**
 * 鼠标悬停擦亮效果 — 需要父容器有 `relative` 和 `overflow-hidden`。
 * 原理：绝对定位的倾斜白色渐变层，hover 时从左滑过右侧。
 */
export const SHIMMER =
  'before:absolute before:inset-0 ' +
  'before:-translate-x-full before:skew-x-[-20deg] ' +
  'before:bg-gradient-to-r before:from-transparent before:via-white/[0.06] before:to-transparent ' +
  'before:transition-transform before:duration-500 before:pointer-events-none before:z-10 ' +
  'hover:before:translate-x-full'

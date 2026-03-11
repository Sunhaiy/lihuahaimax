/**
 * components/ui/Skeleton.tsx
 *
 * 骨架屏组件。
 * 禁止使用 Spinner。所有数据加载态均使用此组件。
 * 支持预设形状：line（文本行）、block（矩形块）、avatar（圆形）、card（卡片）。
 */

interface SkeletonProps {
  className?: string
}

/** 基础骨架块 */
export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-black/[0.06] dark:bg-white/5 rounded-base ${className}`}
      aria-hidden="true"
    />
  )
}

/** 文章卡片骨架屏 */
export function PostCardSkeleton() {
  return (
    <div className="rounded-card border border-black/5 dark:border-white/5 p-6 space-y-4">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <div className="flex items-center gap-3 pt-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  )
}

/** 瞬间条目骨架屏 */
export function MomentSkeleton() {
  return (
    <div className="flex gap-4 py-4">
      <div className="flex flex-col items-center gap-2">
        <Skeleton className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1" />
        <Skeleton className="w-px flex-1" />
      </div>
      <div className="flex-1 space-y-2 pb-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}

/** 相册图片骨架屏 */
export function GalleryImageSkeleton({ className = '' }: SkeletonProps) {
  return <Skeleton className={`rounded-card ${className}`} />
}

/** 动漫卡片骨架屏 */
export function AnimeCardSkeleton() {
  return (
    <div className="rounded-card border border-black/5 dark:border-white/5 overflow-hidden">
      <Skeleton className="aspect-[2/3] w-full" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

/** 游戏卡带骨架屏 */
export function GameCardSkeleton() {
  return (
    <div className="rounded-card border border-black/5 dark:border-white/5 overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  )
}

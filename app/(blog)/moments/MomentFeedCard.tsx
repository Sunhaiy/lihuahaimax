'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'
import { RichTextRenderer } from '@/components/ui/RichTextRenderer'
import { extractPlainTextFromRichContent } from '@/lib/utils/extractHeadings'
import type { MomentRow, MomentType } from '@/types/moment'
import type { SiteProfile } from '@/types/site'

type MomentFeedItem = Omit<MomentRow, 'created_at'> & {
  created_at: string
}

interface MomentComment {
  id: number
  author_name: string
  content: string
  created_at: string
}

interface EngagementState {
  likeCount: number
  commentCount: number
  shareCount: number
  liked: boolean
}

interface MomentFeedCardProps {
  moment: MomentFeedItem
  siteProfile: SiteProfile
}

const VISITOR_KEY_STORAGE = 'lihuahai-moment-visitor'
const LIKED_STORAGE = 'lihuahai-liked-moments'

function getVisitorKey() {
  if (typeof window === 'undefined') return ''

  const existing = window.localStorage.getItem(VISITOR_KEY_STORAGE)
  if (existing) return existing

  const generated =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`

  window.localStorage.setItem(VISITOR_KEY_STORAGE, generated)
  return generated
}

function getLikedMomentIds() {
  if (typeof window === 'undefined') return new Set<number>()

  try {
    return new Set<number>(JSON.parse(window.localStorage.getItem(LIKED_STORAGE) ?? '[]'))
  } catch {
    return new Set<number>()
  }
}

function persistLikedMoment(momentId: number, liked: boolean) {
  const ids = getLikedMomentIds()
  if (liked) ids.add(momentId)
  else ids.delete(momentId)

  window.localStorage.setItem(LIKED_STORAGE, JSON.stringify(Array.from(ids)))
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} 小时前`

  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} 天前`

  const months = Math.floor(days / 30)
  if (months < 12) return `${months} 个月前`

  return `${Math.floor(months / 12)} 年前`
}

function formatMomentType(type: MomentType): string {
  switch (type) {
    case 'image':
      return '照片'
    case 'sleep':
      return '睡眠'
    case 'steps':
      return '步数'
    case 'heartrate':
      return '心率'
    case 'mood':
      return '心情'
    case 'link':
      return '分享'
    default:
      return '随记'
  }
}

function formatDistance(distance: number): string {
  if (distance >= 1000) return `${(distance / 1000).toFixed(2)} km`
  return `${distance} m`
}

function formatMomentSource(moment: MomentFeedItem): string {
  if (moment.location) return moment.location
  if (moment.weather) return moment.weather
  return `${formatMomentType(moment.type)}动态`
}

function getMomentSummary(moment: MomentFeedItem): string {
  const context = [moment.mood, moment.weather, moment.location].filter(Boolean) as string[]
  if (context.length > 0) return context.join(' · ')

  const richText = moment.content_json ? extractPlainTextFromRichContent(moment.content_json) : ''
  if (richText) return richText

  if (moment.type === 'sleep' && moment.meta) {
    const meta = moment.meta as {
      deepSleepMinutes?: number
      score?: number | null
    }
    const parts: string[] = []
    if (typeof meta.deepSleepMinutes === 'number') parts.push(`深睡 ${meta.deepSleepMinutes} 分钟`)
    if (typeof meta.score === 'number') parts.push(`评分 ${meta.score}`)
    if (parts.length > 0) return parts.join(' · ')
  }

  if (moment.type === 'steps' && moment.meta) {
    const meta = moment.meta as {
      steps?: number
      distance?: number
      calories?: number
    }
    const parts: string[] = []
    if (typeof meta.steps === 'number') parts.push(`${meta.steps.toLocaleString()} 步`)
    if (typeof meta.distance === 'number') parts.push(formatDistance(meta.distance))
    if (typeof meta.calories === 'number') parts.push(`${meta.calories} kcal`)
    if (parts.length > 0) return parts.join(' · ')
  }

  if (moment.type === 'link' && moment.meta) {
    const meta = moment.meta as { title?: string; url?: string }
    if (meta.title) return meta.title
    if (meta.url) return meta.url
  }

  if (moment.images.length > 0) return '照片已经收好，等你下次翻到这里。'
  if (moment.type === 'link') return '把想分享的东西先挂在了这里。'
  if (moment.content) return moment.content
  return '这一刻已经被存进了回声里。'
}

function getMomentMetrics(moment: MomentFeedItem) {
  if (!moment.meta) return []

  if (moment.type === 'sleep') {
    const meta = moment.meta as {
      sleepStart?: string
      sleepEnd?: string
      deepSleepMinutes?: number
      score?: number | null
    }

    return [
      meta.sleepStart ? { label: '入睡', value: meta.sleepStart } : null,
      meta.sleepEnd ? { label: '起床', value: meta.sleepEnd } : null,
      typeof meta.deepSleepMinutes === 'number' ? { label: '深睡', value: `${meta.deepSleepMinutes} min` } : null,
      typeof meta.score === 'number' ? { label: '评分', value: String(meta.score) } : null,
    ].filter(Boolean) as Array<{ label: string; value: string }>
  }

  if (moment.type === 'steps') {
    const meta = moment.meta as {
      steps?: number
      distance?: number
      calories?: number
      activeMinutes?: number
    }

    return [
      typeof meta.steps === 'number' ? { label: '步数', value: meta.steps.toLocaleString() } : null,
      typeof meta.distance === 'number' ? { label: '距离', value: formatDistance(meta.distance) } : null,
      typeof meta.calories === 'number' ? { label: '热量', value: `${meta.calories} kcal` } : null,
      typeof meta.activeMinutes === 'number' ? { label: '活跃', value: `${meta.activeMinutes} min` } : null,
    ].filter(Boolean) as Array<{ label: string; value: string }>
  }

  return []
}

function getSourceIcon(moment: MomentFeedItem): string {
  if (moment.location) return 'pin_drop'
  if (moment.weather) return 'rainy'
  if (moment.images.length > 0) return 'image'
  if (moment.type === 'link') return 'link'
  return 'chat_bubble'
}

function getMomentLinkMeta(moment: MomentFeedItem) {
  if (moment.type !== 'link' || !moment.meta) return null

  const meta = moment.meta as { title?: string; url?: string; description?: string }
  if (!meta.url && !meta.title) return null
  return meta
}

function getLikeStripText(siteProfile: SiteProfile, engagement: EngagementState, summary: string) {
  if (engagement.liked) {
    if (engagement.likeCount > 1) return `你和 ${engagement.likeCount - 1} 位访客赞了这条瞬间`
    return '你赞了这条瞬间'
  }

  if (engagement.likeCount > 0) {
    return `${siteProfile.ownerName} 和 ${engagement.likeCount} 位访客收到了这条回声`
  }

  return summary
}

function mergeEngagement(previous: EngagementState, next: Partial<EngagementState>): EngagementState {
  return { ...previous, ...next }
}

function getMomentContentClass(content: string) {
  const length = content.trim().length

  if (length <= 22) {
    return 'text-[1.2rem] font-semibold leading-[1.55] tracking-[-0.028em] sm:text-[1.36rem]'
  }

  if (length <= 54) {
    return 'text-[1.08rem] font-semibold leading-[1.62] tracking-[-0.024em] sm:text-[1.2rem]'
  }

  return 'text-[1rem] font-medium leading-[1.74] tracking-[-0.016em] sm:text-[1.08rem]'
}

export function MomentFeedCard({ moment, siteProfile }: MomentFeedCardProps) {
  const createdAt = new Date(moment.created_at)
  const summary = getMomentSummary(moment)
  const metrics = getMomentMetrics(moment)
  const linkMeta = getMomentLinkMeta(moment)
  const richContentText = useMemo(
    () => (moment.content_json ? extractPlainTextFromRichContent(moment.content_json) : ''),
    [moment.content_json]
  )
  const contentClass = moment.content ? getMomentContentClass(moment.content) : ''
  const [visitorKey, setVisitorKey] = useState('')
  const [engagement, setEngagement] = useState<EngagementState>({
    likeCount: moment.like_count,
    commentCount: moment.comment_count,
    shareCount: moment.share_count,
    liked: false,
  })
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [comments, setComments] = useState<MomentComment[]>([])
  const [commentsLoaded, setCommentsLoaded] = useState(false)
  const [commentName, setCommentName] = useState('')
  const [commentText, setCommentText] = useState('')
  const [isLiking, setIsLiking] = useState(false)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [shareStatus, setShareStatus] = useState('')

  useEffect(() => {
    const key = getVisitorKey()
    setVisitorKey(key)
    setEngagement((current) => mergeEngagement(current, { liked: getLikedMomentIds().has(moment.id) }))
  }, [moment.id])

  useEffect(() => {
    if (!commentsOpen || commentsLoaded) return

    let alive = true

    fetch(`/api/moments/${moment.id}/comments`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((payload: { data: MomentComment[] }) => {
        if (!alive) return
        setComments(payload.data)
        setCommentsLoaded(true)
      })
      .catch(() => {
        if (!alive) return
        setCommentsLoaded(true)
      })

    return () => {
      alive = false
    }
  }, [commentsLoaded, commentsOpen, moment.id])

  async function handleLike() {
    if (!visitorKey || isLiking) return

    setIsLiking(true)
    try {
      const res = await fetch(`/api/moments/${moment.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorKey }),
      })

      if (!res.ok) throw new Error('Failed to like moment')
      const next = await res.json()

      setEngagement((current) =>
        mergeEngagement(current, {
          likeCount: next.likeCount,
          commentCount: next.commentCount,
          shareCount: next.shareCount,
          liked: next.liked,
        })
      )
      persistLikedMoment(moment.id, next.liked)
    } finally {
      setIsLiking(false)
    }
  }

  async function handleCommentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!commentName.trim() || !commentText.trim() || isSubmittingComment) return

    setIsSubmittingComment(true)
    try {
      const res = await fetch(`/api/moments/${moment.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: commentName.trim(),
          content: commentText.trim(),
        }),
      })

      if (!res.ok) throw new Error('Failed to post comment')
      const nextComment = await res.json()

      setComments((current) => [nextComment, ...current])
      setCommentText('')
      setCommentsLoaded(true)
      setEngagement((current) => mergeEngagement(current, { commentCount: current.commentCount + 1 }))
    } finally {
      setIsSubmittingComment(false)
    }
  }

  async function handleShare() {
    const url = `${window.location.origin}/moments#moment-${moment.id}`
    const title = `${siteProfile.ownerName} 的瞬间`
    const text = moment.content || richContentText || summary

    setShareStatus('')

    try {
      if (navigator.share) {
        await navigator.share({ title, text, url })
      } else {
        await navigator.clipboard.writeText(url)
        setShareStatus('链接已复制')
      }

      const res = await fetch(`/api/moments/${moment.id}/share`, { method: 'POST' })
      if (res.ok) {
        const next = await res.json()
        setEngagement((current) =>
          mergeEngagement(current, {
            likeCount: next.likeCount,
            commentCount: next.commentCount,
            shareCount: next.shareCount,
          })
        )
      }
    } catch {
      setShareStatus('分享已取消')
    }
  }

  return (
    <article
      id={`moment-${moment.id}`}
      className="group relative scroll-mt-24 overflow-hidden rounded-[24px] border border-hero-border/16 bg-zinc-950/58 px-4 py-4 backdrop-blur-2xl transition-all duration-300 hover:border-primary/24 hover:bg-zinc-950/64 sm:px-5 sm:py-5"
    >
      <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent" />

      <header className="flex items-start gap-3">
        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border border-white/12 bg-hero-panel/60">
          {siteProfile.avatarUrl ? (
            <img src={siteProfile.avatarUrl} alt={siteProfile.ownerName} className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-base font-semibold text-white">
              {siteProfile.ownerInitial}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 pt-0.5">
          <p className="truncate text-[1.05rem] font-bold leading-none tracking-[-0.03em] text-white/90">
            {siteProfile.ownerName}.
          </p>

          {moment.content_json ? (
            <div className="mt-3 max-w-[42rem]">
              <RichTextRenderer
                content={moment.content_json}
                proseClassName="
                  prose prose-invert max-w-none
                  [&_.ProseMirror]:text-white/88
                  [&_.ProseMirror]:leading-8
                  [&_.ProseMirror_h2]:mt-7
                  [&_.ProseMirror_h2]:mb-3
                  [&_.ProseMirror_h2]:text-[1.35rem]
                  [&_.ProseMirror_h2]:font-semibold
                  [&_.ProseMirror_h3]:mt-6
                  [&_.ProseMirror_h3]:mb-3
                  [&_.ProseMirror_h3]:text-[1.12rem]
                  [&_.ProseMirror_h3]:font-semibold
                  [&_.ProseMirror_p]:my-4
                  [&_.ProseMirror_p]:text-[1rem]
                  [&_.ProseMirror_p]:leading-8
                  [&_.ProseMirror_a]:text-primary
                  [&_.ProseMirror_a]:underline
                  [&_.ProseMirror_a]:underline-offset-4
                  [&_.ProseMirror_ul]:my-4
                  [&_.ProseMirror_ul]:space-y-2
                  [&_.ProseMirror_ul]:pl-5
                  [&_.ProseMirror_ol]:my-4
                  [&_.ProseMirror_ol]:space-y-2
                  [&_.ProseMirror_ol]:pl-5
                  [&_.ProseMirror_li]:text-white/82
                  [&_.ProseMirror_blockquote]:my-6
                  [&_.ProseMirror_blockquote]:rounded-[22px]
                  [&_.ProseMirror_blockquote]:border-l-[3px]
                  [&_.ProseMirror_blockquote]:border-primary/34
                  [&_.ProseMirror_blockquote]:bg-white/[0.04]
                  [&_.ProseMirror_blockquote]:px-5
                  [&_.ProseMirror_blockquote]:py-4
                  [&_.ProseMirror_code]:rounded-md
                  [&_.ProseMirror_code]:bg-primary/10
                  [&_.ProseMirror_code]:px-1.5
                  [&_.ProseMirror_code]:py-1
                  [&_.ProseMirror_code]:text-primary
                  [&_.ProseMirror_pre]:my-6
                  [&_.ProseMirror_pre]:overflow-x-auto
                  [&_.ProseMirror_pre]:rounded-[24px]
                  [&_.ProseMirror_pre]:border
                  [&_.ProseMirror_pre]:border-white/8
                  [&_.ProseMirror_pre]:bg-black/38
                  [&_.ProseMirror_pre_code]:block
                  [&_.ProseMirror_pre_code]:bg-transparent
                  [&_.ProseMirror_pre_code]:px-5
                  [&_.ProseMirror_pre_code]:py-4
                  [&_.ProseMirror_pre_code]:text-zinc-100
                  [&_.ProseMirror_img]:my-6
                  [&_.ProseMirror_img]:rounded-[22px]
                  [&_.ProseMirror_img]:border
                  [&_.ProseMirror_img]:border-white/10
                "
              />
            </div>
          ) : moment.content ? (
            <div className="mt-3 max-w-[40rem]">
              <p className={`whitespace-pre-line text-white/88 ${contentClass}`}>{moment.content}</p>
            </div>
          ) : null}

          {metrics.length > 0 ? (
            <div className="mt-4 grid max-w-[40rem] gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-[16px] border border-white/8 bg-white/[0.055] px-3.5 py-2.5"
                >
                  <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-white/42">
                    {metric.label}
                  </p>
                  <p className="mt-1 text-[13px] font-bold text-white/82">{metric.value}</p>
                </div>
              ))}
            </div>
          ) : null}

          {linkMeta ? (
            <a
              href={linkMeta.url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 block max-w-[40rem] rounded-[16px] border border-white/10 bg-white/[0.055] px-3.5 py-3 transition-colors hover:border-primary/28 hover:bg-white/[0.075]"
            >
              <p className="line-clamp-2 text-[13px] font-bold text-white/88">
                {linkMeta.title ?? linkMeta.url}
              </p>
              {linkMeta.description ? (
                <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-white/50">{linkMeta.description}</p>
              ) : null}
              {linkMeta.url ? (
                <p className="mt-2 truncate font-mono text-[10px] text-primary/80">{linkMeta.url}</p>
              ) : null}
            </a>
          ) : null}

          <MomentImages images={moment.images} />

          <div className="mt-4 flex items-center justify-between gap-3 text-white/46">
            <div className="flex min-w-0 items-center gap-2 text-[0.9rem] font-semibold">
              <time className="flex-shrink-0">
                {createdAt.toLocaleTimeString('zh-CN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </time>
              <span className="text-white/28">·</span>
              <span className="inline-flex min-w-0 items-center gap-1.5 truncate">
                <MaterialSymbol icon={getSourceIcon(moment)} size={15} />
                <span className="truncate">{formatMomentSource(moment)}</span>
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
              <ActionButton
                active={engagement.liked}
                count={engagement.likeCount}
                disabled={isLiking}
                icon="favorite"
                label={engagement.liked ? '取消点赞' : '点赞'}
                onClick={handleLike}
              />
              <ActionButton
                count={engagement.commentCount}
                icon="mode_comment"
                label="评论"
                onClick={() => setCommentsOpen((open) => !open)}
              />
              <ActionButton count={engagement.shareCount} icon="reply" label="分享" onClick={handleShare} />
            </div>
          </div>

          {shareStatus ? <p className="mt-2 text-right text-[11px] font-medium text-white/42">{shareStatus}</p> : null}

          <div className="mt-4 rounded-[14px] bg-white/[0.065] px-4 py-2.5">
            <div className="flex items-center gap-2 text-[0.95rem] font-bold leading-6 text-white/86">
              <MaterialSymbol icon="favorite" size={20} className="flex-shrink-0 text-white/86" />
              <span>{getLikeStripText(siteProfile, engagement, summary)}</span>
            </div>
          </div>

          {commentsOpen ? (
            <CommentPanel
              commentName={commentName}
              comments={comments}
              commentsLoaded={commentsLoaded}
              commentText={commentText}
              isSubmitting={isSubmittingComment}
              onNameChange={setCommentName}
              onSubmit={handleCommentSubmit}
              onTextChange={setCommentText}
            />
          ) : null}

          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-white/24">
            {timeAgo(createdAt)} · {formatMomentType(moment.type)}
          </p>
        </div>
      </header>
    </article>
  )
}

function MomentImages({ images }: { images: string[] }) {
  if (images.length === 0) return null

  if (images.length === 1) {
    return (
      <div className="mt-4 overflow-hidden rounded-[12px] border border-white/10 bg-black/24">
        <img
          src={images[0]}
          alt=""
          className="max-h-[34rem] w-full object-cover transition-transform duration-500 group-hover:scale-[1.015]"
        />
      </div>
    )
  }

  return (
    <div className="mt-4 grid grid-cols-2 gap-2">
      {images.slice(0, 4).map((url, index) => (
        <div
          key={index}
          className="relative aspect-square overflow-hidden rounded-[12px] border border-white/10 bg-black/24"
        >
          <img
            src={url}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
          />
          {index === 3 && images.length > 4 ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/58">
              <span className="text-lg font-black text-white">+{images.length - 4}</span>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  )
}

function ActionButton({
  active = false,
  count,
  disabled = false,
  icon,
  label,
  onClick,
}: {
  active?: boolean
  count?: number
  disabled?: boolean
  icon: string
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`inline-flex h-8 min-w-8 items-center justify-center gap-1 rounded-full border border-transparent px-1.5 text-white/78 transition hover:border-white/10 hover:bg-white/[0.03] hover:text-white disabled:cursor-wait disabled:opacity-60 ${
        active ? 'text-ember' : ''
      }`}
      disabled={disabled}
      onClick={onClick}
    >
      <MaterialSymbol icon={icon} size={19} fill={active} weight={430} />
      {typeof count === 'number' && count > 0 ? (
        <span className="text-[0.82rem] font-semibold leading-none">{count}</span>
      ) : null}
    </button>
  )
}

function CommentPanel({
  commentName,
  comments,
  commentsLoaded,
  commentText,
  isSubmitting,
  onNameChange,
  onSubmit,
  onTextChange,
}: {
  commentName: string
  comments: MomentComment[]
  commentsLoaded: boolean
  commentText: string
  isSubmitting: boolean
  onNameChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onTextChange: (value: string) => void
}) {
  return (
    <div className="mt-4 rounded-[18px] border border-white/10 bg-black/20 p-3">
      <form className="grid gap-2" onSubmit={onSubmit}>
        <input
          value={commentName}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder="昵称"
          maxLength={32}
          className="rounded-[12px] border border-white/10 bg-white/[0.055] px-3 py-2 text-sm font-semibold text-white outline-none transition placeholder:text-white/30 focus:border-primary/38"
        />
        <textarea
          value={commentText}
          onChange={(event) => onTextChange(event.target.value)}
          placeholder="留一句评论..."
          maxLength={500}
          rows={3}
          className="resize-none rounded-[12px] border border-white/10 bg-white/[0.055] px-3 py-2 text-sm leading-6 text-white outline-none transition placeholder:text-white/30 focus:border-primary/38"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !commentName.trim() || !commentText.trim()}
            className="rounded-full border border-primary/24 bg-primary/15 px-4 py-2 text-xs font-bold text-white transition hover:bg-primary/22 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isSubmitting ? '发布中...' : '发布评论'}
          </button>
        </div>
      </form>

      <div className="mt-4 space-y-3">
        {!commentsLoaded ? (
          <p className="text-sm text-white/42">评论加载中...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-white/42">还没有评论，先坐第一排。</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="rounded-[14px] bg-white/[0.045] px-3 py-2">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-bold text-white/84">{comment.author_name}</p>
                <time className="flex-shrink-0 text-[10px] text-white/32">
                  {new Date(comment.created_at).toLocaleString('zh-CN', {
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </time>
              </div>
              <p className="mt-1 whitespace-pre-line text-sm leading-6 text-white/62">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

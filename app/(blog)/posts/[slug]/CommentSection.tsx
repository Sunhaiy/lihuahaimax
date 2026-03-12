/**
 * app/(blog)/posts/[slug]/CommentSection.tsx
 *
 * 评论区组件 — 客户端组件。
 * 展示已审核评论 + 提交新评论表单。
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { RiMessage2Line, RiUserLine, RiMailLine, RiSendPlaneLine, RiLoader4Line } from '@remixicon/react'

interface Comment {
  id: number
  author_name: string
  content: string
  created_at: string
}

interface CommentSectionProps {
  postId: number
}

export function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitState, setSubmitState] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const loadComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/posts/${postId}/comments`)
      if (res.ok) setComments(await res.json())
    } finally {
      setLoading(false)
    }
  }, [postId])

  useEffect(() => { loadComments() }, [loadComments])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !content.trim()) return
    setSubmitting(true)
    setSubmitState('idle')
    setErrorMsg('')

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author_name: name.trim(), author_email: email.trim(), content: content.trim() }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(typeof d?.error === 'string' ? d.error : '提交失败，请稍后重试')
      }
      setSubmitState('success')
      setName('')
      setEmail('')
      setContent('')
    } catch (err) {
      setSubmitState('error')
      setErrorMsg(err instanceof Error ? err.message : '提交失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mt-12">
      {/* 标题 */}
      <div className="flex items-center gap-2 mb-6">
        <RiMessage2Line size={18} className="text-ember" />
        <h2 className="text-lg font-bold text-foreground">
          评论{comments.length > 0 ? ` (${comments.length})` : ''}
        </h2>
      </div>

      {/* 评论列表 */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <RiLoader4Line size={20} className="animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8 border border-dashed border-border rounded-xl">
          还没有评论，来留下第一条吧！
        </p>
      ) : (
        <div className="space-y-4 mb-8">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              {/* 头像 */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-border to-muted
                              flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-muted-foreground">
                  {c.author_name.charAt(0).toUpperCase()}
                </span>
              </div>
              {/* 正文 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-sm font-medium text-foreground">{c.author_name}</span>
                  <time className="text-[11px] text-muted-foreground font-mono">
                    {new Date(c.created_at).toLocaleDateString('zh-CN', {
                      year: 'numeric', month: '2-digit', day: '2-digit',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </time>
                </div>
                <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 提交表单 */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="text-sm font-semibold text-foreground mb-4">留下评论</p>

        {submitState === 'success' ? (
          <div className="rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-400">
            评论已提交！待博主审核后将显示在列表中。
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 昵称 */}
              <div className="relative">
                <RiUserLine size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="昵称 *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={50}
                  required
                  className="w-full pl-8 pr-3 py-2 rounded-lg text-sm
                             bg-background border border-border
                             text-foreground placeholder:text-muted-foreground
                             focus:outline-none focus:border-ember/40 transition-colors"
                />
              </div>
              {/* 邮箱（可选） */}
              <div className="relative">
                <RiMailLine size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type="email"
                  placeholder="邮箱（选填，不公开）"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-lg text-sm
                             bg-background border border-border
                             text-foreground placeholder:text-muted-foreground
                             focus:outline-none focus:border-ember/40 transition-colors"
                />
              </div>
            </div>

            {/* 内容 */}
            <textarea
              placeholder="写下你的想法…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              maxLength={2000}
              required
              className="w-full px-3 py-2 rounded-lg text-sm resize-none leading-relaxed
                         bg-background border border-border
                         text-foreground placeholder:text-muted-foreground
                         focus:outline-none focus:border-ember/40 transition-colors"
            />

            {/* 错误信息 */}
            {submitState === 'error' && (
              <p className="text-xs text-red-400">{errorMsg}</p>
            )}

            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">评论将在审核后公开显示</p>
              <button
                type="submit"
                disabled={submitting || !name.trim() || !content.trim()}
                className="flex items-center gap-1.5 text-xs font-medium text-white
                           px-4 py-2 rounded-lg bg-ember hover:bg-ember/85
                           transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting
                  ? <><RiLoader4Line size={13} className="animate-spin" />提交中…</>
                  : <><RiSendPlaneLine size={13} />提交评论</>
                }
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}

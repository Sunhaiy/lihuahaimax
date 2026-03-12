/**
 * app/dashboard/comments/page.tsx
 *
 * 评论管理 — 全量评论列表（待审 + 已审），支持一键审核 / 删除。
 */

import { revalidatePath } from 'next/cache'
import { findAllComments } from '@/lib/db/dao/commentDao'
import { approveComment, deleteComment } from '@/lib/db/dao/commentDao'

async function handleApprove(formData: FormData) {
  'use server'
  const id = Number(formData.get('id'))
  if (id) {
    await approveComment(id)
    revalidatePath('/dashboard/comments')
  }
}

async function handleDelete(formData: FormData) {
  'use server'
  const id = Number(formData.get('id'))
  if (id) {
    await deleteComment(id)
    revalidatePath('/dashboard/comments')
  }
}

export default async function CommentsPage() {
  const comments = await findAllComments()
  const pending = comments.filter((c) => !c.is_approved)
  const approved = comments.filter((c) => c.is_approved)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">评论管理</h1>
        {pending.length > 0 && (
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-ember/15 text-ember border border-ember/25">
            {pending.length} 条待审
          </span>
        )}
      </div>

      {comments.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground text-sm">暂无评论。</div>
      ) : (
        <div className="space-y-8">

          {/* 待审区 */}
          {pending.length > 0 && (
            <section>
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">待审核</p>
              <div className="rounded-card border border-ember/20 overflow-hidden divide-y divide-border">
                {pending.map((c) => (
                  <div key={c.id} className="px-5 py-4 bg-ember/[0.03] flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-foreground">{c.author_name}</span>
                        {c.author_email && (
                          <span className="text-xs text-muted-foreground font-mono">{c.author_email}</span>
                        )}
                        <span className="text-[10px] text-muted-foreground font-mono ml-auto">
                          {new Date(c.created_at).toLocaleString('zh-CN')}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          文章 #{c.post_id}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{c.content}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <form action={handleApprove}>
                        <input type="hidden" name="id" value={c.id} />
                        <button
                          type="submit"
                          className="text-xs px-3 py-1.5 rounded border border-green-500/30
                                     text-green-400 hover:bg-green-400/10 transition-colors"
                        >
                          通过
                        </button>
                      </form>
                      <form action={handleDelete}>
                        <input type="hidden" name="id" value={c.id} />
                        <button
                          type="submit"
                          className="text-xs px-3 py-1.5 rounded border border-red-500/20
                                     text-red-400 hover:bg-red-400/10 transition-colors"
                        >
                          删除
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 已审区 */}
          {approved.length > 0 && (
            <section>
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">已发布</p>
              <div className="rounded-card border border-border overflow-hidden divide-y divide-border">
                {approved.map((c) => (
                  <div key={c.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-start gap-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-foreground">{c.author_name}</span>
                        {c.author_email && (
                          <span className="text-xs text-muted-foreground font-mono">{c.author_email}</span>
                        )}
                        <span className="text-[10px] text-muted-foreground font-mono ml-auto">
                          {new Date(c.created_at).toLocaleString('zh-CN')}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          文章 #{c.post_id}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{c.content}</p>
                    </div>
                    <form action={handleDelete} className="shrink-0">
                      <input type="hidden" name="id" value={c.id} />
                      <button
                        type="submit"
                        className="text-xs px-3 py-1.5 rounded border border-red-500/20
                                   text-red-400 hover:bg-red-400/10 transition-colors"
                      >
                        删除
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      )}
    </div>
  )
}

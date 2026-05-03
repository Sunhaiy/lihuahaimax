import { revalidatePath } from 'next/cache'
import {
  AdminEmptyState,
  AdminListToolbar,
  AdminPageHeader,
  AdminPanel,
  AdminStatusBadge,
} from '@/components/admin/AdminPrimitives'
import { Button } from '@/components/ui/Button'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'
import { approveComment, deleteComment, findAllComments } from '@/lib/db/dao/commentDao'

async function handleApprove(formData: FormData) {
  'use server'
  const id = Number(formData.get('id'))
  if (!id) return

  await approveComment(id)
  revalidatePath('/dashboard/comments')
}

async function handleDelete(formData: FormData) {
  'use server'
  const id = Number(formData.get('id'))
  if (!id) return

  await deleteComment(id)
  revalidatePath('/dashboard/comments')
}

export default async function CommentsPage() {
  const comments = await findAllComments()
  const pending = comments.filter((item) => !item.is_approved)
  const approved = comments.filter((item) => item.is_approved)

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Comment Queue"
        title="评论管理"
        description="统一查看待审核与已发布评论，把高频审核动作收在同一处，不再让队列像旧式列表页散着放。"
        meta={
          <>
            <AdminStatusBadge tone={pending.length ? 'accent' : 'neutral'}>待处理 {pending.length}</AdminStatusBadge>
            <AdminStatusBadge tone="neutral">总计 {comments.length}</AdminStatusBadge>
          </>
        }
      />

      {comments.length === 0 ? (
        <AdminEmptyState
          icon="chat_bubble"
          title="还没有评论"
          description="前台收到第一条留言后，这里会开始形成审核队列。"
        />
      ) : (
        <>
          <AdminListToolbar className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <AdminStatusBadge tone={pending.length ? 'accent' : 'neutral'}>待处理 {pending.length}</AdminStatusBadge>
              <AdminStatusBadge tone="success">已发布 {approved.length}</AdminStatusBadge>
            </div>
            <p className="text-sm text-muted-foreground">优先处理待审核评论，已发布评论保留轻量删除入口。</p>
          </AdminListToolbar>

          {pending.length ? (
            <AdminPanel
              title="待审核"
              description="这些评论还没有进入前台展示。"
              icon="pending_actions"
              bodyClassName="space-y-4"
            >
              {pending.map((comment) => (
                <article
                  key={comment.id}
                  className="rounded-[24px] border border-primary/16 bg-primary/8 p-5 backdrop-blur-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">{comment.author_name}</h3>
                        {comment.author_email ? (
                          <span className="text-xs text-muted-foreground">{comment.author_email}</span>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-muted-foreground">
                        <span>{new Date(comment.created_at).toLocaleString('zh-CN')}</span>
                        <span>文章 #{comment.post_id}</span>
                      </div>
                    </div>
                    <AdminStatusBadge tone="accent">待审核</AdminStatusBadge>
                  </div>

                  <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                    {comment.content}
                  </p>

                  <div className="mt-5 flex flex-wrap justify-end gap-3">
                    <form action={handleApprove}>
                      <input type="hidden" name="id" value={comment.id} />
                      <Button type="submit">
                        <MaterialSymbol icon="check_circle" size={18} />
                        通过审核
                      </Button>
                    </form>
                    <form action={handleDelete}>
                      <input type="hidden" name="id" value={comment.id} />
                      <Button type="submit" variant="danger">
                        <MaterialSymbol icon="delete" size={18} />
                        删除
                      </Button>
                    </form>
                  </div>
                </article>
              ))}
            </AdminPanel>
          ) : null}

          {approved.length ? (
            <AdminPanel
              title="已发布"
              description="这些评论已经在前台可见。"
              icon="task_alt"
              bodyClassName="space-y-4"
            >
              {approved.map((comment) => (
                <article
                  key={comment.id}
                  className="rounded-[24px] border border-border/70 bg-background/36 p-5 transition-colors hover:border-primary/16 hover:bg-background/48"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">{comment.author_name}</h3>
                        {comment.author_email ? (
                          <span className="text-xs text-muted-foreground">{comment.author_email}</span>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-muted-foreground">
                        <span>{new Date(comment.created_at).toLocaleString('zh-CN')}</span>
                        <span>文章 #{comment.post_id}</span>
                      </div>
                    </div>
                    <AdminStatusBadge tone="success">已发布</AdminStatusBadge>
                  </div>

                  <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                    {comment.content}
                  </p>

                  <div className="mt-5 flex justify-end">
                    <form action={handleDelete}>
                      <input type="hidden" name="id" value={comment.id} />
                      <Button type="submit" variant="ghost">
                        <MaterialSymbol icon="delete" size={18} />
                        删除评论
                      </Button>
                    </form>
                  </div>
                </article>
              ))}
            </AdminPanel>
          ) : null}
        </>
      )}
    </div>
  )
}

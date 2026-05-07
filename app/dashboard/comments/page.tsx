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

function MetaTag({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'accent' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] ${
        tone === 'accent'
          ? 'border-primary/24 bg-primary/10 text-primary'
          : 'border-border/70 bg-background/55 text-muted-foreground'
      }`}
    >
      {children}
    </span>
  )
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
        description="统一处理待审核评论、站长回复和已发布留言，前后台的数据结构保持一致。"
        meta={
          <>
            <AdminStatusBadge tone={pending.length ? 'accent' : 'neutral'}>
              待处理 {pending.length}
            </AdminStatusBadge>
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
              <AdminStatusBadge tone={pending.length ? 'accent' : 'neutral'}>
                待审核 {pending.length}
              </AdminStatusBadge>
              <AdminStatusBadge tone="success">已发布 {approved.length}</AdminStatusBadge>
            </div>
            <p className="text-sm text-muted-foreground">
              博主身份的回复会自动通过，其他访客评论仍然保留人工审核。
            </p>
          </AdminListToolbar>

          {pending.length > 0 ? (
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
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">{comment.author_name}</h3>
                        {comment.is_by_author ? <MetaTag tone="accent">博主回复</MetaTag> : null}
                        {comment.reply_to_name ? <MetaTag>回复 @{comment.reply_to_name}</MetaTag> : null}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-muted-foreground">
                        <span>{new Date(comment.created_at).toLocaleString('zh-CN')}</span>
                        <span>文章：{comment.post_title ?? `#${comment.post_id}`}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {comment.location_label ? <MetaTag>{comment.location_label}</MetaTag> : null}
                        {comment.os_label ? <MetaTag>{comment.os_label}</MetaTag> : null}
                        {comment.browser_label ? <MetaTag>{comment.browser_label}</MetaTag> : null}
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

          {approved.length > 0 ? (
            <AdminPanel
              title="已发布"
              description="这些评论已经在前台公开可见。"
              icon="task_alt"
              bodyClassName="space-y-4"
            >
              {approved.map((comment) => (
                <article
                  key={comment.id}
                  className="rounded-[24px] border border-border/70 bg-background/36 p-5 transition-colors hover:border-primary/16 hover:bg-background/48"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">{comment.author_name}</h3>
                        {comment.is_by_author ? <MetaTag tone="accent">博主回复</MetaTag> : null}
                        {comment.reply_to_name ? <MetaTag>回复 @{comment.reply_to_name}</MetaTag> : null}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-muted-foreground">
                        <span>{new Date(comment.created_at).toLocaleString('zh-CN')}</span>
                        <span>文章：{comment.post_title ?? `#${comment.post_id}`}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {comment.location_label ? <MetaTag>{comment.location_label}</MetaTag> : null}
                        {comment.os_label ? <MetaTag>{comment.os_label}</MetaTag> : null}
                        {comment.browser_label ? <MetaTag>{comment.browser_label}</MetaTag> : null}
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

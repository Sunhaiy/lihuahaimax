/**
 * app/dashboard/editor/[id]/page.tsx
 *
 * 编辑现有文章。
 */

import { notFound } from 'next/navigation'
import { findPostById } from '@/lib/db/dao/postDao'
import { PostEditor } from '../PostEditor'

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await findPostById(Number(id))
  if (!post) notFound()

  return <PostEditor post={post} />
}

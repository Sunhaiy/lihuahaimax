/**
 * app/(blog)/posts/[slug]/PostContent.tsx
 *
 * 文章内容渲染组件 — 客户端组件。
 * 使用 Tiptap 只读模式渲染 JSONB 内容（包括自定义 React 块）。
 */

'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import { getEditorExtensions } from '@/lib/editor/registry'
import type { JSONContent } from '@tiptap/core'

interface PostContentProps {
  content: object
}

export function PostContent({ content }: PostContentProps) {
  const editor = useEditor({
    extensions: getEditorExtensions(),
    content: content as JSONContent,
    editable: false,
    immediatelyRender: false,
  })

  return (
    <div className="prose prose-invert max-w-none">
      <EditorContent editor={editor} />
    </div>
  )
}

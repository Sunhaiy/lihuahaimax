/**
 * app/(blog)/posts/[slug]/PostContent.tsx
 *
 * 文章内容渲染组件 — 客户端组件。
 * 使用 Tiptap 只读模式渲染 JSONB 内容（包括自定义 React 块）。
 * 渲染完成后自动为标题节点注入 id，供 TOC 锚点使用。
 */

'use client'

import { useEffect } from 'react'
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

  // 渲染后为每个标题元素注入 id="heading-N"，与 extractHeadings 的顺序对应
  useEffect(() => {
    if (!editor) return
    const container = document.querySelector('.post-content')
    if (!container) return
    const els = container.querySelectorAll('h1, h2, h3, h4, h5, h6')
    els.forEach((el, i) => {
      el.id = `heading-${i}`
    })
  }, [editor])

  return (
    <div className="post-content prose dark:prose-invert max-w-none">
      <EditorContent editor={editor} />
    </div>
  )
}


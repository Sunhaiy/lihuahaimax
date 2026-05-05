'use client'

import { useEffect, useRef } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import type { JSONContent } from '@tiptap/core'
import { getEditorExtensions } from '@/lib/editor/registry'
import type { Heading } from '@/lib/utils/extractHeadings'

interface RichTextRendererProps {
  content: object
  headings?: Heading[]
  className?: string
  proseClassName?: string
}

export function RichTextRenderer({
  content,
  headings = [],
  className = '',
  proseClassName = '',
}: RichTextRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const editor = useEditor({
    extensions: getEditorExtensions(),
    content: content as JSONContent,
    editable: false,
    immediatelyRender: false,
  })

  useEffect(() => {
    if (!editor || !containerRef.current) return

    const frame = window.requestAnimationFrame(() => {
      const nodes = containerRef.current?.querySelectorAll('h1, h2, h3, h4, h5, h6')
      nodes?.forEach((node, index) => {
        node.id = headings[index]?.id ?? `heading-${index}`
      })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [editor, headings, content])

  if (!editor) return null

  return (
    <div ref={containerRef} className={className}>
      <EditorContent editor={editor} className={proseClassName} />
    </div>
  )
}

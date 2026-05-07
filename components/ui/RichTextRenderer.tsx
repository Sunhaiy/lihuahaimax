'use client'

import { useEffect, useRef } from 'react'
import type { JSONContent } from '@tiptap/core'
import { EditorContent, useEditor } from '@tiptap/react'
import hljs from 'highlight.js/lib/common'
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

    let cancelled = false
    let frame = 0
    let observer: MutationObserver | null = null
    const timers: number[] = []

    const applyEnhancements = () => {
      if (cancelled) return

      const root = containerRef.current
      if (!root) return

      const headingNodes = root.querySelectorAll('h1, h2, h3, h4, h5, h6')
      headingNodes.forEach((node, index) => {
        node.id = headings[index]?.id ?? `heading-${index}`
      })

      const codeNodes = root.querySelectorAll<HTMLElement>('pre code')
      codeNodes.forEach((node) => {
        const pre = node.closest('pre')
        const classNames = Array.from(node.classList)
        const languageClass = classNames.find((item) => item.startsWith('language-'))
        const existingLanguage = classNames.find((item) => hljs.getLanguage(item))
        const requestedLanguage = (
          languageClass?.replace(/^language-/, '') ||
          existingLanguage ||
          ''
        )
          .trim()
          .toLowerCase()
        const language = requestedLanguage && hljs.getLanguage(requestedLanguage)
          ? requestedLanguage
          : undefined
        const rawText = node.textContent ?? ''
        const signature = `${language ?? 'auto'}::${rawText}`

        if (pre) {
          pre.classList.add('code-block')
        }
        if (!rawText.trim()) return
        if (node.dataset.highlightSignature === signature) return

        if (language) {
          node.classList.add(`language-${language}`)
        }
        node.textContent = rawText
        node.classList.add('hljs')
        node.removeAttribute('data-highlighted')
        hljs.highlightElement(node)
        node.dataset.highlightSignature = signature

        if (pre) {
          const detectedLanguage =
            language ||
            Array.from(node.classList)
              .find((item) => item.startsWith('language-'))
              ?.replace(/^language-/, '') ||
            ''
          if (detectedLanguage) {
            pre.dataset.language = detectedLanguage
          } else {
            delete pre.dataset.language
          }
        }
      })
    }

    const queueEnhancement = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(applyEnhancements)
    }

    queueEnhancement()
    frame = window.requestAnimationFrame(queueEnhancement)
    timers.push(window.setTimeout(queueEnhancement, 80))
    timers.push(window.setTimeout(queueEnhancement, 260))
    timers.push(window.setTimeout(queueEnhancement, 720))

    observer = new MutationObserver(queueEnhancement)
    observer.observe(containerRef.current, {
      childList: true,
      subtree: true,
      characterData: true,
    })

    return () => {
      cancelled = true
      observer?.disconnect()
      window.cancelAnimationFrame(frame)
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [editor, headings, content])

  if (!editor) return null

  return (
    <div ref={containerRef} className={className}>
      <EditorContent editor={editor} className={proseClassName} />
    </div>
  )
}

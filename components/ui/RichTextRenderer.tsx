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

function highlightCodeLine(line: string, language?: string) {
  if (!line) return '&nbsp;'

  if (language && hljs.getLanguage(language)) {
    return hljs.highlight(line, { language, ignoreIllegals: true }).value || '&nbsp;'
  }

  return hljs.highlightAuto(line).value || '&nbsp;'
}

async function copyText(rawText: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(rawText)
      return
    } catch {
    }
  }

  const textarea = document.createElement('textarea')
  textarea.value = rawText
  textarea.setAttribute('readonly', 'true')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  textarea.style.pointerEvents = 'none'
  textarea.style.top = '0'
  textarea.style.left = '0'
  document.body.append(textarea)
  textarea.focus()
  textarea.select()

  const copied = document.execCommand('copy')
  textarea.remove()

  if (!copied) {
    throw new Error('copy failed')
  }
}

function createCopyButton(rawText: string) {
  const button = document.createElement('button')
  const icon = document.createElement('span')
  let resetTimer = 0

  button.type = 'button'
  button.className = 'code-block-copy'
  button.setAttribute('aria-label', '复制代码')
  button.title = '复制代码'

  icon.className = 'material-symbols-rounded'
  icon.setAttribute('aria-hidden', 'true')
  icon.textContent = 'content_copy'
  button.append(icon)

  const setButtonState = (state: 'idle' | 'copied' | 'error') => {
    button.dataset.state = state
    if (state === 'copied') {
      icon.textContent = 'check'
      button.title = '已复制'
      button.setAttribute('aria-label', '已复制')
      return
    }

    if (state === 'error') {
      icon.textContent = 'error'
      button.title = '复制失败'
      button.setAttribute('aria-label', '复制失败')
      return
    }

    icon.textContent = 'content_copy'
    button.title = '复制代码'
    button.setAttribute('aria-label', '复制代码')
  }

  button.addEventListener('click', async () => {
    window.clearTimeout(resetTimer)

    try {
      await copyText(rawText)
      setButtonState('copied')
    } catch {
      setButtonState('error')
    }

    resetTimer = window.setTimeout(() => {
      setButtonState('idle')
    }, 1600)
  })

  return button
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
        const rawTextSource = node.querySelector('.code-block-line')
          ? node.dataset.rawCode || pre?.dataset.rawCode || ''
          : node.textContent ?? ''
        const rawText = rawTextSource.replace(/\r\n/g, '\n')
        const detectedLanguage = requestedLanguage && hljs.getLanguage(requestedLanguage)
          ? requestedLanguage
          : hljs.highlightAuto(rawText).language
        const signature = `${detectedLanguage ?? 'auto'}::${rawText}`

        if (pre) {
          pre.classList.add('code-block')
        }
        if (!rawText.trim()) return
        if (
          node.dataset.highlightSignature === signature &&
          pre?.dataset.codeBlockSignature === signature &&
          node.querySelector('.code-block-line')
        ) {
          return
        }

        const lines = rawText.split('\n')
        const renderedLines = lines
          .map((line, index) => {
            const highlightedLine = highlightCodeLine(line, detectedLanguage)
            return `<span class="code-block-line" data-line="${index + 1}"><span class="code-block-line-content">${highlightedLine}</span></span>`
          })
          .join('')

        node.classList.add('hljs')
        node.removeAttribute('data-highlighted')
        node.innerHTML = renderedLines
        node.dataset.highlightSignature = signature
        node.dataset.rawCode = rawText

        if (pre) {
          const existingCopyButton = pre.querySelector<HTMLButtonElement>('.code-block-copy')
          existingCopyButton?.remove()

          pre.append(createCopyButton(rawText))
          pre.dataset.codeBlockSignature = signature
          pre.dataset.rawCode = rawText

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

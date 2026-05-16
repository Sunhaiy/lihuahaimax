'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { Editor as CoreEditor, JSONContent } from '@tiptap/core'
import { BubbleMenu, EditorContent, useEditor } from '@tiptap/react'
import { Button } from '@/components/ui/Button'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'
import type { ArticleDoc } from '@/lib/articles/document'
import { ensureArticleDocV2 } from '@/lib/articles/document'
import { getArticleExtensions } from '@/lib/editor/article/registry'
import {
  estimateReadTime,
  extractHeadings,
  extractPlainTextFromRichContent,
} from '@/lib/utils/extractHeadings'

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}

export interface ArticleEditorStats {
  characters: number
  words: number
  readingMinutes: number
  headings: ReturnType<typeof extractHeadings>
  activeBlockLabel: string
}

interface ArticleEditorV2Props {
  initialContent: ArticleDoc | JSONContent
  onChange: (content: JSONContent) => void
  onStatsChange?: (stats: ArticleEditorStats) => void
  placeholder?: string
  className?: string
}

type SlashItem = {
  key: string
  label: string
  description: string
  keywords: string[]
  command: (editor: CoreEditor) => void
}

type ToolbarItem = {
  key: string
  label: string
  icon: string
  onClick: () => void | boolean | undefined
  active?: boolean
}

type UploadResult = {
  url: string
  width: number | null
  height: number | null
}

const HEADING_LEVELS = [1, 2, 3, 4, 5, 6] as const

const EMPTY_PARAGRAPH_NODE: JSONContent = {
  type: 'paragraph',
}

const EMPTY_CODE_BLOCK_NODE: JSONContent = {
  type: 'codeBlock',
  attrs: {
    language: 'typescript',
  },
  content: [
    {
      type: 'text',
      text: '',
    },
  ],
}

const EMPTY_IMAGE_NODE: JSONContent = {
  type: 'imageFigure',
  attrs: {
    src: '',
    alt: '',
    caption: '',
    display: 'regular',
  },
}

function createStarterTableNode(): JSONContent {
  const cell = (text: string): JSONContent => ({
    type: 'tableCell',
    content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
  })

  const header = (text: string): JSONContent => ({
    type: 'tableHeader',
    content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
  })

  return {
    type: 'table',
    content: [
      {
        type: 'tableRow',
        content: [header('字段'), header('用途'), header('备注')],
      },
      {
        type: 'tableRow',
        content: [cell('示例 A'), cell('说明这列写什么'), cell('可以补充注意点')],
      },
      {
        type: 'tableRow',
        content: [cell('示例 B'), cell('适合做对比'), cell('也适合放结论')],
      },
    ],
  }
}

function insertBlockAndContinue(target: CoreEditor, block: JSONContent) {
  return target.chain().focus().insertContent([block, EMPTY_PARAGRAPH_NODE]).focus('end').run()
}

function focusTrailingParagraph(target: CoreEditor) {
  const { doc, schema } = target.state
  const paragraph = schema.nodes.paragraph
  const lastNode = doc.lastChild

  if (paragraph && (!lastNode || lastNode.type !== paragraph)) {
    target.chain().focus().insertContent(EMPTY_PARAGRAPH_NODE).focus('end').run()
    return
  }

  target.chain().focus('end').run()
}

function getActiveBlockLabel(editor: CoreEditor) {
  const { $from } = editor.state.selection
  const parent = $from.parent
  const typeName = parent.type.name

  const labels: Record<string, string> = {
    paragraph: '段落',
    heading: `标题 H${parent.attrs.level ?? 1}`,
    bulletList: '无序列表',
    orderedList: '有序列表',
    blockquote: '引用',
    codeBlock: '代码块',
    tableCell: '表格',
    tableHeader: '表格',
    callout: '提示块',
  }

  return labels[typeName] ?? typeName
}

function updateImageNodeByTempId(editor: CoreEditor, tempId: string, nextAttrs: Record<string, unknown>) {
  let targetPos: number | null = null

  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === 'imageFigure' && node.attrs.tempId === tempId) {
      targetPos = pos
      return false
    }

    return true
  })

  if (targetPos === null) return

  const node = editor.state.doc.nodeAt(targetPos)
  if (!node) return

  const tr = editor.state.tr.setNodeMarkup(targetPos, undefined, {
    ...node.attrs,
    ...nextAttrs,
  })
  editor.view.dispatch(tr)
}

async function uploadImageFile(file: File): Promise<UploadResult> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/upload/image', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new Error(typeof payload?.error === 'string' ? payload.error : '图片上传失败')
  }

  return response.json()
}

function guessFileExtensionFromMime(mimeType: string) {
  if (mimeType.includes('png')) return 'png'
  if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return 'jpg'
  if (mimeType.includes('webp')) return 'webp'
  if (mimeType.includes('gif')) return 'gif'
  if (mimeType.includes('avif')) return 'avif'
  return 'png'
}

function dataUrlToFile(dataUrl: string, fallbackName: string) {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/)
  if (!match) return null

  const mimeType = match[1]
  const base64 = match[2]
  const binary = window.atob(base64)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return new File([bytes], fallbackName, { type: mimeType })
}

async function imageSourceToFile(src: string, fallbackBaseName: string) {
  if (!src) return null

  if (src.startsWith('data:image/')) {
    const dataFile = dataUrlToFile(src, `${fallbackBaseName}.png`)
    return dataFile
  }

  if (/^https?:\/\//i.test(src) || src.startsWith('/')) {
    try {
      const response = await fetch(src)
      if (!response.ok) return null
      const blob = await response.blob()
      if (!blob.type.startsWith('image/')) return null
      return new File([blob], `${fallbackBaseName}.${guessFileExtensionFromMime(blob.type)}`, {
        type: blob.type,
      })
    } catch {
      return null
    }
  }

  return null
}

async function extractImageFilesFromClipboard(event: ClipboardEvent) {
  const clipboard = event.clipboardData
  if (!clipboard) return [] as File[]

  const directFiles = Array.from(clipboard.files ?? []).filter((file) => file.type.startsWith('image/'))
  if (directFiles.length > 0) return directFiles

  const itemFiles = Array.from(clipboard.items ?? [])
    .map((item) => (item.kind === 'file' ? item.getAsFile() : null))
    .filter((file): file is File => file instanceof File && file.type.startsWith('image/'))
  if (itemFiles.length > 0) return itemFiles

  const html = clipboard.getData('text/html')
  if (!html) return []

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const imageSources = Array.from(doc.querySelectorAll('img'))
    .map((image) => image.getAttribute('src')?.trim() ?? '')
    .filter(Boolean)

  if (imageSources.length === 0) return []

  const files = (
    await Promise.all(
      imageSources.map((src, index) => imageSourceToFile(src, `pasted-image-${Date.now()}-${index + 1}`))
    )
  ).filter((file): file is File => Boolean(file))

  return files
}

export function ArticleEditorV2({
  initialContent,
  onChange,
  onStatsChange,
  placeholder,
  className,
}: ArticleEditorV2Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const editorRef = useRef<CoreEditor | null>(null)
  const initialContentRef = useRef<JSONContent>(ensureArticleDocV2(initialContent) as JSONContent)
  const [slashOpen, setSlashOpen] = useState(false)
  const [slashQuery, setSlashQuery] = useState('')
  const [slashPosition, setSlashPosition] = useState({ top: 0, left: 0 })
  const extensions = useMemo(
    () =>
      getArticleExtensions({
        editable: true,
        placeholder,
      }),
    [placeholder]
  )

  const editor = useEditor({
    extensions,
    content: initialContentRef.current,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'article-doc article-edit-surface focus:outline-none',
      },
      handlePaste(view, event) {
        const directFiles = Array.from(event.clipboardData?.files ?? []).filter((file) =>
          file.type.startsWith('image/')
        )
        const itemFiles = Array.from(event.clipboardData?.items ?? [])
          .map((item) => (item.kind === 'file' ? item.getAsFile() : null))
          .filter((file): file is File => file instanceof File && file.type.startsWith('image/'))
        const html = event.clipboardData?.getData('text/html') ?? ''
        const mayContainImageHtml = /<img[\s\S]*src=/i.test(html)

        if (directFiles.length === 0 && itemFiles.length === 0 && !mayContainImageHtml) {
          return false
        }

        event.preventDefault()

        const immediateFiles = directFiles.length > 0 ? directFiles : itemFiles
        if (immediateFiles.length > 0) {
          void handleImageFiles(immediateFiles)
          return true
        }

        void extractImageFilesFromClipboard(event).then((files) => {
          if (files.length > 0) {
            void handleImageFiles(files)
          }
        })
        return true
      },
      handleDrop(view, event, _, moved) {
        if (moved) return false
        const targetEditor = editorRef.current ?? editor
        const files = Array.from(event.dataTransfer?.files ?? []).filter((file) =>
          file.type.startsWith('image/')
        )
        if (files.length === 0) return false

        event.preventDefault()
        const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY })
        if (coordinates) {
          targetEditor?.chain().focus().setTextSelection(coordinates.pos).run()
        }
        void handleImageFiles(files)
        return true
      },
    },
  }, [extensions])

  useEffect(() => {
    editorRef.current = editor ?? null
  }, [editor])

  const slashItems = useMemo<SlashItem[]>(
    () => [
      {
        key: 'paragraph',
        label: '正文段落',
        description: '普通文本段落',
        keywords: ['p', 'paragraph', '正文'],
        command: (target) => target.chain().focus().setParagraph().run(),
      },
      ...HEADING_LEVELS.map((level) => ({
        key: `heading-${level}`,
        label: `H${level} 标题`,
        description: `插入 H${level} 层级标题`,
        keywords: [`h${level}`, '标题', 'heading'],
        command: (target: CoreEditor) => target.chain().focus().toggleHeading({ level }).run(),
      })),
      {
        key: 'bullet-list',
        label: '无序列表',
        description: '适合列重点',
        keywords: ['list', 'ul', '列表'],
        command: (target) => target.chain().focus().toggleBulletList().run(),
      },
      {
        key: 'ordered-list',
        label: '有序列表',
        description: '适合步骤顺序',
        keywords: ['ol', '步骤', '列表'],
        command: (target) => target.chain().focus().toggleOrderedList().run(),
      },
      {
        key: 'blockquote',
        label: '引用',
        description: '强调原话、观点或补充说明',
        keywords: ['quote', '引用'],
        command: (target) => target.chain().focus().toggleBlockquote().run(),
      },
      {
        key: 'code',
        label: '代码块',
        description: '插入可高亮代码',
        keywords: ['code', '代码'],
        command: (target) => insertBlockAndContinue(target, EMPTY_CODE_BLOCK_NODE),
      },
      {
        key: 'table',
        label: '表格',
        description: '适合参数、对比与结论',
        keywords: ['table', '表格'],
        command: (target) => insertBlockAndContinue(target, createStarterTableNode()),
      },
      {
        key: 'callout',
        label: '提示块',
        description: '说明 / 提示 / 注意 / 结论',
        keywords: ['callout', '提示', '说明', '注意'],
        command: (target) =>
          insertBlockAndContinue(target, {
            type: 'callout',
            attrs: { variant: 'info', title: '小提示' },
            content: [{ type: 'paragraph', content: [{ type: 'text', text: '把这段重点写在这里。' }] }],
          }),
      },
      {
        key: 'image',
        label: '图片卡片',
        description: '先插入占位，后续可粘贴或补地址',
        keywords: ['image', '图片'],
        command: (target) => insertBlockAndContinue(target, EMPTY_IMAGE_NODE),
      },
      {
        key: 'steps',
        label: '步骤流',
        description: '适合教程和流程拆解',
        keywords: ['step', '步骤'],
        command: (target) =>
          insertBlockAndContinue(target, {
            type: 'stepFlow',
            attrs: {
              title: '步骤拆解',
              items: [{ title: '步骤 1', description: '先把这一小步讲清楚。', meta: '' }],
            },
          }),
      },
      {
        key: 'faq',
        label: 'FAQ',
        description: '常见问题和回答',
        keywords: ['faq', '问题'],
        command: (target) =>
          insertBlockAndContinue(target, {
            type: 'faqBlock',
            attrs: {
              title: '常见问题',
              items: [{ question: '这里最容易疑惑什么？', answer: '先把核心概念抓牢，再看实现细节。' }],
            },
          }),
      },
      {
        key: 'timeline',
        label: '时间线',
        description: '阶段推进和演进过程',
        keywords: ['timeline', '时间线'],
        command: (target) =>
          insertBlockAndContinue(target, {
            type: 'timelineBlock',
            attrs: {
              title: '时间线',
              items: [{ time: '第 1 天', title: '搭好骨架', description: '先把最小可运行版本拉起来。' }],
            },
          }),
      },
      {
        key: 'columns',
        label: '双栏信息',
        description: '适合定义 / 例子 / 前后对照',
        keywords: ['columns', '双栏'],
        command: (target) =>
          insertBlockAndContinue(target, {
            type: 'infoColumns',
            attrs: {
              leftTitle: '概念',
              leftBody: '在左边写定义或原理。',
              rightTitle: '例子',
              rightBody: '在右边写例子、经验或注意点。',
            },
          }),
      },
      {
        key: 'file-tree',
        label: '文件树',
        description: '展示工程目录结构',
        keywords: ['tree', '文件树'],
        command: (target) =>
          insertBlockAndContinue(target, {
            type: 'fileTree',
            attrs: {
              title: '项目结构',
              rootLabel: 'project/',
              lines: ['src/', '├── app/', '├── components/', '└── package.json'],
            },
          }),
      },
      {
        key: 'terminal',
        label: '终端演示',
        description: '适合命令和输出日志',
        keywords: ['terminal', 'shell', '终端'],
        command: (target) =>
          insertBlockAndContinue(target, {
            type: 'terminalDemo',
            attrs: {
              title: '命令行过程',
              prompt: '$',
              body: 'pnpm install\npnpm dev',
            },
          }),
      },
    ],
    []
  )

  const filteredSlashItems = useMemo(() => {
    const query = slashQuery.trim().toLowerCase()
    if (!query) return slashItems

    return slashItems.filter((item) => {
      const haystack = [item.label, item.description, ...item.keywords].join(' ').toLowerCase()
      return haystack.includes(query)
    })
  }, [slashItems, slashQuery])

  function emitStats(nextEditor: CoreEditor) {
    const content = nextEditor.getJSON() as JSONContent
    const plainText = extractPlainTextFromRichContent(content)
    const normalized = plainText.replace(/\s+/g, ' ').trim()

    onChange(content)
    onStatsChange?.({
      characters: normalized.replace(/\s+/g, '').length,
      words: normalized ? normalized.split(/\s+/).length : 0,
      readingMinutes: estimateReadTime(content),
      headings: extractHeadings(content),
      activeBlockLabel: getActiveBlockLabel(nextEditor),
    })
  }

  function refreshSlashMenu(nextEditor: CoreEditor) {
    const { from, $from } = nextEditor.state.selection
    if (!$from.parent || $from.parent.type.name !== 'paragraph') {
      setSlashOpen(false)
      return
    }

    const textBefore = $from.parent.textBetween(0, $from.parentOffset, '\0', '\0')
    const match = textBefore.match(/^\/([\w\u4e00-\u9fa5-]*)$/)
    if (!match) {
      setSlashOpen(false)
      return
    }

    const root = containerRef.current
    if (!root) {
      setSlashOpen(false)
      return
    }

    const cursor = nextEditor.view.coordsAtPos(from)
    const rect = root.getBoundingClientRect()

    setSlashQuery(match[1] ?? '')
    setSlashPosition({
      top: cursor.bottom - rect.top + 12,
      left: cursor.left - rect.left,
    })
    setSlashOpen(true)
  }

  async function handleImageFiles(files: File[]) {
    const targetEditor = editorRef.current ?? editor
    if (!targetEditor) return

    for (const file of files) {
      const tempId = `${Date.now()}-${Math.random().toString(36).slice(2)}`
      insertBlockAndContinue(targetEditor, {
        type: 'imageFigure',
        attrs: {
          src: '',
          alt: file.name.replace(/\.[^.]+$/, ''),
          caption: file.name,
          display: 'regular',
          uploading: true,
          tempId,
        },
      })

      try {
        const uploaded = await uploadImageFile(file)
        updateImageNodeByTempId(targetEditor, tempId, {
          src: uploaded.url,
          width: uploaded.width,
          height: uploaded.height,
          uploading: false,
          error: '',
        })
      } catch (error) {
        updateImageNodeByTempId(targetEditor, tempId, {
          uploading: false,
          error: error instanceof Error ? error.message : '图片上传失败',
        })
      }
    }
  }

  function runSlashItem(item: SlashItem) {
    if (!editor) return

    const { from, $from } = editor.state.selection
    const textBefore = $from.parent.textBetween(0, $from.parentOffset, '\0', '\0')
    const match = textBefore.match(/^\/([\w\u4e00-\u9fa5-]*)$/)

    if (match) {
      const start = from - match[0].length
      editor.chain().focus().deleteRange({ from: start, to: from }).run()
    }

    item.command(editor)
    setSlashOpen(false)
  }

  useEffect(() => {
    if (!editor) return

    emitStats(editor)
    refreshSlashMenu(editor)

    const handleUpdate = ({ editor: currentEditor }: { editor: CoreEditor }) => {
      emitStats(currentEditor)
      refreshSlashMenu(currentEditor)
    }
    const handleSelection = ({ editor: currentEditor }: { editor: CoreEditor }) => {
      emitStats(currentEditor)
      refreshSlashMenu(currentEditor)
    }

    editor.on('update', handleUpdate)
    editor.on('selectionUpdate', handleSelection)

    return () => {
      editor.off('update', handleUpdate)
      editor.off('selectionUpdate', handleSelection)
    }
  }, [editor])

  useEffect(() => {
    if (!slashOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSlashOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [slashOpen])

  if (!editor) return null

  return (
    <div ref={containerRef} className={cn('article-editor-shell relative', className)}>
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? [])
          if (files.length > 0) {
            void handleImageFiles(files)
          }
          event.target.value = ''
        }}
      />

      <div className="sticky top-[4.8rem] z-20 mb-5 flex flex-wrap items-center gap-2 rounded-[26px] border border-border/70 bg-card/88 p-3 shadow-[0_16px_44px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
        {([
          ...HEADING_LEVELS.map((level) => ({
            key: `heading-${level}`,
            label: `H${level} 标题`,
            icon: `filter_${level}`,
            active: editor.isActive('heading', { level }),
            onClick: () => editor.chain().focus().toggleHeading({ level }).run(),
          })),
          {
            key: 'bullet-list',
            label: '列表',
            icon: 'format_list_bulleted',
            active: editor.isActive('bulletList'),
            onClick: () => editor.chain().focus().toggleBulletList().run(),
          },
          {
            key: 'blockquote',
            label: '引用',
            icon: 'format_quote',
            active: editor.isActive('blockquote'),
            onClick: () => editor.chain().focus().toggleBlockquote().run(),
          },
          {
            key: 'code',
            label: '代码块',
            icon: 'code',
            active: editor.isActive('codeBlock'),
            onClick: () => insertBlockAndContinue(editor, EMPTY_CODE_BLOCK_NODE),
          },
          {
            key: 'table',
            label: '表格',
            icon: 'table_chart',
            onClick: () => insertBlockAndContinue(editor, createStarterTableNode()),
          },
          {
            key: 'callout',
            label: '提示块',
            icon: 'info',
            onClick: () => slashItems.find((item) => item.key === 'callout')?.command(editor),
          },
          {
            key: 'steps',
            label: '步骤',
            icon: 'format_list_numbered',
            onClick: () => slashItems.find((item) => item.key === 'steps')?.command(editor),
          },
          {
            key: 'faq',
            label: 'FAQ',
            icon: 'quiz',
            onClick: () => slashItems.find((item) => item.key === 'faq')?.command(editor),
          },
          {
            key: 'timeline',
            label: '时间线',
            icon: 'timeline',
            onClick: () => slashItems.find((item) => item.key === 'timeline')?.command(editor),
          },
          {
            key: 'image',
            label: '图片',
            icon: 'image',
            onClick: () => uploadInputRef.current?.click(),
          },
        ] as ToolbarItem[]).map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={item.onClick}
            title={item.label}
            aria-label={item.label}
            className={cn(
              'inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-background/55 text-muted-foreground transition-colors hover:text-foreground',
              item.active && 'border-primary/28 bg-primary/12 text-primary'
            )}
          >
            <MaterialSymbol icon={item.icon} size={18} />
          </button>
        ))}
      </div>

      <div className="rounded-[32px] border border-border/70 bg-card/72 p-5 backdrop-blur-2xl sm:p-7">
        <EditorContent editor={editor} />
        <button
          type="button"
          onClick={() => focusTrailingParagraph(editor)}
          className="mt-5 flex min-h-16 w-full items-center justify-center rounded-[22px] border border-dashed border-border/70 bg-background/26 px-4 text-sm text-muted-foreground transition-colors hover:border-primary/28 hover:text-foreground"
        >
          <span className="inline-flex items-center gap-2">
            <MaterialSymbol icon="add" size={18} />
            在这里继续写正文，或输入 / 插入新块
          </span>
        </button>
      </div>

      <BubbleMenu
        editor={editor}
        tippyOptions={{ duration: 120, placement: 'top' }}
        shouldShow={({ editor: target }) => !target.state.selection.empty}
      >
        <div className="flex items-center gap-1 rounded-full border border-border/70 bg-card/95 p-1 shadow-2xl backdrop-blur-xl">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium',
              editor.isActive('bold') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            )}
          >
            加粗
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium',
              editor.isActive('italic') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            )}
          >
            斜体
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium',
              editor.isActive('code') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            )}
          >
            行内代码
          </button>
          <button
            type="button"
            onClick={() => {
              const previous = editor.getAttributes('link').href as string | undefined
              const href = window.prompt('输入链接地址', previous ?? 'https://')
              if (!href) return
              editor.chain().focus().setLink({ href }).run()
            }}
            className="rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground"
          >
            链接
          </button>
        </div>
      </BubbleMenu>

      {slashOpen ? (
        <div
          className="absolute z-30 w-[320px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[24px] border border-border/75 bg-card/95 shadow-[0_30px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl"
          style={{
            top: slashPosition.top,
            left: Math.max(0, slashPosition.left),
          }}
        >
          <div className="border-b border-border/70 px-4 py-3">
            <p className="text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
              Slash Command
            </p>
            <p className="mt-1 text-sm text-foreground">
              输入 <span className="font-mono text-primary">/</span> 以后，直接选一个组件插进去。
            </p>
          </div>
          <div className="max-h-[360px] overflow-y-auto p-2">
            {filteredSlashItems.length > 0 ? (
              filteredSlashItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => runSlashItem(item)}
                  className="flex w-full items-start gap-3 rounded-[18px] px-3 py-3 text-left transition-colors hover:bg-background/70"
                >
                  <div className="mt-0.5 h-2 w-2 rounded-full bg-primary/75" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-5 text-sm text-muted-foreground">没有匹配项，换个关键词试试。</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

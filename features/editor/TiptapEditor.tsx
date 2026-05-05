'use client'

import { useEffect, useRef, useState } from 'react'
import type { Editor, JSONContent } from '@tiptap/core'
import { EditorContent, useEditor } from '@tiptap/react'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'
import { getEditorExtensions } from '@/lib/editor/registry'

export interface EditorStats {
  characters: number
  words: number
  readingMinutes: number
}

interface TiptapEditorProps {
  initialContent?: JSONContent
  onChange?: (content: JSONContent) => void
  onStatsChange?: (stats: EditorStats) => void
  placeholder?: string
  editable?: boolean
  className?: string
  toolbarPreset?: 'full' | 'lite'
  proseClassName?: string
}

type ToolItem = {
  icon: React.ReactNode
  title: string
  action: (editor: Editor) => void
  isActive?: (editor: Editor) => boolean
}

function estimateEditorStats(editor: Editor): EditorStats {
  const text = editor.getText().trim()
  const compact = text.replace(/\s+/g, '')
  const latinWords = text ? text.split(/\s+/).filter(Boolean).length : 0
  const cjkCharacters = (compact.match(/[\u3400-\u9fff]/g) ?? []).length
  const words = Math.max(latinWords, cjkCharacters + Math.max(0, latinWords - 1))
  const readingMinutes = Math.max(1, Math.ceil((cjkCharacters + latinWords * 2) / 320))

  return {
    characters: compact.length,
    words,
    readingMinutes,
  }
}

export function TiptapEditor({
  initialContent,
  onChange,
  onStatsChange,
  placeholder = '开始写作...',
  editable = true,
  className = '',
  toolbarPreset = 'full',
  proseClassName = '',
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: getEditorExtensions({ placeholder }),
    content: initialContent,
    editable,
    immediatelyRender: false,
    onCreate({ editor }) {
      onStatsChange?.(estimateEditorStats(editor))
    },
    onUpdate({ editor }) {
      onChange?.(editor.getJSON())
      onStatsChange?.(estimateEditorStats(editor))
    },
  })

  if (!editor) return null

  const minHeightClass =
    toolbarPreset === 'lite' ? '[&_.ProseMirror]:min-h-[320px]' : '[&_.ProseMirror]:min-h-[760px]'

  return (
    <div className={`mx-auto w-full max-w-[1080px] ${className}`.trim()}>
      <div className="overflow-hidden rounded-[32px] border border-border/75 bg-card/82 shadow-[0_24px_80px_rgba(10,10,12,0.08)] backdrop-blur-2xl">
        {editable ? <EditorToolbar editor={editor} preset={toolbarPreset} /> : null}
        <EditorContent
          editor={editor}
          className={cn(
            'relative prose prose-neutral max-w-none dark:prose-invert',
            '[&_.ProseMirror]:px-8 [&_.ProseMirror]:py-10 [&_.ProseMirror]:font-sans [&_.ProseMirror]:text-[16px] [&_.ProseMirror]:leading-8 [&_.ProseMirror]:text-foreground [&_.ProseMirror]:focus:outline-none',
            minHeightClass,
            '[&_.ProseMirror_h1]:mb-5 [&_.ProseMirror_h1]:text-4xl [&_.ProseMirror_h1]:font-semibold [&_.ProseMirror_h1]:tracking-[-0.06em]',
            '[&_.ProseMirror_h2]:mt-12 [&_.ProseMirror_h2]:mb-5 [&_.ProseMirror_h2]:text-[2rem] [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:tracking-[-0.05em]',
            '[&_.ProseMirror_h3]:mt-9 [&_.ProseMirror_h3]:mb-4 [&_.ProseMirror_h3]:text-[1.45rem] [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:tracking-[-0.04em]',
            '[&_.ProseMirror_h4]:mt-7 [&_.ProseMirror_h4]:mb-3 [&_.ProseMirror_h4]:text-[1.12rem] [&_.ProseMirror_h4]:font-semibold',
            '[&_.ProseMirror_p]:my-4 [&_.ProseMirror_p]:text-[1rem] [&_.ProseMirror_p]:leading-8 [&_.ProseMirror_p]:text-foreground/86',
            '[&_.ProseMirror_a]:text-primary [&_.ProseMirror_a]:underline [&_.ProseMirror_a]:decoration-primary/35 [&_.ProseMirror_a]:underline-offset-4',
            '[&_.ProseMirror_blockquote]:rounded-[24px] [&_.ProseMirror_blockquote]:border-l-[3px] [&_.ProseMirror_blockquote]:border-primary/30 [&_.ProseMirror_blockquote]:bg-background/42 [&_.ProseMirror_blockquote]:px-5 [&_.ProseMirror_blockquote]:py-4',
            '[&_.ProseMirror_pre]:rounded-[24px] [&_.ProseMirror_pre]:border [&_.ProseMirror_pre]:border-border/70 [&_.ProseMirror_pre]:bg-[linear-gradient(180deg,rgba(16,16,18,0.98),rgba(10,10,12,0.98))] [&_.ProseMirror_pre]:shadow-[0_20px_48px_rgba(0,0,0,0.14)]',
            '[&_.ProseMirror_pre_code]:block [&_.ProseMirror_pre_code]:rounded-none [&_.ProseMirror_pre_code]:bg-transparent [&_.ProseMirror_pre_code]:px-5 [&_.ProseMirror_pre_code]:py-4 [&_.ProseMirror_pre_code]:font-mono [&_.ProseMirror_pre_code]:text-[0.92rem] [&_.ProseMirror_pre_code]:leading-7 [&_.ProseMirror_pre_code]:text-zinc-100',
            '[&_.ProseMirror_code]:rounded-md [&_.ProseMirror_code]:bg-primary/10 [&_.ProseMirror_code]:px-1.5 [&_.ProseMirror_code]:py-1 [&_.ProseMirror_code]:font-mono [&_.ProseMirror_code]:text-[0.92em] [&_.ProseMirror_code]:text-primary',
            '[&_.ProseMirror_ul]:my-5 [&_.ProseMirror_ul]:space-y-2.5 [&_.ProseMirror_ul]:pl-6 [&_.ProseMirror_ol]:my-5 [&_.ProseMirror_ol]:space-y-2.5 [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_li]:text-foreground/84',
            '[&_.ProseMirror_hr]:my-10 [&_.ProseMirror_hr]:border-border/75',
            '[&_.ProseMirror_img]:rounded-[24px] [&_.ProseMirror_img]:border [&_.ProseMirror_img]:border-border/70 [&_.ProseMirror_img]:bg-background/65 [&_.ProseMirror_img]:shadow-[0_24px_64px_rgba(0,0,0,0.12)]',
            proseClassName
          )}
        />
      </div>
    </div>
  )
}

function EditorToolbar({ editor, preset }: { editor: Editor; preset: 'full' | 'lite' }) {
  const imgInputRef = useRef<HTMLInputElement>(null)
  const [imgUploading, setImgUploading] = useState(false)
  const [linkPanelOpen, setLinkPanelOpen] = useState(false)
  const [linkValue, setLinkValue] = useState('')

  useEffect(() => {
    if (!linkPanelOpen) return
    setLinkValue(editor.getAttributes('link').href ?? '')
  }, [editor, linkPanelOpen])

  async function handleImageFile(file: File) {
    setImgUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch('/api/upload/image', { method: 'POST', body: formData })
      if (!response.ok) throw new Error('图片上传失败')
      const { url } = await response.json()
      editor.chain().focus().setImage({ src: url }).run()
    } catch (error) {
      alert(error instanceof Error ? error.message : '图片上传失败')
    } finally {
      setImgUploading(false)
    }
  }

  function applyLink() {
    const nextValue = linkValue.trim()
    if (!nextValue) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      setLinkPanelOpen(false)
      return
    }

    const normalized =
      nextValue.startsWith('http://') ||
      nextValue.startsWith('https://') ||
      nextValue.startsWith('mailto:')
        ? nextValue
        : `https://${nextValue}`

    editor.chain().focus().extendMarkRange('link').setLink({ href: normalized }).run()
    setLinkPanelOpen(false)
  }

  const sharedGroups: ToolItem[][] = [
    [
      {
        icon: <MaterialSymbol icon="undo" size={18} />,
        title: '撤销',
        action: (instance) => instance.chain().focus().undo().run(),
      },
      {
        icon: <MaterialSymbol icon="redo" size={18} />,
        title: '重做',
        action: (instance) => instance.chain().focus().redo().run(),
      },
    ],
    [
      {
        icon: <MaterialSymbol icon="text_fields" size={18} />,
        title: '正文段落',
        action: (instance) => instance.chain().focus().setParagraph().run(),
        isActive: (instance) => instance.isActive('paragraph'),
      },
      {
        icon: <MaterialSymbol icon="format_h2" size={18} />,
        title: '二级标题',
        action: (instance) => instance.chain().focus().toggleHeading({ level: 2 }).run(),
        isActive: (instance) => instance.isActive('heading', { level: 2 }),
      },
      {
        icon: <MaterialSymbol icon="format_h3" size={18} />,
        title: '三级标题',
        action: (instance) => instance.chain().focus().toggleHeading({ level: 3 }).run(),
        isActive: (instance) => instance.isActive('heading', { level: 3 }),
      },
    ],
    [
      {
        icon: <MaterialSymbol icon="format_bold" size={18} />,
        title: '加粗',
        action: (instance) => instance.chain().focus().toggleBold().run(),
        isActive: (instance) => instance.isActive('bold'),
      },
      {
        icon: <MaterialSymbol icon="format_italic" size={18} />,
        title: '斜体',
        action: (instance) => instance.chain().focus().toggleItalic().run(),
        isActive: (instance) => instance.isActive('italic'),
      },
      {
        icon: <MaterialSymbol icon="code" size={18} />,
        title: '行内代码',
        action: (instance) => instance.chain().focus().toggleCode().run(),
        isActive: (instance) => instance.isActive('code'),
      },
      {
        icon: <MaterialSymbol icon="format_clear" size={18} />,
        title: '清除格式',
        action: (instance) => instance.chain().focus().unsetAllMarks().clearNodes().run(),
      },
    ],
    [
      {
        icon: <MaterialSymbol icon="format_list_bulleted" size={18} />,
        title: '无序列表',
        action: (instance) => instance.chain().focus().toggleBulletList().run(),
        isActive: (instance) => instance.isActive('bulletList'),
      },
      {
        icon: <MaterialSymbol icon="format_list_numbered" size={18} />,
        title: '有序列表',
        action: (instance) => instance.chain().focus().toggleOrderedList().run(),
        isActive: (instance) => instance.isActive('orderedList'),
      },
      {
        icon: <MaterialSymbol icon="format_quote" size={18} />,
        title: '引用',
        action: (instance) => instance.chain().focus().toggleBlockquote().run(),
        isActive: (instance) => instance.isActive('blockquote'),
      },
      {
        icon: <MaterialSymbol icon="code_blocks" size={18} />,
        title: '代码块',
        action: (instance) => instance.chain().focus().toggleCodeBlock().run(),
        isActive: (instance) => instance.isActive('codeBlock'),
      },
      {
        icon: <MaterialSymbol icon="horizontal_rule" size={18} />,
        title: '分隔线',
        action: (instance) => instance.chain().focus().setHorizontalRule().run(),
      },
    ],
  ]

  const fullOnlyGroup: ToolItem[] = [
    {
      icon: <MaterialSymbol icon="format_h4" size={18} />,
      title: '四级标题',
      action: (instance) => instance.chain().focus().toggleHeading({ level: 4 }).run(),
      isActive: (instance) => instance.isActive('heading', { level: 4 }),
    },
    {
      icon: <MaterialSymbol icon="format_strikethrough" size={18} />,
      title: '删除线',
      action: (instance) => instance.chain().focus().toggleStrike().run(),
      isActive: (instance) => instance.isActive('strike'),
    },
  ]

  const customBlocks: ToolItem[] = [
    {
      icon: <MaterialSymbol icon="html" size={18} />,
      title: '原始 HTML',
      action: (instance) => instance.chain().focus().insertContent({ type: 'rawHtml' }).run(),
    },
    {
      icon: <MaterialSymbol icon="schema" size={18} />,
      title: '引脚图',
      action: (instance) => instance.chain().focus().insertContent({ type: 'pinoutDiagram' }).run(),
    },
    {
      icon: <MaterialSymbol icon="terminal" size={18} />,
      title: 'SSH 终端',
      action: (instance) => instance.chain().focus().insertContent({ type: 'sshTerminal' }).run(),
    },
  ]

  const groups = sharedGroups.map((group, index) => {
    if (preset === 'full' && index === 1) {
      return [...group, ...fullOnlyGroup.slice(0, 1)]
    }
    if (preset === 'full' && index === 2) {
      return [...group, ...fullOnlyGroup.slice(1)]
    }
    return group
  })

  if (preset === 'full') {
    groups.push(customBlocks)
  }

  return (
    <div className="sticky top-0 z-20 border-b border-border/70 bg-background/90 backdrop-blur-2xl">
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-muted-foreground">
            {preset === 'lite' ? 'Moment Composer' : 'Writing Surface'}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {preset === 'lite'
              ? '适合写一条更完整的瞬间记录，够用但不过度打扰。'
              : '工具栏补齐了常用排版和插入能力，但依旧尽量轻，不让正文写作变成在堆按钮。'}
          </p>
        </div>

        <div className="flex max-w-[1000px] flex-wrap items-center justify-end gap-2">
          <input
            ref={imgInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) void handleImageFile(file)
              event.target.value = ''
            }}
          />

          {groups.map((group, groupIndex) => (
            <div
              key={groupIndex}
              className="flex items-center gap-1 rounded-2xl border border-border/70 bg-background/42 px-2 py-1"
            >
              {group.map((item, itemIndex) => {
                const active = item.isActive?.(editor) ?? false
                return (
                  <button
                    key={itemIndex}
                    type="button"
                    title={item.title}
                    onMouseDown={(event) => {
                      event.preventDefault()
                      item.action(editor)
                    }}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-xl border transition-colors',
                      active
                        ? 'border-primary/18 bg-primary/10 text-primary'
                        : 'border-transparent text-muted-foreground hover:border-border/70 hover:bg-background/65 hover:text-foreground'
                    )}
                  >
                    {item.icon}
                  </button>
                )
              })}
            </div>
          ))}

          <div className="flex items-center gap-1 rounded-2xl border border-border/70 bg-background/42 px-2 py-1">
            <button
              type="button"
              title="插入或编辑链接"
              onMouseDown={(event) => {
                event.preventDefault()
                setLinkPanelOpen((current) => !current)
              }}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-xl border transition-colors',
                editor.isActive('link')
                  ? 'border-primary/18 bg-primary/10 text-primary'
                  : 'border-transparent text-muted-foreground hover:border-border/70 hover:bg-background/65 hover:text-foreground'
              )}
            >
              <MaterialSymbol icon="link" size={18} />
            </button>

            <button
              type="button"
              title="移除链接"
              onMouseDown={(event) => {
                event.preventDefault()
                editor.chain().focus().extendMarkRange('link').unsetLink().run()
                setLinkPanelOpen(false)
              }}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-muted-foreground transition-colors hover:border-border/70 hover:bg-background/65 hover:text-foreground"
            >
              <MaterialSymbol icon="link_off" size={18} />
            </button>

            <button
              type="button"
              title="插入图片"
              disabled={imgUploading}
              onMouseDown={(event) => {
                event.preventDefault()
                imgInputRef.current?.click()
              }}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-muted-foreground transition-colors hover:border-border/70 hover:bg-background/65 hover:text-foreground disabled:opacity-40"
            >
              {imgUploading ? (
                <MaterialSymbol icon="progress_activity" size={18} className="animate-spin" />
              ) : (
                <MaterialSymbol icon="add_photo_alternate" size={18} />
              )}
            </button>
          </div>
        </div>
      </div>

      {linkPanelOpen ? (
        <div className="border-t border-border/70 px-5 py-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-background/45 p-4 md:flex-row md:items-center">
            <div className="min-w-0 flex-1">
              <label className="text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
                Link URL
              </label>
              <input
                value={linkValue}
                onChange={(event) => setLinkValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    applyLink()
                  }
                  if (event.key === 'Escape') {
                    setLinkPanelOpen(false)
                  }
                }}
                placeholder="https://example.com"
                className="mt-2 h-11 w-full rounded-[18px] border border-border/70 bg-background/55 px-4 text-sm text-foreground outline-none transition-colors focus:border-primary/28 focus:ring-2 focus:ring-primary/14"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={applyLink}
                className="inline-flex h-11 items-center justify-center rounded-[18px] border border-primary/18 bg-primary/10 px-4 text-sm font-medium text-foreground transition-colors hover:bg-primary/14"
              >
                应用链接
              </button>
              <button
                type="button"
                onClick={() => setLinkPanelOpen(false)}
                className="inline-flex h-11 items-center justify-center rounded-[18px] border border-border/70 bg-background/55 px-4 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}

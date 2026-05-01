'use client'

import { useRef, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import type { Editor, JSONContent } from '@tiptap/core'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'
import { getEditorExtensions } from '@/lib/editor/registry'

interface TiptapEditorProps {
  initialContent?: JSONContent
  onChange?: (content: JSONContent) => void
  placeholder?: string
  editable?: boolean
  className?: string
}

type ToolItem =
  | {
      type: 'btn'
      icon: React.ReactNode
      title: string
      action: (editor: Editor) => void
      isActive: (editor: Editor) => boolean
    }
  | { type: 'sep' }

type ToolGroup = { items: ToolItem[] }

export function TiptapEditor({
  initialContent,
  onChange,
  placeholder = '开始写作…',
  editable = true,
  className = '',
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: getEditorExtensions({ placeholder }),
    content: initialContent,
    editable,
    immediatelyRender: false,
    onUpdate({ editor }) {
      onChange?.(editor.getJSON())
    },
  })

  if (!editor) return null

  return (
    <div className={`mx-auto w-full max-w-[980px] ${className}`.trim()}>
      <div className="overflow-hidden rounded-[32px] border border-white/8 bg-card/80 shadow-[0_28px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl">
        {editable ? <EditorToolbar editor={editor} /> : null}
        <div className="relative">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,138,107,0.06),transparent_34%)]" />
          <EditorContent
            editor={editor}
            className="
              relative prose max-w-none dark:prose-invert
              [&_.ProseMirror]:min-h-[720px]
              [&_.ProseMirror]:px-8
              [&_.ProseMirror]:py-10
              [&_.ProseMirror]:font-sans
              [&_.ProseMirror]:text-[16px]
              [&_.ProseMirror]:leading-8
              [&_.ProseMirror]:text-foreground
              [&_.ProseMirror]:focus:outline-none
              [&_.ProseMirror_h1]:mb-5
              [&_.ProseMirror_h2]:mt-10
              [&_.ProseMirror_h3]:mt-8
              [&_.ProseMirror_blockquote]:rounded-r-[20px]
              [&_.ProseMirror_blockquote]:bg-black/[0.03]
              [&_.ProseMirror_blockquote]:px-5
              [&_.ProseMirror_blockquote]:py-3
              dark:[&_.ProseMirror_blockquote]:bg-white/[0.04]
              [&_.ProseMirror_pre]:rounded-[20px]
              [&_.ProseMirror_pre]:border
              [&_.ProseMirror_pre]:border-white/8
              [&_.ProseMirror_img]:shadow-[0_20px_50px_rgba(15,23,42,0.18)]
            "
          />
        </div>
      </div>
    </div>
  )
}

function EditorToolbar({ editor }: { editor: Editor }) {
  const imgInputRef = useRef<HTMLInputElement>(null)
  const [imgUploading, setImgUploading] = useState(false)

  async function handleImageFile(file: File) {
    setImgUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload/image', { method: 'POST', body: fd })
      if (!res.ok) throw new Error('上传失败')
      const { url } = await res.json()
      editor.chain().focus().setImage({ src: url }).run()
    } catch (error) {
      alert(error instanceof Error ? error.message : '图片上传失败')
    } finally {
      setImgUploading(false)
    }
  }

  const groups: ToolGroup[] = [
    {
      items: [
        {
          type: 'btn',
          icon: <MaterialSymbol icon="undo" size={18} />,
          title: '撤销',
          action: (instance) => instance.chain().focus().undo().run(),
          isActive: () => false,
        },
        {
          type: 'btn',
          icon: <MaterialSymbol icon="redo" size={18} />,
          title: '重做',
          action: (instance) => instance.chain().focus().redo().run(),
          isActive: () => false,
        },
      ],
    },
    {
      items: [
        {
          type: 'btn',
          icon: <MaterialSymbol icon="format_bold" size={18} />,
          title: '加粗',
          action: (instance) => instance.chain().focus().toggleBold().run(),
          isActive: (instance) => instance.isActive('bold'),
        },
        {
          type: 'btn',
          icon: <MaterialSymbol icon="format_italic" size={18} />,
          title: '斜体',
          action: (instance) => instance.chain().focus().toggleItalic().run(),
          isActive: (instance) => instance.isActive('italic'),
        },
        {
          type: 'btn',
          icon: <MaterialSymbol icon="format_strikethrough" size={18} />,
          title: '删除线',
          action: (instance) => instance.chain().focus().toggleStrike().run(),
          isActive: (instance) => instance.isActive('strike'),
        },
        {
          type: 'btn',
          icon: <MaterialSymbol icon="code" size={18} />,
          title: '行内代码',
          action: (instance) => instance.chain().focus().toggleCode().run(),
          isActive: (instance) => instance.isActive('code'),
        },
      ],
    },
    {
      items: [
        {
          type: 'btn',
          icon: <MaterialSymbol icon="format_h2" size={18} />,
          title: '二级标题',
          action: (instance) => instance.chain().focus().toggleHeading({ level: 2 }).run(),
          isActive: (instance) => instance.isActive('heading', { level: 2 }),
        },
        {
          type: 'btn',
          icon: <MaterialSymbol icon="format_h3" size={18} />,
          title: '三级标题',
          action: (instance) => instance.chain().focus().toggleHeading({ level: 3 }).run(),
          isActive: (instance) => instance.isActive('heading', { level: 3 }),
        },
        {
          type: 'btn',
          icon: <MaterialSymbol icon="format_h4" size={18} />,
          title: '四级标题',
          action: (instance) => instance.chain().focus().toggleHeading({ level: 4 }).run(),
          isActive: (instance) => instance.isActive('heading', { level: 4 }),
        },
      ],
    },
    {
      items: [
        {
          type: 'btn',
          icon: <MaterialSymbol icon="format_list_bulleted" size={18} />,
          title: '无序列表',
          action: (instance) => instance.chain().focus().toggleBulletList().run(),
          isActive: (instance) => instance.isActive('bulletList'),
        },
        {
          type: 'btn',
          icon: <MaterialSymbol icon="format_list_numbered" size={18} />,
          title: '有序列表',
          action: (instance) => instance.chain().focus().toggleOrderedList().run(),
          isActive: (instance) => instance.isActive('orderedList'),
        },
      ],
    },
    {
      items: [
        {
          type: 'btn',
          icon: <MaterialSymbol icon="format_quote" size={18} />,
          title: '引用',
          action: (instance) => instance.chain().focus().toggleBlockquote().run(),
          isActive: (instance) => instance.isActive('blockquote'),
        },
        {
          type: 'btn',
          icon: <MaterialSymbol icon="code_blocks" size={18} />,
          title: '代码块',
          action: (instance) => instance.chain().focus().toggleCodeBlock().run(),
          isActive: (instance) => instance.isActive('codeBlock'),
        },
        {
          type: 'btn',
          icon: <MaterialSymbol icon="horizontal_rule" size={18} />,
          title: '分隔线',
          action: (instance) => instance.chain().focus().setHorizontalRule().run(),
          isActive: () => false,
        },
      ],
    },
    {
      items: [
        {
          type: 'btn',
          icon: <MaterialSymbol icon="html" size={18} />,
          title: '原始 HTML',
          action: (instance) => instance.chain().focus().insertContent({ type: 'rawHtml' }).run(),
          isActive: () => false,
        },
        {
          type: 'btn',
          icon: <MaterialSymbol icon="schema" size={18} />,
          title: '引脚图',
          action: (instance) => instance.chain().focus().insertContent({ type: 'pinoutDiagram' }).run(),
          isActive: () => false,
        },
        {
          type: 'btn',
          icon: <MaterialSymbol icon="terminal" size={18} />,
          title: 'SSH 终端',
          action: (instance) => instance.chain().focus().insertContent({ type: 'sshTerminal' }).run(),
          isActive: () => false,
        },
      ],
    },
  ]

  return (
    <div className="sticky top-0 z-20 border-b border-white/8 bg-background/88 backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-muted-foreground">
            Writing Surface
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            专注正文，格式操作保持轻量和靠前。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={imgInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) handleImageFile(file)
              event.target.value = ''
            }}
          />

          {groups.map((group, groupIndex) => (
            <div
              key={groupIndex}
              className="flex items-center gap-1 rounded-2xl border border-white/8 bg-white/[0.03] px-2 py-1"
            >
              {group.items.map((item, itemIndex) => {
                if (item.type === 'sep') {
                  return <div key={itemIndex} className="mx-1 h-5 w-px bg-white/8" />
                }

                const active = item.isActive(editor)

                return (
                  <button
                    key={itemIndex}
                    type="button"
                    title={item.title}
                    onMouseDown={(event) => {
                      event.preventDefault()
                      item.action(editor)
                    }}
                    className={[
                      'flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-150',
                      active
                        ? 'bg-sky-400/16 text-sky-200 shadow-[0_0_0_1px_rgba(56,189,248,0.25)]'
                        : 'text-muted-foreground hover:bg-white/[0.06] hover:text-foreground',
                    ].join(' ')}
                  >
                    {item.icon}
                  </button>
                )
              })}
            </div>
          ))}

          <button
            type="button"
            title="插入图片"
            disabled={imgUploading}
            onMouseDown={(event) => {
              event.preventDefault()
              imgInputRef.current?.click()
            }}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/8 bg-white/[0.03] text-muted-foreground transition-all duration-150 hover:bg-white/[0.06] hover:text-foreground disabled:opacity-40"
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
  )
}

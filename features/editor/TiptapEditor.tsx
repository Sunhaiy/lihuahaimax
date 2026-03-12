/**
 * features/editor/TiptapEditor.tsx
 *
 * 核心 Tiptap 编辑器 — 专业工具栏 + 沉浸式写作区。
 */

'use client'

import { useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { getEditorExtensions } from '@/lib/editor/registry'
import type { JSONContent } from '@tiptap/core'
import type { Editor } from '@tiptap/core'
import {
  RiArrowGoBackLine,
  RiArrowGoForwardLine,
  RiBold,
  RiItalic,
  RiStrikethrough,
  RiCodeLine,
  RiH2,
  RiH3,
  RiH4,
  RiListUnordered,
  RiListOrdered,
  RiDoubleQuotesL,
  RiCodeBoxLine,
  RiSeparator,
  RiTerminalBoxLine,
  RiPlugLine,
  RiHtml5Line,
  RiImageAddLine,
  RiLoader4Line,
} from '@remixicon/react'

interface TiptapEditorProps {
  initialContent?: JSONContent
  onChange?: (content: JSONContent) => void
  placeholder?: string
  editable?: boolean
  className?: string
}

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
    <div className={`flex flex-col ${className}`}>
      {editable && <EditorToolbar editor={editor} />}
      <EditorContent
        editor={editor}
        className="prose dark:prose-invert max-w-none focus:outline-none min-h-[520px] px-8 py-6"
      />
    </div>
  )
}

// ============================================================
// 工具栏
// ============================================================

type ToolGroup = {
  items: ToolItem[]
}

type ToolItem =
  | { type: 'btn'; icon: React.ReactNode; title: string; action: (e: Editor) => void; isActive: (e: Editor) => boolean }
  | { type: 'sep' }

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
    } catch (e) {
      alert(e instanceof Error ? e.message : '图片上传失败')
    } finally {
      setImgUploading(false)
    }
  }

  const groups: ToolGroup[] = [
    {
      items: [
        { type: 'btn', icon: <RiArrowGoBackLine size={15} />, title: '撤销 (Ctrl+Z)', action: (e) => e.chain().focus().undo().run(), isActive: () => false },
        { type: 'btn', icon: <RiArrowGoForwardLine size={15} />, title: '重做 (Ctrl+Y)', action: (e) => e.chain().focus().redo().run(), isActive: () => false },
      ],
    },
    {
      items: [
        { type: 'btn', icon: <RiBold size={15} />, title: '加粗 (Ctrl+B)', action: (e) => e.chain().focus().toggleBold().run(), isActive: (e) => e.isActive('bold') },
        { type: 'btn', icon: <RiItalic size={15} />, title: '斜体 (Ctrl+I)', action: (e) => e.chain().focus().toggleItalic().run(), isActive: (e) => e.isActive('italic') },
        { type: 'btn', icon: <RiStrikethrough size={15} />, title: '删除线', action: (e) => e.chain().focus().toggleStrike().run(), isActive: (e) => e.isActive('strike') },
        { type: 'btn', icon: <RiCodeLine size={15} />, title: '行内代码', action: (e) => e.chain().focus().toggleCode().run(), isActive: (e) => e.isActive('code') },
      ],
    },
    {
      items: [
        { type: 'btn', icon: <RiH2 size={15} />, title: '二级标题', action: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(), isActive: (e) => e.isActive('heading', { level: 2 }) },
        { type: 'btn', icon: <RiH3 size={15} />, title: '三级标题', action: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(), isActive: (e) => e.isActive('heading', { level: 3 }) },
        { type: 'btn', icon: <RiH4 size={15} />, title: '四级标题', action: (e) => e.chain().focus().toggleHeading({ level: 4 }).run(), isActive: (e) => e.isActive('heading', { level: 4 }) },
      ],
    },
    {
      items: [
        { type: 'btn', icon: <RiListUnordered size={15} />, title: '无序列表', action: (e) => e.chain().focus().toggleBulletList().run(), isActive: (e) => e.isActive('bulletList') },
        { type: 'btn', icon: <RiListOrdered size={15} />, title: '有序列表', action: (e) => e.chain().focus().toggleOrderedList().run(), isActive: (e) => e.isActive('orderedList') },
      ],
    },
    {
      items: [
        { type: 'btn', icon: <RiDoubleQuotesL size={15} />, title: '引用块', action: (e) => e.chain().focus().toggleBlockquote().run(), isActive: (e) => e.isActive('blockquote') },
        { type: 'btn', icon: <RiCodeBoxLine size={15} />, title: '代码块', action: (e) => e.chain().focus().toggleCodeBlock().run(), isActive: (e) => e.isActive('codeBlock') },
        { type: 'btn', icon: <RiSeparator size={15} />, title: '分隔线', action: (e) => e.chain().focus().setHorizontalRule().run(), isActive: () => false },
      ],
    },
    {
      items: [
        { type: 'btn', icon: <RiHtml5Line size={15} />, title: '插入原始 HTML 块', action: (e) => e.chain().focus().insertContent({ type: 'rawHtml' }).run(), isActive: () => false },
        { type: 'btn', icon: <RiPlugLine size={15} />, title: '插入引脚图', action: (e) => e.chain().focus().insertContent({ type: 'pinoutDiagram' }).run(), isActive: () => false },
        { type: 'btn', icon: <RiTerminalBoxLine size={15} />, title: '插入 SSH 终端演示', action: (e) => e.chain().focus().insertContent({ type: 'sshTerminal' }).run(), isActive: () => false },
      ],
    },
  ]

  return (
    <div className="sticky top-0 z-10 flex items-center gap-0.5 px-4 py-2
                    border-b border-border
                    bg-background/95 backdrop-blur-sm
                    overflow-x-auto scrollbar-none">
      <input
        ref={imgInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleImageFile(file)
          e.target.value = ''
        }}
      />
      {groups.map((group, gi) => (
        <div key={gi} className="flex items-center gap-0.5">
          {/* 分组间分隔线 */}
          {gi > 0 && (
            <div className="w-px h-4 bg-foreground/10 mx-1.5 flex-shrink-0" />
          )}
          {group.items.map((item, ii) => {
            if (item.type === 'sep') return <div key={ii} className="w-px h-4 bg-foreground/10 mx-1" />
            const active = item.isActive(editor)
            return (
              <button
                key={ii}
                type="button"
                title={item.title}
                onMouseDown={(evt) => {
                  evt.preventDefault()
                  item.action(editor)
                }}
                className={[
                  'flex-shrink-0 w-7 h-7 flex items-center justify-center rounded',
                  'transition-all duration-150',
                  active
                    ? 'bg-ocean/20 text-ocean shadow-[0_0_0_1px_rgba(14,165,233,0.3)]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-black/[0.06] dark:hover:bg-white/[0.06]',
                ].join(' ')}
              >
                {item.icon}
              </button>
            )
          })}
        </div>
      ))}

      {/* 图片上传按钮 */}
      <div className="w-px h-4 bg-foreground/10 mx-1.5 flex-shrink-0" />
      <button
        type="button"
        title="插入图片"
        disabled={imgUploading}
        onMouseDown={(e) => { e.preventDefault(); imgInputRef.current?.click() }}
        className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded
                   transition-all duration-150 disabled:opacity-40
                   text-muted-foreground hover:text-foreground hover:bg-black/[0.06] dark:hover:bg-white/[0.06]"
      >
        {imgUploading
          ? <RiLoader4Line size={15} className="animate-spin" />
          : <RiImageAddLine size={15} />
        }
      </button>
    </div>
  )
}

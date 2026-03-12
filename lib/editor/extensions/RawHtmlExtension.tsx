/**
 * lib/editor/extensions/RawHtmlExtension.tsx
 *
 * 允许在文章中插入原始 HTML / <style> / <script> 块。
 * 存储为 JSONB，渲染时通过 dangerouslySetInnerHTML 输出（仅限可信管理员内容）。
 *
 * 在编辑器内以代码编辑器形式展示，前端渲染时直接注入 DOM。
 */

'use client'

import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import React, { useCallback } from 'react'

// ============================================================
// React Node View（编辑器内渲染）
// ============================================================

function RawHtmlNodeView({
  node,
  updateAttributes,
}: {
  node: { attrs: { language: string; code: string } }
  updateAttributes: (attrs: Record<string, string>) => void
}) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateAttributes({ code: e.target.value })
    },
    [updateAttributes]
  )

  return (
    <NodeViewWrapper className="raw-html-block my-4">
      <div className="flex items-center gap-2 mb-1 px-3 py-1 bg-background border border-border rounded-t-base text-xs text-muted-foreground">
        <span className="text-ocean">{'</>'}</span>
        <span>原始 {node.attrs.language} 注入块</span>
      </div>
      <textarea
        className="w-full min-h-[120px] p-3 bg-background border border-border rounded-b-base
                   font-mono text-sm text-foreground resize-y focus:outline-none focus:border-ocean/50"
        value={node.attrs.code}
        onChange={handleChange}
        placeholder={`<!-- 在此输入 ${node.attrs.language} 代码 -->`}
        spellCheck={false}
      />
    </NodeViewWrapper>
  )
}

// ============================================================
// Tiptap 扩展定义
// ============================================================

export const RawHtmlExtension = Node.create({
  name: 'rawHtml',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      language: { default: 'html' },
      code: { default: '' },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="raw-html"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'raw-html' })]
  },

  addNodeView() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ReactNodeViewRenderer(RawHtmlNodeView as any)
  },
})

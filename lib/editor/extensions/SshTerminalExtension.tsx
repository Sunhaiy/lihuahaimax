/**
 * lib/editor/extensions/SshTerminalExtension.tsx
 *
 * SSH 终端演示卡片（藏青色、打字机特效）。
 * 用于在文章中嵌入命令行操作演示。
 *
 * 数据结构：
 *   - hostname: 终端提示符主机名
 *   - user: 用户名
 *   - commands: 命令与输出的序列（JSON Array）
 *   - typingSpeed: 打字速度（ms/字符）
 */

'use client'

import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import React, { useState } from 'react'

export interface TerminalCommand {
  cmd: string
  output?: string
}

// ============================================================
// 编辑器内预览组件
// ============================================================

function SshTerminalNodeView({
  node,
  updateAttributes,
}: {
  node: { attrs: { hostname: string; user: string; commandsJson: string; typingSpeed: number } }
  updateAttributes: (attrs: Record<string, unknown>) => void
}) {
  const { hostname, user, commandsJson } = node.attrs
  const [jsonError, setJsonError] = useState('')

  const handleCommandsChange = (val: string) => {
    try {
      JSON.parse(val)
      setJsonError('')
    } catch {
      setJsonError('JSON 格式错误')
    }
    updateAttributes({ commandsJson: val })
  }

  return (
    <NodeViewWrapper className="ssh-terminal-block my-6">
      <div className="rounded-card overflow-hidden border border-[#27272A]">
        {/* 标题栏 */}
        <div className="flex items-center gap-2 px-4 py-2 bg-[#18181B] border-b border-[#27272A]">
          <span className="w-3 h-3 rounded-full bg-red-500/70" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <span className="w-3 h-3 rounded-full bg-green-500/70" />
          <span className="flex-1 text-center text-xs text-slate-400 font-mono">
            {user}@{hostname}
          </span>
        </div>
        {/* 终端预览 */}
        <div className="bg-[#09090B] p-4 font-mono text-sm text-[#A1A1AA] min-h-[80px]">
          <span className="text-green-400">{user}@{hostname}</span>
          <span className="text-white">:~$ </span>
          <span className="text-ocean">▋</span>
        </div>
        {/* 编辑区 */}
        <div className="bg-[#121217] p-3 border-t border-[#27272A] space-y-2">
          <div className="flex gap-2">
            <input
              className="flex-1 text-xs bg-background border border-border rounded-base px-2 py-1 text-foreground font-mono"
              value={user}
              onChange={(e) => updateAttributes({ user: e.target.value })}
              placeholder="用户名"
            />
            <input
              className="flex-1 text-xs bg-background border border-border rounded-base px-2 py-1 text-foreground font-mono"
              value={hostname}
              onChange={(e) => updateAttributes({ hostname: e.target.value })}
              placeholder="主机名"
            />
          </div>
          <textarea
            className={`w-full text-xs bg-background border rounded-base px-2 py-1
                        text-foreground font-mono resize-y min-h-[80px] focus:outline-none
                        ${jsonError ? 'border-red-500/50' : 'border-border focus:border-ocean/50'}`}
            value={commandsJson}
            onChange={(e) => handleCommandsChange(e.target.value)}
            placeholder={`[{"cmd": "ls -la", "output": "total 0\\ndrwxr-xr-x ..."}]`}
          />
          {jsonError && <p className="text-xs text-red-400">{jsonError}</p>}
        </div>
      </div>
    </NodeViewWrapper>
  )
}

// ============================================================
// Tiptap 扩展定义
// ============================================================

export const SshTerminalExtension = Node.create({
  name: 'sshTerminal',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      hostname: { default: 'localhost' },
      user: { default: 'root' },
      commandsJson: { default: '[]' },
      typingSpeed: { default: 40 },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="ssh-terminal"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'ssh-terminal' })]
  },

  addNodeView() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ReactNodeViewRenderer(SshTerminalNodeView as any)
  },
})

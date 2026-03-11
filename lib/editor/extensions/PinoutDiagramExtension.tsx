/**
 * lib/editor/extensions/PinoutDiagramExtension.tsx
 *
 * 可交互的开发板引脚图插入块（如 ESP32-C3）。
 * 在编辑器中以预览卡片形式展示，前端文章页渲染为完整交互组件。
 *
 * 扩展点：
 *   - boardType 支持多种开发板（esp32c3, esp32s3, arduino-uno 等）
 *   - 前端渲染组件可进一步封装悬浮引脚说明、电压图例
 */

'use client'

import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import React from 'react'

// ============================================================
// 支持的开发板类型
// ============================================================
export type BoardType = 'esp32c3' | 'esp32s3' | 'esp8266' | 'arduino-uno' | 'raspberry-pi-pico'

const BOARD_LABELS: Record<BoardType, string> = {
  'esp32c3': 'ESP32-C3 核心板',
  'esp32s3': 'ESP32-S3 核心板',
  'esp8266': 'ESP8266 NodeMCU',
  'arduino-uno': 'Arduino UNO',
  'raspberry-pi-pico': 'Raspberry Pi Pico',
}

// ============================================================
// 编辑器内预览组件
// ============================================================

function PinoutNodeView({
  node,
  updateAttributes,
}: {
  node: { attrs: { boardType: BoardType; title: string } }
  updateAttributes: (attrs: Record<string, string>) => void
}) {
  return (
    <NodeViewWrapper className="pinout-block my-6">
      <div className="border border-ocean/30 rounded-card p-4 bg-ocean/5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-ocean">
            引脚图：{BOARD_LABELS[node.attrs.boardType] ?? node.attrs.boardType}
          </span>
          <select
            className="text-xs bg-white/5 border border-white/10 rounded-base px-2 py-1 text-foreground"
            value={node.attrs.boardType}
            onChange={(e) => updateAttributes({ boardType: e.target.value })}
          >
            {(Object.entries(BOARD_LABELS) as [BoardType, string][]).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
        <input
          className="w-full text-sm bg-transparent border-b border-white/10 pb-1
                     text-muted-foreground focus:outline-none focus:border-ocean/50"
          value={node.attrs.title}
          onChange={(e) => updateAttributes({ title: e.target.value })}
          placeholder="可选：添加说明标题"
        />
        <div className="mt-3 h-20 flex items-center justify-center text-xs text-muted-foreground
                        border border-dashed border-white/10 rounded-base">
          {/* 实际引脚图组件在文章页渲染 */}
          引脚图将在文章页显示（编辑器内为占位预览）
        </div>
      </div>
    </NodeViewWrapper>
  )
}

// ============================================================
// Tiptap 扩展定义
// ============================================================

export const PinoutDiagramExtension = Node.create({
  name: 'pinoutDiagram',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      boardType: { default: 'esp32c3' },
      title: { default: '' },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="pinout-diagram"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'pinout-diagram' })]
  },

  addNodeView() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ReactNodeViewRenderer(PinoutNodeView as any)
  },
})

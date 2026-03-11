/**
 * lib/editor/registry.ts
 *
 * Tiptap 自定义 React 块插件注册中心。
 *
 * 设计目标：热拔插 (Plug-and-Play)。
 * 新增自定义块时，只需：
 *   1. 在 lib/editor/extensions/ 中创建扩展文件
 *   2. 在此注册中心 import 并挂载
 *   无需修改编辑器核心任何代码。
 *
 * 使用方式：
 *   import { getEditorExtensions } from '@/lib/editor/registry'
 *   const editor = useEditor({ extensions: getEditorExtensions() })
 */

import StarterKit from '@tiptap/starter-kit'
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
import { Image } from '@tiptap/extension-image'
import { Placeholder } from '@tiptap/extension-placeholder'
import { createLowlight, common } from 'lowlight'
import type { Extensions } from '@tiptap/core'

// 自定义扩展
import { RawHtmlExtension } from './extensions/RawHtmlExtension'
import { PinoutDiagramExtension } from './extensions/PinoutDiagramExtension'
import { SshTerminalExtension } from './extensions/SshTerminalExtension'

const lowlight = createLowlight(common)

/**
 * 插件注册中心 —— 返回完整的 Tiptap 扩展列表。
 *
 * @param options.placeholder 编辑器占位提示文字
 */
export function getEditorExtensions(options: {
  placeholder?: string
} = {}): Extensions {
  return [
    // ========================================================
    // 核心套件（包含 Bold, Italic, Heading, List, Blockquote 等）
    // 禁用默认代码块，改用 CodeBlockLowlight
    // ========================================================
    StarterKit.configure({
      codeBlock: false,
    }),

    // ========================================================
    // 代码块（支持语法高亮）
    // ========================================================
    CodeBlockLowlight.configure({
      lowlight,
      defaultLanguage: 'plaintext',
      HTMLAttributes: {
        class: 'code-block',
      },
    }),

    // ========================================================
    // 图片
    // ========================================================
    Image.configure({
      HTMLAttributes: { class: 'editor-image' },
      allowBase64: false,
    }),

    // ========================================================
    // 占位提示
    // ========================================================
    Placeholder.configure({
      placeholder: options.placeholder ?? '开始写作…',
    }),

    // ========================================================
    // 自定义 React 块（通过此注册中心热拔插）
    // ========================================================

    // 原始 HTML / CSS / JS 注入块
    RawHtmlExtension,

    // ESP32-C3 / 任意开发板引脚图（交互式 React 组件）
    PinoutDiagramExtension,

    // SSH 终端演示卡片（打字机特效）
    SshTerminalExtension,

    // 👇 Future Plug-in: 在此追加更多自定义扩展
    // ExampleNewExtension,
  ]
}

import type { Extensions } from '@tiptap/core'
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
import { Image } from '@tiptap/extension-image'
import { Link } from '@tiptap/extension-link'
import { Placeholder } from '@tiptap/extension-placeholder'
import StarterKit from '@tiptap/starter-kit'
import { common, createLowlight } from 'lowlight'
import { CalloutExtension } from './extensions/CalloutExtension'
import { PinoutDiagramExtension } from './extensions/PinoutDiagramExtension'
import { RawHtmlExtension } from './extensions/RawHtmlExtension'
import { SshTerminalExtension } from './extensions/SshTerminalExtension'

const lowlight = createLowlight(common)

export function getEditorExtensions(options: { placeholder?: string } = {}): Extensions {
  return [
    StarterKit.configure({
      codeBlock: false,
    }),

    CodeBlockLowlight.configure({
      lowlight,
      defaultLanguage: 'typescript',
      HTMLAttributes: {
        class: 'code-block',
      },
    }),

    Image.configure({
      HTMLAttributes: { class: 'editor-image' },
      allowBase64: false,
    }),

    Link.configure({
      openOnClick: false,
      autolink: true,
      protocols: ['http', 'https', 'mailto'],
      HTMLAttributes: {
        rel: 'noopener noreferrer nofollow',
        target: '_blank',
      },
    }),

    Placeholder.configure({
      placeholder: options.placeholder ?? '开始写作吧…',
    }),

    CalloutExtension,
    RawHtmlExtension,
    PinoutDiagramExtension,
    SshTerminalExtension,
  ]
}

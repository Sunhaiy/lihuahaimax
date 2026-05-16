import { Extension, type Extensions } from '@tiptap/core'
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
import { Link } from '@tiptap/extension-link'
import { Placeholder } from '@tiptap/extension-placeholder'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import { gapCursor } from '@tiptap/pm/gapcursor'
import { Plugin, TextSelection } from '@tiptap/pm/state'
import StarterKit from '@tiptap/starter-kit'
import { common, createLowlight } from 'lowlight'
import {
  createArticleCalloutExtension,
  createArticleFaqExtension,
  createArticleFileTreeExtension,
  createArticleImageFigureExtension,
  createArticleInfoColumnsExtension,
  createArticleStepFlowExtension,
  createArticleTerminalDemoExtension,
  createArticleTimelineExtension,
} from './extensions'

const lowlight = createLowlight(common)

const ArticleCursorExtension = Extension.create({
  name: 'articleCursor',

  addProseMirrorPlugins() {
    return [
      gapCursor(),
      new Plugin({
        props: {
          handleKeyDown(view, event) {
            const isExitShortcut =
              (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) || event.key === 'ArrowDown'
            if (!isExitShortcut) return false

            const { state } = view
            const { selection, schema } = state
            const { $from, empty } = selection
            const paragraph = schema.nodes.paragraph

            if (!empty || !paragraph || $from.parent.type.name !== 'codeBlock') return false
            if ($from.parentOffset !== $from.parent.content.size) return false

            const codeBlockPos = $from.before()
            const afterPos = codeBlockPos + $from.parent.nodeSize
            const nodeAfter = state.doc.nodeAt(afterPos)
            const tr = state.tr

            if (!nodeAfter || nodeAfter.type !== paragraph) {
              tr.insert(afterPos, paragraph.create())
            }

            const targetPos = Math.min(tr.doc.content.size, afterPos + 1)
            tr.setSelection(TextSelection.near(tr.doc.resolve(targetPos)))
            view.dispatch(tr.scrollIntoView())
            event.preventDefault()
            return true
          },
        },
        appendTransaction: (_transactions, _oldState, newState) => {
          const { doc, schema } = newState
          const paragraph = schema.nodes.paragraph
          const lastNode = doc.lastChild

          if (!paragraph || !lastNode) return null
          if (lastNode.type === paragraph) return null

          return newState.tr.insert(doc.content.size, paragraph.create())
        },
      }),
    ]
  },
})

export function getArticleExtensions(options: {
  editable?: boolean
  placeholder?: string
} = {}): Extensions {
  const editable = options.editable ?? true

  return [
    StarterKit.configure({
      codeBlock: false,
      heading: {
        levels: [1, 2, 3, 4, 5, 6],
      },
    }),

    CodeBlockLowlight.configure({
      lowlight,
      defaultLanguage: 'typescript',
      HTMLAttributes: {
        class: 'code-block',
      },
    }),

    Link.configure({
      openOnClick: !editable,
      autolink: true,
      protocols: ['http', 'https', 'mailto'],
      HTMLAttributes: {
        rel: 'noopener noreferrer nofollow',
        target: '_blank',
      },
    }),

    Table.configure({
      resizable: editable,
      HTMLAttributes: {
        class: 'article-table',
      },
    }),
    TableRow,
    TableHeader,
    TableCell,

    Placeholder.configure({
      placeholder:
        options.placeholder ??
        '从这里开始写文章，输入 / 可以快速插入结构化组件。',
    }),

    ArticleCursorExtension,

    createArticleCalloutExtension(editable),
    createArticleImageFigureExtension(editable),
    createArticleStepFlowExtension(editable),
    createArticleFaqExtension(editable),
    createArticleTimelineExtension(editable),
    createArticleInfoColumnsExtension(editable),
    createArticleFileTreeExtension(editable),
    createArticleTerminalDemoExtension(editable),
  ]
}

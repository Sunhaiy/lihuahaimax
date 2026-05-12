import { Node, mergeAttributes } from '@tiptap/core'

export type CalloutVariant = 'info' | 'tip' | 'warning' | 'success'

export const CALLOUT_LABELS: Record<CalloutVariant, string> = {
  info: '说明',
  tip: '小提示',
  warning: '注意',
  success: '结论',
}

export const CalloutExtension = Node.create({
  name: 'callout',

  group: 'block',

  content: 'block+',

  defining: true,

  addAttributes() {
    return {
      variant: {
        default: 'tip',
        parseHTML: (element) => element.getAttribute('data-variant') ?? 'tip',
      },
      title: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-title') ?? '',
      },
    }
  },

  parseHTML() {
    return [{ tag: 'aside[data-type="callout"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    const variant = (HTMLAttributes.variant ?? 'tip') as CalloutVariant
    const fallbackTitle = CALLOUT_LABELS[variant] ?? CALLOUT_LABELS.tip
    const title = String(HTMLAttributes.title || fallbackTitle)

    return [
      'aside',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'callout',
        'data-variant': variant,
        'data-title': title,
        class: `article-callout article-callout-${variant}`,
      }),
      0,
    ]
  },
})

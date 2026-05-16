'use client'

import React from 'react'
import { Node, mergeAttributes } from '@tiptap/core'
import type { Editor } from '@tiptap/react'
import { NodeViewContent, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import type { ArticleCalloutVariant, ArticleImageDisplay } from '@/lib/articles/spec'

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}

function updateTopLevelBlocks(
  editor: Editor,
  getPos: (() => number) | boolean,
  transform: (blocks: Record<string, unknown>[], index: number) => Record<string, unknown>[]
) {
  if (typeof getPos !== 'function') return

  const position = getPos()
  const json = editor.getJSON() as { type?: string; content?: Record<string, unknown>[] }
  const blocks = Array.isArray(json.content) ? [...json.content] : []

  let foundIndex = -1
  editor.state.doc.forEach((_, offset, index) => {
    if (offset === position) {
      foundIndex = index
    }
  })

  if (foundIndex < 0) return

  const nextBlocks = transform(blocks, foundIndex)
  editor.commands.setContent(
    {
      type: 'doc',
      content: nextBlocks.length > 0 ? nextBlocks : [{ type: 'paragraph' }],
    },
    true
  )
}

function moveBlock(editor: Editor, getPos: (() => number) | boolean, direction: -1 | 1) {
  updateTopLevelBlocks(editor, getPos, (blocks, index) => {
    const target = index + direction
    if (target < 0 || target >= blocks.length) return blocks

    const next = [...blocks]
    const [current] = next.splice(index, 1)
    next.splice(target, 0, current)
    return next
  })
}

function duplicateBlock(editor: Editor, getPos: (() => number) | boolean) {
  updateTopLevelBlocks(editor, getPos, (blocks, index) => {
    const next = [...blocks]
    next.splice(index + 1, 0, structuredClone(blocks[index]))
    return next
  })
}

function deleteBlock(editor: Editor, getPos: (() => number) | boolean) {
  updateTopLevelBlocks(editor, getPos, (blocks, index) => {
    const next = [...blocks]
    next.splice(index, 1)
    return next
  })
}

function BlockChrome({
  editor,
  getPos,
  label,
  description,
  children,
  selected,
}: {
  editor: Editor
  getPos: (() => number) | boolean
  label: string
  description?: string
  children: React.ReactNode
  selected?: boolean
}) {
  return (
    <NodeViewWrapper
      className={cn(
        'article-editor-block group my-5 rounded-[28px] border bg-card/70 backdrop-blur-xl',
        selected ? 'border-primary/45 ring-1 ring-primary/20' : 'border-border/70'
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/65 px-4 py-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            {label}
          </p>
          {description ? (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={() => moveBlock(editor, getPos, -1)}
            className="rounded-full border border-border/70 px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
          >
            上移
          </button>
          <button
            type="button"
            onClick={() => moveBlock(editor, getPos, 1)}
            className="rounded-full border border-border/70 px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
          >
            下移
          </button>
          <button
            type="button"
            onClick={() => duplicateBlock(editor, getPos)}
            className="rounded-full border border-border/70 px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
          >
            复制
          </button>
          <button
            type="button"
            onClick={() => deleteBlock(editor, getPos)}
            className="rounded-full border border-red-500/20 px-2 py-1 text-xs text-red-400 hover:border-red-500/40"
          >
            删除
          </button>
        </div>
      </div>
      <div className="px-4 py-4">{children}</div>
    </NodeViewWrapper>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block space-y-2">
      <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  )
}

const INPUT_CLASS =
  'w-full rounded-2xl border border-border/70 bg-background/65 px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/55 focus:border-primary/35'

const TEXTAREA_CLASS = `${INPUT_CLASS} min-h-[120px] resize-y`
const SELECT_CLASS = `${INPUT_CLASS} appearance-none`

function CalloutNodeView(props: any) {
  const variant = (props.node.attrs.variant ?? 'info') as ArticleCalloutVariant

  return (
    <BlockChrome
      editor={props.editor}
      getPos={props.getPos}
      label="提示块"
      description="适合解释重点、提醒注意点和结论收束"
      selected={props.selected}
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-[180px_minmax(0,1fr)]">
          <Field label="样式">
            <select
              className={SELECT_CLASS}
              value={variant}
              onChange={(event) => props.updateAttributes({ variant: event.target.value })}
            >
              <option value="info">说明</option>
              <option value="tip">提示</option>
              <option value="warning">注意</option>
              <option value="summary">结论</option>
            </select>
          </Field>
          <Field label="标题">
            <input
              className={INPUT_CLASS}
              value={props.node.attrs.title ?? ''}
              onChange={(event) => props.updateAttributes({ title: event.target.value })}
              placeholder="例如：先别急着背公式，先理解为什么"
            />
          </Field>
        </div>
        <div
          className={cn(
            'rounded-[24px] border px-5 py-4',
            variant === 'warning' && 'border-amber-500/30 bg-amber-500/8',
            variant === 'tip' && 'border-emerald-500/30 bg-emerald-500/8',
            variant === 'summary' && 'border-sky-500/30 bg-sky-500/8',
            variant === 'info' && 'border-border/70 bg-background/45'
          )}
        >
          <NodeViewContent className="article-editor-callout-content prose prose-sm max-w-none text-foreground dark:prose-invert" />
        </div>
      </div>
    </BlockChrome>
  )
}

function ImageFigureNodeView(props: any) {
  const attrs = props.node.attrs as {
    src?: string
    alt?: string
    caption?: string
    width?: number
    height?: number
    display?: ArticleImageDisplay
    uploading?: boolean
    error?: string
  }

  return (
    <BlockChrome
      editor={props.editor}
      getPos={props.getPos}
      label="图片卡片"
      description="支持粘贴、拖拽上传，也可以手动补图片地址与说明"
      selected={props.selected}
    >
      <div className="space-y-4">
        <div className="overflow-hidden rounded-[24px] border border-border/70 bg-background/55">
          {attrs.src ? (
            <img src={attrs.src} alt={attrs.alt || ''} className="max-h-[420px] w-full object-cover" />
          ) : (
            <div className="flex min-h-[220px] items-center justify-center px-6 text-center text-sm text-muted-foreground">
              直接把图片粘贴进正文，或者拖进来，编辑器会自动上传并插入。
            </div>
          )}
        </div>
        {attrs.uploading ? (
          <p className="text-sm text-primary">图片上传中，完成后会自动补全尺寸信息。</p>
        ) : null}
        {attrs.error ? <p className="text-sm text-red-400">{attrs.error}</p> : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="图片地址">
            <input
              className={INPUT_CLASS}
              value={attrs.src ?? ''}
              onChange={(event) => props.updateAttributes({ src: event.target.value })}
              placeholder="/uploads/images/example.webp"
            />
          </Field>
          <Field label="展示宽度">
            <select
              className={SELECT_CLASS}
              value={attrs.display ?? 'regular'}
              onChange={(event) => props.updateAttributes({ display: event.target.value })}
            >
              <option value="regular">标准宽度</option>
              <option value="wide">加宽</option>
              <option value="full">全宽</option>
            </select>
          </Field>
          <Field label="Alt 文本">
            <input
              className={INPUT_CLASS}
              value={attrs.alt ?? ''}
              onChange={(event) => props.updateAttributes({ alt: event.target.value })}
              placeholder="给搜索引擎和读屏器看的说明"
            />
          </Field>
          <Field label="图注">
            <input
              className={INPUT_CLASS}
              value={attrs.caption ?? ''}
              onChange={(event) => props.updateAttributes({ caption: event.target.value })}
              placeholder="这张图为什么值得放在这里"
            />
          </Field>
        </div>
      </div>
    </BlockChrome>
  )
}

function mutateListItem<T extends Record<string, unknown>>(
  list: T[],
  index: number,
  patch: Partial<T>
) {
  return list.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item))
}

function StepFlowNodeView(props: any) {
  const attrs = props.node.attrs as {
    title?: string
    items: Array<{ title: string; description: string; meta?: string }>
  }
  const items = Array.isArray(attrs.items) ? attrs.items : []

  return (
    <BlockChrome
      editor={props.editor}
      getPos={props.getPos}
      label="步骤流"
      description="适合教程拆步骤，把一整段思路拆成可执行的小块"
      selected={props.selected}
    >
      <div className="space-y-4">
        <Field label="模块标题">
          <input
            className={INPUT_CLASS}
            value={attrs.title ?? ''}
            onChange={(event) => props.updateAttributes({ title: event.target.value })}
            placeholder="例如：从零实现一轮前向传播"
          />
        </Field>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="rounded-[24px] border border-border/70 bg-background/55 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-foreground">步骤 {index + 1}</span>
                <button
                  type="button"
                  className="text-xs text-red-400"
                  onClick={() =>
                    props.updateAttributes({
                      items: items.filter((_: unknown, itemIndex: number) => itemIndex !== index),
                    })
                  }
                >
                  删除
                </button>
              </div>
              <div className="grid gap-3">
                <input
                  className={INPUT_CLASS}
                  value={item.title}
                  onChange={(event) =>
                    props.updateAttributes({
                      items: mutateListItem(items, index, { title: event.target.value }),
                    })
                  }
                  placeholder="步骤标题"
                />
                <textarea
                  className={TEXTAREA_CLASS}
                  value={item.description}
                  onChange={(event) =>
                    props.updateAttributes({
                      items: mutateListItem(items, index, { description: event.target.value }),
                    })
                  }
                  placeholder="把这一步讲清楚，最好是口语化的人话"
                />
                <input
                  className={INPUT_CLASS}
                  value={item.meta ?? ''}
                  onChange={(event) =>
                    props.updateAttributes({
                      items: mutateListItem(items, index, { meta: event.target.value }),
                    })
                  }
                  placeholder="可选补充，例如耗时、关键词、注意点"
                />
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            props.updateAttributes({
              items: [
                ...items,
                {
                  title: `步骤 ${items.length + 1}`,
                  description: '',
                  meta: '',
                },
              ],
            })
          }
          className="rounded-full border border-border/70 px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          新增一步
        </button>
      </div>
    </BlockChrome>
  )
}

function FaqNodeView(props: any) {
  const attrs = props.node.attrs as {
    title?: string
    items: Array<{ question: string; answer: string }>
  }
  const items = Array.isArray(attrs.items) ? attrs.items : []

  return (
    <BlockChrome
      editor={props.editor}
      getPos={props.getPos}
      label="FAQ"
      description="把读者最容易卡住的问题提前写出来"
      selected={props.selected}
    >
      <div className="space-y-4">
        <Field label="模块标题">
          <input
            className={INPUT_CLASS}
            value={attrs.title ?? ''}
            onChange={(event) => props.updateAttributes({ title: event.target.value })}
            placeholder="例如：读到这里最常见的 4 个疑问"
          />
        </Field>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="rounded-[24px] border border-border/70 bg-background/55 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-foreground">问题 {index + 1}</span>
                <button
                  type="button"
                  className="text-xs text-red-400"
                  onClick={() =>
                    props.updateAttributes({
                      items: items.filter((_: unknown, itemIndex: number) => itemIndex !== index),
                    })
                  }
                >
                  删除
                </button>
              </div>
              <div className="grid gap-3">
                <input
                  className={INPUT_CLASS}
                  value={item.question}
                  onChange={(event) =>
                    props.updateAttributes({
                      items: mutateListItem(items, index, { question: event.target.value }),
                    })
                  }
                  placeholder="把问题写成读者真的会问出来的样子"
                />
                <textarea
                  className={TEXTAREA_CLASS}
                  value={item.answer}
                  onChange={(event) =>
                    props.updateAttributes({
                      items: mutateListItem(items, index, { answer: event.target.value }),
                    })
                  }
                  placeholder="答案尽量短、清楚、别绕"
                />
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            props.updateAttributes({
              items: [...items, { question: '', answer: '' }],
            })
          }
          className="rounded-full border border-border/70 px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          新增问题
        </button>
      </div>
    </BlockChrome>
  )
}

function TimelineNodeView(props: any) {
  const attrs = props.node.attrs as {
    title?: string
    items: Array<{ time: string; title: string; description: string }>
  }
  const items = Array.isArray(attrs.items) ? attrs.items : []

  return (
    <BlockChrome
      editor={props.editor}
      getPos={props.getPos}
      label="时间线"
      description="适合里程碑、版本演进、排查过程"
      selected={props.selected}
    >
      <div className="space-y-4">
        <Field label="模块标题">
          <input
            className={INPUT_CLASS}
            value={attrs.title ?? ''}
            onChange={(event) => props.updateAttributes({ title: event.target.value })}
            placeholder="例如：我把这个项目从想法推到上线的过程"
          />
        </Field>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="rounded-[24px] border border-border/70 bg-background/55 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-foreground">节点 {index + 1}</span>
                <button
                  type="button"
                  className="text-xs text-red-400"
                  onClick={() =>
                    props.updateAttributes({
                      items: items.filter((_: unknown, itemIndex: number) => itemIndex !== index),
                    })
                  }
                >
                  删除
                </button>
              </div>
              <div className="grid gap-3">
                <input
                  className={INPUT_CLASS}
                  value={item.time}
                  onChange={(event) =>
                    props.updateAttributes({
                      items: mutateListItem(items, index, { time: event.target.value }),
                    })
                  }
                  placeholder="时间，例如：第 1 天 / 2026-05-12 / 训练阶段"
                />
                <input
                  className={INPUT_CLASS}
                  value={item.title}
                  onChange={(event) =>
                    props.updateAttributes({
                      items: mutateListItem(items, index, { title: event.target.value }),
                    })
                  }
                  placeholder="节点标题"
                />
                <textarea
                  className={TEXTAREA_CLASS}
                  value={item.description}
                  onChange={(event) =>
                    props.updateAttributes({
                      items: mutateListItem(items, index, { description: event.target.value }),
                    })
                  }
                  placeholder="这一段发生了什么，为什么值得记下来"
                />
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            props.updateAttributes({
              items: [...items, { time: '', title: '', description: '' }],
            })
          }
          className="rounded-full border border-border/70 px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          新增节点
        </button>
      </div>
    </BlockChrome>
  )
}

function InfoColumnsNodeView(props: any) {
  const attrs = props.node.attrs as {
    leftTitle?: string
    leftBody?: string
    rightTitle?: string
    rightBody?: string
  }

  return (
    <BlockChrome
      editor={props.editor}
      getPos={props.getPos}
      label="双栏信息"
      description="适合前后对照、定义与示例、方案对比"
      selected={props.selected}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[24px] border border-border/70 bg-background/55 p-4">
          <div className="grid gap-3">
            <input
              className={INPUT_CLASS}
              value={attrs.leftTitle ?? ''}
              onChange={(event) => props.updateAttributes({ leftTitle: event.target.value })}
              placeholder="左栏标题"
            />
            <textarea
              className={TEXTAREA_CLASS}
              value={attrs.leftBody ?? ''}
              onChange={(event) => props.updateAttributes({ leftBody: event.target.value })}
              placeholder="左栏正文"
            />
          </div>
        </div>
        <div className="rounded-[24px] border border-border/70 bg-background/55 p-4">
          <div className="grid gap-3">
            <input
              className={INPUT_CLASS}
              value={attrs.rightTitle ?? ''}
              onChange={(event) => props.updateAttributes({ rightTitle: event.target.value })}
              placeholder="右栏标题"
            />
            <textarea
              className={TEXTAREA_CLASS}
              value={attrs.rightBody ?? ''}
              onChange={(event) => props.updateAttributes({ rightBody: event.target.value })}
              placeholder="右栏正文"
            />
          </div>
        </div>
      </div>
    </BlockChrome>
  )
}

function FileTreeNodeView(props: any) {
  const attrs = props.node.attrs as {
    title?: string
    rootLabel?: string
    lines?: string[]
  }

  return (
    <BlockChrome
      editor={props.editor}
      getPos={props.getPos}
      label="文件树"
      description="适合项目目录、模块边界、工程结构"
      selected={props.selected}
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className={INPUT_CLASS}
            value={attrs.title ?? ''}
            onChange={(event) => props.updateAttributes({ title: event.target.value })}
            placeholder="模块标题"
          />
          <input
            className={INPUT_CLASS}
            value={attrs.rootLabel ?? ''}
            onChange={(event) => props.updateAttributes({ rootLabel: event.target.value })}
            placeholder="根目录，例如：llm_from_scratch/"
          />
        </div>
        <textarea
          className={`${TEXTAREA_CLASS} min-h-[220px] font-mono text-[0.92rem] leading-7`}
          value={Array.isArray(attrs.lines) ? attrs.lines.join('\n') : ''}
          onChange={(event) =>
            props.updateAttributes({
              lines: event.target.value
                .split('\n')
                .map((line) => line.trimEnd())
                .filter(Boolean),
            })
          }
          placeholder={'tokenizer/\n├── tokenizer.py\n├── vocab.json\n└── merges.txt'}
        />
      </div>
    </BlockChrome>
  )
}

function TerminalDemoNodeView(props: any) {
  const attrs = props.node.attrs as {
    title?: string
    prompt?: string
    body?: string
  }

  return (
    <BlockChrome
      editor={props.editor}
      getPos={props.getPos}
      label="终端演示"
      description="适合命令、日志、部署输出、脚手架流程"
      selected={props.selected}
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_120px]">
          <input
            className={INPUT_CLASS}
            value={attrs.title ?? ''}
            onChange={(event) => props.updateAttributes({ title: event.target.value })}
            placeholder="例如：第一轮训练日志"
          />
          <input
            className={INPUT_CLASS}
            value={attrs.prompt ?? '$'}
            onChange={(event) => props.updateAttributes({ prompt: event.target.value })}
            placeholder="$"
          />
        </div>
        <textarea
          className={`${TEXTAREA_CLASS} min-h-[220px] font-mono text-[0.92rem] leading-7`}
          value={attrs.body ?? ''}
          onChange={(event) => props.updateAttributes({ body: event.target.value })}
          placeholder={'pip install -r requirements.txt\npython train.py\nEpoch 1/20 - loss: 2.41'}
        />
      </div>
    </BlockChrome>
  )
}

function renderItems(items: string[], wrapperClassName: string) {
  return items.map((item, index) => ['li', { class: wrapperClassName, 'data-index': index }, item])
}

function createNode<T extends Record<string, unknown>>({
  name,
  addAttributes,
  renderHTML,
  nodeView,
}: {
  name: string
  addAttributes: () => T
  renderHTML: (attrs: T) => any[]
  nodeView?: any
}) {
  return (editable: boolean) =>
    Node.create({
      name,
      group: 'block',
      atom: name !== 'callout',
      content: name === 'callout' ? 'block+' : '',
      isolating: true,

      addAttributes() {
        return addAttributes()
      },

      parseHTML() {
        return [{ tag: `[data-node="${name}"]` }]
      },

      renderHTML({ HTMLAttributes }) {
        return renderHTML(HTMLAttributes as T) as any
      },
      ...(editable && nodeView
        ? {
            addNodeView() {
              return ReactNodeViewRenderer(nodeView)
            },
          }
        : {}),
    })
}

export const createArticleCalloutExtension = createNode({
  name: 'callout',
  addAttributes: () => ({
    variant: { default: 'info' },
    title: { default: '' },
  }),
  renderHTML: (attrs: any) => [
    'aside',
    mergeAttributes(
      {
        'data-node': 'callout',
        'data-variant': attrs.variant ?? 'info',
      },
      attrs
    ),
    ['div', { class: 'article-callout-head' }, attrs.title || '说明'],
    ['div', { class: 'article-callout-body' }, 0],
  ],
  nodeView: CalloutNodeView,
})

export const createArticleImageFigureExtension = createNode({
  name: 'imageFigure',
  addAttributes: () => ({
    src: { default: '' },
    alt: { default: '' },
    caption: { default: '' },
    width: { default: null },
    height: { default: null },
    display: { default: 'regular' },
    uploading: { default: false },
    error: { default: '' },
    tempId: { default: '' },
  }),
  renderHTML: (attrs: any) => [
    'figure',
    {
      'data-node': 'imageFigure',
      'data-display': attrs.display ?? 'regular',
      class: 'article-figure',
    },
    [
      'img',
      {
        src: attrs.src || '',
        alt: attrs.alt || '',
        width: attrs.width || undefined,
        height: attrs.height || undefined,
      },
    ],
    ...(attrs.caption ? [['figcaption', { class: 'article-figure-caption' }, attrs.caption]] : []),
  ],
  nodeView: ImageFigureNodeView,
})

export const createArticleStepFlowExtension = createNode({
  name: 'stepFlow',
  addAttributes: () => ({
    title: { default: '' },
    items: {
      default: [{ title: '步骤 1', description: '', meta: '' }],
    },
  }),
  renderHTML: (attrs: any) => [
    'section',
    { 'data-node': 'stepFlow', class: 'article-step-flow' },
    ...(attrs.title ? [['div', { class: 'article-structured-title' }, attrs.title]] : []),
    [
      'ol',
      { class: 'article-step-list' },
      ...((attrs.items ?? []) as Array<{ title: string; description: string; meta?: string }>).map(
        (item, index) => [
          'li',
          { class: 'article-step-item', 'data-index': index + 1 },
          ['h4', { class: 'article-step-item-title' }, item.title],
          ...(item.meta ? [['p', { class: 'article-step-item-meta' }, item.meta]] : []),
          ['p', { class: 'article-step-item-description' }, item.description],
        ]
      ),
    ],
  ],
  nodeView: StepFlowNodeView,
})

export const createArticleFaqExtension = createNode({
  name: 'faqBlock',
  addAttributes: () => ({
    title: { default: '' },
    items: {
      default: [{ question: '', answer: '' }],
    },
  }),
  renderHTML: (attrs: any) => [
    'section',
    { 'data-node': 'faqBlock', class: 'article-faq' },
    ...(attrs.title ? [['div', { class: 'article-structured-title' }, attrs.title]] : []),
    ...((attrs.items ?? []) as Array<{ question: string; answer: string }>).map((item) => [
      'details',
      { class: 'article-faq-item', open: 'open' },
      ['summary', { class: 'article-faq-question' }, item.question],
      ['div', { class: 'article-faq-answer' }, item.answer],
    ]),
  ],
  nodeView: FaqNodeView,
})

export const createArticleTimelineExtension = createNode({
  name: 'timelineBlock',
  addAttributes: () => ({
    title: { default: '' },
    items: {
      default: [{ time: '', title: '', description: '' }],
    },
  }),
  renderHTML: (attrs: any) => [
    'section',
    { 'data-node': 'timelineBlock', class: 'article-timeline' },
    ...(attrs.title ? [['div', { class: 'article-structured-title' }, attrs.title]] : []),
    [
      'div',
      { class: 'article-timeline-list' },
      ...((attrs.items ?? []) as Array<{ time: string; title: string; description: string }>).map(
        (item) => [
          'article',
          { class: 'article-timeline-item' },
          ['p', { class: 'article-timeline-time' }, item.time],
          ['h4', { class: 'article-timeline-title' }, item.title],
          ['p', { class: 'article-timeline-description' }, item.description],
        ]
      ),
    ],
  ],
  nodeView: TimelineNodeView,
})

export const createArticleInfoColumnsExtension = createNode({
  name: 'infoColumns',
  addAttributes: () => ({
    leftTitle: { default: '左栏' },
    leftBody: { default: '' },
    rightTitle: { default: '右栏' },
    rightBody: { default: '' },
  }),
  renderHTML: (attrs: any) => [
    'section',
    { 'data-node': 'infoColumns', class: 'article-info-columns' },
    ['article', { class: 'article-info-column' }, ['h4', {}, attrs.leftTitle], ['p', {}, attrs.leftBody]],
    ['article', { class: 'article-info-column' }, ['h4', {}, attrs.rightTitle], ['p', {}, attrs.rightBody]],
  ],
  nodeView: InfoColumnsNodeView,
})

export const createArticleFileTreeExtension = createNode({
  name: 'fileTree',
  addAttributes: () => ({
    title: { default: '' },
    rootLabel: { default: 'project/' },
    lines: { default: ['src/', 'package.json'] },
  }),
  renderHTML: (attrs: any) => [
    'section',
    { 'data-node': 'fileTree', class: 'article-file-tree' },
    ...(attrs.title ? [['div', { class: 'article-structured-title' }, attrs.title]] : []),
    ['div', { class: 'article-file-tree-root' }, attrs.rootLabel],
    [
      'ul',
      { class: 'article-file-tree-list' },
      ...renderItems((attrs.lines ?? []) as string[], 'article-file-tree-item'),
    ],
  ],
  nodeView: FileTreeNodeView,
})

export const createArticleTerminalDemoExtension = createNode({
  name: 'terminalDemo',
  addAttributes: () => ({
    title: { default: '' },
    prompt: { default: '$' },
    body: { default: '' },
  }),
  renderHTML: (attrs: any) => [
    'section',
    { 'data-node': 'terminalDemo', class: 'article-terminal-demo' },
    ...(attrs.title ? [['div', { class: 'article-structured-title' }, attrs.title]] : []),
    [
      'pre',
      { class: 'article-terminal-shell' },
      [
        'code',
        {},
        String(attrs.body ?? '')
          .split('\n')
          .map((line: string) => `${attrs.prompt || '$'} ${line}`)
          .join('\n'),
      ],
    ],
  ],
  nodeView: TerminalDemoNodeView,
})

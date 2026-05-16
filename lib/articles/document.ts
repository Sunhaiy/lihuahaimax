import { z } from 'zod'
import {
  ARTICLE_CALLOUT_VARIANTS,
  ARTICLE_IMAGE_DISPLAYS,
} from './spec'

const textMarkSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('bold') }),
  z.object({ type: z.literal('italic') }),
  z.object({ type: z.literal('strike') }),
  z.object({ type: z.literal('code') }),
  z.object({
    type: z.literal('link'),
    attrs: z
      .object({
        href: z.string().min(1).max(2048),
        target: z.string().optional(),
        rel: z.string().optional(),
      })
      .strict(),
  }),
])

const textNodeSchema = z
  .object({
    type: z.literal('text'),
    text: z.string(),
    marks: z.array(textMarkSchema).optional(),
  })
  .strict()

const paragraphSchema = z
  .object({
    type: z.literal('paragraph'),
    content: z.array(textNodeSchema).optional(),
  })
  .strict()

const headingSchema = z
  .object({
    type: z.literal('heading'),
    attrs: z
      .object({
        level: z.number().int().min(1).max(6),
      })
      .strict(),
    content: z.array(textNodeSchema).min(1),
  })
  .strict()

const horizontalRuleSchema = z
  .object({
    type: z.literal('horizontalRule'),
  })
  .strict()

const codeTextNodeSchema = z
  .object({
    type: z.literal('text'),
    text: z.string(),
  })
  .strict()

const codeBlockSchema = z
  .object({
    type: z.literal('codeBlock'),
    attrs: z
      .object({
        language: z.string().max(40).optional(),
        filename: z.string().max(160).optional(),
      })
      .strict()
      .optional(),
    content: z.array(codeTextNodeSchema).optional(),
  })
  .strict()

const stepItemSchema = z
  .object({
    title: z.string().min(1).max(120),
    description: z.string().min(1).max(600),
    meta: z.string().max(120).optional(),
  })
  .strict()

const faqItemSchema = z
  .object({
    question: z.string().min(1).max(220),
    answer: z.string().min(1).max(1200),
  })
  .strict()

const timelineItemSchema = z
  .object({
    time: z.string().min(1).max(80),
    title: z.string().min(1).max(160),
    description: z.string().min(1).max(600),
  })
  .strict()

const fileTreeLineSchema = z.string().min(1).max(240)

const imageFigureSchema = z
  .object({
    type: z.literal('imageFigure'),
    attrs: z
      .object({
        src: z.string().min(1).max(2048),
        alt: z.string().max(220).default(''),
        caption: z.string().max(320).default(''),
        width: z.number().int().positive().max(8000).optional(),
        height: z.number().int().positive().max(8000).optional(),
        display: z.enum(ARTICLE_IMAGE_DISPLAYS).default('regular'),
      })
      .strict(),
  })
  .strict()

const stepFlowSchema = z
  .object({
    type: z.literal('stepFlow'),
    attrs: z
      .object({
        title: z.string().max(160).optional(),
        items: z.array(stepItemSchema).min(1).max(8),
      })
      .strict(),
  })
  .strict()

const faqBlockSchema = z
  .object({
    type: z.literal('faqBlock'),
    attrs: z
      .object({
        title: z.string().max(160).optional(),
        items: z.array(faqItemSchema).min(1).max(12),
      })
      .strict(),
  })
  .strict()

const timelineBlockSchema = z
  .object({
    type: z.literal('timelineBlock'),
    attrs: z
      .object({
        title: z.string().max(160).optional(),
        items: z.array(timelineItemSchema).min(1).max(12),
      })
      .strict(),
  })
  .strict()

const infoColumnsSchema = z
  .object({
    type: z.literal('infoColumns'),
    attrs: z
      .object({
        leftTitle: z.string().max(120).default('左栏'),
        leftBody: z.string().max(1200).default(''),
        rightTitle: z.string().max(120).default('右栏'),
        rightBody: z.string().max(1200).default(''),
      })
      .strict(),
  })
  .strict()

const fileTreeSchema = z
  .object({
    type: z.literal('fileTree'),
    attrs: z
      .object({
        title: z.string().max(160).optional(),
        rootLabel: z.string().max(120).default('project/'),
        lines: z.array(fileTreeLineSchema).min(1).max(48),
      })
      .strict(),
  })
  .strict()

const terminalDemoSchema = z
  .object({
    type: z.literal('terminalDemo'),
    attrs: z
      .object({
        title: z.string().max(160).optional(),
        prompt: z.string().max(12).default('$'),
        body: z.string().min(1).max(4000),
      })
      .strict(),
  })
  .strict()

type LooseBlock = z.infer<typeof paragraphSchema> | z.infer<typeof headingSchema>

const listItemSchema: z.ZodType<{
  type: 'listItem'
  content: Array<
    z.infer<typeof paragraphSchema> | {
      type: 'bulletList' | 'orderedList'
      attrs?: { start?: number }
      content: unknown[]
    }
  >
}> = z.lazy(() =>
  z
    .object({
      type: z.literal('listItem'),
      content: z
        .array(
          z.union([
            paragraphSchema,
            bulletListSchema,
            orderedListSchema,
          ])
        )
        .min(1),
    })
    .strict()
)

const bulletListSchema: z.ZodType<{
  type: 'bulletList'
  content: Array<z.infer<typeof listItemSchema>>
}> = z.lazy(() =>
  z
    .object({
      type: z.literal('bulletList'),
      content: z.array(listItemSchema).min(1),
    })
    .strict()
)

const orderedListSchema: z.ZodType<{
  type: 'orderedList'
  attrs?: { start?: number }
  content: Array<z.infer<typeof listItemSchema>>
}> = z.lazy(() =>
  z
    .object({
      type: z.literal('orderedList'),
      attrs: z
        .object({
          start: z.number().int().min(1).max(999).optional(),
        })
        .strict()
        .optional(),
      content: z.array(listItemSchema).min(1),
    })
    .strict()
)

const tableCellContentSchema: z.ZodType<Array<LooseBlock | z.infer<typeof bulletListSchema> | z.infer<typeof orderedListSchema>>> =
  z.lazy(() =>
    z
      .array(
        z.union([
          paragraphSchema,
          headingSchema,
          bulletListSchema,
          orderedListSchema,
        ])
      )
      .min(1)
  )

const tableCellSchema = z
  .object({
    type: z.literal('tableCell'),
    content: tableCellContentSchema,
  })
  .strict()

const tableHeaderSchema = z
  .object({
    type: z.literal('tableHeader'),
    content: tableCellContentSchema,
  })
  .strict()

const tableRowSchema = z
  .object({
    type: z.literal('tableRow'),
    content: z.array(z.union([tableCellSchema, tableHeaderSchema])).min(1),
  })
  .strict()

const tableSchema = z
  .object({
    type: z.literal('table'),
    content: z.array(tableRowSchema).min(1),
  })
  .strict()

const articleBlockSchema: z.ZodType<unknown> = z.lazy(() =>
  z.union([
    paragraphSchema,
    headingSchema,
    bulletListSchema,
    orderedListSchema,
    blockquoteSchema,
    horizontalRuleSchema,
    codeBlockSchema,
    tableSchema,
    imageFigureSchema,
    calloutSchema,
    stepFlowSchema,
    faqBlockSchema,
    timelineBlockSchema,
    infoColumnsSchema,
    fileTreeSchema,
    terminalDemoSchema,
  ])
)

const blockquoteSchema: z.ZodType<{
  type: 'blockquote'
  content: unknown[]
}> = z.lazy(() =>
  z
    .object({
      type: z.literal('blockquote'),
      content: z.array(z.union([paragraphSchema, bulletListSchema, orderedListSchema])).min(1),
    })
    .strict()
)

const calloutSchema: z.ZodType<{
  type: 'callout'
  attrs: {
    variant: (typeof ARTICLE_CALLOUT_VARIANTS)[number]
    title?: string
  }
  content: unknown[]
}> = z.lazy(() =>
  z
    .object({
      type: z.literal('callout'),
      attrs: z
        .object({
          variant: z.enum(ARTICLE_CALLOUT_VARIANTS),
          title: z.string().max(160).optional(),
        })
        .strict(),
      content: z.array(z.union([paragraphSchema, headingSchema, bulletListSchema, orderedListSchema, codeBlockSchema, blockquoteSchema])).min(1),
    })
    .strict()
)

export const articleDocSchema = z
  .object({
    type: z.literal('doc'),
    content: z.array(articleBlockSchema).default([{ type: 'paragraph' }]),
  })
  .strict()

export type ArticleDoc = z.infer<typeof articleDocSchema>

type NormalizedLooseBlock = Record<string, unknown>
type NormalizedLooseBlockList = NormalizedLooseBlock[]

export const EMPTY_ARTICLE_DOC: ArticleDoc = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
}

export function isArticleDocV2(value: unknown): value is ArticleDoc {
  return articleDocSchema.safeParse(value).success
}

export function ensureArticleDocV2(value: unknown): ArticleDoc {
  const parsed = articleDocSchema.safeParse(value)
  if (parsed.success) {
    return parsed.data
  }

  return EMPTY_ARTICLE_DOC
}

type LooseNode = {
  type?: string
  text?: string
  marks?: Array<{ type?: string; attrs?: Record<string, unknown> }>
  attrs?: Record<string, unknown>
  content?: LooseNode[]
}

function asLooseNode(value: unknown): LooseNode | null {
  return value && typeof value === 'object' ? (value as LooseNode) : null
}

function asString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function asPositiveInt(value: unknown) {
  return typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : undefined
}

function normalizeTextNode(node: LooseNode) {
  if (typeof node.text !== 'string') return null

  const marks = Array.isArray(node.marks)
    ? node.marks
        .map((mark) => {
          if (!mark || typeof mark !== 'object') return null
          switch (mark.type) {
            case 'bold':
            case 'italic':
            case 'strike':
            case 'code':
              return { type: mark.type }
            case 'link':
              return typeof mark.attrs?.href === 'string' && mark.attrs.href
                ? {
                    type: 'link' as const,
                    attrs: {
                      href: mark.attrs.href,
                      ...(typeof mark.attrs.target === 'string' ? { target: mark.attrs.target } : {}),
                      ...(typeof mark.attrs.rel === 'string' ? { rel: mark.attrs.rel } : {}),
                    },
                  }
                : null
            default:
              return null
          }
        })
        .filter((mark): mark is NonNullable<typeof mark> => Boolean(mark))
    : undefined

  return {
    type: 'text' as const,
    text: node.text,
    ...(marks && marks.length > 0 ? { marks } : {}),
  }
}

function normalizeInlineContent(content: unknown) {
  if (!Array.isArray(content)) return undefined

  const nodes = content
    .map((child) => normalizeTextNode(asLooseNode(child) ?? {}))
    .filter((node): node is NonNullable<typeof node> => Boolean(node))

  return nodes.length > 0 ? nodes : undefined
}

function normalizeParagraph(node: LooseNode) {
  return {
    type: 'paragraph' as const,
    ...(normalizeInlineContent(node.content) ? { content: normalizeInlineContent(node.content) } : {}),
  }
}

function normalizeHeading(node: LooseNode) {
  const content = normalizeInlineContent(node.content)
  if (!content || content.length === 0) return null

  const level =
    typeof node.attrs?.level === 'number'
      ? Math.max(1, Math.min(6, Math.trunc(node.attrs.level)))
      : 1

  return {
    type: 'heading' as const,
    attrs: { level },
    content,
  }
}

function normalizeListItem(node: LooseNode): NormalizedLooseBlock | null {
  const content = normalizeNestedBlocks(node.content)
  if (content.length === 0) return null
  return {
    type: 'listItem' as const,
    content,
  }
}

function normalizeList(node: LooseNode, ordered: boolean): NormalizedLooseBlock | null {
  const content = Array.isArray(node.content)
    ? node.content
        .map((child) => normalizeListItem(asLooseNode(child) ?? {}))
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
    : []

  if (content.length === 0) return null

  return {
    type: ordered ? ('orderedList' as const) : ('bulletList' as const),
    ...(ordered && typeof node.attrs?.start === 'number' && node.attrs.start > 1
      ? { attrs: { start: Math.trunc(node.attrs.start) } }
      : {}),
    content,
  }
}

function normalizeBlockquote(node: LooseNode) {
  const content = normalizeNestedBlocks(node.content)
  if (content.length === 0) return null
  return {
    type: 'blockquote' as const,
    content,
  }
}

function normalizeCodeBlock(node: LooseNode) {
  const rawText = Array.isArray(node.content)
    ? node.content
        .map((child) => (typeof child?.text === 'string' ? child.text : ''))
        .join('')
    : ''

  const attrs = {
    ...(typeof node.attrs?.language === 'string' && node.attrs.language
      ? { language: node.attrs.language }
      : {}),
    ...(typeof node.attrs?.filename === 'string' && node.attrs.filename
      ? { filename: node.attrs.filename }
      : {}),
  }

  return {
    type: 'codeBlock' as const,
    ...(Object.keys(attrs).length > 0 ? { attrs } : {}),
    ...(rawText ? { content: [{ type: 'text' as const, text: rawText }] } : {}),
  }
}

function normalizeTableCell(node: LooseNode, type: 'tableCell' | 'tableHeader') {
  const content = normalizeTableCellContent(node.content)
  if (content.length === 0) return null
  return { type, content }
}

function normalizeTable(node: LooseNode) {
  const rows = Array.isArray(node.content)
    ? node.content
        .map((row) => {
          const rowNode = asLooseNode(row)
          if (!rowNode || rowNode.type !== 'tableRow' || !Array.isArray(rowNode.content)) return null
          const cells = rowNode.content
            .map((cell) => {
              const cellNode = asLooseNode(cell)
              if (!cellNode) return null
              if (cellNode.type === 'tableHeader') return normalizeTableCell(cellNode, 'tableHeader')
              if (cellNode.type === 'tableCell') return normalizeTableCell(cellNode, 'tableCell')
              return null
            })
            .filter((cell): cell is NonNullable<typeof cell> => Boolean(cell))
          if (cells.length === 0) return null
          return { type: 'tableRow' as const, content: cells }
        })
        .filter((row): row is NonNullable<typeof row> => Boolean(row))
    : []

  if (rows.length === 0) return null
  return { type: 'table' as const, content: rows }
}

function normalizeCallout(node: LooseNode) {
  const variant = ['info', 'tip', 'warning', 'summary'].includes(asString(node.attrs?.variant))
    ? (node.attrs?.variant as 'info' | 'tip' | 'warning' | 'summary')
    : 'info'
  const content = normalizeCalloutContent(node.content)
  if (content.length === 0) return null
  return {
    type: 'callout' as const,
    attrs: {
      variant,
      ...(asString(node.attrs?.title).trim() ? { title: asString(node.attrs?.title).trim() } : {}),
    },
    content,
  }
}

function normalizeImageFigure(node: LooseNode) {
  const src = asString(node.attrs?.src).trim()
  if (!src) return null

  const display = ['regular', 'wide', 'full'].includes(asString(node.attrs?.display))
    ? (node.attrs?.display as 'regular' | 'wide' | 'full')
    : 'regular'

  return {
    type: 'imageFigure' as const,
    attrs: {
      src,
      alt: asString(node.attrs?.alt),
      caption: asString(node.attrs?.caption),
      display,
      ...(asPositiveInt(node.attrs?.width) ? { width: asPositiveInt(node.attrs?.width) } : {}),
      ...(asPositiveInt(node.attrs?.height) ? { height: asPositiveInt(node.attrs?.height) } : {}),
    },
  }
}

function normalizeStepFlow(node: LooseNode) {
  const items = Array.isArray(node.attrs?.items)
    ? node.attrs.items
        .map((item) => {
          const record = item && typeof item === 'object' ? (item as Record<string, unknown>) : null
          const title = asString(record?.title).trim()
          const description = asString(record?.description).trim()
          const meta = asString(record?.meta).trim()
          if (!title || !description) return null
          return { title, description, ...(meta ? { meta } : {}) }
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
    : []

  if (items.length === 0) return null
  return {
    type: 'stepFlow' as const,
    attrs: {
      ...(asString(node.attrs?.title).trim() ? { title: asString(node.attrs?.title).trim() } : {}),
      items,
    },
  }
}

function normalizeFaqBlock(node: LooseNode) {
  const items = Array.isArray(node.attrs?.items)
    ? node.attrs.items
        .map((item) => {
          const record = item && typeof item === 'object' ? (item as Record<string, unknown>) : null
          const question = asString(record?.question).trim()
          const answer = asString(record?.answer).trim()
          if (!question || !answer) return null
          return { question, answer }
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
    : []

  if (items.length === 0) return null
  return {
    type: 'faqBlock' as const,
    attrs: {
      ...(asString(node.attrs?.title).trim() ? { title: asString(node.attrs?.title).trim() } : {}),
      items,
    },
  }
}

function normalizeTimelineBlock(node: LooseNode) {
  const items = Array.isArray(node.attrs?.items)
    ? node.attrs.items
        .map((item) => {
          const record = item && typeof item === 'object' ? (item as Record<string, unknown>) : null
          const time = asString(record?.time).trim()
          const title = asString(record?.title).trim()
          const description = asString(record?.description).trim()
          if (!time || !title || !description) return null
          return { time, title, description }
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
    : []

  if (items.length === 0) return null
  return {
    type: 'timelineBlock' as const,
    attrs: {
      ...(asString(node.attrs?.title).trim() ? { title: asString(node.attrs?.title).trim() } : {}),
      items,
    },
  }
}

function normalizeInfoColumns(node: LooseNode) {
  return {
    type: 'infoColumns' as const,
    attrs: {
      leftTitle: asString(node.attrs?.leftTitle, '左栏'),
      leftBody: asString(node.attrs?.leftBody),
      rightTitle: asString(node.attrs?.rightTitle, '右栏'),
      rightBody: asString(node.attrs?.rightBody),
    },
  }
}

function normalizeFileTree(node: LooseNode) {
  const lines = Array.isArray(node.attrs?.lines)
    ? node.attrs.lines.map((item) => asString(item).trimEnd()).filter(Boolean)
    : []

  if (lines.length === 0) return null
  return {
    type: 'fileTree' as const,
    attrs: {
      ...(asString(node.attrs?.title).trim() ? { title: asString(node.attrs?.title).trim() } : {}),
      rootLabel: asString(node.attrs?.rootLabel, 'project/'),
      lines,
    },
  }
}

function normalizeTerminalDemo(node: LooseNode) {
  const body = asString(node.attrs?.body).trim()
  if (!body) return null
  return {
    type: 'terminalDemo' as const,
    attrs: {
      ...(asString(node.attrs?.title).trim() ? { title: asString(node.attrs?.title).trim() } : {}),
      prompt: asString(node.attrs?.prompt, '$') || '$',
      body,
    },
  }
}

function normalizeNestedBlocks(content: unknown): NormalizedLooseBlockList {
  if (!Array.isArray(content)) return []

  return content
    .map((child) => normalizeNestedBlock(asLooseNode(child) ?? {}))
    .filter((node): node is NonNullable<typeof node> => Boolean(node))
}

function normalizeCalloutContent(content: unknown): NormalizedLooseBlockList {
  if (!Array.isArray(content)) return []

  return content
    .map((child) => normalizeCalloutBlock(asLooseNode(child) ?? {}))
    .filter((node): node is NonNullable<typeof node> => Boolean(node))
}

function normalizeTableCellContent(content: unknown): NormalizedLooseBlockList {
  if (!Array.isArray(content)) return []

  return content
    .map((child) => normalizeTableAllowedBlock(asLooseNode(child) ?? {}))
    .filter((node): node is NonNullable<typeof node> => Boolean(node))
}

function normalizeNestedBlock(node: LooseNode): NormalizedLooseBlock | null {
  switch (node.type) {
    case 'paragraph':
      return normalizeParagraph(node)
    case 'bulletList':
      return normalizeList(node, false)
    case 'orderedList':
      return normalizeList(node, true)
    default:
      return null
  }
}

function normalizeCalloutBlock(node: LooseNode): NormalizedLooseBlock | null {
  switch (node.type) {
    case 'paragraph':
      return normalizeParagraph(node)
    case 'heading':
      return normalizeHeading(node)
    case 'bulletList':
      return normalizeList(node, false)
    case 'orderedList':
      return normalizeList(node, true)
    case 'blockquote':
      return normalizeBlockquote(node)
    case 'codeBlock':
      return normalizeCodeBlock(node)
    default:
      return null
  }
}

function normalizeTableAllowedBlock(node: LooseNode): NormalizedLooseBlock | null {
  switch (node.type) {
    case 'paragraph':
      return normalizeParagraph(node)
    case 'heading':
      return normalizeHeading(node)
    case 'bulletList':
      return normalizeList(node, false)
    case 'orderedList':
      return normalizeList(node, true)
    default:
      return null
  }
}

function normalizeTopLevelBlock(node: LooseNode): NormalizedLooseBlock | null {
  switch (node.type) {
    case 'paragraph':
      return normalizeParagraph(node)
    case 'heading':
      return normalizeHeading(node)
    case 'bulletList':
      return normalizeList(node, false)
    case 'orderedList':
      return normalizeList(node, true)
    case 'blockquote':
      return normalizeBlockquote(node)
    case 'horizontalRule':
      return { type: 'horizontalRule' as const }
    case 'codeBlock':
      return normalizeCodeBlock(node)
    case 'table':
      return normalizeTable(node)
    case 'imageFigure':
      return normalizeImageFigure(node)
    case 'callout':
      return normalizeCallout(node)
    case 'stepFlow':
      return normalizeStepFlow(node)
    case 'faqBlock':
      return normalizeFaqBlock(node)
    case 'timelineBlock':
      return normalizeTimelineBlock(node)
    case 'infoColumns':
      return normalizeInfoColumns(node)
    case 'fileTree':
      return normalizeFileTree(node)
    case 'terminalDemo':
      return normalizeTerminalDemo(node)
    default:
      return null
  }
}

export function sanitizeArticleDocV2(value: unknown): ArticleDoc {
  const doc = asLooseNode(value)
  const blocks = Array.isArray(doc?.content)
    ? doc.content
        .map((block) => normalizeTopLevelBlock(asLooseNode(block) ?? {}))
        .filter((block): block is NonNullable<typeof block> => Boolean(block))
    : []

  return articleDocSchema.parse({
    type: 'doc',
    content: blocks.length > 0 ? blocks : [{ type: 'paragraph' }],
  })
}

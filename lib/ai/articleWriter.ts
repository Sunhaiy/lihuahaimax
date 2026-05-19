import { z } from 'zod'
import { articleDocSchema, type ArticleDoc } from '@/lib/articles/document'
import { createDeepSeekJsonCompletion } from '@/lib/ai/deepseek'

const generatedSectionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('heading'),
    level: z.number().int().min(1).max(6).optional(),
    text: z.string().min(1).max(180),
  }),
  z.object({
    type: z.literal('paragraph'),
    text: z.string().min(1).max(2400),
  }),
  z.object({
    type: z.literal('bullet_list'),
    items: z.array(z.string().min(1).max(300)).min(1).max(12),
  }),
  z.object({
    type: z.literal('ordered_list'),
    items: z.array(z.string().min(1).max(300)).min(1).max(12),
  }),
  z.object({
    type: z.literal('blockquote'),
    text: z.string().min(1).max(500),
  }),
  z.object({
    type: z.literal('callout'),
    variant: z.enum(['info', 'tip', 'warning', 'summary']),
    title: z.string().max(160).optional(),
    body: z.union([
      z.string().min(1).max(1200),
      z.array(z.string().min(1).max(600)).min(1).max(6),
    ]),
  }),
  z.object({
    type: z.literal('step_flow'),
    title: z.string().max(160).optional(),
    items: z
      .array(
        z.object({
          title: z.string().min(1).max(120),
          description: z.string().min(1).max(600),
          meta: z.string().max(120).optional(),
        })
      )
      .min(1)
      .max(8),
  }),
  z.object({
    type: z.literal('faq'),
    title: z.string().max(160).optional(),
    items: z
      .array(
        z.object({
          question: z.string().min(1).max(220),
          answer: z.string().min(1).max(1200),
        })
      )
      .min(1)
      .max(10),
  }),
  z.object({
    type: z.literal('timeline'),
    title: z.string().max(160).optional(),
    items: z
      .array(
        z.object({
          time: z.string().min(1).max(80),
          title: z.string().min(1).max(160),
          description: z.string().min(1).max(600),
        })
      )
      .min(1)
      .max(10),
  }),
  z.object({
    type: z.literal('code'),
    language: z.string().max(40).optional(),
    filename: z.string().max(160).optional(),
    code: z.string().min(1).max(12000),
  }),
  z.object({
    type: z.literal('table'),
    headers: z.array(z.string().min(1).max(120)).min(1).max(6),
    rows: z.array(z.array(z.string().max(400)).min(1).max(6)).min(1).max(12),
  }),
  z.object({
    type: z.literal('file_tree'),
    title: z.string().max(160).optional(),
    rootLabel: z.string().max(120).optional(),
    lines: z.array(z.string().min(1).max(240)).min(1).max(48),
  }),
  z.object({
    type: z.literal('terminal'),
    title: z.string().max(160).optional(),
    prompt: z.string().max(12).optional(),
    body: z.string().min(1).max(4000),
  }),
])

const generatedArticleSchema = z.object({
  title: z.string().min(1).max(200),
  excerpt: z.string().min(1).max(220),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(320).optional(),
  category: z.string().max(80).optional(),
  tags: z.array(z.string().min(1).max(24)).max(10).optional(),
  sections: z.array(generatedSectionSchema).min(1).max(80),
})

export type GeneratedArticleInput = {
  materials: string
  titleHint?: string
  angle?: string
  category?: string
  tags?: string[]
  model?: string
}

export type GeneratedArticleResult = {
  title: string
  excerpt: string
  seoTitle: string | null
  seoDescription: string | null
  category: string
  tags: string[]
  content: ArticleDoc
}

type GeneratedSection = z.infer<typeof generatedSectionSchema>
type GeneratedArticleDraft = z.infer<typeof generatedArticleSchema>
type ArticleBlock = NonNullable<ArticleDoc['content']>[number]

function asRecord(value: unknown) {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null
}

function asString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback
}

function asStringList(value: unknown, max = 12) {
  if (Array.isArray(value)) {
    return value
      .map((item) => asString(item))
      .filter(Boolean)
      .slice(0, max)
  }

  if (typeof value === 'string') {
    return value
      .split(/\n+|[，,、]/g)
      .map((item) => item.replace(/^[-*•\d.]+\s*/, '').trim())
      .filter(Boolean)
      .slice(0, max)
  }

  return []
}

function asInt(value: unknown, fallback = 4) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.trunc(value)
  }
  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return Math.trunc(parsed)
  }
  return fallback
}

function limitText(value: string, max: number) {
  return value.trim().slice(0, max)
}

function normalizeSectionType(type: string) {
  const normalized = type.trim().toLowerCase()

  if (['heading', 'title', 'subtitle', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(normalized)) return 'heading'
  if (['paragraph', 'text', 'body', 'intro', 'content'].includes(normalized)) return 'paragraph'
  if (['bullet_list', 'bulletlist', 'bullets', 'unordered_list', 'ul'].includes(normalized)) return 'bullet_list'
  if (['ordered_list', 'orderedlist', 'numbered_list', 'steps', 'ol'].includes(normalized)) return 'ordered_list'
  if (['blockquote', 'quote'].includes(normalized)) return 'blockquote'
  if (['callout', 'note', 'tip', 'warning', 'summary'].includes(normalized)) return 'callout'
  if (['step_flow', 'stepflow', 'workflow'].includes(normalized)) return 'step_flow'
  if (['faq', 'faq_block', 'faqblock', 'questions'].includes(normalized)) return 'faq'
  if (['timeline', 'timeline_block', 'timelineblock'].includes(normalized)) return 'timeline'
  if (['code', 'code_block', 'codeblock', 'snippet'].includes(normalized)) return 'code'
  if (normalized === 'table') return 'table'
  if (['file_tree', 'filetree'].includes(normalized)) return 'file_tree'
  if (['terminal', 'terminal_demo', 'terminaldemo', 'shell'].includes(normalized)) return 'terminal'
  return normalized
}

function normalizeCalloutVariant(value: unknown): 'info' | 'tip' | 'warning' | 'summary' {
  const normalized = asString(value).toLowerCase()
  if (normalized === 'tip') return 'tip'
  if (normalized === 'warning') return 'warning'
  if (normalized === 'summary') return 'summary'
  if (normalized === 'note') return 'info'
  return 'info'
}

function extractSectionText(record: Record<string, unknown>) {
  return (
    asString(record.text) ||
    asString(record.body) ||
    asString(record.content) ||
    asString(record.description) ||
    asString(record.value)
  )
}

function normalizeTableRows(value: unknown, headerCount: number) {
  if (!Array.isArray(value)) return []

  return value
    .map((row) => {
      if (Array.isArray(row)) {
        const cells = row.map((cell) => limitText(asString(cell), 400)).slice(0, headerCount)
        while (cells.length < headerCount) cells.push('')
        return cells
      }

      const record = asRecord(row)
      if (!record) return null
      const cells = Object.values(record)
        .map((cell) => limitText(asString(cell), 400))
        .slice(0, headerCount)
      while (cells.length < headerCount) cells.push('')
      return cells
    })
    .filter((row): row is string[] => Array.isArray(row) && row.length > 0)
    .slice(0, 12)
}

function normalizeGeneratedSection(value: unknown): GeneratedSection | null {
  if (typeof value === 'string') {
    const text = limitText(value, 2400)
    return text ? { type: 'paragraph', text } : null
  }

  const record = asRecord(value)
  if (!record) return null

  const type = normalizeSectionType(asString(record.type))

  switch (type) {
    case 'heading': {
      const text = limitText(
        asString(record.text) || asString(record.title) || asString(record.heading),
        180
      )
      if (!text) return null
      return { type: 'heading', level: asInt(record.level, 4), text }
    }
    case 'paragraph': {
      const text = limitText(extractSectionText(record), 2400)
      return text ? { type: 'paragraph', text } : null
    }
    case 'bullet_list': {
      const items = asStringList(record.items ?? record.list ?? record.content ?? record.bullets, 12)
        .map((item) => limitText(item, 300))
      return items.length > 0 ? { type: 'bullet_list', items } : null
    }
    case 'ordered_list': {
      const items = asStringList(record.items ?? record.list ?? record.content ?? record.steps, 12)
        .map((item) => limitText(item, 300))
      return items.length > 0 ? { type: 'ordered_list', items } : null
    }
    case 'blockquote': {
      const text = limitText(extractSectionText(record), 500)
      return text ? { type: 'blockquote', text } : null
    }
    case 'callout': {
      const bodySource = record.body ?? record.items ?? record.content ?? record.text
      const body =
        Array.isArray(bodySource)
          ? asStringList(bodySource, 6).map((item) => limitText(item, 600))
          : limitText(asString(bodySource), 1200)
      if (!body || (Array.isArray(body) && body.length === 0)) return null
      return {
        type: 'callout',
        variant: normalizeCalloutVariant(record.variant ?? record.type),
        ...(asString(record.title) ? { title: limitText(asString(record.title), 160) } : {}),
        body,
      }
    }
    case 'step_flow': {
      const rawItems: unknown[] = Array.isArray(record.items ?? record.steps ?? record.content)
        ? (record.items ?? record.steps ?? record.content) as unknown[]
        : []
      const items = rawItems
        .map((item) => {
          if (typeof item === 'string') {
            const title = limitText(item, 120)
            return title ? { title, description: title } : null
          }
          const source = asRecord(item)
          if (!source) return null
          const title = limitText(asString(source.title) || asString(source.name), 120)
          const description = limitText(
            asString(source.description) || asString(source.body) || asString(source.text),
            600
          )
          const meta = limitText(asString(source.meta) || asString(source.label), 120)
          if (!title || !description) return null
          return { title, description, ...(meta ? { meta } : {}) }
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
        .slice(0, 8)
      if (items.length === 0) return null
      return {
        type: 'step_flow',
        ...(asString(record.title) ? { title: limitText(asString(record.title), 160) } : {}),
        items,
      }
    }
    case 'faq': {
      const rawItems: unknown[] = Array.isArray(record.items ?? record.questions ?? record.content)
        ? (record.items ?? record.questions ?? record.content) as unknown[]
        : []
      const items = rawItems
        .map((item) => {
          const source = asRecord(item)
          if (!source) return null
          const question = limitText(asString(source.question) || asString(source.q), 220)
          const answer = limitText(
            asString(source.answer) || asString(source.a) || asString(source.text),
            1200
          )
          if (!question || !answer) return null
          return { question, answer }
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
        .slice(0, 10)
      if (items.length === 0) return null
      return {
        type: 'faq',
        ...(asString(record.title) ? { title: limitText(asString(record.title), 160) } : {}),
        items,
      }
    }
    case 'timeline': {
      const rawItems: unknown[] = Array.isArray(record.items ?? record.steps ?? record.content)
        ? (record.items ?? record.steps ?? record.content) as unknown[]
        : []
      const items = rawItems
        .map((item) => {
          const source = asRecord(item)
          if (!source) return null
          const time = limitText(asString(source.time) || asString(source.date), 80)
          const title = limitText(asString(source.title) || asString(source.name), 160)
          const description = limitText(
            asString(source.description) || asString(source.body) || asString(source.text),
            600
          )
          if (!time || !title || !description) return null
          return { time, title, description }
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
        .slice(0, 10)
      if (items.length === 0) return null
      return {
        type: 'timeline',
        ...(asString(record.title) ? { title: limitText(asString(record.title), 160) } : {}),
        items,
      }
    }
    case 'code': {
      const code = limitText(
        asString(record.code) || asString(record.content) || asString(record.body) || asString(record.text),
        12000
      )
      if (!code) return null
      return {
        type: 'code',
        ...(asString(record.language || record.lang) ? { language: limitText(asString(record.language || record.lang), 40) } : {}),
        ...(asString(record.filename || record.file) ? { filename: limitText(asString(record.filename || record.file), 160) } : {}),
        code,
      }
    }
    case 'table': {
      const headers = asStringList(record.headers ?? record.columns, 6).map((item) => limitText(item, 120))
      if (headers.length === 0) return null
      const rows = normalizeTableRows(record.rows ?? record.data ?? record.items, headers.length)
      if (rows.length === 0) return null
      return { type: 'table', headers, rows }
    }
    case 'file_tree': {
      const lines = asStringList(record.lines ?? record.content ?? record.body, 48).map((item) =>
        limitText(item, 240)
      )
      if (lines.length === 0) return null
      return {
        type: 'file_tree',
        ...(asString(record.title) ? { title: limitText(asString(record.title), 160) } : {}),
        ...(asString(record.rootLabel) ? { rootLabel: limitText(asString(record.rootLabel), 120) } : {}),
        lines,
      }
    }
    case 'terminal': {
      const body = limitText(
        asString(record.body) || asString(record.content) || asString(record.text),
        4000
      )
      if (!body) return null
      return {
        type: 'terminal',
        ...(asString(record.title) ? { title: limitText(asString(record.title), 160) } : {}),
        ...(asString(record.prompt) ? { prompt: limitText(asString(record.prompt), 12) } : {}),
        body,
      }
    }
    default: {
      const fallback = limitText(extractSectionText(record), 2400)
      return fallback ? { type: 'paragraph', text: fallback } : null
    }
  }
}

function deriveSectionsFromLooseValue(value: unknown): GeneratedSection[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeGeneratedSection(item))
      .filter((item): item is GeneratedSection => Boolean(item))
      .slice(0, 80)
  }

  if (typeof value === 'string') {
    return value
      .split(/\n{2,}/g)
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => ({ type: 'paragraph', text: limitText(item, 2400) }) satisfies GeneratedSection)
      .slice(0, 80)
  }

  return []
}

function deriveExcerpt(sections: GeneratedSection[]) {
  const text = sections
    .flatMap((section) => {
      if (section.type === 'paragraph') return [section.text]
      if (section.type === 'blockquote') return [section.text]
      if (section.type === 'callout') {
        return [Array.isArray(section.body) ? section.body.join(' ') : section.body]
      }
      return []
    })
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()

  return text.slice(0, 140) || '这是一篇由资料自动整理出来的文章草稿。'
}

function normalizeGeneratedArticle(value: unknown): GeneratedArticleDraft {
  const strict = generatedArticleSchema.safeParse(value)
  if (strict.success) {
    return strict.data
  }

  const record = asRecord(value)
  if (!record) {
    throw new Error('DeepSeek 返回了空结果，请换一份更完整的资料再试。')
  }

  const sections = deriveSectionsFromLooseValue(
    record.sections ?? record.content ?? record.blocks ?? record.body
  )

  if (sections.length === 0) {
    throw new Error('DeepSeek 返回的内容太零碎，暂时没法整理成文章，请补充更完整的资料。')
  }

  const excerpt = limitText(
    asString(record.excerpt) || asString(record.summary) || deriveExcerpt(sections),
    220
  )

  return generatedArticleSchema.parse({
    title: limitText(
      asString(record.title) || asString(record.headline) || asString(record.name) || '未命名文章',
      200
    ),
    excerpt,
    seoTitle: limitText(asString(record.seoTitle) || asString(record.metaTitle), 200) || undefined,
    seoDescription:
      limitText(asString(record.seoDescription) || asString(record.metaDescription) || excerpt, 320) ||
      undefined,
    category: limitText(asString(record.category), 80) || undefined,
    tags: asStringList(record.tags, 10).map((item) => limitText(item, 24)),
    sections,
  })
}

function createTextNode(text: string) {
  return {
    type: 'text' as const,
    text,
  }
}

function createParagraph(text: string) {
  const trimmed = text.trim()
  return trimmed
    ? {
        type: 'paragraph' as const,
        content: [createTextNode(trimmed)],
      }
    : {
        type: 'paragraph' as const,
      }
}

function createHeading(text: string, level = 4) {
  return {
    type: 'heading' as const,
    attrs: {
      level: Math.min(6, Math.max(4, Math.trunc(level || 4))),
    },
    content: [createTextNode(text.trim())],
  }
}

function createList(items: string[], ordered: boolean) {
  return {
    type: ordered ? ('orderedList' as const) : ('bulletList' as const),
    content: items.map((item) => ({
      type: 'listItem' as const,
      content: [createParagraph(item)],
    })),
  }
}

function createCalloutContent(body: string | string[]) {
  const parts = Array.isArray(body) ? body : body.split(/\n{2,}/g)
  return parts
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => createParagraph(item))
}

function buildArticleDocFromSections(sections: GeneratedSection[]): ArticleDoc {
  const content: ArticleBlock[] = []

  for (const section of sections) {
    let blocks: ArticleBlock[] = []

    switch (section.type) {
      case 'heading':
        blocks = [createHeading(section.text, section.level) as ArticleBlock]
        break
      case 'paragraph':
        blocks = section.text
          .split(/\n{2,}/g)
          .map((item) => item.trim())
          .filter(Boolean)
          .map((item) => createParagraph(item) as ArticleBlock)
        break
      case 'bullet_list':
        blocks = [createList(section.items, false) as ArticleBlock]
        break
      case 'ordered_list':
        blocks = [createList(section.items, true) as ArticleBlock]
        break
      case 'blockquote':
        blocks = [
          {
            type: 'blockquote' as const,
            content: [createParagraph(section.text)],
          },
        ] as ArticleBlock[]
        break
      case 'callout':
        blocks = [
          {
            type: 'callout' as const,
            attrs: {
              variant: section.variant,
              ...(section.title?.trim() ? { title: section.title.trim() } : {}),
            },
            content: createCalloutContent(section.body),
          },
        ] as ArticleBlock[]
        break
      case 'step_flow':
        blocks = [
          {
            type: 'stepFlow' as const,
            attrs: {
              ...(section.title?.trim() ? { title: section.title.trim() } : {}),
              items: section.items.map((item) => ({
                title: item.title.trim(),
                description: item.description.trim(),
                ...(item.meta?.trim() ? { meta: item.meta.trim() } : {}),
              })),
            },
          },
        ] as ArticleBlock[]
        break
      case 'faq':
        blocks = [
          {
            type: 'faqBlock' as const,
            attrs: {
              ...(section.title?.trim() ? { title: section.title.trim() } : {}),
              items: section.items.map((item) => ({
                question: item.question.trim(),
                answer: item.answer.trim(),
              })),
            },
          },
        ] as ArticleBlock[]
        break
      case 'timeline':
        blocks = [
          {
            type: 'timelineBlock' as const,
            attrs: {
              ...(section.title?.trim() ? { title: section.title.trim() } : {}),
              items: section.items.map((item) => ({
                time: item.time.trim(),
                title: item.title.trim(),
                description: item.description.trim(),
              })),
            },
          },
        ] as ArticleBlock[]
        break
      case 'code':
        blocks = [
          {
            type: 'codeBlock' as const,
            attrs: {
              ...(section.language?.trim() ? { language: section.language.trim() } : {}),
              ...(section.filename?.trim() ? { filename: section.filename.trim() } : {}),
            },
            content: [{ type: 'text' as const, text: section.code }],
          },
        ] as ArticleBlock[]
        break
      case 'table': {
        const headers = section.headers.map((item) => ({
          type: 'tableHeader' as const,
          content: [createParagraph(item)],
        }))

        const rows = section.rows.map((row) => ({
          type: 'tableRow' as const,
          content: row.map((cell) => ({
            type: 'tableCell' as const,
            content: [createParagraph(cell)],
          })),
        }))

        blocks = [
          {
            type: 'table' as const,
            content: [
              {
                type: 'tableRow' as const,
                content: headers,
              },
              ...rows,
            ],
          },
        ] as ArticleBlock[]
        break
      }
      case 'file_tree':
        blocks = [
          {
            type: 'fileTree' as const,
            attrs: {
              ...(section.title?.trim() ? { title: section.title.trim() } : {}),
              rootLabel: section.rootLabel?.trim() || 'project/',
              lines: section.lines.map((line) => line.trimEnd()),
            },
          },
        ] as ArticleBlock[]
        break
      case 'terminal':
        blocks = [
          {
            type: 'terminalDemo' as const,
            attrs: {
              ...(section.title?.trim() ? { title: section.title.trim() } : {}),
              prompt: section.prompt?.trim() || '$',
              body: section.body.trim(),
            },
          },
        ] as ArticleBlock[]
        break
    }

    content.push(...blocks)
  }

  return articleDocSchema.parse({
    type: 'doc',
    content: content.length > 0 ? content : [createParagraph('')],
  })
}

function dedupeStrings(values: string[]) {
  const seen = new Set<string>()
  const result: string[] = []

  for (const value of values) {
    const normalized = value.trim()
    if (!normalized) continue
    const key = normalized.toLocaleLowerCase('zh-CN')
    if (seen.has(key)) continue
    seen.add(key)
    result.push(normalized)
  }

  return result
}

function buildSystemPrompt() {
  return [
    '你是中文技术博客写作助手，要根据我提供的资料直接产出一篇可发布的文章。',
    '你必须只返回一个 JSON 对象，不要输出 markdown 代码围栏，不要输出解释文字。',
    '文章风格要求：口语化但逻辑清楚，像一个懂技术的人在带读者理解问题。',
    '禁止杜撰资料里没有的事实；如果资料不完整，可以明确说明局限，但仍然要尽量整理成有价值的结构。',
    '优先使用这些结构块：paragraph、heading、bullet_list、ordered_list、callout、step_flow、faq、timeline、code、table。',
    '正文内部的 heading 尽量使用 level 4，避免太大的标题层级。',
    'excerpt 控制在 60 到 120 个汉字左右，seoDescription 控制在 80 到 180 个汉字左右。',
    '如果资料明显适合教程，请至少给出一个 step_flow；如果资料有重点提醒，请给出一个 callout；如果资料有问答感内容，可以给 faq。',
    '输出格式必须是 JSON：{"title":"","excerpt":"","seoTitle":"","seoDescription":"","category":"","tags":[],"sections":[]}',
  ].join('\n')
}

function buildUserPrompt(input: GeneratedArticleInput) {
  const tagLine = input.tags && input.tags.length > 0 ? input.tags.join(', ') : '（未指定）'
  return [
    '请根据下面资料生成文章 JSON。',
    `标题提示：${input.titleHint?.trim() || '（未指定）'}`,
    `写作角度：${input.angle?.trim() || '（未指定）'}`,
    `文章分类：${input.category?.trim() || '（未指定）'}`,
    `预设标签：${tagLine}`,
    '',
    '原始资料如下：',
    input.materials.trim(),
  ].join('\n')
}

export async function generateArticleFromMaterials(
  input: GeneratedArticleInput
): Promise<GeneratedArticleResult> {
  const result = await createDeepSeekJsonCompletion<unknown>({
    model: input.model,
    messages: [
      {
        role: 'system',
        content: buildSystemPrompt(),
      },
      {
        role: 'user',
        content: buildUserPrompt(input),
      },
    ],
  })

  const draft = normalizeGeneratedArticle(result)
  const content = buildArticleDocFromSections(draft.sections)
  const category = input.category?.trim() || draft.category?.trim() || 'AI 笔记'
  const tags = dedupeStrings([...(input.tags || []), ...(draft.tags || [])]).slice(0, 10)
  const title = draft.title.trim()
  const excerpt = draft.excerpt.trim()

  return {
    title,
    excerpt,
    seoTitle: draft.seoTitle?.trim() || title,
    seoDescription: draft.seoDescription?.trim() || excerpt,
    category,
    tags,
    content,
  }
}

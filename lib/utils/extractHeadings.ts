export interface Heading {
  id: string
  level: number
  text: string
}

type RichNode = {
  type?: string
  text?: string
  attrs?: Record<string, unknown>
  content?: RichNode[]
}

function collectNodeText(node: RichNode | null | undefined): string {
  if (!node) return ''
  const own = typeof node.text === 'string' ? node.text : ''
  const nested = Array.isArray(node.content) ? node.content.map((child) => collectNodeText(child)).join('') : ''
  return `${own}${nested}`
}

function walkNodes(node: RichNode | null | undefined, visitor: (node: RichNode) => void) {
  if (!node) return
  visitor(node)
  if (Array.isArray(node.content)) {
    node.content.forEach((child) => walkNodes(child, visitor))
  }
}

export function extractHeadings(content: object): Heading[] {
  const headings: Heading[] = []

  walkNodes(content as RichNode, (node) => {
    if (node.type !== 'heading') return

    const level = typeof node.attrs?.level === 'number' ? node.attrs.level : 1
    const text = collectNodeText(node).trim()
    if (!text) return

    headings.push({
      id: `heading-${headings.length}`,
      level,
      text,
    })
  })

  return headings
}

export function extractPlainTextFromRichContent(content: object | null | undefined): string {
  const parts: string[] = []

  walkNodes((content ?? {}) as RichNode, (node) => {
    if (typeof node.text === 'string' && node.text.trim()) {
      parts.push(node.text.trim())
    }
  })

  return parts.join(' ').replace(/\s+/g, ' ').trim()
}

export function estimateReadTime(content: object): number {
  const text = extractPlainTextFromRichContent(content)
  const chars = text.replace(/\s+/g, '').length
  return Math.max(1, Math.ceil(chars / 350))
}

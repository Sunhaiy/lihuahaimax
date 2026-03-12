/**
 * lib/utils/extractHeadings.ts
 *
 * 从 Tiptap JSONB 内容中提取标题节点，用于生成目录（TOC）。
 */

export interface Heading {
  id: string    // 用于 anchor scroll，格式 heading-N
  level: number // 1-6
  text: string
}

export function extractHeadings(content: object): Heading[] {
  const headings: Heading[] = []

  function walk(node: Record<string, unknown>) {
    if (node.type === 'heading') {
      const level = (node.attrs as Record<string, unknown>)?.level
      const children = node.content as Array<Record<string, unknown>> | undefined
      const text = children?.map((n) => n.text ?? '').join('') ?? ''
      if (text.trim()) {
        headings.push({
          id: `heading-${headings.length}`,
          level: typeof level === 'number' ? level : 1,
          text: text.trim(),
        })
      }
    }
    const children = (node as Record<string, unknown>).content as Array<Record<string, unknown>> | undefined
    if (Array.isArray(children)) {
      for (const child of children) walk(child)
    }
  }

  walk(content as Record<string, unknown>)
  return headings
}

/** 估算阅读时长（分钟），中文按每分钟 350 字计 */
export function estimateReadTime(content: object): number {
  let text = ''

  function walk(node: Record<string, unknown>) {
    if (typeof node.text === 'string') text += node.text
    const children = node.content as Array<Record<string, unknown>> | undefined
    if (Array.isArray(children)) {
      for (const child of children) walk(child)
    }
  }

  walk(content as Record<string, unknown>)
  const chars = text.replace(/\s+/g, '').length
  return Math.max(1, Math.ceil(chars / 350))
}

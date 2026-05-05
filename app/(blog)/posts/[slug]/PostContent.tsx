'use client'

import { RichTextRenderer } from '@/components/ui/RichTextRenderer'
import type { Heading } from '@/lib/utils/extractHeadings'

interface PostContentProps {
  content: object
  headings: Heading[]
}

export function PostContent({ content, headings }: PostContentProps) {
  return (
    <RichTextRenderer
      content={content}
      headings={headings}
      className="post-content"
      proseClassName="
        prose prose-neutral max-w-none dark:prose-invert
        [&_.ProseMirror]:text-[1.02rem]
        [&_.ProseMirror]:leading-8
        [&_.ProseMirror]:text-foreground
        [&_.ProseMirror]:selection:bg-primary/18
        [&_.ProseMirror_h1]:mb-6
        [&_.ProseMirror_h1]:text-4xl
        [&_.ProseMirror_h1]:font-semibold
        [&_.ProseMirror_h1]:tracking-[-0.06em]
        [&_.ProseMirror_h2]:mt-14
        [&_.ProseMirror_h2]:mb-5
        [&_.ProseMirror_h2]:text-[1.95rem]
        [&_.ProseMirror_h2]:font-semibold
        [&_.ProseMirror_h2]:tracking-[-0.05em]
        [&_.ProseMirror_h2]:text-foreground
        [&_.ProseMirror_h3]:mt-10
        [&_.ProseMirror_h3]:mb-4
        [&_.ProseMirror_h3]:text-[1.45rem]
        [&_.ProseMirror_h3]:font-semibold
        [&_.ProseMirror_h3]:tracking-[-0.045em]
        [&_.ProseMirror_h4]:mt-8
        [&_.ProseMirror_h4]:mb-3
        [&_.ProseMirror_h4]:text-[1.12rem]
        [&_.ProseMirror_h4]:font-semibold
        [&_.ProseMirror_p]:my-5
        [&_.ProseMirror_p]:text-[1rem]
        [&_.ProseMirror_p]:leading-8
        [&_.ProseMirror_p]:text-foreground/82
        [&_.ProseMirror_p:first-of-type]:text-[1.08rem]
        [&_.ProseMirror_p:first-of-type]:leading-9
        [&_.ProseMirror_p:first-of-type]:text-foreground/88
        [&_.ProseMirror_a]:font-medium
        [&_.ProseMirror_a]:text-primary
        [&_.ProseMirror_a]:underline
        [&_.ProseMirror_a]:decoration-primary/35
        [&_.ProseMirror_a]:underline-offset-4
        [&_.ProseMirror_strong]:text-foreground
        [&_.ProseMirror_ul]:my-6
        [&_.ProseMirror_ul]:space-y-2.5
        [&_.ProseMirror_ul]:pl-6
        [&_.ProseMirror_ol]:my-6
        [&_.ProseMirror_ol]:space-y-2.5
        [&_.ProseMirror_ol]:pl-6
        [&_.ProseMirror_li]:pl-1
        [&_.ProseMirror_li]:text-foreground/82
        [&_.ProseMirror_li>p]:my-0
        [&_.ProseMirror_hr]:my-10
        [&_.ProseMirror_hr]:border-border/75
        [&_.ProseMirror_blockquote]:my-8
        [&_.ProseMirror_blockquote]:rounded-[26px]
        [&_.ProseMirror_blockquote]:border-l-[3px]
        [&_.ProseMirror_blockquote]:border-primary/34
        [&_.ProseMirror_blockquote]:bg-card/72
        [&_.ProseMirror_blockquote]:px-6
        [&_.ProseMirror_blockquote]:py-5
        [&_.ProseMirror_blockquote]:text-[0.98rem]
        [&_.ProseMirror_blockquote]:leading-8
        [&_.ProseMirror_blockquote]:text-foreground/78
        [&_.ProseMirror_code]:rounded-md
        [&_.ProseMirror_code]:bg-primary/10
        [&_.ProseMirror_code]:px-1.5
        [&_.ProseMirror_code]:py-1
        [&_.ProseMirror_code]:font-mono
        [&_.ProseMirror_code]:text-[0.92em]
        [&_.ProseMirror_code]:text-primary
        [&_.ProseMirror_pre]:my-8
        [&_.ProseMirror_pre]:overflow-x-auto
        [&_.ProseMirror_pre]:rounded-[28px]
        [&_.ProseMirror_pre]:border
        [&_.ProseMirror_pre]:border-border/70
        [&_.ProseMirror_pre]:bg-[linear-gradient(180deg,rgba(18,18,20,0.98),rgba(10,10,12,0.98))]
        [&_.ProseMirror_pre]:px-0
        [&_.ProseMirror_pre]:py-0
        [&_.ProseMirror_pre_code]:block
        [&_.ProseMirror_pre_code]:rounded-none
        [&_.ProseMirror_pre_code]:bg-transparent
        [&_.ProseMirror_pre_code]:px-6
        [&_.ProseMirror_pre_code]:py-5
        [&_.ProseMirror_pre_code]:text-[0.92rem]
        [&_.ProseMirror_pre_code]:leading-7
        [&_.ProseMirror_pre_code]:text-zinc-100
        [&_.ProseMirror_img]:my-8
        [&_.ProseMirror_img]:overflow-hidden
        [&_.ProseMirror_img]:rounded-[28px]
        [&_.ProseMirror_img]:border
        [&_.ProseMirror_img]:border-border/70
        [&_.ProseMirror_img]:bg-card/60
        [&_.ProseMirror_img]:shadow-[0_24px_60px_rgba(0,0,0,0.16)]
      "
    />
  )
}

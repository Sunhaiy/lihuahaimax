'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/Button'
import { LinkSubmissionForm } from '@/components/ui/LinkSubmissionForm'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'

export function LinkSubmissionDialog() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        <MaterialSymbol icon="edit_square" size={16} />
        提交友链申请
      </Button>

      {mounted && open
        ? createPortal(
            <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 sm:p-6">
              <button
                type="button"
                className="absolute inset-0 bg-black/68 backdrop-blur-md"
                aria-label="关闭友链申请弹窗"
                onClick={() => setOpen(false)}
              />

              <div className="relative flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-[30px] border border-white/10 bg-[rgba(18,18,20,0.92)] text-foreground shadow-2xl backdrop-blur-2xl">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 px-5 py-5 sm:px-6">
                  <div>
                    <p className="text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
                      Friend Link
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-white">申请友链</h3>
                    <p className="mt-2 text-sm leading-6 text-white/62">
                      填完表单后我会按顺序回访，合适的话会尽快补上链接。
                    </p>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
                    <MaterialSymbol icon="close" size={16} />
                    关闭
                  </Button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
                  <LinkSubmissionForm />
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  )
}

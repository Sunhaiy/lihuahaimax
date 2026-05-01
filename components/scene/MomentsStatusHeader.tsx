'use client'

import { useEffect, useState } from 'react'

const EXPRESSIONS = ['normal', 'blink', 'happy', 'surprised', 'error', 'loading'] as const

type Expression = (typeof EXPRESSIONS)[number]

function eyeClass(expression: Expression) {
  switch (expression) {
    case 'blink':
      return 'h-[3px] w-[18px] rounded-full'
    case 'happy':
      return 'h-[10px] w-[16px] rounded-t-full rounded-b-[4px]'
    case 'surprised':
      return 'h-[18px] w-[18px] rounded-full'
    case 'error':
      return 'h-[14px] w-[14px] rotate-45 rounded-none'
    case 'loading':
      return 'h-[14px] w-[14px] rounded-full animate-pulse'
    default:
      return 'h-[15px] w-[15px] rounded-full'
  }
}

function mouthClass(expression: Expression) {
  switch (expression) {
    case 'happy':
      return 'h-[3px] w-[48px] rounded-full bg-accent shadow-[0_0_10px_hsl(var(--accent)/0.55)]'
    case 'surprised':
      return 'h-[16px] w-[16px] rounded-full border-[3px] border-accent bg-transparent shadow-[0_0_10px_hsl(var(--accent)/0.35)]'
    case 'error':
      return 'h-[3px] w-[42px] rotate-[-12deg] rounded-full bg-accent shadow-[0_0_10px_hsl(var(--accent)/0.55)]'
    case 'loading':
      return 'h-[3px] w-[56px] rounded-full bg-accent shadow-[0_0_10px_hsl(var(--accent)/0.55)] animate-pulse'
    default:
      return 'h-[3px] w-[40px] rounded-full bg-accent shadow-[0_0_10px_hsl(var(--accent)/0.55)]'
  }
}

export function MomentsStatusHeader() {
  const [expressionIndex, setExpressionIndex] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setExpressionIndex((current) => (current + 1) % EXPRESSIONS.length)
    }, 3000)

    return () => window.clearInterval(timer)
  }, [])

  const expression = EXPRESSIONS[expressionIndex]

  return (
    <header className="mx-auto flex max-w-5xl justify-center px-4 pb-10 pt-14 sm:px-6">
      <div className="flex flex-col items-center">
        <div className="relative flex flex-col items-center transition-transform duration-300 hover:-translate-y-1">
          <div className="relative flex h-[176px] w-[214px] items-center justify-center rounded-[28px] border-[4px] border-line/80 bg-surface/95 shadow-[0_10px_0_hsl(var(--line)/0.82),0_0_30px_hsl(var(--accent)/0.14)]">
            <div className="absolute -top-9 left-0 right-0">
              <div className="absolute left-[52px] h-9 w-1 rotate-[-30deg] rounded-full bg-line" />
              <div className="absolute right-[52px] h-9 w-1 rotate-[30deg] rounded-full bg-line" />
            </div>

            <div className="relative h-[128px] w-[162px] overflow-hidden rounded-[18px] border-2 border-line bg-background shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
              <div className="absolute inset-0 shadow-[inset_0_0_22px_hsl(var(--accent)/0.16)]" />
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    'linear-gradient(to bottom, rgba(255,255,255,0.04), rgba(255,255,255,0.04) 1px, transparent 1px, transparent 4px)',
                }}
              />

              <div className="relative z-10 flex h-full flex-col items-center justify-center gap-5">
                <div className="flex items-center gap-6">
                  <span
                    className={`${eyeClass(expression)} bg-accent shadow-[0_0_12px_hsl(var(--accent)/0.58)] transition-all duration-300`}
                  />
                  <span
                    className={`${eyeClass(expression)} bg-accent shadow-[0_0_12px_hsl(var(--accent)/0.58)] transition-all duration-300`}
                  />
                </div>
                <span className={`${mouthClass(expression)} transition-all duration-300`} />
              </div>
            </div>
          </div>

          <div className="h-3 w-[72px] rounded-b-[12px] bg-surface/95" />
        </div>

        <p className="scene-copy-subtle mt-5 text-[11px] font-mono uppercase tracking-[0.3em]">
          TERMINAL_STATUS: {expression.toUpperCase()}
        </p>
        <p className="scene-copy-muted mt-4 max-w-2xl text-center text-sm leading-7">
          把一闪而过的想法、失眠后的凌晨、手环里的睡眠曲线和突然落下的大雨，
          一起收进这片持续闪烁的终端屏幕里。
        </p>
      </div>
    </header>
  )
}

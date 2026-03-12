'use client'

import { useMemo, useState } from 'react'
import type { ActivityDay } from '@/lib/db/dao/activityDao'

const LEVEL_CLS = [
  'bg-border/50',
  'bg-ember/20',
  'bg-ember/45',
  'bg-ember/70',
  'bg-ember',
] as const

function level(count: number) {
  if (count === 0) return 0
  if (count === 1) return 1
  if (count <= 3) return 2
  if (count <= 6) return 3
  return 4
}

function fmtDate(s: string) {
  const [y, m, d] = s.split('-')
  return `${y}年${parseInt(m)}月${parseInt(d)}日`
}

interface Props {
  data: ActivityDay[]
}

export function ActivityHeatmap({ data }: Props) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null)

  const { weeks, monthLabels, activeDays, total } = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const dow = today.getDay()
    const thisMonday = new Date(today)
    thisMonday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1))

    const start = new Date(thisMonday)
    start.setDate(start.getDate() - 51 * 7)

    const map = new Map(data.map((d) => [d.date, d.count]))

    type Cell = { date: string; count: number; future: boolean }
    const weeks: Cell[][] = []
    const monthLabels: { label: string; col: number }[] = []
    let lastMonth = -1
    let activeDays = 0
    let total = 0

    for (let col = 0; col < 52; col++) {
      const week: Cell[] = []
      for (let row = 0; row < 7; row++) {
        const d = new Date(start)
        d.setDate(d.getDate() + col * 7 + row)
        const dateStr =
          d.getFullYear() + '-' +
          String(d.getMonth() + 1).padStart(2, '0') + '-' +
          String(d.getDate()).padStart(2, '0')
        const future = d > today
        const count = future ? 0 : (map.get(dateStr) ?? 0)

        if (row === 0 && d.getMonth() !== lastMonth) {
          monthLabels.push({ label: `${d.getMonth() + 1}月`, col })
          lastMonth = d.getMonth()
        }
        if (!future && count > 0) {
          activeDays++
          total += count
        }
        week.push({ date: dateStr, count, future })
      }
      weeks.push(week)
    }
    return { weeks, monthLabels, activeDays, total }
  }, [data])

  const COL_W = 14

  return (
    <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* w-max：容器宽度精确等于格子内容宽度，标题行两端对齐到格子左右端 */}
      <div className="flex flex-col w-max">

        {/* 标题行：与格子等宽，两端对齐 */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-foreground">创作活跃度</h2>
          <p className="text-sm text-muted-foreground">
            过去一年 ·{' '}
            <span className="text-foreground font-medium">{total}</span> 条 ·{' '}
            <span className="text-foreground font-medium">{activeDays}</span> 天活跃
          </p>
        </div>

        {/* 月份标签行 */}
        <div className="relative h-[14px]">
          {monthLabels.map(({ label, col }) => (
            <span
              key={col}
              className="absolute text-[9px] text-muted-foreground whitespace-nowrap"
              style={{ left: col * COL_W }}
            >
              {label}
            </span>
          ))}
        </div>

        {/* 格子行 */}
        <div className="flex gap-[3px] mt-[3px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((cell, di) => (
                <div
                  key={di}
                  className={[
                    'w-[11px] h-[11px] rounded-[2px]',
                    'cursor-default transition-transform hover:scale-125',
                    cell.future ? 'bg-border/20' : LEVEL_CLS[level(cell.count)],
                  ].join(' ')}
                  onMouseEnter={(e) => {
                    if (cell.future) return
                    const rect = e.currentTarget.getBoundingClientRect()
                    setTooltip({
                      x: rect.left + rect.width / 2,
                      y: rect.top,
                      text: cell.count > 0
                        ? `${fmtDate(cell.date)} · ${cell.count} 条`
                        : fmtDate(cell.date),
                    })
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              ))}
            </div>
          ))}
        </div>

        {/* 图例 */}
        <div className="flex items-center gap-1.5 mt-2 justify-end">
          <span className="text-[10px] text-muted-foreground">少</span>
          {LEVEL_CLS.map((cls, i) => (
            <div key={i} className={`w-[10px] h-[10px] rounded-[2px] ${cls}`} />
          ))}
          <span className="text-[10px] text-muted-foreground">多</span>
        </div>

      </div>

      {/* 浮动 Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none
                     px-2.5 py-1.5 rounded-lg text-xs font-mono
                     bg-background/95 backdrop-blur-md border border-border
                     text-foreground whitespace-nowrap shadow-md
                     -translate-x-1/2 -translate-y-full"
          style={{ left: tooltip.x, top: tooltip.y - 6 }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  )
}

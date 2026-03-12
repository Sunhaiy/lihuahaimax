'use client'

import { useMemo } from 'react'
import type { ActivityDay } from '@/lib/db/dao/activityDao'

/* ── 颜色等级 (ember 主题) ─────────────────────────────────────── */
const LEVEL_CLS = [
  'bg-border/50',   // 0：无内容
  'bg-ember/20',    // 1：1 条
  'bg-ember/45',    // 2：2–3 条
  'bg-ember/70',    // 3：4–6 条
  'bg-ember',       // 4：7+ 条
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

/* ── 组件 ─────────────────────────────────────────────────────── */
interface Props {
  data: ActivityDay[]
}

export function ActivityHeatmap({ data }: Props) {
  const { weeks, monthLabels, activeDays, total } = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 当周周一
    const dow = today.getDay()
    const thisMonday = new Date(today)
    thisMonday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1))

    // 往前 51 周，共 52 周
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
        // YYYY-MM-DD 不依赖时区
        const dateStr =
          d.getFullYear() +
          '-' +
          String(d.getMonth() + 1).padStart(2, '0') +
          '-' +
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

  // 每格 11px + 3px 间距 = 14px / col
  const COL_W = 14

  return (
    <div>
      {/* 标题行 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">创作活跃度</h2>
        <p className="text-sm text-muted-foreground">
          过去一年 ·{' '}
          <span className="text-foreground font-medium">{total}</span> 条 ·{' '}
          <span className="text-foreground font-medium">{activeDays}</span> 天活跃
        </p>
      </div>

      {/* 可横向滚动容器 */}
      <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex gap-[3px] min-w-max">

          {/* 星期标签列 */}
          <div
            className="flex flex-col mt-[18px] shrink-0"
            style={{ gap: '3px' }}
          >
            {['一', '', '三', '', '五', '', '日'].map((l, i) => (
              <div key={i} className="h-[11px] w-[14px] flex items-center">
                <span className="text-[9px] leading-none text-muted-foreground">{l}</span>
              </div>
            ))}
          </div>

          {/* 主网格区 */}
          <div className="flex flex-col gap-[3px]">
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
            <div className="flex gap-[3px]">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {week.map((cell, di) => (
                    <div
                      key={di}
                      className={[
                        'w-[11px] h-[11px] rounded-[2px]',
                        'cursor-default transition-transform hover:scale-125',
                        cell.future
                          ? 'bg-border/20'
                          : LEVEL_CLS[level(cell.count)],
                      ].join(' ')}
                      title={
                        cell.future
                          ? ''
                          : cell.count > 0
                            ? `${fmtDate(cell.date)}：${cell.count} 条内容`
                            : `${fmtDate(cell.date)}：无内容`
                      }
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
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
    </div>
  )
}

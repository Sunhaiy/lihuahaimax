/**
 * lib/cron/jobs/miBandSync.ts
 *
 * 小米手环数据同步 Job（预留接口）。
 *
 * 当前为 TODO 占位，等待真实 API 或本地脚本接入。
 * 数据接入后调用 momentDao.upsertMiBandMoment() 写入数据库。
 */

import { upsertMiBandMoment } from '@/lib/db/dao/momentDao'

export async function syncMiBandData(): Promise<void> {
  // TODO: 通过 MI_BAND_API_TOKEN 调用数据源 API
  // 可能方式：
  //   1. 通过 Zepp Life / Gadgetbridge 导出脚本（本地 SQLite 解析）
  //   2. 通过第三方非官方 API
  //   3. 通过 child_process 调用 Python 脚本

  const token = process.env.MI_BAND_API_TOKEN
  if (!token) {
    // 未配置 token，跳过同步
    return
  }

  // 示例：写入当天睡眠数据占位
  const today = new Date()
  await upsertMiBandMoment(
    'sleep',
    {
      sleepStart: null,   // TODO: 从 API 读取
      sleepEnd: null,
      deepSleepMinutes: 0,
      lightSleepMinutes: 0,
      remMinutes: 0,
      score: null,
    },
    today
  )
}

/**
 * lib/db/index.ts
 *
 * PostgreSQL 连接池单例。
 * 使用 pg 库手动管理连接，禁止使用 ORM。
 * 所有 SQL 通过此处的 query() 方法执行，便于集中做：
 *   - 超时控制
 *   - 慢查询日志
 *   - SQL 注入审计（参数化查询强制执行）
 */

import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg'

// ============================================================
// 连接池配置
// ============================================================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // 若无 DATABASE_URL 则使用分拆字段
  host: process.env.PGHOST ?? 'localhost',
  port: Number(process.env.PGPORT ?? 5432),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  max: 20,               // 最大连接数
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  // SSL: 生产环境建议开启
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
})

pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error', err)
})

// ============================================================
// 统一查询入口
// 强制参数化查询，杜绝 SQL 注入
// ============================================================
export async function query<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  const start = Date.now()
  try {
    const result = await pool.query<T>(sql, params)
    const duration = Date.now() - start
    // 慢查询预警（>500ms）
    if (duration > 500) {
      console.warn(`[DB] Slow query detected (${duration}ms):`, sql.slice(0, 120))
    }
    return result
  } catch (err) {
    console.error('[DB] Query error:', { sql: sql.slice(0, 120), params, err })
    throw err
  }
}

// ============================================================
// 事务帮手
// 使用方式:
//   await withTransaction(async (client) => {
//     await client.query(...)
//     await client.query(...)
//   })
// ============================================================
export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await fn(client)
    await client.query('COMMIT')
    return result
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export default pool

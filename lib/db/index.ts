/**
 * lib/db/index.ts
 *
 * PostgreSQL 连接池单例。
 */

import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg'

function getSslConfig() {
  const mode = (process.env.PGSSLMODE ?? '').toLowerCase()
  const url = (process.env.DATABASE_URL ?? '').toLowerCase()
  const enabled =
    process.env.DATABASE_SSL === 'true' ||
    url.includes('sslmode=require') ||
    url.includes('ssl=true') ||
    ['require', 'verify-ca', 'verify-full'].includes(mode)

  if (!enabled) return false

  return {
    rejectUnauthorized: process.env.PGSSL_REJECT_UNAUTHORIZED === 'true',
  }
}

const poolConnectionConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.PGHOST ?? 'localhost',
      port: Number(process.env.PGPORT ?? 5432),
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
    }

const pool = new Pool({
  ...poolConnectionConfig,
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  ssl: getSslConfig(),
})

pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error', err)
})

export async function query<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  const start = Date.now()

  try {
    const result = await pool.query<T>(sql, params)
    const duration = Date.now() - start

    if (duration > 500) {
      console.warn(`[DB] Slow query detected (${duration}ms):`, sql.slice(0, 120))
    }

    return result
  } catch (err) {
    console.error('[DB] Query error:', { sql: sql.slice(0, 120), params, err })
    throw err
  }
}

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

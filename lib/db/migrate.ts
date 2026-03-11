/**
 * lib/db/migrate.ts
 *
 * 数据库迁移脚本。
 * 执行方式: npm run db:migrate
 *
 * 策略: 读取 schema.sql 并在数据库执行（CREATE IF NOT EXISTS），
 * 幂等安全，可重复运行。
 */

import fs from 'node:fs'
import path from 'node:path'
import { Pool } from 'pg'

async function migrate() {
  const schemaPath = path.join(process.cwd(), 'lib', 'db', 'schema.sql')

  if (!fs.existsSync(schemaPath)) {
    console.error('[migrate] schema.sql not found at:', schemaPath)
    process.exit(1)
  }

  const sql = fs.readFileSync(schemaPath, 'utf-8')

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
  })

  const client = await pool.connect()
  try {
    console.log('[migrate] Running schema migration...')
    await client.query(sql)
    console.log('[migrate] Done. All tables are up to date.')
  } catch (err) {
    console.error('[migrate] Migration failed:', err)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

migrate()

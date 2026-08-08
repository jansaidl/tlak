import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const globalForDb = globalThis as unknown as {
  client?: ReturnType<typeof postgres>
}

const client =
  globalForDb.client ??
  postgres({
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER!,
    password: process.env.DB_PASS!,
    database: process.env.DB_NAME ?? 'db',
    max: 5,
  })

if (process.env.NODE_ENV !== 'production') globalForDb.client = client

export const db = drizzle(client, { schema })
export { schema }

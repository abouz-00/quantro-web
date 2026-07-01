import { PrismaClient } from '@prisma/client'
import { isProduction, serverEnv } from '@/lib/env'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const createSqliteClient = (dbPath: string) => {
  const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
  const adapter = new PrismaBetterSqlite3({ url: dbPath })
  return new PrismaClient({ adapter })
}

const createPostgresClient = (databaseUrl: string) => {
  const { PrismaPg } = require('@prisma/adapter-pg')
  const { Pool } = require('pg')
  const pool = new Pool({ connectionString: databaseUrl })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

const createPrismaClient = () => {
  // Priority: DATABASE_URL > POSTGRES_PRISMA_URL > local SQLite
  const databaseUrl = serverEnv.DATABASE_URL || serverEnv.POSTGRES_PRISMA_URL
  const isPostgresUrl =
    databaseUrl?.startsWith('postgres://') || databaseUrl?.startsWith('postgresql://')
  const allowPostgresInDev = serverEnv.ALLOW_POSTGRES_IN_DEV === 'true'

  // Debug logging for build troubleshooting
  if (isProduction) {
    console.log('[Prisma] Initializing with URL prefix:', databaseUrl?.substring(0, 15) || 'NO URL')
  }

  // In development we default to SQLite to match prisma/schema.prisma.
  // Set ALLOW_POSTGRES_IN_DEV=true if you intentionally run Postgres locally.
  if (isPostgresUrl && !isProduction && !allowPostgresInDev) {
    console.warn(
      '[Prisma] Postgres URL detected in development with SQLite schema; using local SQLite instead. Set ALLOW_POSTGRES_IN_DEV=true to override.'
    )
    return createSqliteClient('./prisma/dev.db')
  }

  // For PostgreSQL databases (production or explicit dev override)
  if (databaseUrl && isPostgresUrl) {
    return createPostgresClient(databaseUrl)
  }
  
  // For file-based SQLite databases (local dev)
  if (databaseUrl?.startsWith('file:')) {
    const dbPath = databaseUrl.replace('file:', '')
    return createSqliteClient(dbPath)
  }
  
  // No URL provided - use SQLite for local development only
  if (!databaseUrl && !isProduction) {
    return createSqliteClient('./prisma/dev.db')
  }
  
  // Production without valid URL - throw error
  if (!databaseUrl) {
    throw new Error('DATABASE_URL or POSTGRES_PRISMA_URL must be set in production')
  }
  
  // Fallback - shouldn't reach here
  return new PrismaClient()
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (!isProduction) globalForPrisma.prisma = prisma

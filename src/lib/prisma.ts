import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const createPrismaClient = () => {
  // Priority: DATABASE_URL > POSTGRES_PRISMA_URL > local SQLite
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL
  
  // Debug logging for build troubleshooting
  if (process.env.NODE_ENV === 'production') {
    console.log('[Prisma] Initializing with URL prefix:', databaseUrl?.substring(0, 15) || 'NO URL')
  }
  
  // For PostgreSQL databases (production)
  if (databaseUrl?.startsWith('postgres://') || databaseUrl?.startsWith('postgresql://')) {
    const { PrismaPg } = require('@prisma/adapter-pg')
    const { Pool } = require('pg')
    const pool = new Pool({ connectionString: databaseUrl })
    const adapter = new PrismaPg(pool)
    return new PrismaClient({ adapter })
  }
  
  // For file-based SQLite databases (local dev)
  if (databaseUrl?.startsWith('file:')) {
    const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
    const dbPath = databaseUrl.replace('file:', '')
    const adapter = new PrismaBetterSqlite3({ url: dbPath })
    return new PrismaClient({ adapter })
  }
  
  // No URL provided - use SQLite for local development only
  if (!databaseUrl && process.env.NODE_ENV !== 'production') {
    const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
    const dbPath = './prisma/dev.db'
    const adapter = new PrismaBetterSqlite3({ url: dbPath })
    return new PrismaClient({ adapter })
  }
  
  // Production without valid URL - throw error
  if (!databaseUrl) {
    throw new Error('DATABASE_URL or POSTGRES_PRISMA_URL must be set in production')
  }
  
  // Fallback - shouldn't reach here
  return new PrismaClient()
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

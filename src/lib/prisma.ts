import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const createPrismaClient = () => {
  // Priority: DATABASE_URL > POSTGRES_PRISMA_URL > local SQLite
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL
  
  // If no database URL is provided, use SQLite for local development
  if (!databaseUrl) {
    const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
    const dbPath = './prisma/dev.db'
    const adapter = new PrismaBetterSqlite3({ url: dbPath })
    return new PrismaClient({ adapter })
  }
  
  // For file-based SQLite databases
  if (databaseUrl.startsWith('file:')) {
    const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
    const dbPath = databaseUrl.replace('file:', '')
    const adapter = new PrismaBetterSqlite3({ url: dbPath })
    return new PrismaClient({ adapter })
  }
  
  // For PostgreSQL databases in Prisma 7, use the pg adapter
  if (databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://')) {
    const { PrismaPg } = require('@prisma/adapter-pg')
    const { Pool } = require('pg')
    const pool = new Pool({ connectionString: databaseUrl })
    const adapter = new PrismaPg(pool)
    return new PrismaClient({ adapter })
  }
  
  // Fallback for other database types
  return new PrismaClient()
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

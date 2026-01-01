import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const createPrismaClient = () => {
  const databaseUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db'
  
  // Only use SQLite adapter for file-based databases
  if (databaseUrl.startsWith('file:')) {
    const dbPath = databaseUrl.replace('file:', '')
    const adapter = new PrismaBetterSqlite3({ url: dbPath })
    return new PrismaClient({ adapter })
  }
  
  // For PostgreSQL/other databases, use default client without adapter
  return new PrismaClient()
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

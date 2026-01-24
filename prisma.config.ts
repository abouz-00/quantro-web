import 'dotenv/config'
import { defineConfig } from 'prisma/config'

// Get database URL from environment, with fallbacks
const getDatabaseUrl = () => {
  return process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || 'file:./prisma/dev.db'
}

export default defineConfig({
  // The main entry for your schema
  schema: 'prisma/schema.prisma',
  
  // Where migrations should be generated
  migrations: {
    path: 'prisma/migrations',
  },
  
  // The database URL - using process.env for safe fallback handling
  datasource: {
    url: getDatabaseUrl(),
  },
})

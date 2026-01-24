import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  // The main entry for your schema
  schema: 'prisma/schema.prisma',
  
  // Where migrations should be generated
  migrations: {
    path: 'prisma/migrations',
  },
  
  // The database URL - fallback to Postgres URL for production builds
  datasource: {
    // Type Safe env() helper
    // Does not replace the need for dotenv
    url: env('DATABASE_URL') || env('POSTGRES_PRISMA_URL') || 'file:./prisma/dev.db',
  },
})

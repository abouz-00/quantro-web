import { z } from 'zod'

/**
 * Centralized, typed access to environment variables.
 *
 * Every var the app reads is declared once here (as optional — most
 * integrations are feature-flagged on/off by whether their credentials are
 * present) instead of being accessed ad hoc via `process.env.X` scattered
 * across ~15 files. Benefits:
 *  - One place to see every environment variable the app depends on.
 *  - Typos in var names become "always undefined" at a single call site
 *    instead of silently-wrong `process.env` lookups everywhere.
 *  - `checkProductionEnv()` gives a single, fail-fast(ish) startup check
 *    instead of discovering misconfiguration when a specific route 500s.
 *
 * `serverEnv` must only be imported from server-only code (route handlers,
 * `src/lib`, `src/server`). Client components must use `clientEnv`, which
 * only contains `NEXT_PUBLIC_*` vars that are safe to ship to the browser.
 */

const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Database
  DATABASE_URL: z.string().optional(),
  POSTGRES_PRISMA_URL: z.string().optional(),
  ALLOW_POSTGRES_IN_DEV: z.string().optional(),

  // Auth
  NEXTAUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  APPLE_ID: z.string().optional(),
  APPLE_TEAM_ID: z.string().optional(),
  APPLE_PRIVATE_KEY: z.string().optional(),
  APPLE_PRIVATE_KEY_ID: z.string().optional(),
  DEV_SIGNIN_PASSWORD: z.string().optional(),
  BETA_ALLOWLIST_EMAILS: z.string().optional(),

  // Email
  RESEND_API_KEY: z.string().optional(),

  // Rate limiting
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // External food data providers
  USDA_API_KEY: z.string().optional(),
  FATSECRET_CLIENT_ID: z.string().optional(),
  FATSECRET_CLIENT_SECRET: z.string().optional(),

  // Observability / analytics
  ERROR_WEBHOOKS: z.string().optional(),
  GA_MEASUREMENT_ID: z.string().optional(),
  GA_API_SECRET: z.string().optional(),
})

const clientSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
})

function parseEnv<T extends z.ZodTypeAny>(
  schema: T,
  source: Record<string, string | undefined>,
  label: string
): z.infer<T> {
  const result = schema.safeParse(source)
  if (!result.success) {
    // Every field above is optional, so this should be unreachable — but if
    // a required field is ever added, fail loudly at startup rather than
    // producing confusing downstream errors.
    console.error(`[env] Invalid ${label} environment variables:`, result.error.flatten().fieldErrors)
    throw new Error(`Invalid ${label} environment configuration`)
  }
  return result.data
}

export const serverEnv = parseEnv(serverSchema, process.env, 'server')
export const clientEnv = parseEnv(clientSchema, process.env, 'client')

export const isProduction = serverEnv.NODE_ENV === 'production'
export const isDevelopment = serverEnv.NODE_ENV === 'development'
export const isTest = serverEnv.NODE_ENV === 'test'

/**
 * Warns (does not throw — misconfigured optional integrations should
 * degrade, not crash the whole app) about production configuration gaps.
 * Call once during server startup (see `instrumentation.ts`).
 */
export function checkProductionEnv(): void {
  if (!isProduction) return

  const problems: string[] = []

  if (!serverEnv.DATABASE_URL && !serverEnv.POSTGRES_PRISMA_URL) {
    problems.push('DATABASE_URL (or POSTGRES_PRISMA_URL) is not set')
  }
  if (!serverEnv.NEXTAUTH_SECRET) {
    problems.push('NEXTAUTH_SECRET is not set — sessions will not be secure')
  }
  if (!serverEnv.UPSTASH_REDIS_REST_URL || !serverEnv.UPSTASH_REDIS_REST_TOKEN) {
    problems.push(
      'UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN not set — rate limiting will fall back to ' +
        'in-memory storage, which does not work across multiple serverless instances'
    )
  }
  if (!serverEnv.RESEND_API_KEY) {
    problems.push('RESEND_API_KEY is not set — magic-link and beta invite emails will not send')
  }

  if (problems.length > 0) {
    console.warn(
      `[env] Production configuration warnings:\n${problems.map((p) => `  - ${p}`).join('\n')}`
    )
  }
}

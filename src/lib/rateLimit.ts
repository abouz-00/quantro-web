import { NextResponse } from 'next/server'
import type { Redis } from '@upstash/redis'
import type { Ratelimit } from '@upstash/ratelimit'

/**
 * Shared rate limiting for API routes and middleware.
 *
 * Uses Upstash Redis (REST-based, edge-compatible) when
 * UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are configured, so
 * limits are enforced consistently across all serverless instances.
 *
 * Falls back to an in-memory Map when Redis isn't configured (e.g. local
 * dev/test) or if a call to Upstash fails. The in-memory fallback only
 * limits requests within a single process/instance — it is NOT sufficient
 * on its own in a multi-instance production deployment, which is why
 * Upstash should always be configured in production.
 *
 * The Upstash SDKs are dynamically imported (rather than imported at the
 * top of the file) so that environments without Redis configured — like
 * Jest, which can't parse their ESM build — never load them at all.
 */

const UPSTASH_CONFIGURED = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
)

if (!UPSTASH_CONFIGURED && process.env.NODE_ENV === 'production') {
  console.warn(
    '[rateLimit] UPSTASH_REDIS_REST_URL/TOKEN not set — falling back to ' +
      'in-memory rate limiting, which is ineffective across multiple ' +
      'serverless instances. Configure Upstash for real protection in production.'
  )
}

let redisPromise: Promise<Redis> | null = null
function getRedis(): Promise<Redis> {
  if (!redisPromise) {
    redisPromise = import('@upstash/redis').then(
      ({ Redis }) =>
        new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL!,
          token: process.env.UPSTASH_REDIS_REST_TOKEN!,
        })
    )
  }
  return redisPromise
}

const limiters = new Map<string, Promise<Ratelimit>>()
function getLimiter(name: string, max: number, windowSeconds: number): Promise<Ratelimit> {
  const cacheKey = `${name}:${max}:${windowSeconds}`
  let limiter = limiters.get(cacheKey)
  if (!limiter) {
    limiter = Promise.all([getRedis(), import('@upstash/ratelimit')]).then(
      ([redis, { Ratelimit }]) =>
        new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(max, `${windowSeconds} s`),
          prefix: `quantro-ratelimit:${name}`,
          analytics: false,
        })
    )
    limiters.set(cacheKey, limiter)
  }
  return limiter
}

const memoryStore = new Map<string, { count: number; resetAt: number }>()

function memoryLimit(key: string, max: number, windowMs: number): { success: boolean } {
  const now = Date.now()
  const entry = memoryStore.get(key)

  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs })
    return { success: true }
  }

  entry.count++
  return { success: entry.count <= max }
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

export interface RateLimitOptions {
  /** Max requests allowed within the window. */
  max: number
  /** Window size in seconds. */
  windowSeconds: number
}

/**
 * Checks (and consumes) one unit of rate-limit budget for `identifier`
 * under bucket `name`. Returns whether the request is allowed.
 */
export async function checkRateLimit(
  name: string,
  identifier: string,
  options: RateLimitOptions
): Promise<{ success: boolean }> {
  if (UPSTASH_CONFIGURED) {
    try {
      const limiter = await getLimiter(name, options.max, options.windowSeconds)
      const { success } = await limiter.limit(identifier)
      return { success }
    } catch (error) {
      console.error(`[rateLimit] Upstash request failed for "${name}", falling back to in-memory limit:`, error)
    }
  }
  return memoryLimit(`${name}:${identifier}`, options.max, options.windowSeconds * 1000)
}

/** Test-only helper to clear in-memory rate limit state between test cases. */
export function __resetRateLimitForTests(): void {
  memoryStore.clear()
}

/**
 * Convenience wrapper for route handlers: rate-limits by client IP and
 * returns a ready-to-return 429 NextResponse if the limit was exceeded,
 * or null if the request should proceed.
 */
export async function rateLimitOrError(
  name: string,
  request: Request,
  options: RateLimitOptions
): Promise<NextResponse | null> {
  const ip = getClientIp(request)
  const { success } = await checkRateLimit(name, ip, options)
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }
  return null
}

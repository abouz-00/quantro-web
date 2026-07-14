import { NextRequest, NextResponse } from 'next/server'
import type { Session } from 'next-auth'
import type { ZodType } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rateLimitOrError, type RateLimitOptions } from '@/lib/rateLimit'
import { logger } from '@/lib/logger'
import { isDevelopment } from '@/lib/env'
import { ApiError } from './errors'

type AuthMode = 'none' | 'optional' | 'session' | 'admin'

type RouteParams = Record<string, string>

export interface HandlerContext<TBody> {
  /** Populated when `auth` is `'session'`, `'admin'`, or `'optional'` (if signed in). */
  session: Session | null
  /** Parsed + validated request body — only present when `schema` is set. */
  body: TBody
  /** Dynamic route segments, e.g. `{ id: '123' }` for `/api/foo/[id]`. */
  params: RouteParams
}

export interface HandlerOptions<TBody> {
  /**
   * - `'none'` (default): no session is loaded.
   * - `'optional'`: session is loaded and passed to the handler, but not required.
   * - `'session'`: requires a signed-in user; 401s otherwise.
   * - `'admin'`: requires a signed-in user whose `isAdmin` flag is true in the
   *   database (re-checked per-request rather than trusting the JWT, so
   *   admin revocation takes effect immediately). 401/403 otherwise.
   */
  auth?: AuthMode
  /** Rate-limits by client IP before anything else runs. */
  rateLimit?: { name: string } & RateLimitOptions
  /** Validates & parses the JSON request body. Invalid JSON still 500s (treated as unexpected), matching existing route behavior; schema mismatches 400. */
  schema?: ZodType<TBody>
  /** Message used for uncaught (non-`ApiError`) failures. Defaults to 'Internal server error'. */
  defaultErrorMessage?: string
  /** Label used in server logs for uncaught failures, e.g. `'GET /api/food-logs'`. */
  routeLabel: string
}

type NextRouteContext = { params?: Promise<RouteParams> | RouteParams }

/**
 * Wraps a route handler with the cross-cutting concerns that were
 * previously copy-pasted into every `route.ts` file: rate limiting, session
 * lookup, admin checks, request body validation, and error-to-JSON-response
 * mapping. The handler body only needs to contain the actual business logic.
 *
 * Throw `ApiError(status, message, details?)` for expected failures (not
 * found, forbidden, bad request); anything else thrown is logged and turned
 * into a generic 500 so internal error details never leak to clients.
 */
export function createHandler<TBody = undefined>(
  options: HandlerOptions<TBody>,
  fn: (request: NextRequest, ctx: HandlerContext<TBody>) => Promise<NextResponse>
) {
  // `request` is typed as optional so routes with no dynamic behavior (e.g.
  // a GET with no query params) can be unit-tested by calling the handler
  // with zero arguments, same as before this wrapper existed. Next.js
  // itself always supplies a real request at runtime.
  return async (request?: NextRequest, routeCtx?: NextRouteContext): Promise<NextResponse> => {
    try {
      if (options.rateLimit) {
        const limited = await rateLimitOrError(options.rateLimit.name, request, options.rateLimit)
        if (limited) return limited
      }

      let session: Session | null = null
      if (options.auth === 'session' || options.auth === 'admin' || options.auth === 'optional') {
        session = await auth()
        if (options.auth === 'session' && !session?.user?.id) {
          throw new ApiError(401, 'Unauthorized')
        }
      }

      if (options.auth === 'admin') {
        // Matches the historical admin check: only the email is required to
        // look the user up, since admin status is authoritatively re-checked
        // against the database below (never trusted from the JWT alone).
        if (!session?.user?.email) throw new ApiError(401, 'Unauthorized')
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { isAdmin: true },
        })
        if (!dbUser?.isAdmin) throw new ApiError(403, 'Forbidden - Admin access required')
      }

      let body: TBody = undefined as TBody
      if (options.schema) {
        const raw = await request!.json()
        const result = options.schema.safeParse(raw)
        if (!result.success) {
          throw new ApiError(400, 'Invalid request', result.error.flatten().fieldErrors)
        }
        body = result.data
      }

      const params = (await routeCtx?.params) ?? {}
      // Cast: only tests exercise the zero-argument call path, and only for
      // handlers that never touch `request` (see the note above).
      return await fn(request as NextRequest, { session, body, params })
    } catch (error) {
      if (error instanceof ApiError) {
        return NextResponse.json(
          { error: error.message, ...(error.details ? { details: error.details } : {}) },
          { status: error.status }
        )
      }
      logger.error(options.routeLabel, error)
      const errorMessage =
        isDevelopment && error instanceof Error
          ? `${options.defaultErrorMessage ?? 'Internal server error'}: ${error.message}`
          : options.defaultErrorMessage ?? 'Internal server error'
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      )
    }
  }
}

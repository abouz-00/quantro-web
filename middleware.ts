import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

// ── Rate limiting for auth endpoints ──────────────────────────────
// Uses a sliding-window counter via Upstash Redis when configured.
// Falls back to a no-op when UPSTASH_REDIS_REST_URL is not set so the
// app still works locally / in CI without external dependencies.
async function authRateLimited(req: Parameters<Parameters<typeof auth>[0]>[0]): Promise<NextResponse | null> {
  // Skip rate limiting if Upstash is not configured
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null
  }

  try {
    const { Ratelimit } = await import("@upstash/ratelimit")
    const { Redis } = await import("@upstash/redis")

    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })

    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "60 s"),
      analytics: true,
      prefix: "ratelimit:auth",
    })

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown"

    const { success, remaining, reset } = await ratelimit.limit(ip)

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": String(remaining),
            "X-RateLimit-Reset": String(reset),
            "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
          },
        },
      )
    }
  } catch {
    // If rate limiting fails, allow the request through — don't block
    // users because of a Redis outage.
  }

  return null
}

export default auth(async (req) => {
  // ── Rate-limit all auth-related routes ──────────────────────────
  if (req.nextUrl.pathname.startsWith('/api/auth')) {
    const blocked = await authRateLimited(req)
    if (blocked) return blocked
  }

  // ── Protected routes ────────────────────────────────────────────
  if (!req.auth && req.nextUrl.pathname.startsWith('/dashboard')) {
    return Response.redirect(new URL('/', req.url))
  }
  if (!req.auth && req.nextUrl.pathname.startsWith('/log')) {
    return Response.redirect(new URL('/', req.url))
  }
  if (!req.auth && req.nextUrl.pathname.startsWith('/api/user')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!req.auth && req.nextUrl.pathname.startsWith('/api/food-logs')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!req.auth && req.nextUrl.pathname.startsWith('/admin')) {
    return Response.redirect(new URL('/', req.url))
  }
  if (!req.auth && req.nextUrl.pathname.startsWith('/api/admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!req.auth && req.nextUrl.pathname.startsWith('/api/food-search-unified')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
})

export const config = {
  matcher: [
    '/api/auth/:path*',
    '/dashboard/:path*',
    '/log/:path*',
    '/api/user/:path*',
    '/api/food-logs/:path*',
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/food-search-unified/:path*'
  ]
}

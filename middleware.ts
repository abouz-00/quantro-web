import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const { auth } = NextAuth(authConfig)

// ── Edge-compatible rate limiter for auth endpoints ────────────────
// 20 requests per IP per 60 s — covers /api/auth/* and /api/auth/check-email
const authRateMap = new Map<string, { count: number; resetAt: number }>()
const AUTH_MAX = 20
const AUTH_WINDOW = 60_000 // 1 minute

function authRateLimited(req: NextRequest): NextResponse | null {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  const now = Date.now()
  const entry = authRateMap.get(ip)

  if (!entry || now > entry.resetAt) {
    authRateMap.set(ip, { count: 1, resetAt: now + AUTH_WINDOW })
    return null
  }

  entry.count++
  if (entry.count > AUTH_MAX) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    )
  }
  return null
}

export default auth((req) => {
  // ── Rate-limit all auth-related routes ──────────────────────────
  if (req.nextUrl.pathname.startsWith('/api/auth')) {
    const blocked = authRateLimited(req)
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

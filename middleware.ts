import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { NextResponse } from "next/server"
import { checkRateLimit, getClientIp } from "@/lib/rateLimit"

const { auth } = NextAuth(authConfig)

// 20 requests per IP per 60 s — covers /api/auth/* and /api/auth/check-email.
// Backed by Upstash Redis when configured (edge-compatible REST client), so
// the limit is enforced consistently across all serverless instances.
async function authRateLimited(req: Request): Promise<NextResponse | null> {
  const ip = getClientIp(req)
  const { success } = await checkRateLimit('middleware-auth', ip, { max: 20, windowSeconds: 60 })
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    )
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
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!req.auth) {
      return Response.redirect(new URL('/', req.url))
    }
    // Cached isAdmin flag (see auth.ts jwt callback) — the API routes behind
    // this UI re-verify isAdmin against the database on every request, so
    // this is a defense-in-depth gate, not the sole authorization check.
    if (!req.auth.user?.isAdmin) {
      return Response.redirect(new URL('/', req.url))
    }
  }
  if (req.nextUrl.pathname.startsWith('/api/admin')) {
    if (!req.auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!req.auth.user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }
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

import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
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
    '/dashboard/:path*',
    '/log/:path*',
    '/api/user/:path*',
    '/api/food-logs/:path*',
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/food-search-unified/:path*'
  ]
}

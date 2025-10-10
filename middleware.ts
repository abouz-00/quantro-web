import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  console.log('🔐 Middleware check:', {
    path: req.nextUrl.pathname,
    hasAuth: !!req.auth,
    userId: req.auth?.user?.id
  });

  // Add any additional middleware logic here
  if (!req.auth && req.nextUrl.pathname.startsWith('/dashboard')) {
    return Response.redirect(new URL('/', req.url))
  }
  // Allow authenticated users to access /log
  if (!req.auth && req.nextUrl.pathname === '/log') {
    return Response.redirect(new URL('/', req.url))
  }
  if (!req.auth && req.nextUrl.pathname.startsWith('/api/user')) {
    console.log('❌ Unauthorized access to /api/user');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!req.auth && req.nextUrl.pathname.startsWith('/api/food-logs')) {
    console.log('❌ Unauthorized access to /api/food-logs');
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
    '/api/admin/:path*'
  ]
}

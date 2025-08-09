import { auth } from "@/lib/auth"

export default auth((req) => {
  // Add any additional middleware logic here
  if (!req.auth && req.nextUrl.pathname.startsWith('/dashboard')) {
    return Response.redirect(new URL('/', req.url))
  }
  if (!req.auth && req.nextUrl.pathname.startsWith('/api/user')) {
    return Response.redirect(new URL('/api/auth/signin', req.url))
  }
  if (!req.auth && req.nextUrl.pathname.startsWith('/api/food-logs')) {
    return Response.redirect(new URL('/api/auth/signin', req.url))
  }
})

export const config = {
  matcher: ['/dashboard/:path*', '/api/user/:path*', '/api/food-logs/:path*']
}

import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  })

  // For demonstration purposes, we are bypassing full Supabase Auth
  // and instead using a simple cookie-based access check.
  const hasAccess = request.cookies.has('demo_access');

  // Protect /mp routes
  if (request.nextUrl.pathname.startsWith('/mp') && !hasAccess) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect logged-in users away from /login
  if (request.nextUrl.pathname.startsWith('/login') && hasAccess) {
    const url = request.nextUrl.clone()
    url.pathname = '/mp/submissions'
    return NextResponse.redirect(url)
  }

  return response
}

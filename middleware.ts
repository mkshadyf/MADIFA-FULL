import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is not signed in and the current path is not /signin,
  // redirect the user to /signin
  if (!session && !req.nextUrl.pathname.startsWith('/(auth)')) {
    return NextResponse.redirect(new URL('/signin', req.url))
  }

  // If user is signed in and the current path is /signin,
  // redirect the user to /browse
  if (session && req.nextUrl.pathname.startsWith('/(auth)')) {
    return NextResponse.redirect(new URL('/browse', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session }
  } = await supabase.auth.getSession()

  // Protected routes
  if (req.nextUrl.pathname.startsWith('/browse') ||
    req.nextUrl.pathname.startsWith('/watch') ||
    req.nextUrl.pathname.startsWith('/profile')) {
    if (!session) {
      return NextResponse.redirect(new URL('/signin', req.url))
    }
  }

  // Auth routes (when already logged in)
  if (session && (
    req.nextUrl.pathname.startsWith('/signin') ||
    req.nextUrl.pathname.startsWith('/signup')
  )) {
    return NextResponse.redirect(new URL('/browse', req.url))
  }

  return res
}

export const config = {
  matcher: [
    '/browse/:path*',
    '/watch/:path*',
    '/profile/:path*',
    '/signin',
    '/signup'
  ]
} 
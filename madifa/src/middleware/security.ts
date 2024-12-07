import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// CSP Directives
const cspDirectives = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://apis.google.com', 'https://player.vimeo.com'],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'https:', 'blob:'],
  'font-src': ["'self'"],
  'connect-src': [
    "'self'",
    'https://api.vimeo.com',
    'https://*.supabase.co',
    'wss://*.supabase.co',
    'https://vitals.vercel-insights.com'
  ],
  'media-src': ["'self'", 'https://player.vimeo.com'],
  'frame-src': ["'self'", 'https://player.vimeo.com'],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': []
}

// Security Headers
const securityHeaders = {
  // HSTS
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',

  // Prevent clickjacking
  'X-Frame-Options': 'DENY',

  // XSS Protection
  'X-XSS-Protection': '1; mode=block',

  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // Referrer Policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions Policy
  'Permissions-Policy': [
    'accelerometer=()',
    'camera=()',
    'geolocation=()',
    'gyroscope=()',
    'magnetometer=()',
    'microphone=()',
    'payment=()',
    'usb=()'
  ].join(', '),

  // Content Security Policy
  'Content-Security-Policy': Object.entries(cspDirectives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ')
}

// Report-Only CSP for testing
const reportOnlyCSP = {
  ...cspDirectives,
  'report-uri': ['/api/csp-report']
}

export function middleware(request: NextRequest) {
  // Get response
  const response = NextResponse.next()

  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Apply Report-Only CSP in development
  if (process.env.NODE_ENV === 'development') {
    response.headers.set(
      'Content-Security-Policy-Report-Only',
      Object.entries(reportOnlyCSP)
        .map(([key, values]) => `${key} ${values.join(' ')}`)
        .join('; ')
    )
  }

  return response
}

// Configure paths that require security headers
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/csp-report (CSP reporting endpoint)
     * 2. /_next (Next.js internals)
     * 3. /_static (static files)
     * 4. /_vercel (Vercel internals)
     * 5. /favicon.ico, /sitemap.xml (static files)
     */
    '/((?!api/csp-report|_next|_static|_vercel|favicon.ico|sitemap.xml).*)',
  ],
} 
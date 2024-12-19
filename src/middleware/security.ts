import { env } from '@/lib/config/env'
import { logger } from '@/lib/logger'

const ALLOWED_ORIGINS = [
  env.VITE_APP_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean)

export async function securityMiddleware(request: Request): Promise<Response> {
  try {
    const origin = request.headers.get('origin')
    const response = new Response(null, {
      status: 200,
      headers: new Headers({
        'Access-Control-Allow-Origin':
          origin && ALLOWED_ORIGINS.includes(origin)
            ? origin
            : ALLOWED_ORIGINS[0],
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
      }),
    })

    return response
  } catch (error) {
    logger.error('Security middleware error:', error)
    return new Response(null, { status: 500 })
  }
}

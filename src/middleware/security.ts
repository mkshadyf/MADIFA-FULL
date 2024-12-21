import type { NextFunction, Request, Response } from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import hpp from 'hpp'
import xss from 'xss-clean'

// Rate limiting
export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
})

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", process.env.VITE_SUPABASE_URL].filter(
        Boolean
      ) as ContentSecurityPolicyDirective[],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: 'same-site' },
  dnsPrefetchControl: true,
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: true,
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
})

// XSS Protection
export const xssProtection = xss()

// Parameter Pollution Protection
export const parameterProtection = hpp()

// CSRF Protection
export const csrfProtection = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers['x-csrf-token']
  if (!token || token !== process.env.CSRF_TOKEN) {
    return res.status(403).json({ error: 'Invalid CSRF token' })
  }
  next()
}

// Input Sanitization
export const sanitizeInput = (input: string): string => {
  return xss()
}

// Apply all security middleware
export const applySecurityMiddleware = (app: any) => {
  app.use(securityHeaders)
  app.use(limiter)
  app.use(xssProtection)
  app.use(parameterProtection)
  app.use('/api', csrfProtection)
}

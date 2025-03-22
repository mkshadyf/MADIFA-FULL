import type { NextFunction, Request, Response } from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import hpp from 'hpp'
import xss from 'xss-clean'

// Security middleware for PWA with full mobile support
// Using proper typing to maintain clean structure

// Define middleware function type
type MiddlewareFunction = (req: Request, res: Response, next: NextFunction) => void;

// Rate limiting
export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
}) as MiddlewareFunction;

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.payfast.co.za'],
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
}) as MiddlewareFunction;

// XSS Protection
export const xssProtection = xss() as MiddlewareFunction;

// Parameter Pollution
export const parameterProtection = hpp() as MiddlewareFunction;

// CSRF Protection - Type-safe implementation
export const csrfProtection: MiddlewareFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers['x-csrf-token'] as string;
  if (!token || token !== process.env.CSRF_TOKEN) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  next();
};

// Input Sanitization
export const sanitizeInput = (input: string): string => {
  return input.replace(/[<>]/g, '');
};

// Define type for Express application
interface ExpressApplication {
  use(middleware: MiddlewareFunction): void;
  use(path: string, middleware: MiddlewareFunction): void;
}

// Apply all security middleware
export const applySecurityMiddleware = (app: ExpressApplication): void => {
  // Helmet middleware for secure headers
  app.use(securityHeaders);
  // Rate limiting middleware to prevent abuse
  app.use(limiter);
  // XSS protection middleware
  app.use(xssProtection);
  // Parameter pollution protection middleware
  app.use(parameterProtection);
  // CSRF protection for API routes
  app.use('/api', csrfProtection);
};

import { createAPIError } from '@/lib/utils/api-error'
import type { Express } from 'express'
import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit'
import helmet from 'helmet'

// Import untyped modules
const hpp = require('hpp')
const xssClean = require('xss-clean')

// API request wrapper with rate limiting and security
export const apiRequest = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw createAPIError(
        response.status,
        error.message || 'API request failed',
        error.code
      )
    }

    return response.json()
  } catch (error) {
    throw createAPIError(500, 'API request failed', 'API_ERROR', error)
  }
}

// API endpoints configuration
export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    refresh: '/api/auth/refresh',
  },
  user: {
    profile: '/api/user/profile',
    settings: '/api/user/settings',
  },
  videos: {
    list: '/api/videos',
    upload: '/api/videos/upload',
    delete: (id: string) => `/api/videos/${id}`,
    update: (id: string) => `/api/videos/${id}`,
  },
  analytics: {
    overview: '/api/analytics/overview',
    realtime: '/api/analytics/realtime',
    reports: '/api/analytics/reports',
  },
}

// API service class
export class APIService {
  private static instance: APIService
  private rateLimiters: Map<string, RateLimitRequestHandler>

  private constructor() {
    this.rateLimiters = new Map()
    this.setupRateLimiters()
  }

  static getInstance(): APIService {
    if (!APIService.instance) {
      APIService.instance = new APIService()
    }
    return APIService.instance
  }

  private setupRateLimiters() {
    // Authentication rate limiters
    this.rateLimiters.set('auth', rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5,
      message: 'Too many login attempts, please try again later',
    }))

    // API rate limiters
    this.rateLimiters.set('api', rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
    }))

    // Upload rate limiters
    this.rateLimiters.set('upload', rateLimit({
      windowMs: 60 * 60 * 1000,
      max: 10,
      message: 'Upload limit reached, please try again later',
    }))
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Apply rate limiting based on endpoint
    const limiter = this.getLimiter(endpoint)
    if (limiter) {
      await new Promise((resolve, reject) => {
        limiter(
          { ip: '127.0.0.1' } as any,
          { json: reject } as any,
          resolve as any
        )
      })
    }

    return apiRequest<T>(endpoint, options)
  }

  private getLimiter(endpoint: string) {
    if (endpoint.includes('/auth/')) {
      return this.rateLimiters.get('auth')
    }
    if (endpoint.includes('/upload')) {
      return this.rateLimiters.get('upload')
    }
    return this.rateLimiters.get('api')
  }
}

export const apiService = APIService.getInstance()

// Configure Express middleware
export function configureAPIMiddleware(app: Express): void {
  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
  })

  // Apply security middleware
  app.use(helmet())
  app.use(hpp())
  app.use(xssClean())
  app.use(limiter)

  // Content Security Policy
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https://api.vimeo.com'],
        fontSrc: ["'self'", 'https:', 'data:'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'", 'https://player.vimeo.com'],
        frameSrc: ["'self'", 'https://player.vimeo.com']
      }
    })
  )
} 
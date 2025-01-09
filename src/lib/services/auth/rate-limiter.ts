import LRUCache from 'lru-cache'

interface RateLimitInfo {
  count: number
  resetAt: number
  blocked: boolean
}

export class AuthRateLimiter {
  private static instance: AuthRateLimiter
  private cache: LRUCache<string, RateLimitInfo>
  private readonly MAX_ATTEMPTS = 5
  private readonly BLOCK_DURATION = 15 * 60 * 1000 // 15 minutes
  private readonly WINDOW_MS = 5 * 60 * 1000 // 5 minutes

  private constructor() {
    this.cache = new LRUCache({
      max: 500, // Maximum number of items to store
      maxAge: this.WINDOW_MS, // Time to live
    })
  }

  static getInstance(): AuthRateLimiter {
    if (!AuthRateLimiter.instance) {
      AuthRateLimiter.instance = new AuthRateLimiter()
    }
    return AuthRateLimiter.instance
  }

  isRateLimited(identifier: string): {
    limited: boolean
    remainingAttempts: number
    blockedUntil?: Date
  } {
    const now = Date.now()
    const info = this.cache.get(identifier) || {
      count: 0,
      resetAt: now + this.WINDOW_MS,
      blocked: false,
    }

    // Check if blocked
    if (info.blocked) {
      if (now < info.resetAt) {
        return {
          limited: true,
          remainingAttempts: 0,
          blockedUntil: new Date(info.resetAt),
        }
      }
      // Unblock if block duration has passed
      info.blocked = false
      info.count = 0
    }

    // Reset count if window has passed
    if (now > info.resetAt) {
      info.count = 0
      info.resetAt = now + this.WINDOW_MS
    }

    // Increment count
    info.count++

    // Check if should be blocked
    if (info.count > this.MAX_ATTEMPTS) {
      info.blocked = true
      info.resetAt = now + this.BLOCK_DURATION
      this.cache.set(identifier, info)
      return {
        limited: true,
        remainingAttempts: 0,
        blockedUntil: new Date(info.resetAt),
      }
    }

    this.cache.set(identifier, info)
    return {
      limited: false,
      remainingAttempts: this.MAX_ATTEMPTS - info.count,
    }
  }

  reset(identifier: string): void {
    this.cache.del(identifier)
  }
}

export const authRateLimiter = AuthRateLimiter.getInstance()

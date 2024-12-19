import type { PostgrestError } from '@supabase/supabase-js'

import { toast } from '@/components/ui/toast'

export type SupabaseError =
  | PostgrestError
  | {
      code: string
      message: string
      details: unknown
    }

export type ApiError = {
  status: number
  code: string
  message: string
  details?: unknown
}

export type VideoError = {
  type: 'playback' | 'network' | 'decode' | 'format'
  code: string
  message: string
  details?: unknown
}

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context: string,
    public readonly originalError?: unknown
  ) {
    super(message)
    this.name = 'AppError'
  }
}

type ErrorContext = {
  componentName?: string
  functionName: string
  action: string
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return 'An unexpected error occurred'
}

export function isSupabaseError(error: unknown): error is SupabaseError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    ('details' in error || // PostgrestError
      'hint' in error || // PostgrestError
      'statusCode' in error) // AuthError
  )
}

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'code' in error &&
    'message' in error
  )
}

export function isVideoError(error: unknown): error is VideoError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    'code' in error &&
    'message' in error
  )
}

export function handleError(error: unknown, context: ErrorContext): void {
  const errorMessage = getErrorMessage(error)
  const contextString = `${context.componentName ? `${context.componentName}/` : ''}${context.functionName}: ${context.action}`

  console.error(`Error in ${contextString}:`, error)

  // Handle specific error types
  if (error instanceof AppError) {
    switch (error.code) {
      case ErrorCodes.AUTH.NOT_AUTHENTICATED:
        toast.error('Authentication error. Please sign in again.')
        break
      case ErrorCodes.NETWORK.OFFLINE:
        toast.error('Network error. Please check your connection.')
        break
      case ErrorCodes.AUTH.INSUFFICIENT_PERMISSIONS:
        toast.error("You don't have permission to perform this action.")
        break
      case ErrorCodes.SUBSCRIPTION.EXPIRED:
        toast.error(
          'Subscription error. Please check your subscription status.'
        )
        break
      case ErrorCodes.CONTENT.NOT_FOUND:
        toast.error('Content error. Please try again later.')
        break
      default:
        toast.error(errorMessage)
    }
    return
  }

  if (isSupabaseError(error)) {
    switch (error.code) {
      case 'PGRST301':
      case '23505': // Unique violation
        toast.error('Database error. Please try again.')
        break
      case 'auth/invalid-email':
        toast.error('Invalid email address.')
        break
      case 'auth/user-not-found':
        toast.error('User not found.')
        break
      case 'auth/wrong-password':
        toast.error('Invalid password.')
        break
      case 'auth/email-already-in-use':
        toast.error('Email already in use.')
        break
      case 'auth/weak-password':
        toast.error('Password is too weak.')
        break
      case 'auth/operation-not-allowed':
        toast.error('Operation not allowed.')
        break
      case 'auth/popup-closed-by-user':
        toast.error('Sign in popup was closed.')
        break
      default:
        toast.error(errorMessage)
    }
    return
  }

  if (isApiError(error)) {
    switch (error.status) {
      case 400:
        toast.error('Invalid request. Please check your input.')
        break
      case 401:
        toast.error('Unauthorized. Please sign in again.')
        break
      case 403:
        toast.error("Forbidden. You don't have permission.")
        break
      case 404:
        toast.error('Resource not found.')
        break
      case 429:
        toast.error('Too many requests. Please try again later.')
        break
      case 500:
        toast.error('Server error. Please try again later.')
        break
      default:
        toast.error(errorMessage)
    }
    return
  }

  if (isVideoError(error)) {
    switch (error.type) {
      case 'playback':
        toast.error('Playback error. Please try again.')
        break
      case 'network':
        toast.error('Network error. Please check your connection.')
        break
      case 'decode':
        toast.error('Video decode error. Please try a different quality.')
        break
      case 'format':
        toast.error('Unsupported video format.')
        break
      default:
        toast.error(errorMessage)
    }
    return
  }

  // Default error handling
  toast.error(errorMessage)
}

export function createErrorContext(
  componentName: string,
  functionName: string,
  action: string
): ErrorContext {
  return {
    componentName,
    functionName,
    action,
  }
}

export function throwAppError(
  message: string,
  code: string,
  context: string,
  originalError?: unknown
): never {
  throw new AppError(message, code, context, originalError)
}

export const ErrorCodes = {
  AUTH: {
    INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
    SESSION_EXPIRED: 'AUTH_SESSION_EXPIRED',
    NOT_AUTHENTICATED: 'AUTH_NOT_AUTHENTICATED',
    INSUFFICIENT_PERMISSIONS: 'AUTH_INSUFFICIENT_PERMISSIONS',
  },
  SUBSCRIPTION: {
    EXPIRED: 'SUBSCRIPTION_EXPIRED',
    PAYMENT_FAILED: 'SUBSCRIPTION_PAYMENT_FAILED',
    INVALID_TIER: 'SUBSCRIPTION_INVALID_TIER',
  },
  CONTENT: {
    NOT_FOUND: 'CONTENT_NOT_FOUND',
    ACCESS_DENIED: 'CONTENT_ACCESS_DENIED',
    INVALID_FORMAT: 'CONTENT_INVALID_FORMAT',
  },
  NETWORK: {
    OFFLINE: 'NETWORK_OFFLINE',
    TIMEOUT: 'NETWORK_TIMEOUT',
    REQUEST_FAILED: 'NETWORK_REQUEST_FAILED',
  },
  VIDEO: {
    PLAYBACK_ERROR: 'VIDEO_PLAYBACK_ERROR',
    NETWORK_ERROR: 'VIDEO_NETWORK_ERROR',
    DECODE_ERROR: 'VIDEO_DECODE_ERROR',
    FORMAT_ERROR: 'VIDEO_FORMAT_ERROR',
  },
  API: {
    BAD_REQUEST: 'API_BAD_REQUEST',
    UNAUTHORIZED: 'API_UNAUTHORIZED',
    FORBIDDEN: 'API_FORBIDDEN',
    NOT_FOUND: 'API_NOT_FOUND',
    RATE_LIMIT: 'API_RATE_LIMIT',
    SERVER_ERROR: 'API_SERVER_ERROR',
  },
} as const

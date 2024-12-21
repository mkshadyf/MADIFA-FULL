import type { StripeError } from '@/types/stripe'
import type { VimeoError } from '@/types/vimeo'
import * as Sentry from '@sentry/browser'

export class AppError extends Error {
  public code: string
  public context?: Record<string, unknown>

  constructor(message: string, code: string, context?: Record<string, unknown>) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.context = context
  }
}

export function handleStripeError(error: StripeError): AppError {
  let message = 'An error occurred while processing your payment'
  let code = 'STRIPE_ERROR'

  switch (error.type) {
    case 'card_error':
      message = error.message || 'Your card was declined'
      code = 'CARD_ERROR'
      break
    case 'validation_error':
      message = error.message || 'Invalid payment details'
      code = 'VALIDATION_ERROR'
      break
    case 'rate_limit_error':
      message = 'Too many requests. Please try again later'
      code = 'RATE_LIMIT_ERROR'
      break
    case 'authentication_error':
      message = 'Authentication failed'
      code = 'AUTH_ERROR'
      break
    case 'api_error':
      message = 'Service temporarily unavailable'
      code = 'API_ERROR'
      break
    case 'idempotency_error':
      message = 'Duplicate request detected'
      code = 'IDEMPOTENCY_ERROR'
      break
    case 'invalid_request_error':
      message = error.message || 'Invalid request'
      code = 'INVALID_REQUEST'
      break
  }

  return new AppError(message, code, {
    type: error.type,
    code: error.code,
    param: error.param,
  })
}

export function handleVimeoError(error: VimeoError): AppError {
  let message = 'An error occurred while processing your video'
  let code = 'VIMEO_ERROR'

  switch (error.error_code) {
    case 'NOT_FOUND':
      message = 'Video not found'
      code = 'VIDEO_NOT_FOUND'
      break
    case 'INVALID_INPUT':
      message = error.developer_message || 'Invalid input'
      code = 'INVALID_INPUT'
      break
    case 'QUOTA_EXCEEDED':
      message = 'Upload quota exceeded'
      code = 'QUOTA_EXCEEDED'
      break
    case 'UNAUTHORIZED':
      message = 'Unauthorized access'
      code = 'UNAUTHORIZED'
      break
    case 'FORBIDDEN':
      message = 'Access forbidden'
      code = 'FORBIDDEN'
      break
    case 'UPLOAD_ERROR':
      message = 'Failed to upload video'
      code = 'UPLOAD_ERROR'
      break
    case 'TRANSCODE_ERROR':
      message = 'Failed to process video'
      code = 'TRANSCODE_ERROR'
      break
  }

  return new AppError(message, code, {
    error: error.error,
    name: error.name,
    status: error.status,
    developer_message: error.developer_message,
  })
}

export function handleError(error: Error | AppError | unknown): AppError {
  // If it's already an AppError, return it
  if (error instanceof AppError) {
    return error
  }

  // If it's a regular Error, convert it to an AppError
  if (error instanceof Error) {
    return new AppError(error.message, 'UNKNOWN_ERROR', {
      name: error.name,
      stack: error.stack,
    })
  }

  // For unknown errors, create a generic AppError
  return new AppError(
    'An unexpected error occurred',
    'UNKNOWN_ERROR',
    error as Record<string, unknown>
  )
}

export function logError(error: Error | AppError | unknown): void {
  const appError = handleError(error)

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      message: appError.message,
      code: appError.code,
      context: appError.context,
      stack: appError.stack,
    })
  }

  // Log to Sentry in production
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(appError, {
      tags: {
        code: appError.code,
      },
      extra: appError.context,
    })
  }
}

export function showErrorMessage(error: Error | AppError | unknown): string {
  const appError = handleError(error)

  // Return user-friendly error message
  switch (appError.code) {
    case 'CARD_ERROR':
    case 'VALIDATION_ERROR':
    case 'INVALID_REQUEST':
      return appError.message
    case 'RATE_LIMIT_ERROR':
      return 'Too many requests. Please try again later.'
    case 'AUTH_ERROR':
      return 'Authentication failed. Please try again.'
    case 'API_ERROR':
      return 'Service temporarily unavailable. Please try again later.'
    case 'VIDEO_NOT_FOUND':
      return 'The requested video could not be found.'
    case 'QUOTA_EXCEEDED':
      return 'Upload quota exceeded. Please try again later.'
    case 'UPLOAD_ERROR':
      return 'Failed to upload video. Please try again.'
    case 'TRANSCODE_ERROR':
      return 'Failed to process video. Please try again.'
    default:
      return process.env.NODE_ENV === 'development'
        ? appError.message
        : 'An unexpected error occurred. Please try again later.'
  }
}


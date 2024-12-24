import type { ApiError, ErrorContext } from '@/types'

export const createAPIError = (
  message: string,
  code: string,
  context?: ErrorContext
): ApiError => {
  return {
    name: 'ApiError',
    code,
    message,
    status: 500,
    details: context?.details
  }
}

export const createErrorContext = (service: string, operation: string, details?: unknown): ErrorContext => {
  return {
    operation: `${service}.${operation}`,
    details: details ? { details } : undefined
  }
}

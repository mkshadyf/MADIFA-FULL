import type { ApiError, BaseError } from '@/types';

type ErrorDetails = Record<string, unknown>

export interface ErrorContext {
  operation: string;
  details?: unknown;
}

export enum ErrorCodes {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  API_ERROR = 'API_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  AUTH = 'AUTH'
}

export class AppError extends Error {
  code: string
  details?: ErrorDetails

  constructor(message: string, code: string = ErrorCodes.UNKNOWN_ERROR, details?: ErrorDetails) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.details = details
  }
}

export const throwAppError = (message: string, code: string = ErrorCodes.UNKNOWN_ERROR, details?: ErrorDetails): never => {
  throw new AppError(message, code, details)
}

const mergeDetails = (context?: ErrorContext, additional?: ErrorDetails): ErrorDetails | undefined => {
  if (!context?.details && !additional) {
    return undefined
  }

  return {
    ...(context?.details as ErrorDetails || {}),
    ...(additional || {})
  }
}

export const createApiError = (error: unknown, context: ErrorContext): ApiError => {
  const baseError: ApiError = {
    name: 'ApiError',
    code: 'API_ERROR',
    message: 'An unexpected error occurred',
    status: 500,
    details: context.details
  }

  if (error instanceof Error) {
    return {
      name: baseError.name,
      code: error.name,
      message: error.message,
      status: baseError.status,
      details: mergeDetails(context, { stack: error.stack })
    }
  }

  if (typeof error === 'object' && error !== null) {
    const apiError = error as Record<string, unknown>
    return {
      name: baseError.name,
      code: (apiError.code as string) || baseError.code,
      message: (apiError.message as string) || baseError.message,
      status: (apiError.status as number) || baseError.status,
      details: mergeDetails(context, apiError as ErrorDetails)
    }
  }

  return baseError
}

export const handleApiError = (error: unknown, context: ErrorContext): ApiError => {
  const apiError = createApiError(error, context)
  console.error(`API Error (${context.operation}):`, apiError)
  return apiError
}

export const handleError = (error: unknown, context: ErrorContext): BaseError => {
  const baseError: BaseError = {
    name: 'Error',
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    details: context.details
  }

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      code: baseError.code,
      stack: error.stack,
      details: mergeDetails(context, { stack: error.stack })
    }
  }

  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, unknown>
    return {
      name: baseError.name,
      message: (errorObj.message as string) || baseError.message,
      code: (errorObj.code as string) || baseError.code,
      details: mergeDetails(context, errorObj as ErrorDetails)
    }
  }

  return baseError
}

export const createAPIError = (message: string, code: string, context?: ErrorContext): ApiError => {
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

export const handleStripeError = (error: unknown): Error => {
  if (error instanceof Error) {
    return error
  }

  if (typeof error === 'object' && error !== null) {
    const stripeError = error as { type?: string; message?: string }
    return new Error(stripeError.message || 'An unexpected Stripe error occurred')
  }

  return new Error('An unexpected Stripe error occurred')
}

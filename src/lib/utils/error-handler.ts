import type {
  ApiError,
  AppError,
  ErrorContext as BaseErrorContext,
  NetworkError,
} from '@/types/error'

interface RequestDetails {
  method?: string
  status?: number
  url?: string
}

export function createErrorContext(
  service: string,
  operation: string,
  details?: unknown
): BaseErrorContext {
  return {
    service,
    operation,
    details,
  }
}

export function handleApiError(
  error: unknown,
  context: BaseErrorContext | { operation: string; details?: any }
): ApiError {
  const details = ('details' in context ? context.details : undefined) as RequestDetails | undefined
  const operation = 'operation' in context ? context.operation : ''

  if (error instanceof Error) {
    return {
      name: 'ApiError',
      code: error.name === 'ApiError' ? error.name : 'UNKNOWN_ERROR',
      message: error.message,
      status: details?.status || 500,
      path: operation,
      method: details?.method,
      originalError: error,
      stack: error.stack,
    }
  }

  return {
    name: 'ApiError',
    code: 'unknown_error',
    message: 'An unknown error occurred',
    status: details?.status || 500,
    path: operation,
    method: details?.method,
  }
}

export function handleNetworkError(
  error: unknown,
  context: BaseErrorContext
): NetworkError {
  const details = context.details as RequestDetails | undefined

  if (error instanceof Error) {
    return {
      name: 'NetworkError',
      code: 'network_error',
      message: error.message,
      status: details?.status,
      url: details?.url,
      method: details?.method,
      originalError: error,
      stack: error.stack,
    }
  }

  return {
    name: 'NetworkError',
    code: 'network_error',
    message: 'A network error occurred',
    status: details?.status,
    url: details?.url,
    method: details?.method,
  }
}

export function handleAppError(
  error: unknown,
  context: BaseErrorContext
): AppError {
  if (error instanceof Error) {
    return {
      name: 'AppError',
      code: 'app_error',
      message: error.message,
      context,
      status: 500,
      originalError: error,
      stack: error.stack,
    }
  }

  return {
    name: 'AppError',
    code: 'unknown_error',
    message: 'An application error occurred',
    context,
    status: 500,
  }
}

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    'code' in error &&
    'message' in error &&
    'status' in error &&
    'path' in error
  )
}

export function isNetworkError(error: unknown): error is NetworkError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    error.name === 'NetworkError' &&
    'code' in error &&
    'message' in error
  )
}

export function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    error.name === 'AppError' &&
    'code' in error &&
    'message' in error
  )
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unknown error occurred'
}

export class ErrorHandler {
  handleApiError(status: number, data: any) {
    const error = {
      message: data.message || 'An unknown error occurred',
      code: data.code || 'UNKNOWN_ERROR'
    }

    switch (status) {
      case 400:
        error.code = 'BAD_REQUEST'
        break
      case 401:
        error.code = 'UNAUTHORIZED'
        break
      case 403:
        error.code = 'FORBIDDEN'
        break
      case 404:
        error.code = 'NOT_FOUND'
        break
      case 500:
        error.code = 'INTERNAL_SERVER_ERROR'
        break
      default:
        error.code = 'UNKNOWN_ERROR'
    }

    return error
  }
}

import type {
  ApiError,
  AppError,
  BaseError,
  ErrorContext,
  NetworkError,
} from '@/types/error'

interface ErrorDetails {
  userId?: string
  environment?: string
  version?: string
  timestamp?: string
  [key: string]: unknown
}

class ErrorMonitoringService {
  private static instance: ErrorMonitoringService
  private isInitialized = false
  private context: ErrorContext = {
    service: 'app',
    operation: 'startup',
    details: {} as ErrorDetails,
  }

  private constructor() {
    // Private constructor to enforce singleton
  }

  public static getInstance(): ErrorMonitoringService {
    if (!ErrorMonitoringService.instance) {
      ErrorMonitoringService.instance = new ErrorMonitoringService()
    }
    return ErrorMonitoringService.instance
  }

  public initialize(config: {
    environment: string
    version?: string
    dsn?: string
  }): void {
    if (this.isInitialized) return

    const details: ErrorDetails = {
      environment: config.environment,
      version: config.version,
    }

    this.context = {
      service: 'app',
      operation: 'startup',
      details,
    }

    this.isInitialized = true
  }

  public captureError(
    error: Error | AppError,
    context?: Partial<ErrorContext>
  ): void {
    // Normalize error to AppError format
    const normalizedError = this.normalizeError(error)

    // Merge contexts
    const mergedContext: ErrorContext = {
      service: context?.service || this.context.service,
      operation: context?.operation || this.context.operation,
      details: {
        ...(this.context.details as ErrorDetails),
        ...(context?.details as ErrorDetails),
      },
    }

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error captured:', normalizedError, mergedContext)
    }

    // Here you would send the error to your error monitoring service
    const errorLog = {
      ...normalizedError,
      context: mergedContext,
    }

    // You could send this to your backend API or error monitoring service
    console.error('Error logged:', errorLog)
  }

  public captureMessage(
    message: string,
    context?: Partial<ErrorContext>
  ): void {
    const timestamp = new Date().toISOString()
    const mergedContext: ErrorContext = {
      service: context?.service || this.context.service,
      operation: context?.operation || this.context.operation,
      details: {
        ...(this.context.details as ErrorDetails),
        ...(context?.details as ErrorDetails),
        timestamp,
      },
    }

    const log = {
      message,
      timestamp,
      context: mergedContext,
    }

    console.log('Message logged:', log)
  }

  public setUser(userId: string): void {
    const details = {
      ...(this.context.details as ErrorDetails),
      userId,
    }

    this.context = {
      ...this.context,
      details,
    }
  }

  public clearUser(): void {
    const details = { ...(this.context.details as ErrorDetails) }
    delete details.userId

    this.context = {
      ...this.context,
      details,
    }
  }

  public setContext(context: Partial<ErrorContext>): void {
    this.context = {
      service: context.service || this.context.service,
      operation: context.operation || this.context.operation,
      details: {
        ...(this.context.details as ErrorDetails),
        ...(context.details as ErrorDetails),
      },
    }
  }

  public clearContext(): void {
    this.context = {
      service: 'app',
      operation: 'startup',
      details: {} as ErrorDetails,
    }
  }

  private normalizeError(error: Error | AppError): BaseError {
    if (this.isAppError(error)) {
      return error
    }

    // Convert standard Error to BaseError
    return {
      name: error.name || 'UnknownError',
      message: error.message,
      stack: error.stack,
      code: 'UNKNOWN_ERROR',
    }
  }

  private isAppError(error: Error | AppError): error is AppError {
    return 'code' in error && 'handled' in error
  }

  public handleApiError(error: unknown): ApiError {
    if (error instanceof Error) {
      return {
        name: 'ApiError',
        message: error.message,
        code: 'API_ERROR',
        status: 500,
        path: '',
        method: '',
      }
    }

    return {
      name: 'ApiError',
      message: 'An unknown error occurred',
      code: 'API_ERROR',
      status: 500,
      path: '',
      method: '',
    }
  }

  public handleNetworkError(error: unknown): NetworkError {
    if (error instanceof Error) {
      return {
        name: 'NetworkError',
        message: error.message,
        code: 'NETWORK_ERROR',
        url: '',
      }
    }

    return {
      name: 'NetworkError',
      message: 'A network error occurred',
      code: 'NETWORK_ERROR',
      url: '',
    }
  }
}

export const errorMonitoring = ErrorMonitoringService.getInstance()

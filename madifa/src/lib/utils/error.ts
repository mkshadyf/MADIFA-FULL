import { env } from "@/config/env"

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
    public meta?: Record<string, any>
  ) {
    super(message)
    this.name = 'AppError'
  }

  static isAppError(error: unknown): error is AppError {
    return error instanceof AppError
  }

  static fromUnknown(error: unknown): AppError {
    if (AppError.isAppError(error)) return error

    if (error instanceof Error) {
      return new AppError(error.message, 'UNKNOWN_ERROR', 500)
    }

    return new AppError(
      'An unexpected error occurred',
      'UNKNOWN_ERROR',
      500
    )
  }
}

export function handleError(error: unknown) {
  const appError = AppError.fromUnknown(error)

  if (env.NODE_ENV === 'development') {
    console.error(`[${appError.code}]`, appError)
  }

  return {
    message: appError.message,
    code: appError.code,
    statusCode: appError.statusCode,
    meta: appError.meta
  }
} 
export interface BaseError {
  name: string
  code: string
  message: string
  originalError?: unknown
  stack?: string
}

export interface ApiError extends BaseError {
  status: number
  path: string
  method?: string
}

export interface SupabaseError extends BaseError {
  code: string
  details?: string
  hint?: string
}

export interface ValidationError extends BaseError {
  field: string
  value: unknown
}

export interface NetworkError extends BaseError {
  status?: number
  url?: string
  method?: string
}

export interface ErrorContext {
  service: string
  operation: string
  details?: unknown
  componentStack?: string
  timestamp?: string
  environment?: string
  metadata?: Record<string, unknown>
}

export interface AppError extends BaseError {
  context?: ErrorContext
  status?: number
}

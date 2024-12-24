export interface BaseError extends Error {
  code: string
  details?: unknown
}

export interface ApiError extends BaseError {
  name: 'ApiError'
  code: string
  message: string
  status: number
  details?: unknown
}

export interface VimeoError extends BaseError {
  name: 'VimeoError'
  code: string
  message: string
  developer_message: string
  error_code: number | string
  status?: number
  link?: string | null
}

export interface AuthError extends BaseError {
  name: 'AuthError'
  code: string
  message: string
  status: number
  details?: unknown
}

export interface ValidationError extends BaseError {
  name: 'ValidationError'
  code: string
  message: string
  status: number
  details?: {
    field: string
    message: string
  }[]
}

export interface NetworkError extends BaseError {
  name: 'NetworkError'
  code: string
  message: string
  status: number
  details?: unknown
}

export interface DatabaseError extends BaseError {
  name: 'DatabaseError'
  code: string
  message: string
  status: number
  details?: unknown
}

export interface StorageError extends BaseError {
  name: 'StorageError'
  code: string
  message: string
  status: number
  details?: unknown
}

export interface PermissionError extends BaseError {
  name: 'PermissionError'
  code: string
  message: string
  status: number
  details?: unknown
}

export interface QuotaError extends BaseError {
  name: 'QuotaError'
  code: string
  message: string
  status: number
  details?: {
    limit: number
    usage: number
    remaining: number
  }
}

export interface RateLimitError extends BaseError {
  name: 'RateLimitError'
  code: string
  message: string
  status: number
  details?: {
    limit: number
    remaining: number
    reset: number
  }
}

export interface TimeoutError extends BaseError {
  name: 'TimeoutError'
  code: string
  message: string
  status: number
  details?: {
    timeout: number
  }
}

export type AppError =
  | ApiError
  | VimeoError
  | AuthError
  | ValidationError
  | NetworkError
  | DatabaseError
  | StorageError
  | PermissionError
  | QuotaError
  | RateLimitError
  | TimeoutError 
export interface ApiError {
  name: string
  code: string
  message: string
  status: number
  details?: unknown
}

export interface ApiResponse<T> {
  data: T | null
  error: ApiError | null
}

export interface ApiContext {
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  details?: unknown
}

export interface ErrorContext {
  operation: string
  details?: unknown
}

export interface ApiClientOptions {
  baseUrl: string
  headers?: Record<string, string>
  onError?: (error: ApiError) => void
  onResponse?: <T>(response: ApiResponse<T>) => void
}

export interface ApiRequestOptions extends RequestInit {
  query?: Record<string, string>
  headers?: Record<string, string>
  signal?: AbortSignal
}

export interface ApiRequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string
  body?: unknown
  options?: ApiRequestOptions
}

export interface RequestEvent {
  request: Request
  env: {
    SUPABASE_URL: string
    SUPABASE_ANON_KEY: string
    [key: string]: string
  }
}

export interface ErrorResponse {
  error: string
  message?: string
  status?: number
}

export interface SuccessResponse<T = unknown> {
  data: T
  message?: string
}

export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse 
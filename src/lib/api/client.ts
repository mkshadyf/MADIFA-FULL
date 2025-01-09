import { getAccessToken } from '@/lib/utils/auth'
import { ErrorHandler } from '@/lib/utils/error-handler'

interface RequestOptions extends RequestInit {
  timeout?: number
}

interface ApiResponse<T = any> {
  data: T
  error: null | {
    message: string
    code: string
  }
}

export class ApiClient {
  private baseUrl: string
  private errorHandler: ErrorHandler

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
    this.errorHandler = new ErrorHandler()
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    const token = await getAccessToken()

    const headers = new Headers({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    })

    const init: RequestInit = {
      ...options,
      headers,
      body: options.body ? JSON.stringify(options.body) : null
    }

    try {
      const response = await fetch(url, init)
      const data = await response.json()

      if (!response.ok) {
        throw this.errorHandler.handleApiError(response.status, data)
      }

      return { data, error: null }
    } catch (error) {
      return {
        data: null as any,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          code: 'UNKNOWN_ERROR'
        }
      }
    }
  }

  public async get<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  public async post<T>(endpoint: string, body: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body })
  }

  public async put<T>(endpoint: string, body: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body })
  }

  public async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }
}

export const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_URL || '')

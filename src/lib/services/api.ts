import { createErrorContext, handleApiError } from '@/lib/utils/error-handler'
import type { ApiResponse } from '@/types'

interface FetchOptions extends RequestInit {
  baseUrl?: string
  query?: Record<string, string>
  retries?: number
  timeout?: number
}

interface ApiClientOptions {
  baseUrl: string
  defaultHeaders?: HeadersInit
  timeout?: number
  retries?: number
}

export class ApiClient {
  private baseUrl: string
  private defaultHeaders: HeadersInit
  private timeout: number
  private retries: number

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl
    this.defaultHeaders = options.defaultHeaders || {}
    this.timeout = options.timeout || 30000
    this.retries = options.retries || 3
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type')
    const isJson = contentType?.includes('application/json')

    if (!response.ok) {
      const error = isJson ? await response.json() : { message: response.statusText }
      throw handleApiError(error, createErrorContext('api', 'handleResponse'))
    }

    if (!isJson) {
      return { data: null } as ApiResponse<T>
    }

    const data = await response.json()
    return { data } as ApiResponse<T>
  }

  private buildUrl(path: string, query?: Record<string, string>): string {
    const url = new URL(path, this.baseUrl)
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value.toString())
        }
      })
    }
    return url.toString()
  }

  async get<T>(path: string, options: FetchOptions = {}): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path, options.query)
    const response = await fetch(url, {
      ...options,
      method: 'GET',
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    })
    return this.handleResponse<T>(response)
  }

  async post<T>(path: string, data?: unknown, options: FetchOptions = {}): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path, options.query)
    const response = await fetch(url, {
      ...options,
      method: 'POST',
      headers: {
        ...this.defaultHeaders,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    })
    return this.handleResponse<T>(response)
  }

  async put<T>(path: string, data?: unknown, options: FetchOptions = {}): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path, options.query)
    const response = await fetch(url, {
      ...options,
      method: 'PUT',
      headers: {
        ...this.defaultHeaders,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    })
    return this.handleResponse<T>(response)
  }

  async delete<T>(path: string, options: FetchOptions = {}): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path, options.query)
    const response = await fetch(url, {
      ...options,
      method: 'DELETE',
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    })
    return this.handleResponse<T>(response)
  }
}

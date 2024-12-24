import { handleApiError } from '@/lib/utils/error-handler'
import type { ApiContext, ApiResponse, ErrorContext } from '@/types'

export class ApiClient {
  private readonly baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private createErrorContext(context: ApiContext): ErrorContext {
    return {
      operation: `${context.method} ${context.path}`,
      details: context.details
    }
  }

  async get<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const context: ApiContext = {
      path,
      method: 'GET',
      details: options.body ? JSON.parse(options.body as string) : undefined
    }

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        method: 'GET'
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          data: null,
          error: handleApiError(data, this.createErrorContext(context))
        }
      }

      return {
        data,
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: handleApiError(error, this.createErrorContext(context))
      }
    }
  }

  async post<T>(path: string, body: unknown, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const context: ApiContext = {
      path,
      method: 'POST',
      details: body
    }

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        body: JSON.stringify(body)
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          data: null,
          error: handleApiError(data, this.createErrorContext(context))
        }
      }

      return {
        data,
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: handleApiError(error, this.createErrorContext(context))
      }
    }
  }

  async put<T>(path: string, body: unknown, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const context: ApiContext = {
      path,
      method: 'PUT',
      details: body
    }

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        body: JSON.stringify(body)
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          data: null,
          error: handleApiError(data, this.createErrorContext(context))
        }
      }

      return {
        data,
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: handleApiError(error, this.createErrorContext(context))
      }
    }
  }

  async delete<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const context: ApiContext = {
      path,
      method: 'DELETE'
    }

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          data: null,
          error: handleApiError(data, this.createErrorContext(context))
        }
      }

      return {
        data,
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: handleApiError(error, this.createErrorContext(context))
      }
    }
  }
}


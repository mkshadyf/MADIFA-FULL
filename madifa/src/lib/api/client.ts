import { createClient } from '@/lib/supabase/client'
import type { ApiResponse } from '@/types'

class ApiClient {
  private supabase = createClient()

  async get<T>(path: string, options?: { query?: Record<string, any> }): Promise<ApiResponse<T>> {
    try {
      let query = this.supabase.from(path).select('*')

      if (options?.query) {
        Object.entries(options.query).forEach(([key, value]) => {
          if (typeof value === 'string' && value.startsWith('ilike.')) {
            query = query.ilike(key, value.replace('ilike.', ''))
          } else {
            query = query.eq(key, value)
          }
        })
      }

      const { data, error } = await query

      if (error) throw error
      return { data: data as T, error: null }
    } catch (error) {
      console.error(`API GET Error (${path}):`, error)
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async post<T>(path: string, data: any): Promise<ApiResponse<T>> {
    try {
      const { data: responseData, error } = await this.supabase
        .from(path)
        .insert(data)
        .single()

      if (error) throw error
      return { data: responseData, error: null }
    } catch (error) {
      console.error(`API POST Error (${path}):`, error)
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async update<T>(path: string, id: string, data: any): Promise<ApiResponse<T>> {
    try {
      const { data: responseData, error } = await this.supabase
        .from(path)
        .update(data)
        .eq('id', id)
        .single()

      if (error) throw error
      return { data: responseData, error: null }
    } catch (error) {
      console.error(`API UPDATE Error (${path}):`, error)
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async delete(path: string, id: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await this.supabase
        .from(path)
        .delete()
        .eq('id', id)

      if (error) throw error
      return { data: null, error: null }
    } catch (error) {
      console.error(`API DELETE Error (${path}):`, error)
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

export const api = new ApiClient() 
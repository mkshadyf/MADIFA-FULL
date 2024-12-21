import type { QueryKey, UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'

import { handleError } from '@/lib/utils/error-handler'

interface FetchOptions<TData>
  extends Omit<UseQueryOptions<TData, Error>, 'queryKey' | 'queryFn'> {
  onError?: (error: Error) => void
  cacheTime?: number
  staleTime?: number
}

export function useDataFetch<TData>(
  key: QueryKey,
  fetcher: () => Promise<TData>,
  options: FetchOptions<TData> = {}
) {
  const {
    onError,
    ...restOptions
  } = options

  return useQuery<TData, Error>({
    queryKey: key,
    queryFn: async () => {
      try {
        return await fetcher()
      } catch (error) {
        console.error('Data fetch error:', error)
        const apiError = handleError(error, 'data_fetch_error')
        onError?.(apiError)
        throw apiError
      }
    },
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (
        error instanceof Error &&
        'status' in error &&
        (error as any).status < 500
      ) {
        return false
      }
      return failureCount < 3
    },
    refetchOnWindowFocus: false,
    ...restOptions,
  })
}

// Helper function to create a fetcher function
export function createFetcher<T = any>(
  url: string,
  options: RequestInit = {}
): () => Promise<T> {
  return async () => {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || 'An error occurred while fetching data')
    }

    return response.json()
  }
}

// Helper function to create a cached query
export function createCachedQuery<T>(
  key: QueryKey,
  queryFn: () => Promise<T>,
  options?: FetchOptions<T>
) {
  return useDataFetch<T>(key, queryFn, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    ...options,
  })
}

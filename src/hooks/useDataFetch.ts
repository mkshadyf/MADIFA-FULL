import type { UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'

import { handleAPIError } from '@/lib/utils/api-error'

interface FetchOptions<TData>
  extends Omit<UseQueryOptions<TData, Error>, 'queryKey' | 'queryFn'> {
  onError?: (error: Error) => void
}

export function useDataFetch<TData>(
  key: string | readonly unknown[],
  fetcher: () => Promise<TData>,
  options: FetchOptions<TData> = {}
) {
  const queryKey = Array.isArray(key) ? key : [key]

  return useQuery<TData, Error>({
    queryKey,
    queryFn: async () => {
      try {
        return await fetcher()
      } catch (error) {
        throw handleAPIError(error)
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
    ...options,
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

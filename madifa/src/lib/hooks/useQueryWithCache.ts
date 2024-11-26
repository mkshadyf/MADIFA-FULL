import { QueryKey, useQuery, UseQueryOptions } from '@tanstack/react-query'

export function useQueryWithCache<T>(
  key: QueryKey,
  queryFn: () => Promise<T>,
  options?: UseQueryOptions<T>
) {
  return useQuery<T>({
    queryKey: key,
    queryFn,
    staleTime: 5 * 60 * 1000, // 5 minutes
    // cacheTime: 30 * 60 * 1000, // 30 minutes
    ...options,
  })
} 

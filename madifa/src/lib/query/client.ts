import { QueryClient, QueryClientConfig } from '@tanstack/react-query'

const queryConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      networkMode: 'offlineFirst'
    },
    mutations: {
      retry: 2,
      networkMode: 'offlineFirst'
    }
  }
}

export const queryClient = new QueryClient(queryConfig)

export function invalidateQueries(queryKey: string | string[]) {
  const key = Array.isArray(queryKey) ? queryKey : [queryKey]
  return queryClient.invalidateQueries({ queryKey: key })
}

export function prefetchQuery(queryKey: string | string[], queryFn: () => Promise<any>) {
  const key = Array.isArray(queryKey) ? queryKey : [queryKey]
  return queryClient.prefetchQuery({
    queryKey: key,
    queryFn,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
} 
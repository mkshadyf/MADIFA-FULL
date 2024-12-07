import type { AnalyticsReport } from '@/types/analytics'
import { useQuery } from '@tanstack/react-query'

interface UseAnalyticsOptions {
  from: string
  to: string
  videoId?: string
  granularity?: 'hour' | 'day' | 'week' | 'month'
}

export function useAnalytics(options: UseAnalyticsOptions) {
  return useQuery<AnalyticsReport>({
    queryKey: ['analytics', options],
    queryFn: async () => {
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data')
      }

      return response.json()
    },
  })
} 
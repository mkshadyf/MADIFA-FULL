import { performanceService } from '@/lib/services/performance'
import type { RealTimeStats } from '@/types/analytics'
import { useQuery } from '@tanstack/react-query'

export interface PerformanceMetrics {
  realTimeStats: RealTimeStats
  resourceMetrics: {
    cacheHitRate: number
    cacheSize: number
    cachedResources: number
    imagesOptimized: number
    spaceSaved: number
    averageCompression: number
  }
  webVitals: {
    fcp: number
    lcp: number
    fid: number
    cls: number
    ttfb: number
  }
}

export function usePerformanceMetrics() {
  return useQuery<PerformanceMetrics, Error>({
    queryKey: ['performance-metrics'],
    queryFn: async () => {
      const [realTimeStats, resourceMetrics, webVitals] = await Promise.all([
        performanceService.getRealTimeStats(),
        performanceService.getResourceMetrics(),
        performanceService.getWebVitals()
      ])

      return {
        realTimeStats,
        resourceMetrics,
        webVitals
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  })
} 
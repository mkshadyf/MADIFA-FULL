import { useActivityTracking } from '@/hooks/useActivityTracking'
import type { VimeoPlayer } from '@/types/vimeo'
import { useVideoAnalytics } from './useVideoAnalytics'

interface UseAnalyticsProps {
  player?: VimeoPlayer | null
  videoId?: string
  onError?: (error: Error) => void
}

export function useAnalytics({ player, videoId, onError }: UseAnalyticsProps = {}) {
  // Video-specific analytics
  const videoAnalytics = videoId && player ? useVideoAnalytics(player, videoId) : null

  // General activity tracking
  const activityTracking = useActivityTracking({
    onError: (error) => {
      console.error('Analytics error:', error)
      onError?.(error)
    }
  })

  return {
    ...activityTracking,
    videoAnalytics,
  }
}

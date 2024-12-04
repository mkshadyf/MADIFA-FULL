import { useAuth } from '@/hooks/useAuth'
import { analyticsService } from '@/lib/services/analytics'
import type { AnalyticsEvent, ViewSession } from '@/types/analytics'
import type { VimeoPlayer } from '@/types/vimeo'
import { useCallback, useEffect, useRef } from 'react'

interface ViewingStats {
  totalTime: number
  pauseCount: number
  seekCount: number
  qualityChanges: number
  bufferingEvents: number
  averageBufferDuration: number
}

export function useVideoAnalytics(player: VimeoPlayer | null, videoId: string) {
  const { user } = useAuth()
  const sessionRef = useRef<ViewSession>()
  const statsRef = useRef<ViewingStats>({
    totalTime: 0,
    pauseCount: 0,
    seekCount: 0,
    qualityChanges: 0,
    bufferingEvents: 0,
    averageBufferDuration: 0
  })
  const bufferStartTimeRef = useRef<number>()

  const trackEvent = useCallback(async (event: Omit<AnalyticsEvent, 'user_id' | 'timestamp'>) => {
    if (!user) return

    try {
      await analyticsService.trackEvent({
        ...event,
        user_id: user.id,
        timestamp: Date.now()
      })
    } catch (error) {
      console.error('Failed to track analytics event:', error)
    }
  }, [user])

  const trackProgress = useCallback(async () => {
    if (!player || !sessionRef.current) return

    try {
      const [currentTime, duration] = await Promise.all([
        player.getCurrentTime(),
        player.getDuration()
      ])

      const progress = currentTime / duration
      if (Math.abs(progress - lastProgressRef.current) > 0.05) {
        await analyticsService.updateViewProgress(sessionRef.current, progress)
        lastProgressRef.current = progress
      }
    } catch (error) {
      console.error('Failed to track progress:', error)
    }
  }, [player])

  useEffect(() => {
    if (!player || !user) return

    const initializeSession = async () => {
      try {
        await analyticsService.trackView(videoId, user.id)
        progressIntervalRef.current = setInterval(trackProgress, 5000)
      } catch (error) {
        console.error('Failed to initialize analytics session:', error)
      }
    }

    const handlePlay = () => {
      trackEvent({
        event_type: 'play',
        video_id: videoId
      })
    }

    const handlePause = () => {
      trackEvent({
        event_type: 'pause',
        video_id: videoId
      })
    }

    const handleSeek = (data: { seconds: number }) => {
      trackEvent({
        event_type: 'seek',
        video_id: videoId,
        data: { position: data.seconds }
      })
    }

    const handleQualityChange = (data: { quality: string }) => {
      trackEvent({
        event_type: 'quality_change',
        video_id: videoId,
        data: { quality: data.quality }
      })
    }

    const handleError = (error: Error) => {
      trackEvent({
        event_type: 'error',
        video_id: videoId,
        data: { message: error.message }
      })
    }

    initializeSession()

    player.on('play', handlePlay)
    player.on('pause', handlePause)
    player.on('seeked', handleSeek)
    player.on('qualitychange', handleQualityChange)
    player.on('error', handleError)

    return () => {
      player.off('play', handlePlay)
      player.off('pause', handlePause)
      player.off('seeked', handleSeek)
      player.off('qualitychange', handleQualityChange)
      player.off('error', handleError)

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [player, user, videoId, trackEvent, trackProgress])
} 
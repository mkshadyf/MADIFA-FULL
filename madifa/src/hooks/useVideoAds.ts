import { adService } from '@/lib/services/ads'
import type { VimeoPlayer } from '@vimeo/player'
import { useCallback, useEffect, useRef } from 'react'
import { useToast } from './useToast'

interface UseVideoAdsOptions {
  player: VimeoPlayer | null
  isSubscribed: boolean
  videoId: string
}

export function useVideoAds({ player, isSubscribed, videoId }: UseVideoAdsOptions) {
  const { showToast } = useToast()
  const hasShownPreRollRef = useRef(false)
  const lastAdTimeRef = useRef(0)
  const midRollIntervalRef = useRef(5 * 60) // 5 minutes

  const showAd = useCallback(async (type: 'preroll' | 'midroll') => {
    if (!player) return false

    try {
      // Pause video
      await player.pause()

      // Show ad
      const adShown = await (type === 'preroll'
        ? adService.showPreRollAd()
        : adService.showMidRollAd())

      if (adShown) {
        // Resume video after ad
        await player.play()
        return true
      }

      return false
    } catch (error) {
      console.error(`Error showing ${type} ad:`, error)
      return false
    }
  }, [player])

  useEffect(() => {
    if (!player || isSubscribed) return

    const handleTimeUpdate = async (data: { seconds: number }) => {
      const currentTime = data.seconds

      // Show pre-roll ad
      if (!hasShownPreRollRef.current && currentTime < 1) {
        hasShownPreRollRef.current = true
        await showAd('preroll')
      }

      // Show mid-roll ad
      if (currentTime - lastAdTimeRef.current >= midRollIntervalRef.current) {
        const adShown = await showAd('midroll')
        if (adShown) {
          lastAdTimeRef.current = currentTime
        }
      }
    }

    const handleError = (error: Error) => {
      console.error('Video error during ad:', error)
      showToast('Error playing advertisement', 'error')
    }

    player.on('timeupdate', handleTimeUpdate)
    player.on('error', handleError)

    return () => {
      player.off('timeupdate', handleTimeUpdate)
      player.off('error', handleError)
    }
  }, [player, isSubscribed, showAd, showToast])

  // Reset ad state when video changes
  useEffect(() => {
    hasShownPreRollRef.current = false
    lastAdTimeRef.current = 0
  }, [videoId])
} 
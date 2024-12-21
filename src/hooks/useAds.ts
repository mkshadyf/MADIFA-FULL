import type Player from '@vimeo/player'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { adManager } from '@/lib/services/ad-manager'
import { adService } from '@/lib/services/ads'
import { AppLovin } from '@/lib/services/applovin'
import { subscriptionService } from '@/lib/services/subscription'

interface UseAdsOptions {
  player?: Player | null
  videoId?: string
}

export function useAds({ player, videoId }: UseAdsOptions = {}) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [adsEnabled, setAdsEnabled] = useState(true)
  const [adsLoaded, setAdsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Video ad state
  const hasShownPreRollRef = useRef(false)
  const lastAdTimeRef = useRef(0)
  const midRollIntervalRef = useRef(5 * 60) // 5 minutes

  useEffect(() => {
    const checkAdsStatus = async () => {
      if (!user) return

      try {
        // Check if user has premium subscription
        const subscription = await subscriptionService.getCurrentSubscription(
          user.id
        )
        const userHasSubscription = subscription?.status === 'active'
        setAdsEnabled(!userHasSubscription)
        setAdsLoaded(true)
      } catch (error) {
        console.error('Failed to check ads status:', error)
        setError('Failed to initialize ads')
        setAdsEnabled(false)
        setAdsLoaded(true)
      }
    }

    void checkAdsStatus()
  }, [user])

  // General ad methods
  const showInterstitial = async (): Promise<boolean> => {
    if (!adsEnabled || !adsLoaded) return false
    if (!adManager.canShowAd('interstitial')) return false

    try {
      const shown = await AppLovin.showInterstitial()
      if (shown) {
        adManager.recordAdShow('interstitial')
      }
      return shown
    } catch (error) {
      console.error('Failed to show interstitial ad:', error)
      setError('Failed to show ad')
      return false
    }
  }

  const showRewarded = async (): Promise<boolean> => {
    if (!adsEnabled || !adsLoaded) return false
    if (!adManager.canShowAd('rewarded')) return false

    try {
      const shown = await AppLovin.showRewarded()
      if (shown) {
        adManager.recordAdShow('rewarded')
      }
      return shown
    } catch (error) {
      console.error('Failed to show rewarded ad:', error)
      setError('Failed to show ad')
      return false
    }
  }

  // Video ad methods
  const showVideoAd = useCallback(
    async (type: 'preroll' | 'midroll'): Promise<boolean> => {
      if (!player || !adsEnabled) return false

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
    },
    [player, adsEnabled]
  )

  // Video ad handling
  useEffect(() => {
    if (!player || !adsEnabled || !videoId) return

    const handleTimeUpdate = async (data: { seconds: number }) => {
      const currentTime = data.seconds

      // Show pre-roll ad
      if (!hasShownPreRollRef.current && currentTime < 1) {
        hasShownPreRollRef.current = true
        await showVideoAd('preroll')
      }

      // Show mid-roll ad
      if (currentTime - lastAdTimeRef.current >= midRollIntervalRef.current) {
        const adShown = await showVideoAd('midroll')
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
  }, [player, adsEnabled, videoId, showVideoAd, showToast])

  // Reset video ad state when video changes
  useEffect(() => {
    if (videoId) {
      hasShownPreRollRef.current = false
      lastAdTimeRef.current = 0
    }
  }, [videoId])

  const getAdStats = (adType: string) => {
    return adManager.getAdStats(adType)
  }

  return {
    adsEnabled,
    adsLoaded,
    error,
    showInterstitial,
    showRewarded,
    showVideoAd,
    getAdStats,
  }
}

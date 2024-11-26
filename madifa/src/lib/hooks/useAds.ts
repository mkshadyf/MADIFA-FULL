import { useAuth } from '@/components/providers/AuthProvider'
import { adManager } from '@/lib/services/ad-manager'
import { appLovin } from '@/lib/services/applovin'
import { useEffect, useState } from 'react'

export function useAds() {
  const [adsEnabled, setAdsEnabled] = useState(true)
  const [adsLoaded, setAdsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    const checkAdsStatus = async () => {
      try {
        // Check if user has premium subscription
        const userHasSubscription = false // Implement your subscription check
        setAdsEnabled(!userHasSubscription)
        setAdsLoaded(true)
      } catch (error) {
        console.error('Failed to check ads status:', error)
        setError('Failed to initialize ads')
        setAdsEnabled(false)
        setAdsLoaded(true)
      }
    }

    checkAdsStatus()
  }, [user])

  const showInterstitial = async (): Promise<boolean> => {
    if (!adsEnabled || !adsLoaded) return false
    if (!adManager.canShowAd('interstitial')) return false

    try {
      const shown = await appLovin.showInterstitial()
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
      const shown = await appLovin.showRewarded()
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

  const getAdStats = (adType: string) => {
    return adManager.getAdStats(adType)
  }

  return {
    adsEnabled,
    adsLoaded,
    error,
    showInterstitial,
    showRewarded,
    getAdStats,
  }
} 

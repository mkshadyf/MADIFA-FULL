declare global {
  interface Window {
    AppLovinMAX: {
      initialize: (sdkKey: string, callback: (success: boolean) => void) => void
      showInterstitial: (unitId: string) => void
      showRewardedAd: (unitId: string) => void
      loadInterstitial: (unitId: string) => void
      loadRewardedAd: (unitId: string) => void
      isInterstitialReady: (unitId: string) => boolean
      isRewardedAdReady: (unitId: string) => boolean
      setVerboseLogging: (enabled: boolean) => void
      setTestDeviceAdvertisingIds: (ids: string[]) => void
      addInterstitialLoadedListener: (callback: () => void) => void
      addInterstitialLoadFailedListener: (
        callback: (error: string) => void
      ) => void
      addInterstitialDisplayedListener: (callback: () => void) => void
      addInterstitialAdFailedToDisplayListener: (
        callback: (error: string) => void
      ) => void
      addInterstitialClickedListener: (callback: () => void) => void
      addInterstitialHiddenListener: (callback: () => void) => void
      addRewardedAdLoadedListener: (callback: () => void) => void
      addRewardedAdLoadFailedListener: (
        callback: (error: string) => void
      ) => void
      addRewardedAdDisplayedListener: (callback: () => void) => void
      addRewardedAdFailedToDisplayListener: (
        callback: (error: string) => void
      ) => void
      addRewardedAdClickedListener: (callback: () => void) => void
      addRewardedAdHiddenListener: (callback: () => void) => void
      addRewardedAdReceivedRewardListener: (
        callback: (reward: { amount: number; currency: string }) => void
      ) => void
    }
    workbox?: {
      register: () => Promise<void>
      unregister: () => Promise<void>
      update: () => Promise<void>
      active: boolean
      waiting: boolean
      installing: boolean
      activated: boolean
      controlling: boolean
    }
  }

  // Add Vimeo player types
  interface VimeoPlayerOptions {
    id: number
    autopause?: boolean
    autoplay?: boolean
    background?: boolean
    byline?: boolean
    color?: string
    controls?: boolean
    dnt?: boolean
    height?: number
    loop?: boolean
    maxheight?: number
    maxwidth?: number
    muted?: boolean
    playsinline?: boolean
    portrait?: boolean
    quality?: string
    responsive?: boolean
    speed?: boolean
    title?: boolean
    transparent?: boolean
    width?: number
  }

  interface VimeoTimeUpdateEvent {
    duration: number
    percent: number
    seconds: number
  }

  interface VimeoProgressEvent {
    duration: number
    percent: number
    seconds: number
  }

  interface VimeoQualityChangeEvent {
    quality: string
  }
}

export {}

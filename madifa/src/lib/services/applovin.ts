import { env } from '@/config/env'

interface AppLovinConfig {
  sdkKey: string
  bannerAdUnitId: string
  interstitialAdUnitId: string
  rewardedAdUnitId: string
}

export class AppLovinService {
  private initialized = false
  private config: AppLovinConfig

  constructor() {
    this.config = {
      sdkKey: env.VITE_APPLOVIN_SDK_KEY,
      bannerAdUnitId: env.VITE_APPLOVIN_BANNER_ID,
      interstitialAdUnitId: env.VITE_APPLOVIN_INTERSTITIAL_ID,
      rewardedAdUnitId: env.VITE_APPLOVIN_REWARDED_ID
    }
  }

  async init(): Promise<void> {
    if (this.initialized) return

    try {
      // Load AppLovin SDK
      const script = document.createElement('script')
      script.src = `https://sdk.applovin.com/js/applovin-max-sdk-web.js`
      script.async = true
      document.head.appendChild(script)

      await new Promise<void>((resolve) => {
        script.onload = () => {
          // @ts-ignore - AppLovin global object
          window.AppLovinMAX.initialize(this.config.sdkKey, {
            debugMode: env.NODE_ENV === 'development'
          })
          this.initialized = true
          resolve()
        }
      })
    } catch (error) {
      console.error('Failed to initialize AppLovin:', error)
    }
  }

  async showBanner(containerId: string): Promise<void> {
    if (!this.initialized) await this.init()

    try {
      // @ts-ignore - AppLovin global object
      window.AppLovinMAX.createBanner(this.config.bannerAdUnitId, {
        position: 'bottom',
        container: containerId
      })
    } catch (error) {
      console.error('Failed to show banner:', error)
    }
  }

  async showInterstitial(): Promise<void> {
    if (!this.initialized) await this.init()

    try {
      // @ts-ignore - AppLovin global object
      window.AppLovinMAX.showInterstitial(this.config.interstitialAdUnitId)
    } catch (error) {
      console.error('Failed to show interstitial:', error)
    }
  }

  async showRewardedAd(): Promise<boolean> {
    if (!this.initialized) await this.init()

    return new Promise((resolve) => {
      try {
        // @ts-ignore - AppLovin global object
        window.AppLovinMAX.showRewardedAd(this.config.rewardedAdUnitId, {
          onUserRewarded: () => resolve(true),
          onAdClosed: () => resolve(false)
        })
      } catch (error) {
        console.error('Failed to show rewarded ad:', error)
        resolve(false)
      }
    })
  }

  async hideBanner(containerId: string): Promise<void> {
    if (!this.initialized) return

    try {
      // @ts-ignore - AppLovin global object
      window.AppLovinMAX.hideBanner(containerId)
    } catch (error) {
      console.error('Failed to hide banner:', error)
    }
  }
}

export const applovinService = new AppLovinService() 

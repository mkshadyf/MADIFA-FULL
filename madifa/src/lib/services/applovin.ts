import { AdsConfig } from '@/lib/config/ads'

declare global {
  interface Window {
    applovin: any
  }
}

class AppLovinService {
  private static instance: AppLovinService
  private initialized: boolean = false

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initializeSDK()
    }
  }

  public static getInstance(): AppLovinService {
    if (!AppLovinService.instance) {
      AppLovinService.instance = new AppLovinService()
    }
    return AppLovinService.instance
  }

  private async initializeSDK() {
    if (this.initialized) return

    try {
      await this.loadAppLovinScript()
      window.applovin.initializeSdk({
        sdkKey: AdsConfig.sdkKey,
        testDeviceIds: AdsConfig.testDeviceId ? [AdsConfig.testDeviceId] : undefined,
      })
      this.initialized = true
    } catch (error) {
      console.error('Failed to initialize AppLovin SDK:', error)
    }
  }

  private loadAppLovinScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector('script[src*="applovin"]')) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://sdk.applovin.com/js/applovin-max.js'
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load AppLovin SDK'))
      document.head.appendChild(script)
    })
  }

  public async showInterstitial(): Promise<boolean> {
    if (!this.initialized) await this.initializeSDK()

    return new Promise((resolve) => {
      window.applovin.showAd(AdsConfig.adUnits.interstitial, {
        onAdLoadSuccess: () => resolve(true),
        onAdLoadFailed: () => resolve(false),
      })
    })
  }

  public async showRewarded(): Promise<boolean> {
    if (!this.initialized) await this.initializeSDK()

    return new Promise((resolve) => {
      window.applovin.showAd(AdsConfig.adUnits.rewarded, {
        onAdLoadSuccess: () => resolve(true),
        onAdLoadFailed: () => resolve(false),
        onAdDisplayed: () => {
          // Handle reward here
        },
      })
    })
  }
}

export const appLovin = AppLovinService.getInstance() 

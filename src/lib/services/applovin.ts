
declare global {
  interface Window {
    AppLovinMAX: any;
  }
}


// Add type declarations for window and document
declare const window: Window & typeof globalThis
declare const document: Document

const isClient = typeof window !== 'undefined' && typeof document !== 'undefined'

export class AppLovin {
  private static instance: AppLovin
  private initialized = false
  private sdkKey: string
  private interstitialId: string
  private rewardedId: string

  private constructor() {
    this.sdkKey = import.meta.env.VITE_APPLOVIN_SDK_KEY || ''
    this.interstitialId = import.meta.env.VITE_APPLOVIN_INTERSTITIAL_ID || ''
    this.rewardedId = import.meta.env.VITE_APPLOVIN_REWARDED_ID || ''
  }

  public static getInstance(): AppLovin {
    if (!AppLovin.instance) {
      AppLovin.instance = new AppLovin()
    }
    return AppLovin.instance
  }

  private loadScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!isClient) {
        resolve()
        return
      }

      try {
        const script = document?.createElement('script')
        if (!script) {
          reject(new Error('Failed to create script element'))
          return
        }

        script.src = 'https://sdkconfig.applovin.com/max/applovin.js'
        script.async = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('Failed to load AppLovin SDK'))
        document?.head?.appendChild(script)
      } catch (error) {
        reject(error)
      }
    })
  }

  public async initialize(): Promise<void> {
    if (this.initialized || !isClient) {
      return
    }

    try {
      await this.loadScript()
      if (typeof window?.AppLovinMAX?.initialize === 'function') {
        window.AppLovinMAX.initialize(this.sdkKey, () => {
          this.initialized = true
          console.info('AppLovin SDK initialized successfully')
        })
      } else {
        throw new Error('AppLovin SDK not loaded properly')
      }
    } catch (error) {
      console.error('Failed to initialize AppLovin SDK:', error)
      throw error
    }
  }

  public async showInterstitial(): Promise<void> {
    if (!isClient || !this.initialized) {
      return
    }

    try {
      if (typeof window?.AppLovinMAX?.showInterstitial === 'function') {
        window.AppLovinMAX.showInterstitial(this.interstitialId)
      }
    } catch (error) {
      console.error('Failed to show interstitial ad:', error)
      throw error
    }
  }

  public async showRewardedAd(): Promise<void> {
    if (!isClient || !this.initialized) {
      return
    }

    try {
      if (typeof window?.AppLovinMAX?.showRewardedAd === 'function') {
        window.AppLovinMAX.showRewardedAd(this.rewardedId)
      }
    } catch (error) {
      console.error('Failed to show rewarded ad:', error)
      throw error
    }
  }

  public async loadInterstitial(): Promise<void> {
    if (!isClient || !this.initialized) {
      return
    }

    try {
      if (typeof window?.AppLovinMAX?.loadInterstitial === 'function') {
        window.AppLovinMAX.loadInterstitial(this.interstitialId)
      }
    } catch (error) {
      console.error('Failed to load interstitial ad:', error)
      throw error
    }
  }

  public async loadRewardedAd(): Promise<void> {
    if (!isClient || !this.initialized) {
      return
    }

    try {
      if (typeof window?.AppLovinMAX?.loadRewardedAd === 'function') {
        window.AppLovinMAX.loadRewardedAd(this.rewardedId)
      }
    } catch (error) {
      console.error('Failed to load rewarded ad:', error)
      throw error
    }
  }
}

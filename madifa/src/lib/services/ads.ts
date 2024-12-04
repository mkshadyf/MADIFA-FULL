import { env } from '@/config/env'

interface AdConfig {
  unitId: string
  format: 'banner' | 'interstitial' | 'rewarded'
  position?: 'top' | 'bottom'
}

interface AdEvent {
  type: 'impression' | 'click' | 'revenue'
  adUnitId: string
  data?: Record<string, any>
}

class AdService {
  private static instance: AdService
  private isInitialized = false
  private eventListeners: ((event: AdEvent) => void)[] = []

  private constructor() {
    this.initializeSDK()
  }

  static getInstance(): AdService {
    if (!AdService.instance) {
      AdService.instance = new AdService()
    }
    return AdService.instance
  }

  private async initializeSDK() {
    if (this.isInitialized) return

    try {
      await this.loadApplovinSDK()
      window.applovin.initializeSdk({
        sdkKey: env.VITE_APPLOVIN_SDK_KEY
      })
      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize ad SDK:', error)
    }
  }

  private loadApplovinSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://sdk.applovin.com/js/applovin.min.js'
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load AppLovin SDK'))
      document.head.appendChild(script)
    })
  }

  async showAd(config: AdConfig): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initializeSDK()
    }

    return new Promise((resolve) => {
      window.applovin.showAd(config.unitId, {
        onAdLoadSuccess: () => {
          this.trackEvent({
            type: 'impression',
            adUnitId: config.unitId
          })
        },
        onAdLoadFailed: () => resolve(false),
        onAdDisplayed: () => resolve(true)
      })
    })
  }

  async showPreRollAd(): Promise<boolean> {
    return this.showAd({
      unitId: env.VITE_APPLOVIN_INTERSTITIAL_ID,
      format: 'interstitial'
    })
  }

  async showMidRollAd(): Promise<boolean> {
    return this.showAd({
      unitId: env.VITE_APPLOVIN_REWARDED_ID,
      format: 'rewarded'
    })
  }

  onEvent(callback: (event: AdEvent) => void) {
    this.eventListeners.push(callback)
    return () => {
      this.eventListeners = this.eventListeners.filter(cb => cb !== callback)
    }
  }

  private trackEvent(event: AdEvent) {
    this.eventListeners.forEach(callback => callback(event))
  }
}

export const adService = AdService.getInstance()

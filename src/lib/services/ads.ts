import { AdsConfig } from '@/lib/config/ads'

type AdType = 'banner' | 'interstitial' | 'rewarded'

interface AdEvent {
  type: 'impression' | 'click' | 'error'
  adUnitId: string
  error?: Error
}

class AdService {
  private static instance: AdService
  private isInitialized = false
  private eventListeners: ((event: AdEvent) => void)[] = []

  private constructor() {}

  static getInstance(): AdService {
    if (!AdService.instance) {
      AdService.instance = new AdService()
    }
    return AdService.instance
  }

  async initialize(): Promise<void> {
    try {
      if (typeof window.applovin === 'undefined') {
        throw new Error('AppLovin SDK not loaded')
      }

      await window.applovin.initialize(AdsConfig.sdkKey)
      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize AppLovin SDK:', error)
      throw error
    }
  }

  async showAd(adType: AdType, unitId: string): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('AppLovin SDK not initialized')
    }

    try {
      if (typeof window.applovin === 'undefined') {
        throw new Error('AppLovin SDK not loaded')
      }

      switch (adType) {
        case 'banner':
          await window.applovin.showBanner(unitId)
          break
        case 'interstitial':
          await window.applovin.showInterstitial(unitId)
          break
        case 'rewarded':
          await window.applovin.showRewarded(unitId)
          break
        default:
          throw new Error(`Unsupported ad type: ${adType}`)
      }

      return true
    } catch (error) {
      console.error(`Failed to show ${adType} ad:`, error)
      return false
    }
  }

  async showPreRollAd(): Promise<boolean> {
    return this.showAd('interstitial', AdsConfig.adUnits.interstitial)
  }

  async showMidRollAd(): Promise<boolean> {
    return this.showAd('rewarded', AdsConfig.adUnits.rewarded)
  }

  addEventListener(callback: (event: AdEvent) => void): void {
    this.eventListeners.push(callback)
  }

  removeEventListener(callback: (event: AdEvent) => void): void {
    this.eventListeners = this.eventListeners.filter(cb => cb !== callback)
  }
}

export const adService = AdService.getInstance()

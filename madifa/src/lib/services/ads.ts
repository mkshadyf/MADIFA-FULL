import { env } from '@/config/env'

declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

export class AdService {
  private static instance: AdService
  private adsInitialized = false

  private constructor() {
    if (env.VITE_AD_ENABLED) {
      this.initializeAds()
    }
  }

  static getInstance(): AdService {
    if (!AdService.instance) {
      AdService.instance = new AdService()
    }
    return AdService.instance
  }

  private initializeAds() {
    if (this.adsInitialized || typeof document === 'undefined') return

    // Initialize Google AdSense
    if (env.VITE_ADSENSE_ID) {
      const script = document.createElement('script') as HTMLScriptElement
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${env.VITE_ADSENSE_ID}`
      script.async = true
      script.crossOrigin = 'anonymous'
      document.head?.appendChild(script)
    }

    this.adsInitialized = true
  }

  refreshAds() {
    if (!env.VITE_AD_ENABLED || typeof window === 'undefined') return

    try {
      if (window.adsbygoogle) {
        window.adsbygoogle.push({})
      }
    } catch (error) {
      console.error('Error refreshing ads:', error)
    }
  }
}

export const adService = AdService.getInstance()

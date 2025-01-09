import type { AdConfig, AdInstance, AdProvider, AdType } from '@/types/ads'
import { BaseService } from '../base/Service'
import { AppLovin } from './providers/applovin'

interface AdProviderInstance {
  initialize: () => Promise<void>
  showInterstitial: () => Promise<void>
  showRewardedAd: () => Promise<void>
  loadInterstitial: () => Promise<void>
  loadRewardedAd: () => Promise<void>
}

export class AdService extends BaseService {
  private providers: Map<AdProvider, AdProviderInstance> = new Map()

  async initialize(config: AdConfig): Promise<void> {
    return this.withErrorHandling(
      'initialize',
      async () => {
        switch (config.provider) {
          case 'applovin':
            // await applovin.initalize
            //   this.providers.set('applovin', applovin)
            break
          // Add other providers here
        }
      },
      { provider: config.provider }
    )
  }

  async showAd(type: AdType): Promise<void> {
    return this.withErrorHandling(
      'showAd',
      async () => {
        const provider = this.providers.get('applovin')
        if (!provider) throw new Error('AppLovin not initialized')

        switch (type) {
          case 'interstitial':
            await provider.showInterstitial()
            break
          case 'rewarded':
            await provider.showRewardedAd()
            break
          // Handle other ad types
        }
      },
      { type }
    )
  }

  async loadAd(type: AdType): Promise<void> {
    return this.withErrorHandling(
      'loadAd',
      async () => {
        const provider = this.providers.get('applovin')
        if (!provider) throw new Error('AppLovin not initialized')

        switch (type) {
          case 'interstitial':
            await provider.loadInterstitial()
            break
          case 'rewarded':
            await provider.loadRewardedAd()
            break
          // Handle other ad types
        }
      },
      { type }
    )
  }

  async destroyAd(instance: AdInstance): Promise<void> {
    return this.withErrorHandling(
      'destroyAd',
      async () => {
        const provider = this.providers.get(instance.provider)
        if (!provider)
          throw new Error(`Provider ${instance.provider} not initialized`)

        // Provider-specific cleanup
      },
      { instance }
    )
  }
}

export const adService = AdService.getInstance()

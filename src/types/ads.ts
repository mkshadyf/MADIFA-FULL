export type AdProvider = 'applovin' | 'admob' | 'unity'

export type AdType = 'banner' | 'interstitial' | 'rewarded'

export interface AdConfig {
  provider: AdProvider
  appId: string
  bannerUnitId?: string
  interstitialUnitId?: string
  rewardedUnitId?: string
}

export interface AdInstance {
  id: string
  type: AdType
  provider: AdProvider
  status: 'loading' | 'ready' | 'showing' | 'closed' | 'error'
  error?: string
}

export interface AdMetrics {
  impressions: number
  clicks: number
  revenue: number
}

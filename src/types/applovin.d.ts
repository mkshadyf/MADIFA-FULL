declare interface AppLovinSDK {
  initialize(appId: string): Promise<void>
  showBanner(unitId: string): Promise<void>
  hideBanner(): Promise<void>
  showInterstitial(unitId: string): Promise<void>
  showRewarded(unitId: string): Promise<void>
  isRewardedReady(): Promise<boolean>
  isInterstitialReady(): Promise<boolean>
  setTestMode(enabled: boolean): void
  setUserId(userId: string): void
  setConsent(hasConsent: boolean): void
  setVerboseLogging(enabled: boolean): void
}

declare interface Window {
  applovin: AppLovinSDK
}

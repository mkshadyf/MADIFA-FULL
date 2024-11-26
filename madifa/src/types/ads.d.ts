declare global {
  interface Window {
    applovin: {
      initializeSdk: (config: {
        sdkKey: string
        testDeviceIds?: string[]
      }) => void
      showAd: (
        adUnitId: string,
        callbacks: {
          onAdLoadSuccess?: () => void
          onAdLoadFailed?: () => void
          onAdDisplayed?: () => void
        }
      ) => void
      createBanner: (config: {
        adUnitId: string
        position: 'top' | 'bottom'
        container?: HTMLElement
      }) => void
      destroyBanner: (adUnitId: string) => void
    }
  }
}

export { }

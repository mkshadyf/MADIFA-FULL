export const AdsConfig = {
  sdkKey: process.env.APPLOVIN_SDK_KEY!,
  testDeviceId: process.env.TEST_DEVICE_ID,
  adUnits: {
    interstitial: process.env.INTERSTITIAL_AD_UNIT_ID!,
    banner: process.env.BANNER_AD_UNIT_ID!,
    rewarded: process.env.REWARDED_AD_UNIT_ID!,
    appOpen: process.env.APP_OPEN_AD_UNIT_ID!,
    mrec: process.env.MREC_AD_UNIT_ID!,
  },
} 
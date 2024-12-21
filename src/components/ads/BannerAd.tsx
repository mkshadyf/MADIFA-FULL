import React from 'react'
import { useEffect, useRef } from 'react'

import { AdsConfig } from '@/lib/config/ads'

export default function BannerAd() {
  const bannerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!bannerRef.current) return

    const loadBanner = async () => {
      if (typeof window.applovin === 'undefined') return

      window.applovin.createBanner({
        adUnitId: AdsConfig.adUnits.banner,
        position: 'bottom',
        container: bannerRef.current || undefined,
      })
    }

    loadBanner()

    return () => {
      if (typeof window.applovin !== 'undefined') {
        window.applovin.destroyBanner(AdsConfig.adUnits.banner)
      }
    }
  }, [])

  return <div ref={bannerRef} className="h-[50px] w-full" />
}

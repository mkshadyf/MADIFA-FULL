import { AdsConfig } from '@/lib/config/ads'
import { useRef, useEffect } from 'react'

export default function BannerAd() {
  const bannerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!bannerRef.current) return

    const loadBanner = async () => {
      if (typeof window.applovin === 'undefined') return

      try {
        await window.applovin.showBanner(AdsConfig.adUnits.banner)
      } catch (error) {
        console.error('Failed to load banner ad:', error)
      }
    }

    loadBanner()

    return () => {
      if (typeof window.applovin !== 'undefined') {
        window.applovin.hideBanner().catch(error => {
          console.error('Failed to hide banner ad:', error)
        })
      }
    }
  }, [])

  return <div ref={bannerRef} className="h-[50px] w-full" />
}

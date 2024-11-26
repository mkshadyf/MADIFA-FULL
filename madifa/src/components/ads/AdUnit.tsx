import React, { useEffect, useRef } from 'react'
import { env } from '@/config/env'
import { adService } from '@/lib/services/ads'
import { usePerformance } from '@/hooks/usePerformance'

interface AdUnitProps {
  slot?: string
  format?: 'auto' | 'fluid' | 'rectangle' | 'vertical'
  className?: string
}

export default function AdUnit({ slot, format = 'auto', className = '' }: AdUnitProps) {
  const adRef = useRef<HTMLDivElement>(null)
  const { measureOperation } = usePerformance('AdUnit')

  useEffect(() => {
    if (!env.VITE_AD_ENABLED) return

    const loadAd = async () => {
      await measureOperation('loadAd', async () => {
        adService.refreshAds()
      })
    }

    loadAd()

    const refreshInterval = setInterval(() => {
      loadAd()
    }, env.VITE_AD_REFRESH_RATE)

    return () => clearInterval(refreshInterval)
  }, [])

  if (!env.VITE_AD_ENABLED) return null

  return (
    <div ref={adRef} className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={env.VITE_GOOGLE_ADS_CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
} 
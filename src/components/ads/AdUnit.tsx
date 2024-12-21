import React, { useEffect, useRef } from 'react'

import { adService } from '@/lib/services/ads'
import { usePerformance } from '@/hooks/usePerformance'

interface AdUnitProps {
  slot?: string
  format?: 'auto' | 'fluid' | 'rectangle' | 'vertical'
  className?: string
}

export default function AdUnit({
  slot,
  format = 'auto',
  className = '',
}: AdUnitProps) {
  const adRef = useRef<HTMLDivElement>(null)
  const { measureOperation } = usePerformance('AdUnit')

  useEffect(() => {
    if (import.meta.env.VITE_AD_ENABLED !== 'true') return

    const loadAd = async () => {
      await measureOperation('loadAd', async () => {
        await adService.showAd({
          unitId: slot || import.meta.env.VITE_APPLOVIN_INTERSTITIAL_ID,
          format:
            format === 'auto' ||
            format === 'fluid' ||
            format === 'rectangle' ||
            format === 'vertical'
              ? 'banner'
              : 'interstitial',
        })
      })
    }

    loadAd()

    const refreshInterval = setInterval(() => {
      loadAd()
    }, 10000)

    return () => clearInterval(refreshInterval)
  }, [])

  if (import.meta.env.VITE_AD_ENABLED !== 'true') return null

  return (
    <div ref={adRef} className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={import.meta.env.VITE_GOOGLE_ADS_CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}

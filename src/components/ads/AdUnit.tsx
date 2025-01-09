import { useEffect, useRef } from 'react'

import { usePerformance } from '@/hooks/usePerformance'
import { adService } from '@/lib/services/ads'

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
        const unitId = slot || import.meta.env.VITE_APPLOVIN_INTERSTITIAL_ID
        await adService.showAd('banner', unitId)
      })
    }

    loadAd()
  }, [slot, format])

  return (
    <div ref={adRef} className={`ad-unit ${className}`} data-format={format} />
  )
}

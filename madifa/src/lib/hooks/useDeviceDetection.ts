import { useEffect, useState } from 'react'

interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  orientation: 'portrait' | 'landscape'
  touchEnabled: boolean
}

export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    orientation: 'portrait',
    touchEnabled: false
  })

  useEffect(() => {
    const checkDevice = () => {
      const ua = navigator.userAgent
      const width = window.innerWidth

      const isMobile = /iPhone|iPad|iPod|Android/i.test(ua) && width < 768
      const isTablet = /iPhone|iPad|iPod|Android/i.test(ua) && width >= 768 && width < 1024
      const isDesktop = !isMobile && !isTablet
      const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      const touchEnabled = 'ontouchstart' in window

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        orientation,
        touchEnabled
      })
    }

    checkDevice()
    window.addEventListener('resize', checkDevice)
    window.addEventListener('orientationchange', checkDevice)

    return () => {
      window.removeEventListener('resize', checkDevice)
      window.removeEventListener('orientationchange', checkDevice)
    }
  }, [])

  return deviceInfo
} 

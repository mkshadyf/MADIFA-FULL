import { useEffect, useState } from 'react'
import { registerSW } from 'virtual:pwa-register'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

declare global {
  interface MediaQueryListEvent extends Event {
    readonly matches: boolean
    readonly media: string
  }
  interface MediaQueryList {
    readonly matches: boolean
    readonly media: string
    onchange: ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null
    addEventListener(type: string, listener: (this: MediaQueryList, ev: MediaQueryListEvent) => any): void
    removeEventListener(type: string, listener: (this: MediaQueryList, ev: MediaQueryListEvent) => any): void
    addListener(listener: (this: MediaQueryList, ev: MediaQueryListEvent) => any): void
    removeListener(listener: (this: MediaQueryList, ev: MediaQueryListEvent) => any): void
  }

  interface WindowLocation {
    reload(): void
  }

  interface WindowEventHandlersEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
    appinstalled: Event
  }

  interface WindowEventHandlers {
    addEventListener<K extends keyof WindowEventHandlersEventMap>(
      type: K,
      listener: (this: Window, ev: WindowEventHandlersEventMap[K]) => any,
      options?: boolean | AddEventListenerOptions
    ): void
    removeEventListener<K extends keyof WindowEventHandlersEventMap>(
      type: K,
      listener: (this: Window, ev: WindowEventHandlersEventMap[K]) => any,
      options?: boolean | EventListenerOptions
    ): void
  }

  interface Window extends WindowEventHandlers {
    matchMedia(query: string): MediaQueryList
    location: Location
  }
}

export function usePWA() {
  const [isInstallable, setIsInstallable] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    const win = typeof window !== 'undefined' ? window : null
    if (!win) return

    // Check if app is installed
    if (win.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    // Register service worker
    const registration = registerSW({
      immediate: true,
      onNeedRefresh() {
        setUpdateAvailable(true)
      },
      onOfflineReady() {
        console.log('App is ready for offline use')
      }
    })

    // Handle install prompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    }

    win.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    win.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      win.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      win.removeEventListener('appinstalled', handleAppInstalled)
      registration()
    }
  }, [])

  const install = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }
  }

  const update = () => {
    const win = typeof window !== 'undefined' ? window : null
    if (updateAvailable && win) {
      win.location.reload()
    }
  }

  return {
    isInstallable,
    isInstalled,
    updateAvailable,
    install,
    update
  }
} 
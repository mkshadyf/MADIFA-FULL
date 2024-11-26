/// <reference types="vite-plugin-pwa/client" />
/// <reference types="vite-plugin-pwa/info" />

declare module 'virtual:pwa-register' {
  export interface RegisterSWOptions {
    immediate?: boolean
    onNeedRefresh?: () => void
    onOfflineReady?: () => void
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void
    onRegisterError?: (error: any) => void
  }

  export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => Promise<void>
}

declare module 'virtual:pwa-info' {
  export interface PwaInfo {
    webManifest: { href: string; useCredentials: boolean }
    registerSW: { registerPath: string; scope: string }
    offlineReady: boolean
    needRefresh: boolean
    updateServiceWorker: (reloadPage?: boolean) => Promise<void>
  }

  export function useRegisterSW(options?: RegisterSWOptions): {
    needRefresh: [boolean, (value: boolean) => void]
    offlineReady: [boolean, (value: boolean) => void]
    updateServiceWorker: (reloadPage?: boolean) => Promise<void>
  }
} 
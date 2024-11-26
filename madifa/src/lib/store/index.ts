import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  theme: 'light' | 'dark'
  language: string
  notifications: boolean
  autoplay: boolean
  quality: 'auto' | '1080p' | '720p' | '480p'
  setTheme: (theme: 'light' | 'dark') => void
  setLanguage: (lang: string) => void
  setNotifications: (enabled: boolean) => void
  setAutoplay: (enabled: boolean) => void
  setQuality: (quality: 'auto' | '1080p' | '720p' | '480p') => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'dark',
      language: 'en',
      notifications: true,
      autoplay: true,
      quality: 'auto',
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setNotifications: (notifications) => set({ notifications }),
      setAutoplay: (autoplay) => set({ autoplay }),
      setQuality: (quality) => set({ quality })
    }),
    {
      name: 'app-storage',
      version: 1
    }
  )
)

interface PlayerState {
  volume: number
  muted: boolean
  playbackRate: number
  setVolume: (volume: number) => void
  setMuted: (muted: boolean) => void
  setPlaybackRate: (rate: number) => void
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      volume: 1,
      muted: false,
      playbackRate: 1,
      setVolume: (volume) => set({ volume }),
      setMuted: (muted) => set({ muted }),
      setPlaybackRate: (playbackRate) => set({ playbackRate })
    }),
    {
      name: 'player-storage',
      version: 1
    }
  )
) 
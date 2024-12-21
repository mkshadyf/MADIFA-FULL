declare global {
  interface Window {
    AppLovinMAX?: any
    workbox?: any
  }

  // Add Vimeo player types
  interface VimeoPlayerOptions {
    id: number
    autopause?: boolean
    autoplay?: boolean
    background?: boolean
    byline?: boolean
    color?: string
    controls?: boolean
    dnt?: boolean
    height?: number
    loop?: boolean
    maxheight?: number
    maxwidth?: number
    muted?: boolean
    playsinline?: boolean
    portrait?: boolean
    quality?: string
    responsive?: boolean
    speed?: boolean
    title?: boolean
    transparent?: boolean
    width?: number
  }

  interface VimeoTimeUpdateEvent {
    duration: number
    percent: number
    seconds: number
  }

  interface VimeoProgressEvent {
    duration: number
    percent: number
    seconds: number
  }

  interface VimeoQualityChangeEvent {
    quality: string
  }
}

export { }


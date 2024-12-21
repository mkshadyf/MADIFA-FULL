declare module '@vimeo/player' {
  class Player {
    constructor(
      element: HTMLElement | string,
      options: {
        id: number | string
        url?: string
        width?: number | string
        height?: number | string
        autopause?: boolean
        autoplay?: boolean
        background?: boolean
        byline?: boolean
        color?: string
        controls?: boolean
        dnt?: boolean
        keyboard?: boolean
        loop?: boolean
        muted?: boolean
        pip?: boolean
        playsinline?: boolean
        portrait?: boolean
        quality?: string
        responsive?: boolean
        speed?: boolean
        title?: boolean
        transparent?: boolean
      }
    )

    setVolume(volume: number): Promise<void>
    setMuted(muted: boolean): Promise<void>
    setPlaybackRate(rate: number): Promise<void>
    setQuality(quality: string): Promise<void>
    getCurrentTime(): Promise<number>
    setCurrentTime(time: number): Promise<number>
    getDuration(): Promise<number>
    getPaused(): Promise<boolean>
    play(): Promise<void>
    pause(): Promise<void>
    getMuted(): Promise<boolean>
    getVolume(): Promise<number>
    on(event: string, callback: (data: any) => void): void
    off(event: string, callback: (data: any) => void): void
    destroy(): Promise<void>
    getQualities(): Promise<string[]>
  }

  export default Player
}

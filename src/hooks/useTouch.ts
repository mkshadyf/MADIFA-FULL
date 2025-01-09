import type { TouchEvent } from 'react'
import { useCallback, useRef, useState } from 'react'

type SwipeDirection = 'left' | 'right' | 'up' | 'down'

interface UseTouchOptions {
  onTap?: () => void
  onDoubleTap?: () => void
  onLongPress?: () => void
  onSwipe?: (direction: SwipeDirection, distance: number) => void
  longPressDelay?: number
  doubleTapDelay?: number
  swipeThreshold?: number
}

interface TouchPosition {
  x: number
  y: number
  time: number
}

interface UseTouchResult {
  onTouchStart: (e: TouchEvent) => void
  onTouchMove: (e: TouchEvent) => void
  onTouchEnd: (e: TouchEvent) => void
}

export function useTouch({
  onTap,
  onDoubleTap,
  onLongPress,
  onSwipe,
  longPressDelay = 500,
  doubleTapDelay = 300,
  swipeThreshold = 50,
}: UseTouchOptions = {}): UseTouchResult {
  const [touchStart, setTouchStart] = useState<TouchPosition | null>(null)
  const [lastTap, setLastTap] = useState<number>(0)
  const longPressTimer = useRef<NodeJS.Timeout>()

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      const touch = e.touches[0]
      const position: TouchPosition = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      }
      setTouchStart(position)

      if (onLongPress) {
        longPressTimer.current = setTimeout(() => {
          onLongPress()
        }, longPressDelay)
      }
    },
    [onLongPress, longPressDelay]
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
      }

      if (!touchStart || !onSwipe) return

      const touch = e.touches[0]
      const deltaX = touch.clientX - touchStart.x
      const deltaY = touch.clientY - touchStart.y
      const absX = Math.abs(deltaX)
      const absY = Math.abs(deltaY)

      if (absX > swipeThreshold || absY > swipeThreshold) {
        let direction: SwipeDirection
        let distance: number

        if (absX > absY) {
          direction = deltaX > 0 ? 'right' : 'left'
          distance = absX
        } else {
          direction = deltaY > 0 ? 'down' : 'up'
          distance = absY
        }

        onSwipe(direction, distance)
        setTouchStart(null)
      }
    },
    [touchStart, onSwipe, swipeThreshold]
  )

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }

    if (!touchStart) return

    const touchEnd = Date.now()
    const timeDiff = touchEnd - touchStart.time

    if (timeDiff < 300) {
      const currentTime = Date.now()
      const tapTimeDiff = currentTime - lastTap

      if (onDoubleTap && tapTimeDiff < doubleTapDelay) {
        onDoubleTap()
        setLastTap(0)
      } else {
        if (onTap) onTap()
        setLastTap(currentTime)
      }
    }

    setTouchStart(null)
  }, [touchStart, lastTap, onTap, onDoubleTap, doubleTapDelay])

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  }
}

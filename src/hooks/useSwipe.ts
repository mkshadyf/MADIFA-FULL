import type { TouchEvent } from 'react'
import { useCallback, useRef } from 'react'

interface UseSwipeOptions {
  onSwipeLeft?: (distance: number) => void
  onSwipeRight?: (distance: number) => void
  onSwipeUp?: (distance: number) => void
  onSwipeDown?: (distance: number) => void
  threshold?: number
  preventDefault?: boolean
}

interface TouchPosition {
  x: number
  y: number
}

interface UseSwipeResult {
  onTouchStart: (e: TouchEvent) => void
  onTouchMove: (e: TouchEvent) => void
  onTouchEnd: (e: TouchEvent) => void
}

export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  preventDefault = true,
}: UseSwipeOptions = {}): UseSwipeResult {
  const touchStart = useRef<TouchPosition | null>(null)

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (preventDefault) {
        e.preventDefault()
      }

      const touch = e.touches[0]
      touchStart.current = {
        x: touch.clientX,
        y: touch.clientY,
      }
    },
    [preventDefault]
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (preventDefault) {
        e.preventDefault()
      }

      if (!touchStart.current) return

      const touch = e.touches[0]
      const deltaX = touch.clientX - touchStart.current.x
      const deltaY = touch.clientY - touchStart.current.y
      const absX = Math.abs(deltaX)
      const absY = Math.abs(deltaY)

      if (absX > threshold || absY > threshold) {
        if (absX > absY) {
          if (deltaX > 0 && onSwipeRight) {
            onSwipeRight(absX)
          } else if (deltaX < 0 && onSwipeLeft) {
            onSwipeLeft(absX)
          }
        } else {
          if (deltaY > 0 && onSwipeDown) {
            onSwipeDown(absY)
          } else if (deltaY < 0 && onSwipeUp) {
            onSwipeUp(absY)
          }
        }

        touchStart.current = null
      }
    },
    [
      onSwipeLeft,
      onSwipeRight,
      onSwipeUp,
      onSwipeDown,
      threshold,
      preventDefault,
    ]
  )

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (preventDefault) {
        e.preventDefault()
      }
      touchStart.current = null
    },
    [preventDefault]
  )

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  }
}

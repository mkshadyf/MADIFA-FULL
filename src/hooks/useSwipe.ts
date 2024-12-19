import { useCallback, useRef } from 'react'

interface UseSwipeOptions {
  onSwipeLeft?: (distance: number) => void
  onSwipeRight?: (distance: number) => void
  onSwipeUp?: (distance: number) => void
  onSwipeDown?: (distance: number) => void
  threshold?: number
  preventDefault?: boolean
}

export function useSwipe ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  preventDefault = true,
}: UseSwipeOptions) {
   y: number } | null>(null)
   y: number } | null>(null)

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    touchEnd.current = null
    touchStart.current = {
      x: event.targetTouches[0].clientX,
      y: event.targetTouches[0].clientY,
    }
  }, [])

  const handleTouchMove = useCallback(
    (event: React.TouchEvent) => {
      if (preventDefault) {
        event.preventDefault()
      }

      touchEnd.current = {
        x: event.targetTouches[0].clientX,
        y: event.targetTouches[0].clientY,
      }
    },
    [preventDefault]
  )

  const handleTouchEnd = useCallback(() => {
    if (!touchStart.current || !touchEnd.current) return

    const distanceX = touchEnd.current.x - touchStart.current.x
    const distanceY = touchEnd.current.y - touchStart.current.y
    const isHorizontal = Math.abs(distanceX) > Math.abs(distanceY)

    if (isHorizontal) {
      if (Math.abs(distanceX) > threshold) {
        if (distanceX > 0) {
          onSwipeRight?.(Math.abs(distanceX))
        } else {
          onSwipeLeft?.(Math.abs(distanceX))
        }
      }
    } else {
      if (Math.abs(distanceY) > threshold) {
        if (distanceY > 0) {
          onSwipeDown?.(Math.abs(distanceY))
        } else {
          onSwipeUp?.(Math.abs(distanceY))
        }
      }
    }

    touchStart.current = null
    touchEnd.current = null
  }, [threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown])

  return {
    bind: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  }
}

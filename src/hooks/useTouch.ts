import { useCallback, useRef, useState } from 'react'

interface UseTouchOptions {
  onTap?: () => void
  onDoubleTap?: () => void
  onLongPress?: () => void
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down', distance: number) => void
  longPressDelay?: number
  doubleTapDelay?: number
  swipeThreshold?: number
}

interface TouchPosition {
  x: number
  y: number
  time: number
}

export function useTouch({
  onTap,
  onDoubleTap,
  onLongPress,
  onSwipe,
  longPressDelay = 500,
  doubleTapDelay = 300,
  swipeThreshold = 50,
}: UseTouchOptions) {
  const [isLongPressing, setIsLongPressing] = useState(false)
  const touchStart = useRef<TouchPosition | null>(null)
  const lastTap = useRef<number>(0)
  const longPressTimer = useRef<NodeJS.Timeout>()

  const handleTouchStart = useCallback(
    (event: React.TouchEvent) => {
      const touch = event.touches[0]
      touchStart.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      }

      longPressTimer.current = setTimeout(() => {
        setIsLongPressing(true)
        onLongPress?.()
      }, longPressDelay)
    },
    [longPressDelay, onLongPress]
  )

  const handleTouchEnd = useCallback(
    (event: React.TouchEvent) => {
      if (!touchStart.current) return

      clearTimeout(longPressTimer.current)

      if (isLongPressing) {
        setIsLongPressing(false)
        return
      }

      const touch = event.changedTouches[0]
      const deltaX = touch.clientX - touchStart.current.x
      const deltaY = touch.clientY - touchStart.current.y
      const deltaTime = Date.now() - touchStart.current.time

      // Handle swipe
      if (Math.abs(deltaX) > swipeThreshold || Math.abs(deltaY) > swipeThreshold) {
        const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY)
        if (isHorizontal) {
          onSwipe?.(deltaX > 0 ? 'right' : 'left', Math.abs(deltaX))
        } else {
          onSwipe?.(deltaY > 0 ? 'down' : 'up', Math.abs(deltaY))
        }
      }
      // Handle tap/double tap
      else if (deltaTime < 300) {
        const currentTime = Date.now()
        const tapLength = currentTime - lastTap.current

        if (tapLength < doubleTapDelay && tapLength > 0) {
          onDoubleTap?.()
        } else {
          onTap?.()
        }

        lastTap.current = currentTime
      }

      touchStart.current = null
    },
    [doubleTapDelay, isLongPressing, onDoubleTap, onSwipe, onTap, swipeThreshold]
  )

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    if (!touchStart.current) return

    const touch = event.touches[0]
    const deltaX = touch.clientX - touchStart.current.x
    const deltaY = touch.clientY - touchStart.current.y

    // Cancel long press if moved too far
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      clearTimeout(longPressTimer.current)
      setIsLongPressing(false)
    }
  }, [])

  return {
    isLongPressing,
    bind: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  }
}

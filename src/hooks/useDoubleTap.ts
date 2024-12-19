import { useCallback, useRef } from 'react'

interface UseDoubleTapOptions {
  onDoubleTap: () => void
  delay?: number
}

export function useDoubleTap({
  onDoubleTap,
  delay = 300,
}: UseDoubleTapOptions) {
  const lastTap = useRef<number>(0)
  const timer = useRef<NodeJS.Timeout>()

  const handleTap = useCallback(
    (event: React.TouchEvent) => {
      const currentTime = new Date().getTime()
      const tapLength = currentTime - lastTap.current

      clearTimeout(timer.current)

      if (tapLength < delay && tapLength > 0) {
        event.preventDefault()
        onDoubleTap()
      } else {
        timer.current = setTimeout(() => {
          // Single tap logic here if needed
        }, delay)
      }

      lastTap.current = currentTime
    },
    [onDoubleTap, delay]
  )

  return {
    bind: {
      onTouchStart: handleTap,
    },
  }
}

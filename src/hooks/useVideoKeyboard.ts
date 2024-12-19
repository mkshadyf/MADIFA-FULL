import { useCallback, useEffect, useRef } from 'react'
import type { VimeoPlayer } from '@vimeo/player'

import { useToast } from './useToast'

interface UseVideoKeyboardOptions {
  player: VimeoPlayer | null
  onToggleFullscreen?: () => void
  onTogglePiP?: () => void
}

export function useVideoKeyboard({
  player,
  onToggleFullscreen,
  onTogglePiP,
}: UseVideoKeyboardOptions) {
  const { showToast } = useToast()
  const volumeStepRef = useRef(0.1)
  const seekStepRef = useRef(10)
  const isShiftPressedRef = useRef(false)

  const handleKeyPress = useCallback(
    async (event: KeyboardEvent) => {
      if (!player || event.repeat || event.target instanceof HTMLInputElement)
        return

      // Update shift key state
      if (event.key === 'Shift') {
        isShiftPressedRef.current = event.type === 'keydown'
        return
      }

      // Adjust step sizes based on shift key
      const volumeStep = isShiftPressedRef.current
        ? volumeStepRef.current * 2
        : volumeStepRef.current
      const seekStep = isShiftPressedRef.current
        ? seekStepRef.current * 2
        : seekStepRef.current

      try {
        switch (event.key.toLowerCase()) {
          case ' ':
          case 'k':
            event.preventDefault()
            const isPaused = await player.getPaused()
            if (isPaused) {
              await player.play()
              showToast('Playing', 'info')
            } else {
              await player.pause()
              showToast('Paused', 'info')
            }
            break

          case 'f':
            event.preventDefault()
            onToggleFullscreen?.()
            break

          case 'p':
            event.preventDefault()
            onTogglePiP?.()
            break

          case 'm':
            event.preventDefault()
            const isMuted = await player.getMuted()
            await player.setMuted(!isMuted)
            showToast(isMuted ? 'Unmuted' : 'Muted', 'info')
            break

          case 'arrowleft':
            event.preventDefault()
            const [currentTime1] = await Promise.all([player.getCurrentTime()])
            await player.setCurrentTime(Math.max(0, currentTime1 - seekStep))
            showToast(`Rewound ${seekStep} seconds`, 'info')
            break

          case 'arrowright':
            event.preventDefault()
            const [currentTime2, duration] = await Promise.all([
              player.getCurrentTime(),
              player.getDuration(),
            ])
            await player.setCurrentTime(
              Math.min(currentTime2 + seekStep, duration)
            )
            showToast(`Forward ${seekStep} seconds`, 'info')
            break

          case 'arrowup':
            event.preventDefault()
            const currentVolume1 = await player.getVolume()
            const newVolume1 = Math.min(currentVolume1 + volumeStep, 1)
            await player.setVolume(newVolume1)
            showToast(`Volume: ${Math.round(newVolume1 * 100)}%`, 'info')
            break

          case 'arrowdown':
            event.preventDefault()
            const currentVolume2 = await player.getVolume()
            const newVolume2 = Math.max(currentVolume2 - volumeStep, 0)
            await player.setVolume(newVolume2)
            showToast(`Volume: ${Math.round(newVolume2 * 100)}%`, 'info')
            break

          case '0':
          case '1':
          case '2':
          case '3':
          case '4':
          case '5':
          case '6':
          case '7':
          case '8':
          case '9':
            event.preventDefault()
            const duration2 = await player.getDuration()
            const targetTime = (parseInt(event.key) / 10) * duration2
            await player.setCurrentTime(targetTime)
            showToast(
              `Jumped to ${Math.round((targetTime / duration2) * 100)}%`,
              'info'
            )
            break

          case '<':
            event.preventDefault()
            const currentRate1 = await player.getPlaybackRate()
            const newRate1 = Math.max(0.25, currentRate1 - 0.25)
            await player.setPlaybackRate(newRate1)
            showToast(`Speed: ${newRate1}x`, 'info')
            break

          case '>':
            event.preventDefault()
            const currentRate2 = await player.getPlaybackRate()
            const newRate2 = Math.min(2, currentRate2 + 0.25)
            await player.setPlaybackRate(newRate2)
            showToast(`Speed: ${newRate2}x`, 'info')
            break
        }
      } catch (error) {
        logger.error('Keyboard control error:', error)
        showToast('Failed to execute command', 'error')
      }
    },
    [player, onToggleFullscreen, onTogglePiP, showToast]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress)
    document.addEventListener('keyup', handleKeyPress)

    return () => {
      document.removeEventListener('keydown', handleKeyPress)
      document.removeEventListener('keyup', handleKeyPress)
    }
  }, [handleKeyPress])
}

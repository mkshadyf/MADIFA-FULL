import { ToastService } from '@/lib/services/toast'
import { useCallback } from 'react'

export function useErrorHandler() {
  const handleError = useCallback((error: unknown) => {
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred'
    ToastService.caller(message)
    console.error(error)
  }, [])

  return { handleError }
}

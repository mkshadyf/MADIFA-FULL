import { AppError } from '@/lib/utils/error-handler'

import { useToast } from './useToast'

interface ErrorOptions {
  showToast?: boolean
  logToServer?: boolean
  context?: string
}

export function useErrorHandler() {
  const { showToast } = useToast()

  const handleError = async (error: unknown, options: ErrorOptions = {}) => {
    const appError = AppError.fromUnknown(error)
    const context = options.context ? `[${options.context}] ` : ''

    // Log error in development
    if (import.meta.env.VITE_NODE_ENV === 'development') {
      console.error(`${context}[${appError.code}]`, appError)
    }

    // Show toast notification
    if (options.showToast !== false) {
      showToast(`${context}${appError.message}`, 'error')
    }

    // Log to server in production
    if (import.meta.env.VITE_NODE_ENV === 'production' && options.logToServer !== false) {
      try {
        await fetch('/api/log-error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: appError.code,
            message: appError.message,
            stack: appError.stack,
            meta: { context: options.context }, // Removed spreading of non-existent meta property
          }),
        })
      } catch (err) {
        console.error('Failed to log error to server:', err)
      }
    }

    return appError
  }

  return { handleError }
}

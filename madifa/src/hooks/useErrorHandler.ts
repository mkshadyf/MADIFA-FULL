import { env } from '@/config/env'
import { AppError } from '@/lib/utils/error'
import { useToast } from './useToast'

interface ErrorOptions {
  showToast?: boolean
  logToServer?: boolean
}

export function useErrorHandler() {
  const { showToast } = useToast()

  const handleError = async (error: unknown, options: ErrorOptions = {}) => {
    const appError = AppError.fromUnknown(error)

    // Log error in development
    if (env.NODE_ENV === 'development') {
      console.error(`[${appError.code}]`, appError)
    }

    // Show toast notification
    if (options.showToast !== false) {
      showToast(appError.message, 'error')
    }

    // Log to server in production
    if (env.NODE_ENV === 'production' && options.logToServer !== false) {
      try {
        await fetch('/api/log-error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: appError.code,
            message: appError.message,
            stack: appError.stack,
            meta: appError.meta
          })
        })
      } catch (err) {
        console.error('Failed to log error to server:', err)
      }
    }

    return appError
  }

  return { handleError }
} 
import { createErrorContext, handleApiError } from '@/lib/utils/error-handler'

export const errorMonitoring = {
  captureError(error: unknown, context: string): void {
    handleApiError(
      error,
      createErrorContext('monitoring', 'capture', { context })
    )
  },

  captureMessage(message: string, context: string): void {
    console.info(`[${context}] ${message}`)
  },
}

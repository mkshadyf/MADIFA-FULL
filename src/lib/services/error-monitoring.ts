import { createErrorContext, handleError } from '@/lib/utils/error-handler'

export const errorMonitoring = {
  captureError(error: unknown, context: string): void {
    handleError(
      error,
      createErrorContext('ErrorMonitoring', 'captureError', context)
    )
  },

  captureMessage(message: string, context: string): void {
    console.info(`[${context}] ${message}`)
  },
}

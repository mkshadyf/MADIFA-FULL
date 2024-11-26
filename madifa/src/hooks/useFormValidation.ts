import { useCallback, useState } from 'react'
import { z } from 'zod'
import { useErrorHandler } from './useErrorHandler'

interface ValidationOptions<T> {
  schema: z.ZodType<T>
  onSuccess?: (data: T) => void | Promise<void>
  onError?: (error: z.ZodError) => void
}

export function useFormValidation<T>() {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { handleError } = useErrorHandler()

  const validateForm = useCallback(async (
    data: unknown,
    options: ValidationOptions<T>
  ) => {
    try {
      const validData = await options.schema.parseAsync(data)
      setErrors({})
      await options.onSuccess?.(validData)
      return { success: true as const, data: validData }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.errors.forEach(err => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message
          }
        })
        setErrors(fieldErrors)
        options.onError?.(error)
        return { success: false as const, error }
      }
      handleError(error)
      return { success: false as const, error }
    }
  }, [handleError])

  return { errors, validateForm, setErrors }
} 
import { useCallback, useState } from 'react'
import { z } from 'zod'

interface UseFormProps<T> {
  initialValues: T
  schema: z.ZodType<T>
  onSubmit: (values: T) => Promise<void>
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  schema,
  onSubmit
}: UseFormProps<T>) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }))
    // Clear error when field is modified
    setErrors(prev => ({ ...prev, [name]: undefined }))
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate form data
      const validData = schema.parse(values)
      await onSubmit(validData)
      setErrors({})
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof T, string>> = {}
        error.errors.forEach(err => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof T] = err.message
          }
        })
        setErrors(fieldErrors)
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [values, schema, onSubmit])

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit
  }
} 
import { z } from 'zod'

// Password validation schema
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')

// Email validation schema
const emailSchema = z
  .string()
  .email('Invalid email address')
  .min(5, 'Email must be at least 5 characters')
  .max(255, 'Email must be less than 255 characters')

// Full name validation schema
const fullNameSchema = z
  .string()
  .min(2, 'Full name must be at least 2 characters')
  .max(100, 'Full name must be less than 100 characters')
  .regex(/^[a-zA-Z\s]*$/, 'Full name can only contain letters and spaces')

// Auth form validation schemas
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: fullNameSchema
})

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
})

export const resetPasswordSchema = z.object({
  email: emailSchema
})

export const updatePasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: passwordSchema
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

// Form validation helper
export async function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const validData = await schema.parseAsync(data)
    return { success: true, data: validData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: 'Validation failed' }
  }
} 
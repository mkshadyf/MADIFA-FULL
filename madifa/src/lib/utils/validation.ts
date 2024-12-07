export type ValidationRule = {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => boolean | string
}

export type ValidationRules = {
  [key: string]: ValidationRule
}

export type ValidationErrors = {
  [key: string]: string
}

export const validate = (data: any, rules: ValidationRules): ValidationErrors => {
  const errors: ValidationErrors = {}

  Object.entries(rules).forEach(([field, rule]) => {
    const value = data[field]

    // Required check
    if (rule.required && !value) {
      errors[field] = `${field} is required`
      return
    }

    if (value) {
      // Min length check
      if (rule.minLength && value.length < rule.minLength) {
        errors[field] = `${field} must be at least ${rule.minLength} characters`
      }

      // Max length check
      if (rule.maxLength && value.length > rule.maxLength) {
        errors[field] = `${field} must be no more than ${rule.maxLength} characters`
      }

      // Pattern check
      if (rule.pattern && !rule.pattern.test(value)) {
        errors[field] = `${field} format is invalid`
      }

      // Custom validation
      if (rule.custom) {
        const result = rule.custom(value)
        if (result !== true) {
          errors[field] = typeof result === 'string' ? result : `${field} is invalid`
        }
      }
    }
  })

  return errors
}

export const commonRules = {
  email: {
    required: true,
    pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  },
  password: {
    required: true,
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
  },
  phone: {
    pattern: /^\+?[\d\s-]{10,}$/,
  },
  url: {
    pattern: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  },
} 
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export const handleAPIError = (error: unknown): APIError => {
  if (error instanceof APIError) {
    return error
  }

  if (error instanceof Error) {
    return new APIError(error.message, 500)
  }

  return new APIError('An unexpected error occurred', 500)
}

export const isAPIError = (error: unknown): error is APIError => {
  return error instanceof APIError
}

export const createAPIError = (
  status: number,
  message: string,
  code?: string,
  details?: any
): APIError => {
  return new APIError(message, status, code, details)
}

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const 
export interface APIError extends Error {
  status: number
  code: string
  cause?: unknown
}

export function createAPIError(
  status: number,
  message: string,
  code: string,
  cause?: unknown
): APIError {
  const error = new Error(message) as APIError
  error.status = status
  error.code = code
  error.cause = cause
  return error
} 
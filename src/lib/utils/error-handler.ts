import type { BaseError, VimeoError } from '@/types';

export interface ErrorContext {
  service: string;
  operation: string;
  details?: unknown;
}

export const isBaseError = (error: unknown): error is BaseError => {
  return error !== null &&
    typeof error === 'object' &&
    'status' in error &&
    'code' in error;
}

export const isVimeoError = (error: unknown): error is VimeoError => {
  return isBaseError(error) &&
    'developer_message' in error &&
    'error_code' in error;
}

export const createErrorContext = (
  service: string,
  operation: string,
  details?: unknown
): ErrorContext => ({
  service,
  operation,
  details
});

export const handleError = <T extends BaseError>(
  error: unknown,
  context: ErrorContext
): T => {
  if (isBaseError(error)) {
    return {
      ...error,
      details: { ...error.details, ...context }
    } as T;
  }

  return {
    status: 500,
    code: 'UNKNOWN_ERROR',
    message: error instanceof Error ? error.message : 'Unknown error occurred',
    name: 'APIError',
    details: context
  } as T;
};

export const handleVimeoError = (error: unknown, context: ErrorContext): VimeoError => {
  if (isVimeoError(error)) {
    return {
      ...error,
      details: { ...error.details, ...context }
    };
  }

  return {
    status: 500,
    code: 'VIMEO_ERROR',
    message: error instanceof Error ? error.message : 'Vimeo API error occurred',
    developer_message: 'An unexpected error occurred while processing the Vimeo API request',
    error_code: 'UNKNOWN',
    name: 'VimeoError',
    details: context
  };
};

export const createAPIError = (
  status: number,
  code: string,
  message: string,
  details?: unknown
): BaseError => ({
  status,
  code,
  message,
  name: 'APIError',
  details
});

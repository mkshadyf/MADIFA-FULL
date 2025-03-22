import * as Sentry from '@sentry/react'

export async function initSentry() {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      // Performance Monitoring
      tracesSampleRate: 1.0,
    })
  }
}

export interface ErrorMonitoringService {
  captureException(error: Error, context?: { 
    context?: string;
    extra?: Record<string, unknown>;
  }): void;
  captureMessage(message: string): void;
  setUser(user: { id: string; email?: string }): void;
  clearUser(): void;
}

export const sentryService: ErrorMonitoringService = {
  captureException: (error: Error, context?: { 
    context?: string;
    extra?: Record<string, unknown>;
  }) => {
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(error);
      
      if (context) {
        console.error('Context:', context);
      }
    } else {
      console.error('Development mode - Error:', error)
      if (context) {
        console.error('Context:', context)
      }
    }
  },

  captureMessage: (message: string) => {
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureMessage(message)
    } else {
      console.log('Development mode - Message:', message)
    }
  },

  setUser: (user: { id: string; email?: string }) => {
    if (process.env.NODE_ENV === 'production') {
      Sentry.setUser(user)
    }
  },

  clearUser: () => {
    if (process.env.NODE_ENV === 'production') {
      Sentry.setUser(null)
    }
  },
}

export const captureException = (
  error: unknown,
  context?: Record<string, unknown>
) => {
  if (process.env.NODE_ENV === 'development') {
    console.error('Error captured:', error)
    if (context) {
      console.error('Context:', context)
    }
    return
  }

  // Ensure error is properly typed for Sentry
  if (error instanceof Error) {
    Sentry.captureException(error);
  } else {
    // Handle non-Error objects by converting them to Error
    const errorObj = new Error(typeof error === 'string' ? error : 'Unknown error');
    if (typeof error === 'object' && error !== null) {
      // Add original error data to the error object
      errorObj.name = 'CapturedNonErrorException';
      Object.assign(errorObj, { originalError: error });
    }
    Sentry.captureException(errorObj);
  }
  
  if (context) {
    console.error('Context:', context);
  }
}

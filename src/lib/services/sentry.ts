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

export const sentryService = {
  captureException: (error: Error) => {
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(error)
    } else {
      console.error('Development mode - Error:', error)
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
  }
}

export const captureException = (error: unknown, context?: Record<string, unknown>) => {
  if (process.env.NODE_ENV === 'development') {
    console.error('Error captured:', error)
    if (context) {
      console.error('Context:', context)
    }
    return
  }

  Sentry.captureException(error, {
    extra: context
  })
}

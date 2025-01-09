import * as Sentry from '@sentry/browser'

export function initErrorTracking() {
  if (process.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.VITE_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0,
    })
  }
}

export function captureError(
  error: Error | string,
  context?: Record<string, any>
) {
  console.error(error)

  if (process.env.VITE_SENTRY_DSN) {
    if (error instanceof Error) {
      Sentry.captureException(error, { extra: context })
    } else {
      Sentry.captureMessage(error, {
        level: 'error',
        extra: context,
      })
    }
  }
}

export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, any>
) {
  if (process.env.VITE_SENTRY_DSN) {
    Sentry.captureMessage(message, {
      level,
      extra: context,
    })
  }
}

export function setUserContext(userId: string | null) {
  if (process.env.VITE_SENTRY_DSN) {
    if (userId) {
      Sentry.setUser({ id: userId })
    } else {
      Sentry.setUser(null)
    }
  }
}

export function addBreadcrumb(breadcrumb: Sentry.Breadcrumb) {
  if (process.env.VITE_SENTRY_DSN) {
    Sentry.addBreadcrumb(breadcrumb)
  }
}

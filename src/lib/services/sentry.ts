import * as Sentry from '@sentry/browser'
import { browserTracingIntegration } from '@sentry/browser'
import { Replay } from '@sentry/replay'
import type { Event, EventHint } from '@sentry/types'

const isBrowser = typeof window !== 'undefined'

export const initSentry = (): void => {
  if (!import.meta.env.VITE_SENTRY_DSN) return

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [
      browserTracingIntegration({
        idleTimeout: 1000,
        finalTimeout: 30000,
        heartbeatInterval: 5000,
        instrumentPageLoad: true,
        enableLongTask: true,
        enableInp: false,
        interactionsSampleRate: 1,
      }),
      new Replay(),
    ],
    // Performance monitoring
    tracesSampleRate: 1.0,
    // Session replay
    replaysSessionSampleRate: 0.1, // Sample rate for session replays
    replaysOnErrorSampleRate: 1.0, // Sample rate for replays when errors occur
    beforeSend(event: Event, hint: EventHint) {
      if (import.meta.env.DEV) {
        console.log('Sentry event in development:', event)
        return null
      }
      return event
    },
  })
}

export const captureException = (
  error: Error,
  context?: Record<string, unknown>
): void => {
  if (!import.meta.env.VITE_SENTRY_DSN) {
    console.error('Error:', error, context)
    return
  }

  Sentry.setContext('error_context', context || null)
  Sentry.captureException(error)
}

export const captureMessage = (
  message: string,
  context?: Record<string, unknown>
): void => {
  if (!import.meta.env.VITE_SENTRY_DSN) {
    console.log('Message:', message, context)
    return
  }

  Sentry.setContext('message_context', context || null)
  Sentry.captureMessage(message)
}

export const setUser = (
  id: string,
  email?: string,
  username?: string
): void => {
  if (!import.meta.env.VITE_SENTRY_DSN) return

  Sentry.setUser({
    id,
    email,
    username,
  })
}

export const clearUser = (): void => {
  if (!import.meta.env.VITE_SENTRY_DSN) return
  Sentry.setUser(null)
}

// New utility functions based on latest Sentry features
export const addBreadcrumb = (
  message: string,
  category?: string,
  level?: Sentry.SeverityLevel
): void => {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
  })
}

export const setTag = (key: string, value: string): void => {
  Sentry.setTag(key, value)
}

export const setExtra = (key: string, value: any): void => {
  Sentry.setExtra(key, value)
}

// Performance monitoring utilities
export const startTransaction = (name: string, op: string) => {
  return Sentry.startTransaction({
    name,
    op,
  })
}

export const configureScope = (
  callback: (scope: Sentry.Scope) => void
): void => {
  Sentry.configureScope(callback)
}

import { env } from '@/config/env'
import type { User } from '@/types/auth'
import * as Sentry from '@sentry/react'
import type { ReactNode } from 'react'

export function initializeSentry(): void {
  if (env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: env.VITE_SENTRY_DSN,
      environment: env.NODE_ENV,
      tracesSampleRate: 1.0,
      beforeSend(event) {
        if (event.exception) {
          Sentry.showReportDialog({ eventId: event.event_id })
        }
        return event
      },
    })
  }
}

export function setUser(user: User | null): void {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.full_name,
    })
  } else {
    Sentry.setUser(null)
  }
}

export function setTag(key: string, value: string): void {
  Sentry.setTag(key, value)
}

export function setExtra(key: string, value: unknown): void {
  Sentry.setExtra(key, value)
}

export function setContext(
  name: string,
  context: Record<string, unknown>
): void {
  Sentry.setContext(name, context)
}

export function captureMessage(
  message: string,
  level?: Sentry.SeverityLevel
): void {
  Sentry.captureMessage(message, level)
}

export function captureException(
  error: unknown,
  context?: Record<string, unknown>
): void {
  Sentry.captureException(error, {
    extra: context,
  })
}

export function addBreadcrumb(breadcrumb: Sentry.Breadcrumb): void {
  Sentry.addBreadcrumb(breadcrumb)
}

export function flush(timeout?: number): Promise<boolean> {
  return Sentry.flush(timeout)
}

export function close(timeout?: number): Promise<boolean> {
  return Sentry.close(timeout)
}

export function wrap<T>(fn: () => T): T {
  try {
    return fn()
  } catch (error) {
    captureException(error)
    throw error
  }
}

export async function wrapAsync<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    captureException(error)
    throw error
  }
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error) => void
}

export const ErrorBoundary: React.ComponentType<ErrorBoundaryProps> =
  Sentry.ErrorBoundary

import { createClient } from '@/lib/supabase/client'
import * as Sentry from '@sentry/browser'
import { BrowserTracing } from '@sentry/browser'
import type { Event } from '@sentry/types'

const supabase = createClient()

export const initSentry = () => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.VITE_SENTRY_DSN,
      integrations: [new BrowserTracing()],
      tracesSampleRate: 1.0,
      environment: process.env.NODE_ENV,
      beforeSend(event: Event): Event | null {
        // Don't send events in development
        if (process.env.NODE_ENV === 'development') {
          return null
        }
        return event
      },
    })
  }
}

export const captureError = (error: Error, context?: Record<string, any>) => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      extra: context,
    })
  } else {
    console.error('Error:', error, 'Context:', context)
  }
}

export const setUserContext = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
    })
  } else {
    Sentry.setUser(null)
  }
}

export const clearUserContext = () => {
  Sentry.setUser(null)
}

export type ErrorReport = {
  id?: string
  error: string
  errorType: string
  stackTrace?: string
  componentStack?: string
  url: string
  userAgent: string
  timestamp: string
  userId?: string
  metadata?: Record<string, any>
}

export const reportError = async (error: Error, componentStack: string | null | undefined) => {
  const errorReport: ErrorReport = {
    error: error.message,
    errorType: error.name,
    stackTrace: error.stack,
    componentStack: componentStack || undefined,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    userId: (await supabase.auth.getUser()).data.user?.id,
    metadata: {
      route: window.location.pathname,
      referrer: document.referrer,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    },
  }

  try {
    await supabase.from('error_reports').insert([errorReport])
  } catch (err) {
    console.error('Failed to save error report:', err)
  }
}

export const getErrorReports = async (
  options: {
    startDate?: string
    endDate?: string
    errorType?: string
    userId?: string
  } = {}
) => {
  let query = supabase.from('error_reports').select('*')

  if (options.startDate) {
    query = query.gte('timestamp', options.startDate)
  }
  if (options.endDate) {
    query = query.lte('timestamp', options.endDate)
  }
  if (options.errorType) {
    query = query.eq('errorType', options.errorType)
  }
  if (options.userId) {
    query = query.eq('userId', options.userId)
  }

  const { data, error } = await query.order('timestamp', { ascending: false })
  if (error) throw error
  return data
}

export const getErrorStats = async () => {
  const { data, error } = await supabase
    .from('error_reports')
    .select('errorType, count')
    .order('count', { ascending: false })

  if (error) throw error

  return data.reduce((acc, { errorType, count }) => {
    acc[errorType] = count
    return acc
  }, {} as Record<string, number>)
} 
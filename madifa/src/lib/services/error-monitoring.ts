import { createClient } from '@/lib/supabase/client'
import { AppError } from '@/lib/utils/error'
import * as Sentry from '@sentry/browser'
import { BrowserTracing } from '@sentry/browser'

const supabase = createClient()

interface ErrorContext {
  userId?: string
  component?: string
  action?: string
  metadata?: Record<string, any>
}

interface ErrorStats {
  error_code: string
  count: number
}

class ErrorMonitoringService {
  private static instance: ErrorMonitoringService
  private initialized = false

  private constructor() { }

  public static getInstance(): ErrorMonitoringService {
    if (!ErrorMonitoringService.instance) {
      ErrorMonitoringService.instance = new ErrorMonitoringService()
    }
    return ErrorMonitoringService.instance
  }

  public init(dsn: string) {
    if (this.initialized) return

    if (process.env.NODE_ENV === 'production') {
      Sentry.init({
        dsn,
        integrations: [new BrowserTracing()],
        tracesSampleRate: 1.0,
        environment: process.env.NODE_ENV,
        beforeSend(event) {
          if (process.env.NODE_ENV === 'development') {
            return null
          }
          return event
        },
      })
    }

    this.initialized = true
  }

  public async captureError(error: Error | unknown, context?: ErrorContext) {
    const appError = error instanceof AppError ? error : AppError.fromUnknown(error)

    // Local logging
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorMonitoring]', {
        error: appError,
        context,
      })
    }

    // Sentry logging in production
    if (process.env.NODE_ENV === 'production') {
      Sentry.withScope((scope) => {
        if (context?.userId) {
          scope.setUser({ id: context.userId })
        }
        if (context?.component) {
          scope.setTag('component', context.component)
        }
        if (context?.action) {
          scope.setTag('action', context.action)
        }
        if (context?.metadata) {
          scope.setExtras(context.metadata)
        }
        Sentry.captureException(appError)
      })
    }

    // Database logging
    try {
      await supabase.from('error_logs').insert({
        error_message: appError.message,
        error_code: appError.code,
        stack_trace: appError.stack,
        user_id: context?.userId,
        component: context?.component,
        action: context?.action,
        metadata: context?.metadata,
        created_at: new Date().toISOString(),
      })
    } catch (dbError) {
      console.error('Failed to log error to database:', dbError)
    }

    return appError
  }

  public setUser(userId: string | null, email?: string) {
    if (process.env.NODE_ENV === 'production') {
      if (userId) {
        Sentry.setUser({ id: userId, email })
      } else {
        Sentry.setUser(null)
      }
    }
  }

  public async getErrorStats(startDate?: Date, endDate?: Date): Promise<ErrorStats[]> {
    let query = supabase
      .from('error_logs')
      .select('error_code, count')

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString())
    }
    if (endDate) {
      query = query.lte('created_at', endDate.toISOString())
    }

    const { data, error } = await query
    if (error) throw error

    // Process the data to get counts by error code
    const stats = data.reduce((acc: Record<string, number>, curr) => {
      acc[curr.error_code] = (acc[curr.error_code] || 0) + 1
      return acc
    }, {})

    return Object.entries(stats).map(([error_code, count]) => ({
      error_code,
      count
    }))
  }
}

export const errorMonitoring = ErrorMonitoringService.getInstance() 
interface ErrorLog {
  message: string
  stack?: string
  context?: Record<string, any>
  userId?: string
  timestamp: string
}

class ErrorLogger {
  private static instance: ErrorLogger
  private logs: ErrorLog[] = []

  private constructor() {
    // Initialize error logging
  }

  public static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger()
    }
    return ErrorLogger.instance
  }

  public async logError(error: Error, context?: Record<string, any>, userId?: string) {
    const errorLog: ErrorLog = {
      message: error.message,
      stack: error.stack,
      context,
      userId,
      timestamp: new Date().toISOString()
    }

    this.logs.push(errorLog)

    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorLog)
    }

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      try {
        await fetch('/api/log-error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(errorLog)
        })
      } catch (e) {
        console.error('Failed to send error log:', e)
      }
    }
  }

  public getRecentLogs(limit = 10): ErrorLog[] {
    return this.logs.slice(-limit)
  }

  public clearLogs() {
    this.logs = []
  }
}

export const errorLogger = ErrorLogger.getInstance() 
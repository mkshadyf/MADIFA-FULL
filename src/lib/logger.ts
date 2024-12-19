/* eslint-disable no-undef */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LoggerOptions {
  level?: LogLevel
  prefix?: string
  enabled?: boolean
}

class Logger {
  private level: LogLevel
  private prefix: string
  private enabled: boolean

  constructor(options: LoggerOptions = {}) {
    this.level = options.level || (import.meta.env.PROD ? 'info' : 'debug')
    this.prefix = options.prefix || '[App]'
    this.enabled = options.enabled ?? import.meta.env.DEV
  }

  private log(level: LogLevel, message: string, ...args: unknown[]): void {
    if (!this.enabled) return

    const timestamp = new Date().toISOString()
    const prefix = `${timestamp} ${this.prefix} ${level.toUpperCase()}`

    switch (level) {
      case 'debug':
        console.debug(prefix, message, ...args)
        break
      case 'info':
        console.info(prefix, message, ...args)
        break
      case 'warn':
        console.warn(prefix, message, ...args)
        break
      case 'error':
        console.error(prefix, message, ...args)
        break
    }
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      this.log('debug', message, ...args)
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      this.log('info', message, ...args)
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      this.log('warn', message, ...args)
    }
  }

  error(message: string | Error, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      const errorMessage = message instanceof Error ? message.message : message
      this.log('error', errorMessage, ...args)
      if (message instanceof Error && message.stack) {
        this.log('error', 'Stack:', message.stack)
      }
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
    return levels.indexOf(level) >= levels.indexOf(this.level)
  }
}

export const logger = new Logger({
  prefix: '[MADIFA]',
  enabled: import.meta.env.DEV || import.meta.env.MODE === 'test',
})

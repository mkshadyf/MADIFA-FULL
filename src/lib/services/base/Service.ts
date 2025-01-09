import { createErrorContext, handleApiError } from '@/lib/utils/error-handler'
import { captureException } from '../sentry'

export abstract class BaseService {
  private static instances = new Map<string, BaseService>()

  constructor() { }

  static getInstance<T extends BaseService>(this: new () => T): T {
    const name = this.name
    if (!BaseService.instances.has(name)) {
      BaseService.instances.set(name, new this())
    }
    return BaseService.instances.get(name) as T
  }

  protected handleError(
    error: unknown,
    operation: string,
    context?: Record<string, any>
  ): never {
    const err = error instanceof Error ? error : new Error(String(error))
    captureException(err)
    throw handleApiError(
      err,
      createErrorContext(
        this.constructor.name.toLowerCase(),
        operation,
        context
      )
    )
  }

  protected async withErrorHandling<T>(
    operation: string,
    fn: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      this.handleError(error, operation, context)
    }
  }
}

export interface ServiceClass<T extends BaseService> {
  new(): T
  getInstance(): T
}

export function createServiceExports<T extends BaseService, M extends keyof T>(
  ServiceClass: ServiceClass<T>,
  methodNames: readonly M[]
): { service: T; methods: Pick<T, M> } {
  const service = ServiceClass.getInstance()
  const methods = methodNames.reduce(
    (acc, method) => {
      const fn = service[method]
      if (typeof fn === 'function') {
        acc[method] = fn.bind(service)
      }
      return acc
    },
    {} as Pick<T, M>
  )

  return { service, methods }
}

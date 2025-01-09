export abstract class BaseService {
  protected constructor() { }

  protected async withErrorHandling<T>(
    operation: string,
    fn: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      console.error(`Error in ${operation}:`, error, context)
      throw error
    }
  }
} 
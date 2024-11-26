import { env } from '@/config/env'
import { useEffect, useRef } from 'react'

export function usePerformance(componentName: string) {
  const mountTime = useRef<number>(0)

  useEffect(() => {
    if (env.NODE_ENV === 'development') {
      mountTime.current = performance.now()

      return () => {
        const unmountTime = performance.now()
        const duration = unmountTime - mountTime.current
        console.log(`${componentName} mounted for ${duration.toFixed(2)}ms`)
      }
    }
  }, [componentName])

  return {
    logRender: (action: string) => {
      if (env.NODE_ENV === 'development') {
        console.log(`${componentName} rendered due to ${action}`)
      }
    },
    measureOperation: async <T>(name: string, operation: () => Promise<T>): Promise<T> => {
      if (env.NODE_ENV === 'development') {
        const start = performance.now()
        const result = await operation()
        const end = performance.now()
        console.log(`${componentName}.${name} took ${(end - start).toFixed(2)}ms`)
        return result
      }
      return operation()
    }
  }
} 
export function measurePerformance(name: string, fn: () => void) {
  if (process.env.NODE_ENV === 'development') {
    const start = performance.now()
    fn()
    const end = performance.now()
    console.log(`${name} took ${end - start}ms`)
  } else {
    fn()
  }
}

export function withPerformanceTracking<T extends (...args: any[]) => any>(
  name: string,
  fn: T
): T {
  return ((...args: Parameters<T>) => {
    const start = performance.now()
    const result = fn(...args)
    const end = performance.now()

    if (process.env.NODE_ENV === 'development') {
      console.log(`${name} took ${end - start}ms`)
    }

    return result
  }) as T
} 
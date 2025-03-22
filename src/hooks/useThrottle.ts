/**
 * useThrottle Hook
 * 
 * A custom hook for throttling values or functions.
 * Useful for scroll events, resize events, and other high-frequency events
 * where you want to limit the rate of execution.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * useThrottle hook for values
 * 
 * @param value - The value to throttle
 * @param limit - The time limit in milliseconds
 * @returns The throttled value
 * 
 * @example
 * const [scrollPosition, setScrollPosition] = useState(0);
 * const throttledScrollPosition = useThrottle(scrollPosition, 200);
 * 
 * // Update scroll position on scroll
 * useEffect(() => {
 *   const handleScroll = () => {
 *     setScrollPosition(window.scrollY);
 *   };
 *   
 *   window.addEventListener('scroll', handleScroll);
 *   return () => window.removeEventListener('scroll', handleScroll);
 * }, []);
 * 
 * // Only update UI when throttledScrollPosition changes
 * useEffect(() => {
 *   updateUI(throttledScrollPosition);
 * }, [throttledScrollPosition]);
 */
export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdated = useRef<number>(0);

  useEffect(() => {
    const now = Date.now();

    if (now >= lastUpdated.current + limit) {
      lastUpdated.current = now;
      setThrottledValue(value);
    } else {
      const timerId = setTimeout(() => {
        lastUpdated.current = Date.now();
        setThrottledValue(value);
      }, limit);

      return () => {
        clearTimeout(timerId);
      };
    }
  }, [value, limit]);

  return throttledValue;
}

/**
 * useThrottleCallback hook for functions
 * 
 * @param callback - The function to throttle
 * @param limit - The time limit in milliseconds
 * @param deps - Dependencies array for the callback
 * @returns The throttled function
 * 
 * @example
 * const handleScroll = useThrottleCallback(
 *   () => {
 *     console.log('Scroll position:', window.scrollY);
 *   },
 *   200,
 *   []
 * );
 * 
 * // Add scroll event listener
 * useEffect(() => {
 *   window.addEventListener('scroll', handleScroll);
 *   return () => window.removeEventListener('scroll', handleScroll);
 * }, [handleScroll]);
 */
export function useThrottleCallback<T extends (...args: any[]) => any>(
  callback: T,
  limit: number,
  deps: any[] = []
): (...args: Parameters<T>) => void {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedCallback = useCallback(callback, deps);
  const lastRun = useRef<number>(0);
  const lastArgs = useRef<Parameters<T> | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up any pending timeouts on unmount
  useEffect(() => () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      lastArgs.current = args;

      // If we haven't run the function recently, run it immediately
      if (now - lastRun.current >= limit) {
        lastRun.current = now;
        memoizedCallback(...args);
        return;
      }

      // Otherwise, schedule it to run after the throttle period
      if (timeoutRef.current === null) {
        timeoutRef.current = setTimeout(() => {
          if (lastArgs.current) {
            lastRun.current = Date.now();
            memoizedCallback(...lastArgs.current);
          }
          timeoutRef.current = null;
        }, limit - (now - lastRun.current));
      }
    },
    [memoizedCallback, limit]
  );
}

/**
 * useThrottleEffect hook
 * 
 * A hook that throttles an effect
 * 
 * @param effect - The effect function to throttle
 * @param limit - The time limit in milliseconds
 * @param deps - Dependencies array for the effect
 * 
 * @example
 * useThrottleEffect(
 *   () => {
 *     console.log('Window size:', window.innerWidth, window.innerHeight);
 *   },
 *   200,
 *   [windowWidth, windowHeight]
 * );
 */
export function useThrottleEffect(
  effect: () => void | (() => void),
  limit: number,
  deps: any[]
): void {
  const lastRun = useRef<number>(0);
  const effectRef = useRef<() => void | (() => void)>(effect);
  const cleanupRef = useRef<void | (() => void)>(undefined);

  // Update the effect ref when the effect changes
  useEffect(() => {
    effectRef.current = effect;
  }, [effect]);

  useEffect(() => {
    const now = Date.now();

    // Run the effect immediately if we haven't run it recently
    if (now - lastRun.current >= limit) {
      lastRun.current = now;

      // Clean up previous effect if needed
      if (typeof cleanupRef.current === 'function') {
        cleanupRef.current();
      }

      // Run the effect and store any cleanup function
      cleanupRef.current = effectRef.current();
    } else {
      // Schedule the effect to run after the throttle period
      const timerId = setTimeout(() => {
        lastRun.current = Date.now();

        // Clean up previous effect if needed
        if (typeof cleanupRef.current === 'function') {
          cleanupRef.current();
        }

        // Run the effect and store any cleanup function
        cleanupRef.current = effectRef.current();
      }, limit - (now - lastRun.current));

      return () => {
        clearTimeout(timerId);
      };
    }

    // Clean up on unmount or when deps change
    return () => {
      if (typeof cleanupRef.current === 'function') {
        cleanupRef.current();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, limit]);
} 
/**
 * useSessionStorage Hook
 * 
 * A custom hook for using sessionStorage with React state.
 * Provides a way to persist state during a browser session.
 */

import { useCallback, useEffect, useState } from 'react';

/**
 * useSessionStorage hook
 * 
 * @param key - The sessionStorage key
 * @param initialValue - The initial value (used if no value exists in sessionStorage)
 * @returns A stateful value and a function to update it
 * 
 * @example
 * const [searchFilters, setSearchFilters] = useSessionStorage('search_filters', {});
 * 
 * // Update the filters
 * setSearchFilters({ category: 'videos', sort: 'newest' });
 * 
 * // Clear the filters
 * setSearchFilters(null);
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T) | null) => void] {
  // Get from session storage then parse stored json or return initialValue
  const readValue = useCallback((): T => {
    // Prevent build error "window is undefined" but keep working
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.sessionStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Return a wrapped version of useState's setter function that persists the new value to sessionStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T) | null) => {
      // Prevent build error "window is undefined" but keep working
      if (typeof window === 'undefined') {
        console.warn(
          `Tried setting sessionStorage key "${key}" even though environment is not a client`
        );
        return;
      }

      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        // Save to state
        setStoredValue(valueToStore as T);

        // Save to session storage
        if (valueToStore === null) {
          window.sessionStorage.removeItem(key);
        } else {
          window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
        }

        // We dispatch a custom event so every useSessionStorage hook are notified
        window.dispatchEvent(new Event('session-storage'));
      } catch (error) {
        console.warn(`Error setting sessionStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Listen for changes to this sessionStorage key from other tabs/windows
  useEffect(() => {
    const handleStorageChange = () => {
      setStoredValue(readValue());
    };

    // this is a custom event, triggered in setValue
    window.addEventListener('session-storage', handleStorageChange);

    return () => {
      window.removeEventListener('session-storage', handleStorageChange);
    };
  }, [readValue]);

  return [storedValue, setValue];
} 
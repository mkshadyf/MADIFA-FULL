/**
 * Hooks Exports
 * 
 * This file exports all custom hooks for the application.
 * 
 * @example
 * // Import multiple hooks
 * import { useApi, useForm, useLocalStorage } from '@hooks';
 * 
 * // Import a specific hook
 * import { useApi } from '@hooks';
 */

// Form hooks
export * from './useForm';

// API hooks
export * from './useApi';

// Storage hooks
export * from './useLocalStorage';
export * from './useSessionStorage';

// UI hooks
export * from './useClickOutside';
export * from './useDebounce';
export * from './useKeyPress';
export * from './useMediaQuery';
export * from './useThrottle';

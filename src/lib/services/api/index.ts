/**
 * API Client Exports
 * 
 * This file exports the API client and related types.
 * 
 * @example
 * // Import the default API client
 * import { apiClient } from '@services/api';
 * 
 * // Import the API client factory
 * import { createApiClient } from '@services/api';
 * 
 * // Import types
 * import type { ApiResponse, PaginatedResponse } from '@services/api';
 */

// Export the API client and factory
export { apiClient, createApiClient } from './client';

// Export all types
export type {
  ApiClientConfig,
  ApiError,
  ApiErrorDetails,
  ApiErrorResponse,
  ApiResponse,
  FilterParams,
  ListParams,
  PaginatedResponse,
  PaginationMeta,
  PaginationParams,
  SortParams
} from './types';
export { SortDirection } from './types';

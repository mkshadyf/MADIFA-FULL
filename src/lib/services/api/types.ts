/**
 * API Client Types
 * 
 * Type definitions for the API client and related interfaces.
 */

import type { AxiosRequestConfig, AxiosResponseHeaders, RawAxiosResponseHeaders } from 'axios';

/**
 * API Client Configuration
 * Extends AxiosRequestConfig with additional properties
 */
export interface ApiClientConfig extends AxiosRequestConfig {
  /**
   * Base URL for API requests
   */
  baseURL: string;

  /**
   * Request timeout in milliseconds
   */
  timeout: number;

  /**
   * Default headers for requests
   */
  headers: Record<string, string>;

  /**
   * Whether to include credentials in cross-origin requests
   */
  withCredentials: boolean;
}

/**
 * API Error Details
 * Additional error information returned by the API
 */
export interface ApiErrorDetails {
  /**
   * Field-specific validation errors
   */
  [field: string]: string | string[];
}

/**
 * API Error Response
 * Standard error response structure
 */
export interface ApiErrorResponse {
  /**
   * Error message
   */
  message: string;

  /**
   * Error code
   */
  code: string;

  /**
   * Additional error details
   */
  details?: ApiErrorDetails | null;
}

/**
 * API Error
 * Standardized error object
 */
export interface ApiError {
  /**
   * Error message
   */
  message: string;

  /**
   * Error code
   */
  code: string;

  /**
   * Additional error details
   */
  details: ApiErrorDetails | null;
}

/**
 * API Response
 * Standardized response structure for all API requests
 */
export interface ApiResponse<T> {
  /**
   * Response data
   */
  data: T;

  /**
   * HTTP status code
   */
  status: number;

  /**
   * HTTP status text
   */
  statusText: string;

  /**
   * Response headers
   */
  headers: RawAxiosResponseHeaders | AxiosResponseHeaders;

  /**
   * Whether the request was successful
   */
  success: boolean;

  /**
   * Error information (null if success is true)
   */
  error: ApiError | null;
}

/**
 * Pagination Parameters
 * Common pagination parameters for list endpoints
 */
export interface PaginationParams {
  /**
   * Page number (1-indexed)
   */
  page?: number;

  /**
   * Number of items per page
   */
  limit?: number;
}

/**
 * Pagination Metadata
 * Metadata about paginated results
 */
export interface PaginationMeta {
  /**
   * Current page number
   */
  currentPage: number;

  /**
   * Total number of pages
   */
  totalPages: number;

  /**
   * Number of items per page
   */
  perPage: number;

  /**
   * Total number of items
   */
  totalItems: number;
}

/**
 * Paginated Response
 * Standard response structure for paginated data
 */
export interface PaginatedResponse<T> {
  /**
   * Array of items
   */
  items: T[];

  /**
   * Pagination metadata
   */
  meta: PaginationMeta;
}

/**
 * Sort Direction
 * Direction for sorting results
 */
export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

/**
 * Sort Parameters
 * Parameters for sorting results
 */
export interface SortParams {
  /**
   * Field to sort by
   */
  sortBy?: string;

  /**
   * Sort direction
   */
  sortDirection?: SortDirection;
}

/**
 * Filter Parameters
 * Base interface for filter parameters
 */
export interface FilterParams {
  /**
   * Search query
   */
  search?: string;

  /**
   * Filter by status
   */
  status?: string;

  /**
   * Filter by date range
   */
  dateFrom?: string;

  /**
   * Filter by date range
   */
  dateTo?: string;

  /**
   * Additional filters
   */
  [key: string]: string | number | boolean | undefined;
}

/**
 * List Parameters
 * Combined parameters for listing resources
 */
export interface ListParams extends PaginationParams, SortParams, FilterParams { } 
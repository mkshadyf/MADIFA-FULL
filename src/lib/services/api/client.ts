/**
 * API Client
 * 
 * A standardized client for making HTTP requests to APIs.
 * Provides consistent error handling, request/response interceptors,
 * and typed responses.
 */

import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';

import type { ApiClientConfig, ApiErrorResponse, ApiResponse } from './types';

/**
 * Default configuration for the API client
 */
const DEFAULT_CONFIG: ApiClientConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
};

/**
 * API Client class for making HTTP requests
 */
export class ApiClient {
  private client: AxiosInstance;

  /**
   * Creates a new API client instance
   * 
   * @param config - Optional configuration to override defaults
   */
  constructor(config?: Partial<ApiClientConfig>) {
    this.client = axios.create({
      ...DEFAULT_CONFIG,
      ...config,
    });

    this.setupInterceptors();
  }

  /**
   * Sets up request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('auth_token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiErrorResponse>) => {
        // Handle specific error cases
        if (error.response?.status === 401) {
          // Handle unauthorized (e.g., redirect to login)
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }

        if (error.response?.status === 403) {
          // Handle forbidden
          window.dispatchEvent(new CustomEvent('auth:forbidden'));
        }

        if (error.response?.status === 429) {
          // Handle rate limiting
          window.dispatchEvent(new CustomEvent('api:rate-limited'));
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Makes a GET request
   * 
   * @param url - The URL to request
   * @param config - Optional request configuration
   * @returns Promise with the response data
   */
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<T>(url, config);
      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError<T>(error as AxiosError<ApiErrorResponse>);
    }
  }

  /**
   * Makes a POST request
   * 
   * @param url - The URL to request
   * @param data - The data to send
   * @param config - Optional request configuration
   * @returns Promise with the response data
   */
  public async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError<T>(error as AxiosError<ApiErrorResponse>);
    }
  }

  /**
   * Makes a PUT request
   * 
   * @param url - The URL to request
   * @param data - The data to send
   * @param config - Optional request configuration
   * @returns Promise with the response data
   */
  public async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<T>(url, data, config);
      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError<T>(error as AxiosError<ApiErrorResponse>);
    }
  }

  /**
   * Makes a PATCH request
   * 
   * @param url - The URL to request
   * @param data - The data to send
   * @param config - Optional request configuration
   * @returns Promise with the response data
   */
  public async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch<T>(url, data, config);
      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError<T>(error as AxiosError<ApiErrorResponse>);
    }
  }

  /**
   * Makes a DELETE request
   * 
   * @param url - The URL to request
   * @param config - Optional request configuration
   * @returns Promise with the response data
   */
  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<T>(url, config);
      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError<T>(error as AxiosError<ApiErrorResponse>);
    }
  }

  /**
   * Handles successful responses
   * 
   * @param response - The Axios response object
   * @returns Standardized API response
   */
  private handleResponse<T>(response: AxiosResponse<T>): ApiResponse<T> {
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      success: true,
      error: null,
    };
  }

  /**
   * Handles error responses
   * 
   * @param error - The Axios error object
   * @returns Standardized API error response
   */
  private handleError<T>(error: AxiosError<ApiErrorResponse>): ApiResponse<T> {
    // Log the error (could be sent to monitoring service)
    console.error('API Error:', error);

    return {
      data: null as unknown as T,
      status: error.response?.status || 0,
      statusText: error.response?.statusText || error.message,
      headers: error.response?.headers || {},
      success: false,
      error: {
        message: error.response?.data?.message || error.message,
        code: error.response?.data?.code || 'UNKNOWN_ERROR',
        details: error.response?.data?.details || null,
      },
    };
  }

  /**
   * Creates a new instance of the API client with custom configuration
   * 
   * @param config - Configuration to override defaults
   * @returns New API client instance
   */
  public createInstance(config: Partial<ApiClientConfig>): ApiClient {
    return new ApiClient(config);
  }
}

// Export a singleton instance of the API client
export const apiClient = new ApiClient();

// Export a function to create custom instances
export const createApiClient = (config: Partial<ApiClientConfig>): ApiClient =>
  new ApiClient(config); 
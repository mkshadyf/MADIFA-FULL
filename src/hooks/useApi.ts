/**
 * useApi Hook
 * 
 * A custom hook for making API requests with loading, error, and data states.
 * Provides a consistent way to handle API requests across the application.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { sentryService } from '@/lib/services/sentry';

/**
 * API response interface
 */
export interface ApiResponse<TData> {
  data: TData | null;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  success: boolean;
  error: {
    message: string;
    code: string;
    details?: unknown;
  } | null;
}

/**
 * API request function
 */
export type ApiRequestFn<TData, TParams = void> = (
  params: TParams
) => Promise<ApiResponse<TData>>;

/**
 * API request options
 */
export interface ApiRequestOptions<TData, TParams> {
  /**
   * API request function
   */
  requestFn: ApiRequestFn<TData, TParams>;

  /**
   * Initial data
   */
  initialData?: TData | null;

  /**
   * Whether to execute the request on mount
   */
  executeOnMount?: boolean;

  /**
   * Parameters to pass to the request function on mount
   */
  initialParams?: TParams;

  /**
   * Callback to run on success
   */
  onSuccess?: (data: TData) => void;

  /**
   * Callback to run on error
   */
  onError?: (error: Error) => void;

  /**
   * Whether to skip the request
   */
  skip?: boolean;
}

/**
 * API request state
 */
export interface ApiRequestState<TData> {
  /**
   * Whether the request is loading
   */
  isLoading: boolean;

  /**
   * Whether the request is in error state
   */
  isError: boolean;

  /**
   * Whether the request has completed successfully
   */
  isSuccess: boolean;

  /**
   * Response data
   */
  data: TData | null;

  /**
   * Error object
   */
  error: Error | null;

  /**
   * HTTP status code
   */
  status: number | null;
}

/**
 * useApi hook return type
 */
export interface UseApiReturn<TData, TParams> extends ApiRequestState<TData> {
  /**
   * Execute the request
   */
  execute: (params: TParams) => Promise<ApiResponse<TData>>;

  /**
   * Reset the request state
   */
  reset: () => void;
}

/**
 * useApi hook
 * 
 * @param options - API request options
 * @returns API request state and functions
 * 
 * @example
 * const { data, isLoading, isError, error, execute } = useApi({
 *   requestFn: (params) => apiClient.get(`/users/${params.id}`),
 *   executeOnMount: true,
 *   initialParams: { id: 1 },
 * });
 */
export function useApi<TData, TParams = void>({
  requestFn,
  initialData = null,
  executeOnMount = false,
  initialParams,
  onSuccess,
  onError,
  skip = false,
}: ApiRequestOptions<TData, TParams>): UseApiReturn<TData, TParams> {
  // Request state
  const [state, setState] = useState<ApiRequestState<TData>>({
    isLoading: executeOnMount && !skip,
    isError: false,
    isSuccess: false,
    data: initialData,
    error: null,
    status: null,
  });

  // Track if the component is mounted
  const isMounted = useRef(true);

  // Reset the request state
  const reset = useCallback(() => {
    if (isMounted.current) {
      setState({
        isLoading: false,
        isError: false,
        isSuccess: false,
        data: initialData,
        error: null,
        status: null,
      });
    }
  }, [initialData]);

  // Execute the request
  const execute = useCallback(
    async (params: TParams): Promise<ApiResponse<TData>> => {
      if (skip) {
        return {
          data: null as unknown as TData,
          status: 0,
          statusText: 'Skipped',
          headers: {},
          success: false,
          error: null,
        };
      }

      // Set loading state
      setState((prev) => ({
        ...prev,
        isLoading: true,
        isError: false,
        isSuccess: false,
        error: null,
      }));

      try {
        // Execute the request
        const response = await requestFn(params);

        // Update state if component is still mounted
        if (isMounted.current) {
          if (response.success) {
            setState({
              isLoading: false,
              isError: false,
              isSuccess: true,
              data: response.data,
              error: null,
              status: response.status,
            });

            // Call onSuccess callback
            if (onSuccess && response.data !== null) {
              onSuccess(response.data as TData);
            }
          } else {
            // Handle error response
            const error = new Error(response.error?.message || 'Unknown error');

            setState({
              isLoading: false,
              isError: true,
              isSuccess: false,
              data: null,
              error,
              status: response.status,
            });

            // Call onError callback
            if (onError) {
              onError(error);
            }

            // Log error
            sentryService.captureException(
              error,
              {
                context: 'useApi',
                extra: {
                  status: response.status,
                  statusText: response.statusText,
                  errorCode: response.error?.code,
                },
              }
            );
          }
        }

        return response;
      } catch (error) {
        // Handle unexpected errors
        const errorObj = error instanceof Error ? error : new Error('Unknown error');

        // Update state if component is still mounted
        if (isMounted.current) {
          setState({
            isLoading: false,
            isError: true,
            isSuccess: false,
            data: null,
            error: errorObj,
            status: 0,
          });

          // Call onError callback
          if (onError) {
            onError(errorObj);
          }

          // Log error
          sentryService.captureException(
            errorObj,
            {
              context: 'useApi',
              extra: {
                message: errorObj.message,
              },
            }
          );
        }

        // Return error response
        return {
          data: null as unknown as TData,
          status: 0,
          statusText: errorObj.message,
          headers: {},
          success: false,
          error: {
            message: errorObj.message,
            code: 'UNKNOWN_ERROR',
            details: null,
          },
        };
      }
    },
    [requestFn, skip, onSuccess, onError]
  );

  // Execute on mount if enabled
  useEffect(() => {
    if (executeOnMount && !skip && initialParams !== undefined) {
      execute(initialParams);
    }

    // Cleanup
    return () => {
      isMounted.current = false;
    };
  }, [execute, executeOnMount, initialParams, skip]);

  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * useMutation hook
 * 
 * A specialized version of useApi for mutation operations (POST, PUT, DELETE)
 * 
 * @param options - API request options
 * @returns API request state and functions
 * 
 * @example
 * const { mutate, isLoading, isError, error } = useMutation({
 *   requestFn: (data) => apiClient.post('/users', data),
 *   onSuccess: (data) => {
 *     console.log('User created:', data);
 *   },
 * });
 */
export function useMutation<TData, TParams = void>(
  options: Omit<ApiRequestOptions<TData, TParams>, 'executeOnMount' | 'initialParams'>
): Omit<UseApiReturn<TData, TParams>, 'execute'> & { mutate: (params: TParams) => Promise<TData | null> } {
  const { execute, ...rest } = useApi({
    ...options,
    executeOnMount: false,
  });

  // Wrapper for execute that returns data directly
  const mutate = useCallback(
    async (params: TParams): Promise<TData | null> => {
      const response = await execute(params);
      return response.success ? response.data : null;
    },
    [execute]
  );

  return {
    ...rest,
    mutate,
  };
}
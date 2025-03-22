# Service Organization Guidelines

This document outlines the standardized service organization pattern for the Madifa application.

## Directory Structure

```
src/lib/services/
├── index.ts                # Service registry and exports
├── api/                    # API client and request utilities
│   ├── index.ts            # Exports API client
│   ├── client.ts           # Base API client implementation
│   ├── interceptors.ts     # Request/response interceptors
│   └── types.ts            # API-related types
├── analytics/              # Analytics service
│   ├── index.ts            # Service exports
│   ├── analytics.ts        # Service implementation
│   └── types.ts            # Service-specific types
├── content/                # Content management service
│   ├── index.ts
│   ├── content.ts
│   └── types.ts
├── vimeo/                  # Vimeo integration service
│   ├── index.ts
│   ├── vimeo.ts
│   ├── queue.ts            # Request queue implementation
│   └── types.ts
└── ...                     # Other service directories
```

## Service Implementation Pattern

Each service should follow this structure:

```ts
// 1. Imports
import { apiClient } from '../api';
import type { ServiceConfig, ServiceResponse } from './types';

// 2. Types
interface ServiceOptions {
  // Service configuration options
}

// 3. Service class definition
export class ExampleService {
  private config: ServiceConfig;
  
  constructor(options?: ServiceOptions) {
    this.config = {
      // Default configuration
      ...options,
    };
  }
  
  // Public methods
  public async getData(id: string): Promise<ServiceResponse> {
    try {
      // Implementation
      return result;
    } catch (error) {
      // Error handling
      this.handleError(error);
      throw error;
    }
  }
  
  // Private helper methods
  private handleError(error: unknown): void {
    // Error handling logic
  }
}

// 4. Service instance
export const exampleService = new ExampleService();
```

## Service Registry Pattern

The service registry (`src/lib/services/index.ts`) provides a central access point for all services:

```ts
// Import service instances
import { analyticsService } from './analytics';
import { contentService } from './content';
import { vimeoService } from './vimeo';
// ... other services

// Group services by domain
export const services = {
  core: {
    // Core services
  },
  content: {
    content: contentService,
    vimeo: vimeoService,
  },
  user: {
    // User-related services
  },
  // ... other service groups
};

// Type definition for the service registry
export type ServiceRegistry = typeof services;

// Hook for accessing services in components
export function useServices() {
  return services;
}

// Re-export individual services for direct imports
export { analyticsService } from './analytics';
export { contentService } from './content';
export { vimeoService } from './vimeo';
// ... other service exports
```

## API Client Pattern

The API client (`src/lib/services/api/client.ts`) provides a base for making HTTP requests:

```ts
import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import { setupInterceptors } from './interceptors';

export class ApiClient {
  private client: AxiosInstance;
  
  constructor(config?: AxiosRequestConfig) {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      ...config,
    });
    
    setupInterceptors(this.client);
  }
  
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }
  
  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }
  
  // Other HTTP methods...
}

export const apiClient = new ApiClient();
```

## Error Handling Pattern

Services should implement consistent error handling:

```ts
import { errorMonitoringService } from '../error-monitoring';

export class ServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

export function handleServiceError(error: unknown, context: string): ServiceError {
  // Log the error
  errorMonitoringService.captureException(error, { context });
  
  // Transform to ServiceError if needed
  if (error instanceof ServiceError) {
    return error;
  }
  
  // Handle Axios errors
  if (axios.isAxiosError(error)) {
    return new ServiceError(
      error.response?.data?.message || 'API request failed',
      error.response?.status?.toString() || 'UNKNOWN',
      error
    );
  }
  
  // Handle other errors
  return new ServiceError(
    error instanceof Error ? error.message : 'Unknown error',
    'UNKNOWN',
    error
  );
}
```

## Best Practices

1. **Single Responsibility**: Each service should focus on a specific domain
2. **Singleton Pattern**: Services should be implemented as singletons
3. **Error Handling**: Implement consistent error handling across services
4. **Typing**: Use strong typing for all service methods and responses
5. **Testability**: Design services to be easily testable
6. **Configuration**: Allow services to be configured with sensible defaults
7. **Logging**: Include appropriate logging for debugging and monitoring
8. **Rate Limiting**: Implement rate limiting for external API calls
9. **Caching**: Use caching strategies where appropriate
10. **Documentation**: Document service methods with JSDoc comments 
# Service Refactoring Plan

## Current Issues
The services directory is currently fragmented with:
- Duplicate implementations
- Inconsistent patterns
- Files both in directories and at the root level
- Mixed service responsibilities

## New Structure

```
src/
└── lib/
    └── services/
        ├── index.ts                 # Main barrel export
        ├── api/
        │   ├── index.ts             # Barrel export
        │   ├── client.ts            # Base API client
        │   ├── interceptors.ts      # Request/response interceptors
        │   └── endpoints/           # API endpoint definitions
        ├── auth/
        │   ├── index.ts             # Barrel export
        │   ├── auth-service.ts      # Main authentication service
        │   ├── session-manager.ts   # Session management
        │   └── permissions.ts       # Permission-related functionality
        ├── content/
        │   ├── index.ts             # Barrel export
        │   ├── content-service.ts   # Main content service
        │   ├── delivery.ts          # Content delivery logic
        │   ├── management.ts        # Content management logic
        │   └── metadata.ts          # Metadata management
        ├── vimeo/
        │   ├── index.ts             # Barrel export
        │   ├── vimeo-service.ts     # Main Vimeo service
        │   ├── content.ts           # Vimeo content operations
        │   ├── privacy.ts           # Privacy settings
        │   └── analytics.ts         # Vimeo analytics
        ├── subscription/
        │   ├── index.ts             # Barrel export
        │   ├── subscription-service.ts # Main subscription service
        │   ├── plans.ts             # Plan definitions and management
        │   ├── payment.ts           # Payment processing
        │   └── access.ts            # Subscription access control
        ├── analytics/
        │   ├── index.ts             # Barrel export
        │   ├── analytics-service.ts # Main analytics service
        │   ├── tracking.ts          # User tracking
        │   ├── reporting.ts         # Analytics reporting
        │   └── metrics.ts           # Metrics collection
        ├── user/
        │   ├── index.ts             # Barrel export
        │   ├── user-service.ts      # Main user service
        │   ├── profile.ts           # Profile management
        │   ├── preferences.ts       # User preferences
        │   └── interactions.ts      # User interactions (history, favorites)
        ├── storage/
        │   ├── index.ts             # Barrel export
        │   ├── storage-service.ts   # Main storage service
        │   ├── quota.ts             # Storage quota management
        │   └── downloads.ts         # Download management
        ├── error/
        │   ├── index.ts             # Barrel export
        │   ├── error-service.ts     # Main error handling service
        │   ├── monitoring.ts        # Error monitoring
        │   └── reporting.ts         # Error reporting
        └── utils/
            ├── index.ts             # Barrel export
            ├── logger.ts            # Logging utility
            ├── formatter.ts         # Data formatting
            └── validation.ts        # General validation
```

## Implementation Strategy

### Step 1: Create the Directory Structure
Start by creating the directory structure outlined above.

### Step 2: Implement Barrel Exports
Create index.ts files in each directory to simplify imports:

Example for auth/index.ts:
```typescript
export * from './auth-service';
export * from './session-manager';
export * from './permissions';

// For backwards compatibility
export { AuthService as default } from './auth-service';
```

### Step 3: Refactor Service Implementation
Standardize service implementation with a consistent pattern:

Example for auth-service.ts:
```typescript
// Single responsibility service class
export class AuthService {
  private static instance: AuthService;
  
  private constructor() {
    // Private constructor for singleton
  }
  
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }
  
  // Service methods
  async login(credentials: LoginCredentials): Promise<User> {
    // Implementation
  }
  
  async logout(): Promise<void> {
    // Implementation
  }
  
  // Other methods...
}

// Export a singleton instance
export const authService = AuthService.getInstance();
```

### Step 4: Update Imports Across Codebase
Gradually update imports to use the new structure:

Before:
```typescript
import { login } from '../../../lib/services/auth';
```

After:
```typescript
import { authService } from '@/lib/services';
// or for more explicit imports
import { authService } from '@/lib/services/auth';
```

### Step 5: Eliminate Duplicated Code
Identify and merge duplicate implementations:
1. Compare all vimeo-related services and consolidate
2. Merge overlapping subscription functionality
3. Standardize error handling across services

### Step 6: Testing
Write comprehensive tests for each service to ensure functionality is preserved during refactoring.
